import json, subprocess
from datetime import datetime, timezone
from provenance import ROOT, file_hash, definition
from plan_contracts import load_repository_spec
root=ROOT; tracker,catalog=load_repository_spec(root); config=json.loads((root/'research/prebuild/run-config.json').read_text()); run_id=config['runId']; base=root/f'research/prebuild/runs/{run_id}'; base.mkdir(parents=True,exist_ok=True)
record={'schemaVersion':1,'runId':run_id,'taskId':'R00','automationStatus':'running','evidenceStatus':'partial','definitionHash':definition(tracker['tasks'][0]),'inputHashes':{p:file_hash(root/p) for p in tracker['tasks'][0]['reads']},'consumedConfig':{'seed':config['seed'],'ai.maxRequests':config['ai']['maxRequests'],'ai.maxCostVnd':config['ai']['maxCostVnd']},'consumedEvidenceHashes':{},'outputHashes':{},'sharedWrites':['run-config defaults initialized','evidence index initialized'],'decisions':[],'gaps':['Validator completeness still under implementation'],'blocker':None,'unitPackResults':[],'checks':[]}
for cid in ['plan_contract_tests','baseline_domain','validator_tests','unit_runner_tests','baseline_types','baseline_service']:
    start=datetime.now(timezone.utc).isoformat(); argv=tracker['commands'][cid]['argv']; argv=list(argv)
    if argv[0]=='npm': argv[0]='npm.cmd'
    p=subprocess.run(argv,cwd=root,text=True,encoding='utf-8',errors='replace',capture_output=True,timeout=120)
    log=base/(cid+'.log'); log.write_text(p.stdout+'\n'+p.stderr,encoding='utf-8')
    record['checks'].append({'id':cid,'command':argv,'cwd':'.','startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':p.returncode,'result':'pass' if p.returncode==0 else 'fail','mode':tracker['commands'][cid]['level'],'outputRef':log.relative_to(root).as_posix(),'reason':None})
    print(cid,p.returncode)
(base/'R00.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
tracker['tasks'][0]['runRecord']=(base/'R00.json').relative_to(root).as_posix()
(root/'docs/planning/PREBUILD_RESEARCH_TRACKER.json').write_text(json.dumps(tracker,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
