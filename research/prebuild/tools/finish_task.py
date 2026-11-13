"""Capture task checks and validate before completion; preserves earlier records."""
import json,subprocess,sys,uuid,shutil
from datetime import datetime,timezone
from provenance import ROOT,definition,file_hash
from plan_contracts import load_repository_spec
from validate import validate

def finish(task_id):
    root=ROOT; tracker,catalog=load_repository_spec(root); task=next(t for t in tracker['tasks'] if t['id']==task_id)
    if any(t['automationStatus']=='running' and t['id']!=task_id for t in tracker['tasks']): raise RuntimeError('Resume the running task before starting another task')
    config=json.loads((root/'research/prebuild/run-config.json').read_text()); base=root/f"research/prebuild/runs/{config['runId']}"; base.mkdir(parents=True,exist_ok=True)
    path=base/(task_id+'.json')
    if path.exists(): shutil.copyfile(path,base/(task_id+'-previous-'+uuid.uuid4().hex+'.json'))
    record=json.loads(path.read_text()) if path.exists() else {'schemaVersion':1,'runId':config['runId'],'taskId':task_id,'checks':[]}
    task['automationStatus']='running';task['evidenceStatus']='partial';task['runRecord']=path.relative_to(root).as_posix()
    tracker_path=root/'docs/planning/PREBUILD_RESEARCH_TRACKER.json';tracker_path.write_text(json.dumps(tracker,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    start=datetime.now(timezone.utc).isoformat()
    rc=subprocess.run(['python','research/prebuild/tools/run_unit_packs.py','--task',task_id],cwd=root).returncode
    if rc: raise RuntimeError('required packs incomplete/failed')
    reports=sorted((base/'unit-packs').glob('*.json'),key=lambda p:p.stat().st_mtime); report_path=reports[-1]; report=json.loads(report_path.read_text()); checks=[]
    for pack in report['packs']:
        definition_pack=next(p for p in catalog['packs'] if p['id']==pack['id'])
        for cid,log in zip(definition_pack['commandIds'],pack['logs']):
            checks.append({'id':cid,'command':tracker['commands'][cid]['argv'],'cwd':'.','startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':0,'result':'pass','mode':'unit','outputRef':log,'reason':None})
    for cid in task['requiredCommands']:
        if cid in {c['id'] for c in checks}: continue
        command=list(tracker['commands'][cid]['argv']); started=datetime.now(timezone.utc).isoformat()
        result=subprocess.run(command,cwd=root,text=True,encoding='utf-8',errors='replace',capture_output=True,timeout=120)
        log=base/(task_id+'-'+cid+'-'+uuid.uuid4().hex+'.log'); log.write_text(result.stdout+'\n'+result.stderr,encoding='utf-8')
        checks.append({'id':cid,'command':command,'cwd':'.','startedAt':started,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':result.returncode,'result':'pass' if result.returncode in tracker['commands'][cid].get('expectedExit',[0]) else 'fail','mode':tracker['commands'][cid]['level'],'outputRef':log.relative_to(root).as_posix(),'reason':None})
    old=[c for c in record['checks'] if c['id'] not in {c['id'] for c in checks} and c['id']!='artifact_check_preliminary']
    record.update({'automationStatus':'running','evidenceStatus':'partial','definitionHash':definition(task),'inputHashes':{ref:file_hash(root/ref) for ref in task['reads'] if (root/ref).is_file() and ref not in ('research/prebuild/run-config.json','research/prebuild/00-evidence-index.json','docs/planning/PREBUILD_TEST_PACKS.json','docs/planning/PREBUILD_RESEARCH_TRACKER.json')},'consumedConfig':record.get('consumedConfig',{}),'consumedEvidenceHashes':{},'sharedWrites':record.get('sharedWrites',[]),'decisions':[],'gaps':[],'blocker':None,'checks':old+checks,'unitPackResults':[{'packId':p['id'],'reportRef':report_path.relative_to(root).as_posix(),'reportHash':file_hash(report_path),'definitionHash':report['packDefinitionHashes'][p['id']],'testedFileHashes':report['testedFileHashes'],'passedCaseIds':[c['id'] for c in p['cases']],'failedCaseIds':[],'skippedCaseIds':[],'notRunCaseIds':[]} for p in report['packs']]})
    record['commandDefinitionHashes']={cid:__import__('provenance').digest(tracker['commands'][cid]) for cid in task['requiredCommands']}
    record['outputHashes']={ref:file_hash(root/ref) for ref in task['outputs'] if (root/ref).is_file() and ref not in ('research/prebuild/run-config.json','research/prebuild/00-evidence-index.json','docs/planning/PREBUILD_TEST_PACKS.json','docs/planning/PREBUILD_RESEARCH_TRACKER.json')}
    path.write_text(json.dumps(record,indent=2))
    code,errors=validate(root,task_id)
    log=base/(task_id+'-artifact-'+uuid.uuid4().hex+'.log');log.write_text('\n'.join(errors))
    if code: print('\n'.join(errors)); return code
    record['checks'].append({'id':'artifact_check','command':['python','research/prebuild/tools/validate.py','--task',task_id],'cwd':'.','startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':0,'result':'pass','mode':'artifact','outputRef':log.relative_to(root).as_posix(),'reason':None})
    record['automationStatus']='done';path.write_text(json.dumps(record,indent=2))
    task.update({'automationStatus':'done','definitionHash':record['definitionHash'],'inputHashes':record['inputHashes'],'nextAction':'External evidence remains partial; consult artifact gaps.','blocker':None})
    tracker_path.write_text(json.dumps(tracker,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(task_id,'done / evidence partial');return 0
if __name__=='__main__':sys.exit(finish(sys.argv[1]))
