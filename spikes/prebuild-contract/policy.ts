import { candidate, resultState, needs as validateNeeds } from '../../research/prebuild/tools/contract_validation.mjs';
export function evaluate(needs:any,variants:any[],offers:any[],context:any,sourceStatus='success',visibleIds?:string[]) {
 validateNeeds(needs);
 const rows=variants.map(v=>{
  const checks=[v.capability==='pass'?'pass':v.capability==='fail'?'fail':'unknown',...needs.hardConstraints.map((c:any)=>constraintFit(v,c))];
  const fit=checks.includes('fail')?'fail':checks.includes('unknown')?'unknown':'pass';
  const exact=offers.filter(o=>o.variantId===v.variantId&&o.matchStatus==='accepted');
  const priced=exact.map(o=>{
   const costs=o.costs;const amounts=[costs.baseVnd,costs.shippingVnd,costs.mandatoryExtraFeesVnd];
   if([...amounts,costs.discountVnd].some(n=>n!==null&&(!Number.isSafeInteger(n)||n<0)))throw Error('invalid_money');
   const total=amounts.some(n=>n===null)||(o.discountEligibility==='confirmed'&&costs.discountVnd===null)?null:amounts.reduce((a,b)=>a+b,0)-(o.discountEligibility==='confirmed'?costs.discountVnd:0);
   if(total!==null&&(!Number.isSafeInteger(total)||total<0))throw Error('invalid_money');
   return {variantId:v.variantId,fit,offerValidity:o.validity,priceCompleteness:total===null?'partial':'complete',affordability:total===null?'unknown':total<=needs.budgetVnd?'within_budget':'over_budget',completeTotalVnd:total,reasonCodes:[fit==='pass'?'synthetic_fit':checks[0]==='fail'?'capability_fail':checks.slice(1).includes('fail')?'hard_constraint_fail':checks[0]==='unknown'?'capability_unknown':'hard_constraint_unknown'],evidenceRefs:v.evidenceRefs||[]};
  });
  const verified=priced.filter(c=>c.offerValidity==='current'&&c.priceCompleteness==='complete'&&c.affordability==='within_budget').sort((a,b)=>a.completeTotalVnd-b.completeTotalVnd);
  return candidate(verified[0]||priced[0]||{variantId:v.variantId,fit,offerValidity:'unknown',priceCompleteness:'partial',affordability:'unknown',completeTotalVnd:null,reasonCodes:['no_exact_offer'],evidenceRefs:v.evidenceRefs||[]});
 });
 const verified=rows.filter(c=>c.fit==='pass'&&c.offerValidity==='current'&&c.priceCompleteness==='complete'&&c.affordability==='within_budget');
 const visible=verified.filter(c=>!visibleIds||visibleIds.includes(c.variantId));
 return {context,state:resultState({confirmed:needs.confirmed,sourceStatus,fitStates:rows.map(c=>c.fit),verifiedCount:verified.length,visibleCount:visible.length}),candidates:visible,excluded:rows.filter(c=>c.fit==='fail'),unknowns:rows.filter(c=>c.fit==='unknown'||c.completeTotalVnd===null)};
}
export function publish(record:any,authorization:any){if(record.datasetKind!=='production'||!authorization?.reviewed||!authorization?.permitted)throw Error('publication_not_authorized');return record;}

// Only explicit supported operators and values establish hard-constraint evidence.
export function constraintFit(v:any,c:any):'pass'|'fail'|'unknown' {
 const field=c?.field;
 if(!['ramGb','ssdGb','os','condition'].includes(field))return 'unknown';
 const actual=field==='condition'?v.condition:v.exactConfiguration?.[field];
 if(actual===null||actual===undefined)return 'unknown';
 if(c.op==='gte'&&['ramGb','ssdGb'].includes(field)){
  if(!Number.isSafeInteger(c.value)||c.value<0||!Number.isSafeInteger(actual)||actual<0)return 'unknown';
  return actual>=c.value?'pass':'fail';
 }
 if(c.op==='eq'){
  if(['ramGb','ssdGb'].includes(field)&&(!Number.isSafeInteger(c.value)||!Number.isSafeInteger(actual)||c.value<0||actual<0))return 'unknown';
  if(['os','condition'].includes(field)&&(typeof c.value!=='string'||typeof actual!=='string'||!c.value||!actual))return 'unknown';
  return actual===c.value?'pass':'fail';
 }
 return 'unknown';
}
