import { validateNeeds } from './picker.ts';
import type { Needs, Filters, Snapshot } from './picker.ts';
import type { Store } from './picker.ts';
export type BootState = 'loading'|'ready'|'read_failed'|'recovery_required';
/** One durable queue shared by normal mutations and explicit destructive recovery. */
export function createPersistence(initial:Store, write:(s:Store)=>Promise<void>, committed:(s:Store)=>void) {
  let current=initial, boot:BootState='loading', tail=Promise.resolve();
  const pending=new Map<string,Promise<boolean>>();
  return {
    status:()=>boot,
    current:()=>current,
    hydrate(store:Store,status:BootState){current=store;boot=status;},
    mutate(update:(s:Store)=>Store, actionId?:string, effect?:(s:Store)=>Promise<void>, recovery=false):Promise<boolean>{
      if(actionId && pending.has(actionId)) return pending.get(actionId)!;
      if(!recovery && boot!=='ready') return Promise.resolve(false);
      const operation=tail.then(async()=>{
        if(!recovery && boot!=='ready')return false;
        try{const next=update(current);await (effect ? effect(current) : write(next));current=next;boot='ready';committed(next);return true;}
        catch{return false;}
      });
      tail=operation.then(()=>{});
      if(actionId){pending.set(actionId,operation);void operation.finally(()=>pending.delete(actionId));}
      return operation;
    }
  };
}
/** Per-instance monotonic suffix plus collision check against persisted IDs. */
export function createDecisionIds(now:()=>number) {
  let sequence=0;
  return (existing:string[])=>{
    let id:string;
    do { id=`d-${now()}-${++sequence}`; } while(existing.includes(id));
    return id;
  };
}

export function cloneDraft(needs:Needs):Needs { return {...needs,tasks:[...needs.tasks],primaryUseOrder:[...needs.primaryUseOrder],additionalRequiredTaskIds:[...needs.additionalRequiredTaskIds],priorities:[...needs.priorities]}; }
export function confirmNeeds(store:Store,draft:Needs):Store {
  const needs={...cloneDraft(draft),useOrderConfirmed:true,revision:store.needs.revision+1};
  if(validateNeeds(needs).length) throw Error("Invalid confirmed needs");
  return {...store,needs};
}
export function toggleComparison(selected:string[],id:string):{ids:string[],rejected:boolean} {
  if(selected.includes(id))return {ids:selected.filter(x=>x!==id),rejected:false};
  return selected.length>=2?{ids:selected,rejected:true}:{ids:[...selected,id],rejected:false};
}
export function filterDraft(filters:Filters):Filters { return {...filters}; }
export function requestIsCurrent(ticket:number,activeTicket:number,revision:number,activeRevision:number) { return ticket===activeTicket && revision===activeRevision; }
export function reopenDecision(store:Store,snapshot:Snapshot):Store {return {...store,needs:cloneDraft(snapshot.needs)};}
export function pickerBack(step:number):number|null { return step>0?step-1:null; }
export type ChatOrigin={sheet:'detail'|null,productId:string,tab:string};
export function chatOrigin(sheet:string|null,productId:string,tab:string):ChatOrigin {return {sheet:sheet==='detail'?'detail':null,productId,tab};}
export function recoveryBytes(current:string,backup:string|null):string|null {return current || backup;}
