import {savedDecision} from '../../research/prebuild/tools/contract_validation.mjs';
/** Injected durable snapshot adapter + explicit in-memory derived evidence index. */
export function repository(storage:any){
 let state:any={schemaVersion:1,variants:[],offers:[],evidence:[],observations:[],saved:[]},tail=Promise.resolve();
 let available=true;const index=new Map();
 const clone=(v:any)=>structuredClone(v);
 async function change(update:any){const operation=tail.then(async()=>{const next=update(clone(state));await storage.write(clone(next));state=next;index.clear();for(const e of state.evidence)if(!e.withdrawn)index.set(e.id,clone(e));return true;});tail=operation.catch(()=>{});return operation;}
 return {
  async restore(){
   const raw=await storage.read();if(raw===null)return;
   try{
    if(!raw||raw.schemaVersion!==1||!['variants','offers','evidence','observations','saved'].every(k=>Array.isArray(raw[k])&&raw[k].every((x:any)=>x&&typeof x==='object'&&!Array.isArray(x))))throw Error('schema');
    for(const s of raw.saved)savedDecision(s);
    const next=clone(raw);const nextIndex=new Map();
    for(const e of next.evidence){if(typeof e.id!=='string'||!e.id)throw Error('evidence');if(!e.withdrawn)nextIndex.set(e.id,clone(e));}
    state=next;index.clear();for(const [id,e] of nextIndex)index.set(id,e);
   }catch{throw Error('recoverable_schema');}
  },
  unavailable(value:boolean){available=!value;},
  catalog(){if(!available)return {status:'source_unavailable',variants:[],offers:[]};return {status:'success',variants:clone(state.variants),offers:clone(state.offers)};},
  upsert(variant:any,offer:any){return change((s:any)=>{s.variants=s.variants.filter((v:any)=>v.variantId!==variant.variantId).concat(clone(variant));s.offers=s.offers.filter((o:any)=>o.offerId!==offer.offerId).concat(clone(offer));const observation={offerId:offer.offerId,observedAt:offer.observedAt,costs:clone(offer.costs)};if(!s.observations.some((o:any)=>JSON.stringify(o)===JSON.stringify(observation)))s.observations.push(observation);return s;});},
  evidence(e:any){return change((s:any)=>{s.evidence=s.evidence.filter((x:any)=>x.id!==e.id).concat(clone(e));if(e.withdrawn)s.variants=s.variants.map((v:any)=>v.evidenceRefs?.includes(e.id)?{...v,capability:'unknown',evidenceRefs:v.evidenceRefs.filter((id:string)=>id!==e.id)}:v);return s;});},
  index(){return clone([...index.values()]);},
  save(snapshot:any){return change((s:any)=>{savedDecision(snapshot);if(!s.saved.some((x:any)=>JSON.stringify(x)===JSON.stringify(snapshot)))s.saved.push(clone(snapshot));return s;});},
  reopen(id:string){return clone(state.saved.findLast((s:any)=>s.needs.decisionId===id)||null);},
  savedHistory(id:string){return clone(state.saved.filter((s:any)=>s.needs.decisionId===id));},
  history(){return clone(state.observations);}
 };
}
