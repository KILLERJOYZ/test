"""Deterministic cost arithmetic. Unknown mandatory inputs never become zero."""
import json,argparse,copy
from decimal import Decimal,ROUND_HALF_UP
from provenance import ROOT
MAX=9007199254740991
def number(v,nullable=False):
 if v is None and nullable:return None
 if type(v)!=int or not 0<=v<=MAX:raise ValueError('safe nonnegative integer required')
 return v

def calculate(data):
 output=[]
 for scenario in data['scenarios']:
  components=[];missing=[];totals={'one_time':0,'recurring':0,'staff':0}
  for component in scenario['components']:
   c=copy.deepcopy(component);units=number(c.get('units'),True);rate=number(c.get('rate'),True);currency=c.get('currency',data['currency']);value=None
   if units is not None and rate is not None:
    value=units*rate
    if value>MAX:raise ValueError('unsafe component total')
    if currency!=data['currency']:
     conversion=data.get('conversions',{}).get(currency)
     if not conversion or not conversion.get('observedAt'):value=None
     else:
      factor=Decimal(str(conversion['rate']));
      if not factor.is_finite() or factor<=0:raise ValueError('invalid conversion')
      value=int((Decimal(value)*factor).quantize(Decimal('1'),rounding=ROUND_HALF_UP))
   if value is None:missing.append(c['id'])
   else:totals[c['category']]+=value
   c['amount']=value;components.append(c)
  if sum(totals.values())>MAX:raise ValueError('unsafe total')
  denominator=number(scenario.get('usefulSessions'),True);complete=None if missing else sum(totals.values())
  output.append({'id':scenario['id'],'components':components,'categories':totals,'knownSubtotal':sum(totals.values()),'missingComponents':missing,'completeTotal':complete,'denominator':denominator,'costPerUsefulSession':None if complete is None or not denominator else int((Decimal(totals['recurring'])/denominator).quantize(Decimal('1'),rounding=ROUND_HALF_UP)),'perSessionBasis':'Recurring only; one-time/staff allocation not assumed.','reason':'Missing mandatory components or observed useful-session denominator.' if missing or not denominator else None})
 return {'scenarios':output}
def main():
 p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--out',required=True);a=p.parse_args();source=ROOT/a.input;v=json.loads(source.read_text(encoding='utf-8'));data=calculate(v['data']);from provenance import file_hash
 (ROOT/a.out).write_text(json.dumps({'schemaVersion':1,'taskId':'R13','inputs':[{'ref':a.input,'sha256':file_hash(source)}],'data':data,'evidenceRefs':[],'gaps':[{'id':'GAP-R13-RATES','reason':'Provider/source/hosting/staff rates and observed useful outcomes unavailable.','nextAction':'Obtain dated scoped quotes, selected topology and observed usage/capacity.'}]},indent=2),encoding='utf-8')
 print('Cost scenarios calculated; unknown mandatory costs retain null complete total.')
if __name__=='__main__':main()
