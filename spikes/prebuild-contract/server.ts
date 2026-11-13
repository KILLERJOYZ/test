import http from 'node:http';
import { result,context,requestNeedsContext,acceptContext,savedDecision,variant,offer } from '../../research/prebuild/tools/contract_validation.mjs';
import { evaluate } from './policy.ts';
export function createServer(repo:any){return http.createServer(async(req,res)=>{
 const send=(status:number,value:any)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(value));};
 try{
  const url=new URL(req.url||'/', 'http://localhost');let body='';for await(const chunk of req){body+=chunk;if(body.length>100000)throw Error('too_large');}const input=body?JSON.parse(body):{};
  if(req.method==='POST'&&['/research/v1/runs','/research/v1/comparisons'].includes(url.pathname)){requestNeedsContext(input.needs,input.context);const catalog=repo.catalog();const output=evaluate(input.needs,catalog.variants,catalog.offers,input.context,catalog.status,input.visibleIds);return send(200,result(output));}
  if(req.method==='POST'&&url.pathname==='/research/v1/decisions'){savedDecision(input.snapshot);await repo.save(input.snapshot);return send(200,input.snapshot);}
  if(req.method==='GET'&&url.pathname.startsWith('/research/v1/decisions/')){const value=repo.reopen(decodeURIComponent(url.pathname.split('/').at(-1)!));return send(value?200:404,value||{error:'not_found'});}
  if(req.method==='GET'&&url.pathname.startsWith('/research/v1/variants/')){const cat=repo.catalog();if(cat.status!=='success')return send(503,{error:'source_unavailable'});const parts=url.pathname.split('/');const id=decodeURIComponent(parts[4]);if(parts[5]==='offers')return send(200,cat.offers.filter((o:any)=>o.variantId===id).map(offer));const v=cat.variants.find((v:any)=>v.variantId===id);return send(v?200:404,v?variant(Object.fromEntries(Object.entries(v).filter(([k])=>!['capability','evidenceRefs'].includes(k)))):{error:'not_found'});}
  send(404,{error:'not_found'});
 }catch(e){if(e instanceof Error && e.message==='stale_revision')send(409,{error:'stale_revision'});else send(400,{error:String(e)});}
});}
export async function runClient(base:string,payload:any,activeContext:any,transport=fetch){const response=await transport(base+'/research/v1/runs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw Error(response.status===409?'stale_revision':response.status>=500?'source_unavailable':'invalid_request');const value=result(await response.json());acceptContext(value.context,activeContext);return value;}
import { pathToFileURL } from 'node:url';
import { repository } from './repository.ts';
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 const storage={read:async()=>null,write:async()=>{}};const repo=repository(storage);
 const server=createServer(repo);server.listen(8791,'127.0.0.1',()=>console.log('Synthetic research API at http://127.0.0.1:8791; empty injected repository; no live provider'));
 process.once('SIGINT',()=>server.close());
}
