import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_STORE, restore } from './picker.ts';
const needs = {...INITIAL_STORE.needs,tasks:['study'],primaryUseOrder:['study'],useOrderConfirmed:true,revision:1};
const snapshot = {id:'saved-1',name:'Test',needs,productIds:['p1'],savedAt:'2026-11-13T05:00:00.000Z',datasetVersion:'synthetic-android-v2',policyVersion:'test-v1',observations:[{productId:'p1',total:20000000,seller:'seller'}]};
test('U06-12 saved records validate dates versions money references and confirmed needs',()=>{
  assert.equal(restore(JSON.stringify({...INITIAL_STORE,needs,saved:[snapshot]})).store.saved.length,1);
  const changes = [{savedAt:'invalid-date'},{datasetVersion:undefined},{policyVersion:''},{observations:[{productId:'p1',total:-1,seller:'seller'}]},{observations:[{productId:'p2',total:20,seller:'seller'}]},{observations:[{productId:'p1',total:20,seller:42}]},{productIds:['p1','p1']},{needs:{...needs,tasks:['study','code'],primaryUseOrder:['study','study']}}];
  for(const change of changes){const result=restore(JSON.stringify({...INITIAL_STORE,needs,saved:[{...snapshot,...change}]}));assert.equal(result.store.saved.length,0,JSON.stringify(change));assert.equal(result.warnings.length,1);}
  assert.throws(()=>restore(JSON.stringify({...INITIAL_STORE,needs:{...needs,tasks:['study','code'],primaryUseOrder:['study','study']}})));
});
import { createPersistence, createDecisionIds } from './decision-state.ts';
const deferred=()=>{let resolve!:()=>void;const promise=new Promise<void>(r=>resolve=r);return {promise,resolve};};
test('U06-09 queued reducers preserve both acknowledged updates',async()=>{
 const gate=deferred();let writes=0;let durable=INITIAL_STORE;
 const p=createPersistence(INITIAL_STORE,async s=>{if(++writes===1)await gate.promise;durable=s;},()=>{});p.hydrate(INITIAL_STORE,'ready');
 const a=p.mutate(s=>({...s,dark:true}));const b=p.mutate(s=>({...s,saved:[snapshot]}));gate.resolve();assert.deepEqual(await Promise.all([a,b]),[true,true]);assert.equal(durable.dark,true);assert.equal(durable.saved.length,1);
});
test('U06-10 failed hydration blocks writes',async()=>{
 let writes=0;const p=createPersistence(INITIAL_STORE,async()=>{writes++;},()=>{});p.hydrate(INITIAL_STORE,'read_failed');assert.equal(await p.mutate(s=>({...s,dark:true})),false);assert.equal(writes,0);p.hydrate(INITIAL_STORE,'recovery_required');assert.equal(await p.mutate(s=>s),false);
});
test('U06-11 delete participates in queue and survives pending writes',async()=>{
 const gate=deferred();let durable=INITIAL_STORE;
 const p=createPersistence(INITIAL_STORE,async s=>{await gate.promise;durable=s;},()=>{});p.hydrate(INITIAL_STORE,'ready');
 const a=p.mutate(s=>({...s,saved:[snapshot]}));const b=p.mutate(()=>INITIAL_STORE,'delete',async()=>{durable=INITIAL_STORE;},true);gate.resolve();assert.deepEqual(await Promise.all([a,b]),[true,true]);assert.equal(durable.saved.length,0);assert.equal(p.current().saved.length,0);
});
test('U06-14 repeated pending action commits once',async()=>{
 const ids=createDecisionIds(()=>42);assert.equal(ids([]),'d-42-1');assert.equal(ids(['d-42-2']),'d-42-3');
 const gate=deferred();let writes=0;const p=createPersistence(INITIAL_STORE,async()=>{writes++;await gate.promise;},()=>{});p.hydrate(INITIAL_STORE,'ready');const a=p.mutate(s=>({...s,dark:true}),'same');const b=p.mutate(s=>({...s,dark:true}),'same');assert.equal(a,b);gate.resolve();assert.deepEqual(await Promise.all([a,b]),[true,true]);assert.equal(writes,1);
});
test('U06-15 throwing updater does not poison later writes',async()=>{
 const p=createPersistence(INITIAL_STORE,async()=>{},()=>{});p.hydrate(INITIAL_STORE,'ready');
 assert.equal(await p.mutate(()=>{throw Error('bad command');}),false);
 assert.equal(await p.mutate(s=>({...s,dark:true})),true);
});
import { cloneDraft, confirmNeeds, toggleComparison, swapComparisonColumn, createUniqueDecisionId, filterDraft, requestIsCurrent, reopenDecision, pickerBack, chatOrigin, recoveryBytes } from './decision-state.ts';
import { EMPTY_FILTERS, evaluate, updateTasks } from './picker.ts';
test('U06-01 draft cancellation leaves committed arrays and revision intact',()=>{
 const draft=cloneDraft(needs);draft.tasks.push('code');draft.primaryUseOrder.reverse();draft.priorities.push('power');assert.deepEqual(needs.tasks,['study']);assert.deepEqual(needs.priorities,[]);assert.equal(needs.revision,1);
});
test('U06-02 confirmation commits one new revision after persistence',async()=>{
 const gate=deferred();let commits=0;const p=createPersistence({...INITIAL_STORE,needs},async()=>gate.promise,()=>{commits++;});p.hydrate({...INITIAL_STORE,needs},'ready');
 const result=p.mutate(s=>confirmNeeds(s,{...needs,budget:23000000}),'confirm');assert.equal(p.current().needs.budget,22000000);gate.resolve();assert.equal(await result,true);assert.equal(p.current().needs.revision,2);assert.equal(commits,1);
});
test('U06-03 invalid and failed persistence keep prior confirmed state',async()=>{
 const p=createPersistence({...INITIAL_STORE,needs},async()=>{throw Error('disk');},()=>{assert.fail('no acknowledgement');});p.hydrate({...INITIAL_STORE,needs},'ready');assert.equal(await p.mutate(s=>confirmNeeds(s,{...needs,budget:-1})),false);assert.equal(await p.mutate(s=>confirmNeeds(s,{...needs,budget:23000000})),false);assert.equal(p.current().needs,needs);
});
test('U06-04 filter drafts cancel and clear without changing needs',()=>{
 const active={...EMPTY_FILTERS,maxWeight:1};const draft=filterDraft(active);draft.maxWeight=2;assert.equal(active.maxWeight,1);assert.equal(evaluate(needs,EMPTY_FILTERS).state,'eligible');assert.equal(needs.budget,22000000);
});
test('U06-05 comparison allows up to 4 items, swaps in place and rejects 5th selection',()=>{
 assert.deepEqual(toggleComparison(['p1','p4'],'p2'),{ids:['p1','p4','p2'],rejected:false});
 assert.deepEqual(toggleComparison(['p1','p2','p3','p4'],'p5'),{ids:['p1','p2','p3','p4'],rejected:true});
 assert.deepEqual(toggleComparison(['p1','p4'],'p1'),{ids:['p4'],rejected:false});
 assert.deepEqual(swapComparisonColumn(['p1','p2','p3'],'p2','p9'),['p1','p9','p3']);
 assert.notEqual(createUniqueDecisionId(),createUniqueDecisionId());
});
test('U06-06 cancelled or old revision response is ignored',()=>{
 assert.equal(requestIsCurrent(1,2,1,1),false);assert.equal(requestIsCurrent(2,2,1,2),false);assert.equal(requestIsCurrent(2,2,2,2),true);
});
test('U06-07 reopening history preserves dated observations independently',()=>{
 const before=JSON.stringify(snapshot);const reopened=reopenDecision(INITIAL_STORE,snapshot);reopened.needs.tasks.push('code');assert.equal(JSON.stringify(snapshot),before);assert.equal(snapshot.observations[0].total,20000000);assert.deepEqual(snapshot.productIds,['p1']);assert.equal(snapshot.savedAt,'2026-11-13T05:00:00.000Z');
});
test('U06-08 removed VM and reordered tasks retain budget without confirmation',()=>{
 const vm={...needs,tasks:['vm','study'],primaryUseOrder:['vm','study'],vm:'many' as const};const edited=updateTasks(vm,['study'],[]);assert.equal(edited.vm,'unknown');assert.equal(edited.budget,22000000);assert.equal(edited.useOrderConfirmed,false);
});
test('U06-13 modal origin and picker back preserve focused detail and draft',()=>{
 assert.deepEqual(chatOrigin('detail','p4','explore'),{sheet:'detail',productId:'p4',tab:'explore'});assert.equal(pickerBack(2),1);assert.equal(pickerBack(0),null);assert.equal(chatOrigin(null,'p1','compare').sheet,null);assert.equal(recoveryBytes('current corrupt','old backup'),'current corrupt');
});
