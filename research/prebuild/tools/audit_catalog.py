"""Offline audit of draft crawl snapshots. No identity or stock inferred from price."""
import argparse,json
from collections import Counter,defaultdict
from provenance import ROOT,digest,file_hash
MAX=9007199254740991
def money(value):
    if value is None:return None
    if type(value)!=int or not 0<=value<=MAX:raise ValueError('money must be safe nonnegative integer VND or null')
    return value

def price_context(costs):
    included=costs.get('includedCharges',[])
    if len(included)!=len(set(included)) or any(k not in ('shippingVnd','mandatoryExtraFeesVnd') for k in included): raise ValueError('invalid included charges')
    values={k:money(costs.get(k)) for k in ('baseVnd','shippingVnd','mandatoryExtraFeesVnd','discountVnd')}
    charges=[values['baseVnd']]+[values[k] for k in ('shippingVnd','mandatoryExtraFeesVnd') if k not in included]
    subtotal=sum(v for v in charges if v is not None)
    if subtotal>MAX: raise ValueError('unsafe sum')
    discount=values['discountVnd'] if costs.get('discountEligibility')=='confirmed' and costs.get('stackingConfirmed') else 0
    if discount is None and costs.get('discountEligibility')=='confirmed': complete=None
    else:complete=None if any(v is None for v in charges) else subtotal-discount
    if complete is not None and complete<0:raise ValueError('discount exceeds charges')
    return {**values,'includedCharges':list(included),'discountEligibility':costs.get('discountEligibility','unknown'),'stackingConfirmed':costs.get('stackingConfirmed',False),'knownSubtotalVnd':subtotal,'completeTotalVnd':complete,'priceCompleteness':'partial' if complete is None else 'conditional' if values['discountVnd'] and not discount else 'complete'}

def audit(snapshot,source_hash):
    products=snapshot.get('products',[])
    if not isinstance(products,list) or any(not isinstance(p,dict) for p in products):raise ValueError('products must be object array')
    listings=[];candidates=[];occurrences=Counter();source_ids=Counter((p.get('source'),p.get('id')) for p in products)
    for raw in sorted(products,key=lambda p:(str(p.get('source')),str(p.get('id')),digest(p))):
        key=digest(raw);occurrences[key]+=1;lid='L-'+key[:16]+'-'+str(occurrences[key]);spec=raw.get('specs') or {};pricing=raw.get('pricing') or {}
        identity={k:raw.get(k) for k in ('name','model','sku')};identity.update({k:spec.get(k) for k in ('cpu','ram','storage','gpu','screen','os')})
        missing=[k for k,v in identity.items() if not v];invalid=[]
        costs={'baseVnd':pricing.get('current'),'shippingVnd':None,'mandatoryExtraFeesVnd':None,'discountVnd':None,'includedCharges':[],'discountEligibility':'unknown','stackingConfirmed':False}
        try:offer=price_context(costs)
        except ValueError as exc:
            invalid.append(str(exc));offer=price_context({**costs,'baseVnd':None})
        offer.update({'variantCandidateId':'V-'+lid,'matchStatus':'unresolved','offerValidity':'unknown','observedAt':(raw.get('metadata') or {}).get('crawledAt',snapshot.get('generatedAt')),'expiresAt':None,'destination':None,'datasetKind':'crawled_draft','evidenceRefs':[],'deliveryContext':None})
        listing={'id':lid,'sourceId':raw.get('source'),'sourceUrl':raw.get('url'),'condition':raw.get('condition') if raw.get('condition') in ('new','used','refurbished') else 'unknown','identity':identity,'missingFields':missing,'invalidFields':invalid,'originalAvailability':raw.get('availability'),'availabilityBasis':'inferred_or_unknown; normalizer defaults stock from price; raw proof absent','observedAt':offer['observedAt'],'evidenceRefs':[],'duplicateSourceIdentity':source_ids[(raw.get('source'),raw.get('id'))]>1,'raw':raw,'offer':offer}
        listings.append(listing);candidates.append({'id':'V-'+lid,'listingId':lid,'identity':identity,'matchStatus':'unresolved','reason':'No independent exact-configuration adjudication; source SKU may be a URL slug.','evidenceRefs':[]})
    groups=defaultdict(list)
    for row in listings:
        if row['condition']=='new':groups[row['sourceId']].append(row['id'])
    queue=[]
    while len(queue)<20 and any(groups.values()):
        for key in sorted(groups,key=str):
            if groups[key] and len(queue)<20:queue.append(groups[key].pop(0))
    return {'sourceHash':source_hash,'counts':{'rows':len(listings),'byCondition':dict(sorted(Counter(l['condition'] for l in listings).items())),'bySource':dict(sorted(Counter(str(l['sourceId']) for l in listings).items())),'duplicateRows':sum(l['duplicateSourceIdentity'] for l in listings),'missingIdentityRows':sum(bool(l['missingFields']) for l in listings),'invalidRows':sum(bool(l['invalidFields']) for l in listings),'completeOffers':sum(l['offer']['completeTotalVnd'] is not None for l in listings)},'listings':listings,'canonicalCandidates':candidates,'reviewQueue':queue,'reviewedCount':0,'rejectedCount':0,'unknownCount':len(listings)}
def main():
    p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--out',required=True);a=p.parse_args();source=ROOT/a.input;out=ROOT/a.out
    data=audit(json.loads(source.read_text(encoding='utf-8-sig')),file_hash(source))
    obj={'schemaVersion':1,'taskId':'R04','inputs':[{'ref':a.input,'sha256':file_hash(source)}],'data':data,'evidenceRefs':[],'gaps':[{'id':'GAP-R04-001','reason':'No independent exact variant/stock/complete-price review. Crawl prices are dated observations.','nextAction':'Review queued new listings with exact manufacturer and retailer evidence under documented source-use basis.'}]}
    out.write_text(json.dumps(obj,indent=2,ensure_ascii=False),encoding='utf-8');print(json.dumps(data['counts']))
if __name__=='__main__':main()
