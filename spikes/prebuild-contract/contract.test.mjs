import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,readFile,writeFile,rename,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {once} from 'node:events';import {repository} from './repository.ts';import {createServer,runClient} from './server.ts';import {ctx,needs,variant,offer,snapshot} from './fixtures.mjs';
test('HTTP scoped decision round trip durable history stale failure and withdrawal',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lua-spike-'));const path=join(dir,'store.json');
 const storage={async read(){try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}},async write(v){await writeFile(path+'.tmp',JSON.stringify(v));await rename(path+'.tmp',path);}};
 const repo=repository(storage);await repo.upsert(variant,offer);const server=createServer(repo);server.listen(0,'127.0.0.1');await once(server,'listening');const url='http://127.0.0.1:'+server.address().port;
 try{
  assert.equal((await runClient(url,{needs,context:ctx},ctx)).state,'eligible');
  assert.equal((await runClient(url,{needs:{...needs,budgetVnd:19999999},context:ctx},ctx)).state,'no_verified_affordable_offer');
  await assert.rejects(runClient(url,{needs,context:ctx},{...ctx,catalogVersion:'new'}),/stale_revision/);
  const response=await fetch(url+'/research/v1/decisions',{method:'POST',body:JSON.stringify({snapshot})});assert.equal(response.status,200);
  const restarted=repository(storage);await restarted.restore();assert.equal(restarted.reopen('D1').observations[0].totalVnd,20000000);
  assert.equal((await (await fetch(url+'/research/v1/decisions/D1')).json()).savedAt,snapshot.savedAt);
  await repo.upsert(variant,{...offer,variantId:'wrong'});assert.equal((await runClient(url,{needs,context:ctx},ctx)).state,'no_verified_affordable_offer');
  await repo.upsert(variant,{...offer,costs:{...offer.costs,shippingVnd:null}});assert.equal((await runClient(url,{needs,context:ctx},ctx)).state,'no_verified_affordable_offer');
  await repo.upsert({...variant,capability:'fail'},offer);assert.equal((await runClient(url,{needs,context:ctx},ctx)).state,'no_fit');
  await repo.upsert(variant,{...offer,validity:'expired'});assert.equal((await runClient(url,{needs,context:ctx},ctx)).state,'no_verified_affordable_offer');
  await repo.upsert(variant,offer);await repo.evidence({id:'E1',version:1,text:'checked'});await repo.evidence({id:'E1',version:2,withdrawn:true});assert.equal((await runClient(url,{needs,context:ctx},ctx)).state,'evidence_unknown');assert.equal(repo.index().length,0);assert.equal(repo.reopen('D1').observations[0].totalVnd,20000000);
  repo.unavailable(true);assert.equal((await runClient(url,{needs,context:ctx},ctx)).state,'source_unavailable');
 }finally{await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});}
});
test('HTTP mismatched needs context rejected without evaluating another decision',async()=>{
 const repo=repository({read:async()=>null,write:async()=>{}});await repo.upsert(variant,offer);const server=createServer(repo);server.listen(0,'127.0.0.1');await once(server,'listening');const url='http://127.0.0.1:'+server.address().port;
 try{for(const changed of [{...needs,decisionId:'other'},{...needs,profileRevision:2}]){const response=await fetch(url+'/research/v1/runs',{method:'POST',body:JSON.stringify({needs:changed,context:ctx})});assert.equal(response.status,409);assert.equal((await response.json()).error,'stale_revision');await assert.rejects(runClient(url,{needs:changed,context:ctx},ctx),/stale_revision/);}}
 finally{await new Promise(resolve=>server.close(resolve));}
});
test('HTTP invalid saved history is rejected before durable mutation',async()=>{
 let writes=0;const repo=repository({read:async()=>null,write:async()=>{writes++;}});const server=createServer(repo);server.listen(0,'127.0.0.1');await once(server,'listening');const url='http://127.0.0.1:'+server.address().port;
 try{let response=await fetch(url+'/research/v1/decisions',{method:'POST',body:JSON.stringify({snapshot})});assert.equal(response.status,200);response=await fetch(url+'/research/v1/decisions',{method:'POST',body:JSON.stringify({snapshot:{...snapshot,observations:[]}})});assert.equal(response.status,400);assert.equal(writes,1);assert.equal(repo.savedHistory('D1').length,1);assert.deepEqual(repo.reopen('D1').observations,snapshot.observations);}
 finally{await new Promise(resolve=>server.close(resolve));}
});
