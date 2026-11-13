"""Evidence checks used by the artifact validator; no truth or approval inference."""
import math

def android_errors(d):
 errors=[];targets=d.get('targetMatrix',[]);cases=d.get('cases',[])
 if d.get('physicalDeviceValidated') and (not any(t.get('kind')=='physical' and t.get('serial') for t in targets) or not cases or any(c.get('result')!='pass' for c in cases)):errors.append('physical acceptance unsupported')
 for c in cases:
  if c.get('result')=='pass':
   if c.get('method') not in ('journey_observation','accessibility_observation') or not c.get('evidenceRefs'):errors.append('journey/accessibility pass requires actual observation')
   if c.get('buildHash')!=d.get('buildHash'):errors.append('stale build evidence')
  elif c.get('result')=='not_run' and not c.get('reason'):errors.append('not_run requires reason')
 for timing in d.get('timings',[]):
  raw=timing.get('samples',[])
  if timing.get('percentile95') is not None:
   values=[x['ms'] for x in raw if x.get('result')=='pass']
   if not values or not d.get('buildHash') or not timing.get('targetRef'):errors.append('percentile needs raw samples/build/target')
   elif timing['percentile95']!=sorted(values)[math.ceil(.95*len(values))-1]:errors.append('percentile mismatch')
  if timing.get('protocolComplete') and (len(raw)<30 or any(x.get('result')!='pass' for x in raw)):errors.append('timing protocol incomplete')
 return errors

def operations_errors(d):
 errors=[]
 for s in d.get('scenarios',[]):
  if s.get('productionControlsValidated') and s.get('mode')!='production_observation':errors.append('sandbox/tabletop is not production control evidence')
  if s.get('unauthorized') and s.get('expectedPublication')=='published':errors.append('unauthorized publication')
  if s.get('sourceStatus')=='failed' and (s.get('userState')=='empty_inventory' or s.get('refreshPrice')):errors.append('source outage is not empty/refreshed price')
  if s.get('destroysHistory'):errors.append('withdrawal/rollback must preserve history')
  if s.get('approved') and any(s.get(k) is None for k in ('providerCap','retention','restoreTarget')):errors.append('unsupported operating approval')
  if s.get('mode')=='sandbox' and not s.get('evidenceRefs'):errors.append('sandbox requires executed evidence')
 return errors
