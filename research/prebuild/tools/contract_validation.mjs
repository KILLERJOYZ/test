// Shared runtime contracts consumed by the isolated spike; no provider authority.
export const STATES=['needs_clarification','evidence_unknown','eligible','no_fit','no_verified_affordable_offer','filter_empty','source_unavailable','stale_revision'];
export const CONTEXT=['decisionId','runId','requestId','profileRevision','catalogVersion','rulesVersion','offerContextHash','focusVariantIds','origin'];
export function money(v){return v===null || (Number.isSafeInteger(v)&&v>=0);}
export function exactShape(v,fields){if(!v||typeof v!=='object'||Array.isArray(v)||fields.some(f=>!(f in v))||Object.keys(v).some(f=>!fields.includes(f)))throw Error('schema_fields');}
export function context(v){exactShape(v,CONTEXT);for(const k of CONTEXT){if(k==='profileRevision'){if(!Number.isSafeInteger(v[k])||v[k]<0)throw Error('revision');}else if(k==='focusVariantIds'){if(!Array.isArray(v[k])||new Set(v[k]).size!==v[k].length||v[k].some(x=>typeof x!=='string'||!x))throw Error('focus');}else if(typeof v[k]!=='string'||!v[k])throw Error('context_'+k);}return v;}
export function acceptContext(response,active){context(response);context(active);if(CONTEXT.some(k=>JSON.stringify(response[k])!==JSON.stringify(active[k])))throw Error('stale_revision');return true;}
export function candidate(c){exactShape(c,['variantId','fit','offerValidity','priceCompleteness','affordability','completeTotalVnd','reasonCodes','evidenceRefs']);if(typeof c.variantId!=='string'||!c.variantId||!['pass','fail','unknown'].includes(c.fit)||!['current','stale','expired','unavailable','suspended','unknown'].includes(c.offerValidity)||!['complete','partial','conditional'].includes(c.priceCompleteness)||!['within_budget','over_budget','unknown'].includes(c.affordability)||!money(c.completeTotalVnd)||!Array.isArray(c.reasonCodes)||!Array.isArray(c.evidenceRefs))throw Error('candidate');if(c.priceCompleteness==='complete'&&c.completeTotalVnd===null)throw Error('missing_total');if(c.completeTotalVnd===null&&c.affordability!=='unknown')throw Error('unknown_affordability');return c;}
export function eligible(c){candidate(c);return c.fit==='pass'&&c.offerValidity==='current'&&c.priceCompleteness==='complete'&&c.affordability==='within_budget'&&c.completeTotalVnd!==null;}
export function result(r){exactShape(r,['context','state','candidates','excluded','unknowns']);context(r.context);if(!STATES.includes(r.state)||![r.candidates,r.excluded,r.unknowns].every(Array.isArray))throw Error('result');for(const c of [...r.candidates,...r.excluded,...r.unknowns])candidate(c);if(r.state==='eligible'&&(!r.candidates.length||r.candidates.some(c=>!eligible(c))))throw Error('contradictory_eligible');return r;}
export function exactOffer(offer,variantId){if(offer.variantId!==variantId||offer.matchStatus!=='accepted')throw Error('variant_mismatch');return offer;}
export function claims(values,facts){for(const c of values){exactShape(c,['factId','variantId','verdict']);const f=facts.find(f=>f.factId===c.factId);if(!f||f.variantId!==c.variantId||f.verdict!==c.verdict)throw Error('contradictory_claim');}return values;}
export function resultState({confirmed,sourceStatus,fitStates,verifiedCount,visibleCount}){if(!confirmed)return 'needs_clarification';if(sourceStatus!=='success')return 'source_unavailable';if(!fitStates.includes('pass'))return fitStates.includes('unknown')?'evidence_unknown':'no_fit';if(!verifiedCount)return 'no_verified_affordable_offer';if(!visibleCount)return 'filter_empty';return 'eligible';}
export function needs(n){
 exactShape(n,['decisionId','profileRevision','confirmed','budgetVnd','budgetScope','orderedUses','requiredTasks','hardConstraints','preferences']);
 const strings=value=>Array.isArray(value)&&value.every(x=>typeof x==='string'&&x.trim().length>0)&&new Set(value).size===value.length;
 if(typeof n.decisionId!=='string'||!n.decisionId.trim()||!Number.isSafeInteger(n.profileRevision)||n.profileRevision<0||typeof n.confirmed!=='boolean'||!money(n.budgetVnd)||n.budgetVnd===null||n.budgetVnd===0||n.budgetScope!=='device-delivered'||!strings(n.orderedUses)||!strings(n.requiredTasks)||!strings(n.preferences)||n.preferences.length>2||n.orderedUses.length>3||(n.confirmed&&n.orderedUses.length===0)||n.requiredTasks.some(id=>n.orderedUses.includes(id))||!Array.isArray(n.hardConstraints)||n.hardConstraints.some(c=>!c||typeof c!=='object'||Array.isArray(c)))throw Error('needs');
 return n;
}
export function requestNeedsContext(n,c){needs(n);context(c);if(n.decisionId!==c.decisionId||n.profileRevision!==c.profileRevision)throw Error('stale_revision');return true;}
export function variant(v){
 exactShape(v,['variantId','familyId','exactConfiguration','condition','publicationState']);
 if(![v.variantId,v.familyId].every(x=>typeof x==='string'&&x.trim())||!v.exactConfiguration||typeof v.exactConfiguration!=='object'||Array.isArray(v.exactConfiguration)||!Object.keys(v.exactConfiguration).length||!['new','used','refurbished','unknown'].includes(v.condition)||!['draft','reviewed','published','withdrawn'].includes(v.publicationState))throw Error('variant');return v;
}
export function instant(value){
 if(typeof value!=='string')return false;
 const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
 if(!match||!Number.isFinite(Date.parse(value)))return false;
 const [year,month,day,hour,minute,second]=match.slice(1,7).map(Number);
 const leap=year%4===0&&(year%100!==0||year%400===0);const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
 return month>=1&&month<=12&&day>=1&&day<=days[month-1]&&hour<24&&minute<60&&second<60;
}
export function offer(o){exactShape(o,['offerId','variantId','matchStatus','sellerId','datasetKind','costs','discountEligibility','validity','observedAt','evidenceRefs']);if(!o.offerId||!o.variantId||!o.sellerId||!['accepted','unresolved','rejected'].includes(o.matchStatus)||!['synthetic','crawled_draft','reviewed_research','production'].includes(o.datasetKind)||!['current','stale','expired','unavailable','suspended','unknown'].includes(o.validity)||!Number.isFinite(Date.parse(o.observedAt))||!Array.isArray(o.evidenceRefs))throw Error('offer');for(const key of ['baseVnd','shippingVnd','mandatoryExtraFeesVnd','discountVnd'])if(!(key in o.costs)||!money(o.costs[key]))throw Error('offer_cost');return o;}
export function savedDecision(s){
 exactShape(s,['schemaVersion','needs','variantIds','historicalConfigurations','observations','savedAt','catalogVersion','rulesVersion']);needs(s.needs);
 if(s.schemaVersion!==1||![s.catalogVersion,s.rulesVersion].every(x=>typeof x==='string'&&x.trim())||!instant(s.savedAt)||!Array.isArray(s.variantIds)||s.variantIds.length<1||s.variantIds.length>2||s.variantIds.some(x=>typeof x!=='string'||!x.trim())||new Set(s.variantIds).size!==s.variantIds.length||!Array.isArray(s.historicalConfigurations)||!Array.isArray(s.observations))throw Error('saved');
 if(s.historicalConfigurations.length!==s.variantIds.length||new Set(s.historicalConfigurations.map(v=>v?.variantId)).size!==s.variantIds.length)throw Error('historical_identity');
 for(const v of s.historicalConfigurations){variant(v);if(!s.variantIds.includes(v.variantId))throw Error('historical_identity');}
 if(s.observations.length!==s.variantIds.length||new Set(s.observations.map(o=>o?.variantId)).size!==s.variantIds.length)throw Error('historical_observation');
 for(const o of s.observations){
  if(!o||typeof o!=='object'||Array.isArray(o)||!s.variantIds.includes(o.variantId)||!money(o.totalVnd)||!instant(o.observedAt)||Object.keys(o).some(k=>!['variantId','totalVnd','observedAt','offerId','sellerId'].includes(k))||['offerId','sellerId'].some(k=>k in o&&(typeof o[k]!=='string'||!o[k].trim())))throw Error('historical_observation');
 }
 return s;
}
