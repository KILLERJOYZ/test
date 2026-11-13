"""Artifact structure and semantic invariants for the prebuild research package."""
from evidence_rules import android_errors, operations_errors
from readiness import backlog_errors, gate_exit
import re
from datetime import datetime
from provenance import contained, file_hash, digest
FIELDS={
'01-buyer-protocol.json':'cohorts targetCount screening questions taskEffectByQuestion consent retention',
'01-buyer-observations.json':'collectedCount participants observations hypotheses',
'02-journey-benchmark.json':'taskIds entries hypotheses',
'03-source-register.json':'sources',
'04-catalog-audit.json':'sourceHash counts listings canonicalCandidates reviewQueue reviewedCount rejectedCount unknownCount',
'05-workload-policy.json':'rulesVersion datasetKind supportedWorkloads rules unknownPolicy evidenceRefs',
'05-evaluation-cases.json':'corpusVersion seed snapshotHashes freezeHash cases',
'06-flow-validation.json':'buildRef states automatedChecks participantSessions findings',
'07-contract-examples.json':'valid invalid',
'09-holdout-usage.json':'corpusHash configHash partition consumed reason',
'09-query-cases.json':'version seed snapshotHashes partitions queries',
'09-retrieval-ranking-results.json':'runs',
'10-ai-evaluation.json':'controlledCases live provider model authorizationRef',
'11-android-cases.json':'buildHash targetMatrix physicalDeviceValidated cases rawTimingSamples limitations',
'12-operations-scenarios.json':'scenarios',
'13-cost-inputs.json':'currency datedRates usage staffEffort usefulSessionDefinition scenarios',
'13-cost-results.json':'scenarios',
'14-production-backlog.json':'items',
'14-build-readiness.json':'automationSummary researchQuestions gaps criticalIssues gates nextRunnableTask externalInputs resumeCommand'}
def validate_artifact(ref,obj,task_id,root,evidence_ids):
    errors=[]
    def need(v,fields,where):
        if not isinstance(v,dict): errors.append(where+': expected object'); return
        for field in fields.split():
            if field not in v: errors.append(where+': missing '+field)
    name=ref.rsplit('/',1)[-1]
    if name not in FIELDS and name!='07-api-contract.json': return errors
    if name=='07-api-contract.json':
        need(obj,'openapi info paths components x-research',ref)
        if not str(obj.get('openapi','')).startswith('3.1.'): errors.append(ref+': expected OpenAPI 3.1')
        def refs(v):
            if isinstance(v,dict):
                if '$ref' in v:
                    current=obj
                    try:
                        for part in v['$ref'].removeprefix('#/').split('/'): current=current[part]
                    except (KeyError,TypeError): errors.append(ref+': unresolved schema reference')
                for x in v.values(): refs(x)
            elif isinstance(v,list):
                for x in v: refs(x)
        refs(obj); return errors
    need(obj,'schemaVersion taskId inputs data evidenceRefs gaps',ref)
    if obj.get('schemaVersion')!=1 or obj.get('taskId')!=task_id: errors.append(ref+': envelope identity mismatch')
    for entry in obj.get('inputs',[]):
        need(entry,'ref sha256',ref+'.inputs')
        try:
            path=contained(root,entry['ref'])
            if not path.is_file() or file_hash(path)!=entry['sha256']: errors.append(ref+': stale input '+entry['ref'])
        except (ValueError,KeyError): errors.append(ref+': unsafe input reference')
    for eid in obj.get('evidenceRefs',[]):
        if eid not in evidence_ids: errors.append(ref+': unresolved evidence '+str(eid))
    for gap in obj.get('gaps',[]): need(gap,'id reason nextAction',ref+'.gaps')
    d=obj.get('data',{}); need(d,FIELDS[name],ref+'.data')
    if not isinstance(d,dict): return errors
    if name=='11-android-cases.json': errors.extend(android_errors(d))
    if name=='12-operations-scenarios.json': errors.extend(operations_errors(d))
    if name=='01-buyer-protocol.json':
        if d.get('targetCount')!=12: errors.append(ref+': targetCount must be 12')
        mapping=d.get('taskEffectByQuestion',{})
        for q in d.get('questions',[]):
            if not mapping.get(q.get('id')): errors.append(ref+': unmapped question '+str(q.get('id')))
    if name=='04-catalog-audit.json':
        listings=d.get('listings',[])
        if sum(d.get(k,0) for k in ('reviewedCount','rejectedCount','unknownCount'))!=len(listings): errors.append(ref+': catalog accounting mismatch')
        for listing in listings:
            need(listing,'sourceId sourceUrl condition identity missingFields invalidFields originalAvailability availabilityBasis observedAt evidenceRefs',ref+'.listings')
        for candidate in d.get('canonicalCandidates',[]):
            if candidate.get('matchStatus') not in ('accepted','unresolved','rejected'): errors.append(ref+': invalid canonical match')
            if candidate.get('matchStatus')=='accepted' and not candidate.get('evidenceRefs'): errors.append(ref+': accepted identity requires evidence')
    if name=='09-query-cases.json':
        queries=d.get('queries',[])
        if len(queries)!=60 or sum(q.get('partition')=='development' for q in queries)!=40 or sum(q.get('partition')=='heldout' for q in queries)!=20: errors.append(ref+': expected 60 queries split 40/20')

    if name=='01-buyer-observations.json':
        participants=d.get('participants',[])
        if d.get('collectedCount')!=len(participants): errors.append(ref+': participant count mismatch')
        for p in participants:
            if p.get('kind')!='observed' or not p.get('evidenceRefs'): errors.append(ref+': participant needs real sourced observation')
    if name=='02-journey-benchmark.json':
        for entry in d.get('entries',[]):
            need(entry,'sourceUrl observedAt method taskId status observations evidenceRefs',ref+'.entries')
            if entry.get('status') not in ('observed','advertised','inaccessible','not_run'): errors.append(ref+': invalid journey status')
            if entry.get('status')=='observed' and (not entry.get('evidenceRefs') or not entry.get('observations') or entry.get('observationKind')=='advertised'): errors.append(ref+': observed journey requires observation evidence')
            if entry.get('participantSuccessCount',0): errors.append(ref+': researcher walkthrough cannot establish participant success')
            if entry.get('timingMs') is not None and not entry.get('timingEvidenceRef'): errors.append(ref+': unsupported timing')
            if not entry.get('sourceUrl') or not entry.get('observedAt') or entry.get('taskId') not in d.get('taskIds',[]): errors.append(ref+': missing comparable row identity')
    if name=='03-source-register.json':
        for source in d.get('sources',[]):
            need(source,'id accessRoute coverage uses cadence retention evidenceRefs unresolved',ref+'.sources')
            for use in source.get('uses',[]):
                need(use,'purpose status evidenceRefs scope expiresAt',ref+'.uses')
                if use.get('status') not in ('documented_basis','prohibited','unresolved'): errors.append(ref+': invalid source-use status')
                if use.get('status')=='documented_basis' and (not use.get('evidenceRefs') or use.get('basisKind') not in ('agreement','explicit_terms','official_api_terms') or not use.get('scope') or not use.get('observedAt')): errors.append(ref+': documented basis needs scoped terms/agreement evidence')
                if use.get('ready') and (use.get('status')!='documented_basis' or use.get('expired')): errors.append(ref+': prohibited/unresolved/expired use cannot be ready')
        def sensitive(v):
            if isinstance(v,dict):
                for k,x in v.items():
                    if k.lower() in ('apikey','api_key','password','token','privatecontractpayload') and x: errors.append(ref+': sensitive serialized value')
                    sensitive(x)
            elif isinstance(v,list):
                for x in v: sensitive(x)
        sensitive(d)
    if name=='05-evaluation-cases.json':
        cases=d.get('cases',[])
        if len(cases)!=120: errors.append(ref+': expected 120 cases')
        if sum(c.get('partition')=='development' for c in cases)!=80 or sum(c.get('partition')=='heldout' for c in cases)!=40: errors.append(ref+': expected disjoint 80/40 partition')
        if d.get('freezeHash')!=digest({k:v for k,v in d.items() if k!='freezeHash'}): errors.append(ref+': invalid freeze hash')
        for c in cases: need(c,'id primaryGroup tags partition needs snapshotRef expected labelProvenance evidenceRefs adjudication',ref+'.cases')
    if name=='06-flow-validation.json':
        if {s.get('id') for s in d.get('states',[])}!={f'T{i:02}' for i in range(1,24)}: errors.append(ref+': must cover T01-T23')
        if not {f'FLOW-{i:02}' for i in range(1,9)}.issubset({f.get('id') for f in d.get('findings',[])}): errors.append(ref+': must cover FLOW-01-08')
    if name=='10-ai-evaluation.json':
        live=d.get('live',{})
        need(live,'status reason runs',ref+'.live')
        if live.get('status')=='pass' and (not d.get('authorizationRef') or not live.get('runs') or any(r.get('mode')!='live' for r in live['runs'])): errors.append(ref+': unsupported live pass')
    if name=='11-android-cases.json' and d.get('physicalDeviceValidated'):
        if not any(t.get('kind')=='physical' and t.get('serial') for t in d.get('targetMatrix',[])): errors.append(ref+': no named physical device')
        if not all(c.get('result')=='pass' and c.get('evidenceRefs') for c in d.get('cases',[])) or not d.get('cases'): errors.append(ref+': unsupported physical journey completion')
    if name=='12-operations-scenarios.json':
        if len(d.get('scenarios',[]))!=6: errors.append(ref+': expected six scenarios')
        for s in d.get('scenarios',[]):
            need(s,'trigger authority expectedTransitions userState recoveryCheck mode result evidenceRefs',ref+'.scenarios')
            if s.get('mode') not in ('sandbox','tabletop','not_run'): errors.append(ref+': invalid operation mode')
    if name=='14-build-readiness.json':
        for g in d.get('gates',[]):
            if gate_exit(g,d.get('evidenceSufficient',False),d.get('criticalIssues',[]))==1: errors.append(ref+': unsupported accepted gate')
    if name=='14-production-backlog.json':
        for item in d.get('items',[]):
            errors.extend(ref+': backlog '+field for field in backlog_errors(item))
            need(item,'id requirementIds outcome contractChanges stateChanges dependsOn exceptionBehavior evidenceRefs estimateAssumptions scopeStatus',ref+'.items')
            if not (item.get('files') or item.get('modules/files')) or not (item.get('acceptanceCommands') or item.get('acceptanceScenarios')): errors.append(ref+': backlog needs files and executable acceptance')
            if item.get('scopeStatus')=='accepted' and not item.get('decisionRef'): errors.append(ref+': accepted scope needs decision')
    def walk(v,where):
        if isinstance(v,dict):
            for key,allowed in {'fit':('pass','fail','unknown'),'priceCompleteness':('complete','partial','conditional'),'affordability':('within_budget','over_budget','unknown'),'datasetKind':('synthetic','crawled_draft','reviewed_research','production')}.items():
                if key in v and v[key] not in allowed: errors.append(where+': invalid '+key)
            if 'evidenceRefs' in v:
                for eid in v['evidenceRefs']:
                    if eid not in evidence_ids: errors.append(where+': unresolved evidence '+str(eid))
            if v.get('priceCompleteness')=='complete' and v.get('completeTotalVnd') is None: errors.append(where+': complete price needs total')
            if 'costPerUsefulSession' in v and not v.get('denominator') and v['costPerUsefulSession'] is not None: errors.append(where+': missing useful-session denominator')
            for k,x in v.items():
                if k.endswith('Vnd') and x is not None and (type(x)!=int or not 0<=x<=9007199254740991): errors.append(where+': invalid money '+k)
                walk(x,where+'.'+k)
        elif isinstance(v,list):
            ids=[x['id'] for x in v if isinstance(x,dict) and 'id' in x]
            if len(ids)!=len(set(ids)): errors.append(where+': duplicate IDs')
            for x in v: walk(x,where)
    walk(d,ref+'.data')
    return errors
