"""Execute unit packs and preserve actual per-test outcomes; no gate decisions."""
import argparse, fnmatch, json, re, subprocess, sys, uuid
from datetime import datetime, timezone
from pathlib import Path
from provenance import ROOT, digest, file_hash, contained
from plan_contracts import load_repository_spec, validate_spec

def parse_results(output, framework):
    found = {}
    if framework == 'python':
        for line in output.splitlines():
            m = re.match(r'(test_\w+) .* \.\.\. (ok|FAIL|ERROR|skipped.*)$',line)
            if m: found[m[1]] = 'passed' if m[2]=='ok' else 'skipped' if m[2].startswith('skipped') else 'failed'
    else:
        for line in output.splitlines():
            m = re.match(r'\s*(not ok|ok) \d+ - (.*?)(?: # (SKIP|TODO).*)?$',line)
            if m: found[m[2]] = 'skipped' if m[3] else 'passed' if m[1]=='ok' else 'failed'
    return found

def assess(cases, results, exit_code):
    rows=[]
    for case in cases:
        matches=[v for name,v in results.items() if name==case.get('existingTestName') or re.match(r'(?:test_)?'+re.escape(case['id'].replace('-','_'))+r'(?:_|$)',name) or name.startswith(case['id']+' ')]
        status = 'not_run' if not matches else 'failed' if 'failed' in matches else 'skipped' if 'skipped' in matches else 'passed'
        rows.append({'id':case['id'],'status':status})
    return rows, 1 if exit_code or not results or any(r['status']!='passed' for r in rows) else 0

def aggregate(codes): return 1 if 1 in codes else 2 if 2 in codes else 0

def run(argv, root):
    try:
        p=subprocess.run(argv,cwd=root,text=True,encoding='utf-8',errors='replace',capture_output=True,timeout=120,shell=False)
        return p.returncode,p.stdout+'\n'+p.stderr,None
    except FileNotFoundError: return None,'','executable unavailable'
    except subprocess.TimeoutExpired as exc: return 1,str(exc),'timeout'

def execute(args, root=ROOT):
    tracker,catalog=load_repository_spec(root)
    errors=validate_spec(tracker,catalog,root)
    if errors: raise ValueError('; '.join(errors))
    tasks={t['id']:t for t in tracker['tasks']}; packs={p['id']:p for p in catalog['packs']}
    selected=set(); deferred=set()
    if args.all: selected=set(packs)
    elif args.task: selected=set(tasks[args.task]['requiredUnitPacks'])
    elif args.pack: selected=set(args.pack)
    else:
        for path in args.changed:
            contained(root,path)
            matched=False
            for rule in catalog['changeImpact']:
                if any(fnmatch.fnmatchcase(path,p) for p in rule['patterns']): selected.update(rule['unitPacks']); matched=True
            for pack in packs.values():
                if path in pack['testFiles']: selected.add(pack['id']); matched=True
            if not matched: raise ValueError('No pack mapping: '+path)
        for pid in selected:
            owner=packs[pid].get('createdByTask')
            if owner and tasks[owner]['automationStatus']=='todo' and not all(contained(root,f).is_file() for f in packs[pid]['testFiles']): deferred.add(pid)
    if not selected or selected-set(packs): raise ValueError('Invalid/empty selection')
    config_path=root/'research/prebuild/run-config.json'
    run_id=json.loads(config_path.read_text(encoding='utf-8-sig'))['runId'] if config_path.exists() else 'unconfigured'
    invocation=uuid.uuid4().hex
    out=contained(root,f'research/prebuild/runs/{run_id}/unit-packs/{invocation}.json'); out.parent.mkdir(parents=True,exist_ok=True)
    report={'runId':run_id,'invocationId':invocation,'selection':vars(args),'testedFileHashes':{},'manifestHash':digest(catalog),'packs':[],'cases':[],'limitations':['Unit results do not establish empirical research or gate acceptance.'],'commandVersions':{},'packDefinitionHashes':{},'fixtureHashes':{},'logs':[]}
    for exe in ('python','node'):
        report['commandVersions'][exe]=run([exe,'--version'],root)[1].strip()
    codes=[]
    for pid in sorted(selected):
        pack=packs[pid]; report['packDefinitionHashes'][pid]=digest(pack)
        absent=any(not contained(root,f).is_file() for f in pack['testFiles'])
        rows=[]; code=0; logs=[]
        if pid in deferred or absent:
            reason='deferred_owner' if pid in deferred else 'planned_suite_unavailable'
            rows=[{'id':c['id'],'status':'not_run','reason':reason} for c in pack['cases']]; code=2
        else:
            results={}; child_codes=[]; unavailable=[]
            for cid in pack['commandIds']:
                argv=list(tracker['commands'][cid]['argv'])
                if argv[0]=='python': argv.append('-v')
                elif argv[0]=='node': argv.insert(1,'--test-reporter=tap')
                rc,output,reason=run(argv,root)
                log=out.with_name(invocation+'-'+cid+'.log'); log.write_text(output,encoding='utf-8'); logs.append(str(log.relative_to(root)).replace('\\','/'))
                child_codes.append(2 if rc is None else 1 if rc else 0)
                parsed=parse_results(output,'python' if argv[0]=='python' else 'node')
                for name,status in parsed.items():
                    if results.get(name) in ('failed','skipped'): continue
                    results[name]=status
                if reason: unavailable.append(reason)
            rows,code=assess(pack['cases'],results,aggregate(child_codes))
            if 2 in child_codes and 1 not in child_codes:
                code=2
                for row in rows:
                    if row['status']=='not_run': row['reason']='; '.join(unavailable)
            if 1 in child_codes: code=1
        for f in pack['testFiles']+pack.get('sut',[]):
            path=contained(root,f)
            if path.is_file(): report['testedFileHashes'][f]=file_hash(path)
        report['packs'].append({'id':pid,'exitCode':code,'cases':rows,'logs':logs}); report['cases'].extend(rows); report['logs'].extend(logs); codes.append(code)
    for helper in ('provenance.py','plan_contracts.py','artifact_contracts.py','evidence_rules.py'):
        path=root/'research/prebuild/tools'/helper
        if path.is_file(): report['testedFileHashes'][path.relative_to(root).as_posix()]=file_hash(path)
    fixtures=root/'research/prebuild/tests/fixtures'
    if fixtures.exists():
        report['fixtureHashes']={p.relative_to(root).as_posix():file_hash(p) for p in fixtures.rglob('*') if p.is_file()}
    for key,status in [('passed','passed'),('failed','failed'),('skipped','skipped'),('notRun','not_run')]: report[key]=sum(c['status']==status for c in report['cases'])
    report['exitCode']=aggregate(codes); out.write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'report':str(out),'exitCode':report['exitCode'],'passed':report['passed'],'failed':report['failed'],'notRun':report['notRun']}))
    return report['exitCode']
def main():
    p=argparse.ArgumentParser(); group=p.add_mutually_exclusive_group(required=True)
    group.add_argument('--task'); group.add_argument('--pack',nargs='+'); group.add_argument('--changed',nargs='+'); group.add_argument('--all',action='store_true')
    try: return execute(p.parse_args())
    except (ValueError,KeyError) as exc: print(str(exc),file=sys.stderr); return 1
if __name__=='__main__': sys.exit(main())
