"""Frozen synthetic invariant cases. Golden outputs are explicit, independent of ranker."""
import argparse,json,random,copy
from collections import Counter
from provenance import ROOT,digest,file_hash
GROUPS={'ordinary':50,'price_budget':20,'identity_condition':15,'unknown_no_fit':15,'freshness':10,'revision':10}
# Literal golden states. No production evaluator is imported or called.
SCENARIOS=[
 {'id':'exact','budgetVnd':20000000,'costs':{'baseVnd':20000000,'shippingVnd':200000,'mandatoryExtraFeesVnd':300000,'discountVnd':500000},'expected':{'completeTotalVnd':20000000,'affordability':'within_budget','state':'eligible'}},
 {'id':'one_less','budgetVnd':19999999,'costs':{'baseVnd':20000000,'shippingVnd':200000,'mandatoryExtraFeesVnd':300000,'discountVnd':500000},'expected':{'completeTotalVnd':20000000,'affordability':'over_budget','state':'no_verified_affordable_offer'}},
 {'id':'unknown_shipping','budgetVnd':22000000,'costs':{'baseVnd':20000000,'shippingVnd':None,'mandatoryExtraFeesVnd':300000,'discountVnd':500000},'expected':{'completeTotalVnd':None,'affordability':'unknown','state':'no_verified_affordable_offer'}},
 {'id':'wrong_variant','variantId':'V-A','offerVariantId':'V-B','expected':{'state':'evidence_unknown','fit':'unknown'}},
 {'id':'used','condition':'used','expected':{'state':'no_fit','fit':'fail'}},
 {'id':'unknown_capability','datasetKind':'crawled_draft','expected':{'state':'evidence_unknown','fit':'unknown'}},
 {'id':'hard_fail','requiredRamGb':32,'ramGb':8,'softPreference':'portable','expected':{'state':'no_fit','fit':'fail'}},
 {'id':'filter_empty','maxWeightKg':1,'weightKg':1.5,'expected':{'state':'filter_empty','fit':'pass'}},
 {'id':'expired','offerValidity':'expired','expected':{'state':'no_verified_affordable_offer','fit':'pass'}},
 {'id':'source_failure','sourceStatus':'failed','expected':{'state':'source_unavailable'}},
 {'id':'stale_revision','activeRevision':2,'responseRevision':1,'expected':{'state':'stale_revision','accept':False}},
 {'id':'history','savedTotalVnd':20000000,'currentTotalVnd':21000000,'expected':{'historicalTotalVnd':20000000,'currentTotalVnd':21000000,'rewriteHistory':False}}]
GROUP_SCENARIOS={'ordinary':[0,7],'price_budget':[0,1,2],'identity_condition':[3,4],'unknown_no_fit':[5,6,9],'freshness':[8,9],'revision':[10,11]}
def real_suitability(evidence,independent_review=False):return 'unknown' if not evidence or not independent_review else 'review_required'
def validate_corpus(data):
    errors=[];cases=data.get('cases',[]);ids=[c['id'] for c in cases]
    if len(ids)!=len(set(ids)):errors.append('duplicate/overlapping case identity')
    if Counter(c['primaryGroup'] for c in cases)!=Counter(GROUPS):errors.append('group totals mismatch')
    if Counter(c['partition'] for c in cases)!=Counter({'development':80,'heldout':40}):errors.append('partition totals mismatch')
    if data.get('freezeHash')!=digest({k:v for k,v in data.items() if k!='freezeHash'}):errors.append('freeze mismatch')
    return errors
def build(config,snapshot_hashes):
    if config['corpus']['groupCounts']!=GROUPS or config['corpus']['profileCount']!=120:raise ValueError('Unsupported corpus quotas; revise explicit fixture design first')
    rng=random.Random(config['seed']);cases=[]
    for group,count in GROUPS.items():
        positions=list(range(count));rng.shuffle(positions);held=set(positions[:count//3])
        # 50->16, 20->6, 15->5,15->5,10->3,10->3 =38; allocate remaining to ordinary and price.
        if group in ('ordinary','price_budget'):held.add(positions[count//3])
        for i in range(count):
            scenario=copy.deepcopy(SCENARIOS[GROUP_SCENARIOS[group][i%len(GROUP_SCENARIOS[group])]])
            expected=scenario.pop('expected');sid=scenario.pop('id')
            cases.append({'id':f'C-{group}-{i+1:03}','primaryGroup':group,'tags':[sid,'synthetic_invariant'],'partition':'heldout' if i in held else 'development','needs':{'budgetVnd':scenario.pop('budgetVnd',22000000),'confirmed':True},'scenario':scenario,'expected':expected,'snapshotRef':'inline_synthetic','labelProvenance':'synthetic_rule','evidenceRefs':[],'adjudication':'independent literals; not reviewed hardware suitability'})
    data={'corpusVersion':'synthetic-invariants-v1','seed':config['seed'],'snapshotHashes':snapshot_hashes,'cases':cases};data['freezeHash']=digest(data)
    if validate_corpus(data):raise ValueError(validate_corpus(data))
    return data
def record_holdout(ledger,corpus_hash,config_hash,run_id):
    result=copy.deepcopy(ledger);runs=result.setdefault('runs',[]);prior=any(r['corpusHash']==corpus_hash and r['configHash']==config_hash for r in runs)
    runs.append({'corpusHash':corpus_hash,'configHash':config_hash,'runId':run_id,'classification':'diagnostic_reuse' if prior else 'first_qualifying','consumed':True});return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--config',required=True);p.add_argument('--out',required=True);a=p.parse_args();config=json.loads((ROOT/a.config).read_text(encoding='utf-8'))
    refs=['apps/adviser/src/domain.ts','apps/adviser/src/picker.ts','research/prebuild/04-catalog-audit.json'];hashes={r:file_hash(ROOT/r) for r in refs};data=build(config,hashes)
    envelope={'schemaVersion':1,'taskId':'R05','inputs':[{'ref':r,'sha256':h} for r,h in hashes.items()],'data':data,'evidenceRefs':[],'gaps':[{'id':'GAP-R05-001','reason':'Labels are synthetic invariants, not independent real-world suitability judgments.','nextAction':'Obtain exact workload evidence and independent adjudication for real quality evaluation.'}]}
    (ROOT/a.out).write_text(json.dumps(envelope,indent=2),encoding='utf-8');print('120 frozen synthetic cases; development=80 heldout=40; no holdout run performed')
if __name__=='__main__':main()
