"""Initialize missing execution configuration without overwriting supplied values."""
import json, subprocess
from datetime import datetime, timezone
from provenance import ROOT, defaults, file_hash
from plan_contracts import load_repository_spec

def initialize():
    root=ROOT; base=root/'research/prebuild'; tracker,catalog=load_repository_spec(root)
    def git(*args): return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
    inputs=['brd.md','docs/planning/APP_FLOW.md','docs/planning/APP_FLOW_DEEP_RESEARCH.md','docs/planning/REPOSITORY_RESEARCH_2026-11-13.md','docs/planning/IMPLEMENTATION_PLAN.md','docs/planning/project-traceability.json','research/prebuild/RESEARCH_TEMPLATES.md']
    proposed={'schemaVersion':1,'runId':datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'),'timezone':'Asia/Saigon','baseline':{'commit':git('rev-parse','HEAD'),'inspectedRefs':{'main':git('rev-parse','main')},'inputHashes':{p:file_hash(root/p) for p in inputs}},'scope':{'platform':'Android/Expo/TypeScript','market':'Vietnam/VND','category':'new laptops','includedRequirementIds':['U01','U02','U03','U04','U05','U07','U08'],'excludedIds':['U06','U19'],'decisionRefs':['docs/planning/project-traceability.json#/deliveryScope'],'productionScopeStatus':'provisional'},'seed':20261113,'corpus':{'profileCount':120,'development':80,'heldout':40,'groupCounts':{'ordinary':50,'price_budget':20,'identity_condition':15,'unknown_no_fit':15,'freshness':10,'revision':10}},'retrieval':{'queryCount':60,'development':40,'heldout':20,'k':10},'ai':{'provider':None,'model':None,'keyEnvName':None,'maxRequests':None,'maxCostVnd':None,'authorizationRef':None,'priceEvidenceRef':None,'spendingMechanism':None},'thresholds':{'status':'proposed','coverage':0.8,'recallAt10':0.9,'usability':0.8},'externalInputs':[{'id':key,'status':'unavailable','evidenceRef':None,'nextAction':action} for key,action in [('buyers','Recruit consented participants using R01 protocol.'),('source_rights','Obtain documented per-use source basis.'),('live_ai','Configure access and authorize numeric request/cost limits.'),('physical_device','Select authorized named phone for D01-D08.'),('gate_review','Accountable owner reviews concrete readiness evidence.')]]}
    path=base/'run-config.json'; existing=json.loads(path.read_text(encoding='utf-8-sig')) if path.exists() else {}; defaults(existing,proposed); path.write_text(json.dumps(existing,indent=2),encoding='utf-8')
    index=base/'00-evidence-index.json'
    if not index.exists(): index.write_text(json.dumps({'schemaVersion':1,'items':[]},indent=2),encoding='utf-8')
    task=tracker['tasks'][0]
    if task['automationStatus']=='todo': task['automationStatus']='running'
    task['evidenceStatus']='partial'; task['nextAction']='Complete R00 validator contract and negative integration tests before marking done.'
    (root/'docs/planning/PREBUILD_RESEARCH_TRACKER.json').write_text(json.dumps(tracker,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(existing['runId'])
if __name__=='__main__': initialize()
