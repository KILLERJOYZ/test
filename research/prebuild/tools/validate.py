"""Read-only research consistency validation. Never approves research gates."""
import argparse, json, sys
from provenance import ROOT, contained, file_hash, digest, definition
from artifact_contracts import validate_artifact
from plan_contracts import load_repository_spec, validate_spec

def evidence_errors(value):
    errors=[]
    def walk(v):
        if isinstance(v,dict):
            if 'collectedCount' in v and v['collectedCount']!=len(v.get('participants',[])): errors.append('invented participant count')
            if v.get('physicalDeviceValidated') and v.get('deviceKind')=='emulator': errors.append('emulator is not phone evidence')
            if v.get('mode')=='controlled' and v.get('livePassed'): errors.append('controlled is not live')
            if v.get('missingComponents') and v.get('completeTotal') is not None: errors.append('unknown cost cannot yield complete total')
            if v.get('shippingVnd','absent') is None and v.get('completeTotalVnd') is not None: errors.append('unknown shipping cannot yield complete total')
            if 'cases' in v and isinstance(v['cases'],list):
                ids=[c.get('id') for c in v['cases'] if isinstance(c,dict)]
                if len(ids)!=len(set(ids)): errors.append('duplicate/leaked cases')
            if v.get('decision') in ('accept','accepted') and not v.get('decisionRef'): errors.append('accept requires actual decision reference')
            for x in v.values(): walk(x)
        elif isinstance(v,list):
            for x in v: walk(x)
    walk(value); return errors

def freshness(record,root,config,index):
    errors=[]
    for field in ('inputHashes','outputHashes'):
        for ref,expected in record.get(field,{}).items():
            try:
                path=contained(root,ref)
                if not path.is_file() or file_hash(path)!=expected: errors.append('stale '+ref)
            except ValueError: errors.append('unsafe '+ref)
    for key,expected in record.get('consumedConfig',{}).items():
        current=config
        for part in key.split('.'): current=current.get(part) if isinstance(current,dict) else None
        if current!=expected: errors.append('stale config '+key)
    entries={e['id']:e for e in index.get('items',[])}
    for key,expected in record.get('consumedEvidenceHashes',{}).items():
        if key not in entries or digest(entries[key])!=expected: errors.append('stale evidence '+key)
    return errors

def validate(root,task_id=None,gate=None):
    tracker,catalog=load_repository_spec(root); errors=validate_spec(tracker,catalog,root)
    config_path=root/'research/prebuild/run-config.json'; index_path=root/'research/prebuild/00-evidence-index.json'
    config=json.loads(config_path.read_text(encoding='utf-8-sig')) if config_path.exists() else {}
    index=json.loads(index_path.read_text(encoding='utf-8-sig')) if index_path.exists() else {}
    errors+=evidence_errors(tracker)
    if task_id and task_id not in {t['id'] for t in tracker['tasks']}: errors.append('unknown task '+task_id)
    if gate and gate not in {g['id'] for g in tracker['gates']}: errors.append('unknown gate '+gate)
    if sum(t['automationStatus']=='running' for t in tracker['tasks'])>1: errors.append('multiple running tasks')
    for ref,obj in [('run-config.json',config),('00-evidence-index.json',index)]:
        if not obj: errors.append('missing shared control '+ref)
    if config and (config.get('schemaVersion')!=1 or not config.get('runId')): errors.append('invalid run configuration')
    if index:
        items=index.get('items',[])
        if len({e.get('id') for e in items})!=len(items): errors.append('duplicate evidence ID')
    if task_id=='R00' and config:
        for key in ('baseline','scope','seed','corpus','retrieval','ai','thresholds','externalInputs'):
            if key not in config: errors.append('run-config missing '+key)

    for task in tracker['tasks']:
        if task['automationStatus'] not in tracker['automationStates'] or task['evidenceStatus'] not in tracker['evidenceStates']: errors.append(task['id']+': invalid state')
        for ref in task['outputs']:
            try: contained(root,ref)
            except ValueError: errors.append(task['id']+': unsafe output '+ref)
        if task_id and task['id']!=task_id: continue
        if not task_id and task['automationStatus']!='done': continue
        for ref in task['outputs']:
            try:
                path=contained(root,ref)
                if not path.is_file(): errors.append('missing output '+ref); continue
                if path.suffix=='.json':
                    obj=json.loads(path.read_text(encoding='utf-8-sig'))
                    errors.extend(ref+': '+e for e in evidence_errors(obj))
                    errors.extend(validate_artifact(ref,obj,task['id'],root,{e['id'] for e in index.get('items',[])}))
            except (ValueError,OSError) as exc: errors.append(ref+': '+str(exc))
        if task['automationStatus']=='done':
            for dep in task['requiresArtifacts']:
                if next(t for t in tracker['tasks'] if t['id']==dep)['automationStatus']!='done': errors.append(task['id']+': unfinished dependency '+dep)
        record_ref=task.get('runRecord')
        if not record_ref: errors.append(task['id']+': missing run record'); continue
        try: record=json.loads(contained(root,record_ref).read_text(encoding='utf-8-sig'))
        except (ValueError,OSError) as exc: errors.append(str(exc)); continue
        if record.get('definitionHash')!=definition(task): errors.append(task['id']+': stale definition')
        errors+=freshness(record,root,config,index)
        for check in record.get('checks',[]):
            if check.get('result')=='not_run' and not check.get('reason'): errors.append('not_run requires reason')
        if task['automationStatus']=='done' and record.get('automationStatus')!='done': errors.append(task['id']+': done tracker requires final record')
        checks={c['id']:c for c in record.get('checks',[])}
        for cid in task['requiredCommands']:
            if record.get('commandDefinitionHashes',{}).get(cid)!=digest(tracker['commands'][cid]): errors.append(task['id']+': stale command definition '+cid)
            c=checks.get(cid,{})
            if c.get('result')!='pass' or c.get('exitCode') not in tracker['commands'][cid].get('expectedExit',[0]) or not c.get('startedAt') or not c.get('finishedAt') or not c.get('outputRef'): errors.append(task['id']+': required execution absent '+cid)
            elif not contained(root,c['outputRef']).is_file(): errors.append('missing log '+cid)
        reports=record.get('unitPackResults',[])
        for pid in task['requiredUnitPacks']:
            refs=[r for r in reports if r['packId']==pid]
            if not refs: errors.append(task['id']+': missing unit pack '+pid); continue
            r=refs[-1]
            try:
                path=contained(root,r['reportRef']); report=json.loads(path.read_text(encoding='utf-8-sig'))
                pack=next(p for p in catalog['packs'] if p['id']==pid)
                if file_hash(path)!=r['reportHash'] or report['packDefinitionHashes'].get(pid)!=digest(pack): errors.append('stale pack report '+pid)
                selected=next(p for p in report['packs'] if p['id']==pid)
                rows=selected['cases']
                if selected['exitCode']!=0 or len(rows)!=len(pack['cases']): errors.append('nonpassing pack '+pid)
                required_files=pack['testFiles']+pack.get('sut',[])
                if any(f not in report['testedFileHashes'] for f in required_files): errors.append('missing tested hash '+pid)
                for log in selected.get('logs',[]):
                    if not contained(root,log).is_file(): errors.append('missing pack execution log '+pid)
                if not selected.get('logs'): errors.append('missing pack execution logs '+pid)
                if {c['id'] for c in rows if c['status']=='passed'}!={c['id'] for c in pack['cases']}: errors.append('missing/failed/skipped cases '+pid)
                errors+=freshness({'inputHashes':{**report['testedFileHashes'],**report.get('fixtureHashes',{})}},root,{}, {})
            except (ValueError,KeyError,OSError,StopIteration) as exc: errors.append('invalid pack '+pid+': '+str(exc))
    if errors: return 1,errors
    if gate:
        g=next(g for g in tracker['gates'] if g['id']==gate)
        if g['decision']!='accept': return 2,[gate+': pending; no acceptance inferred']
        if not g.get('scope') or not g.get('evidenceRefs') or any(t['evidenceStatus']!='sufficient' for t in tracker['tasks']): return 1,['unsupported gate acceptance']
    return 0,['Requested consistency checks passed; no gate approval implied.']
def main():
    p=argparse.ArgumentParser(); g=p.add_mutually_exclusive_group(required=True); g.add_argument('--all',action='store_true'); g.add_argument('--task'); g.add_argument('--gate')
    a=p.parse_args()
    try: code,errors=validate(ROOT,a.task,a.gate)
    except (ValueError,KeyError,OSError) as exc: code,errors=1,[str(exc)]
    print('\n'.join(errors)); return code
if __name__=='__main__': sys.exit(main())
