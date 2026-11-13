import unittest
from evidence_rules import android_errors
class AndroidEvidenceTests(unittest.TestCase):
 def base(self):return {'buildHash':'h1','physicalDeviceValidated':False,'targetMatrix':[],'cases':[],'timings':[]}
 def test_U11_01_emulator(self):
  d=self.base();d.update(physicalDeviceValidated=True,targetMatrix=[{'kind':'emulator','serial':'emulator-1'}]);self.assertTrue(android_errors(d))
 def test_U11_02_inspect_not_journey(self):
  d=self.base();d['cases']=[{'result':'pass','method':'adb_inspect','evidenceRefs':['E1'],'buildHash':'h1'}];self.assertTrue(android_errors(d))
 def test_U11_03_small_failed_sample(self):
  d=self.base();d['timings']=[{'samples':[{'result':'fail','ms':None}], 'protocolComplete':True}];self.assertTrue(android_errors(d));d['timings'][0]['protocolComplete']=False;self.assertEqual(android_errors(d),[])
 def test_U11_04_unsupported_percentile(self):
  d=self.base();d['timings']=[{'percentile95':10,'samples':[]}];self.assertTrue(android_errors(d))
 def test_U11_05_stale_build(self):
  d=self.base();d['cases']=[{'result':'pass','method':'journey_observation','evidenceRefs':['E1'],'buildHash':'old'}];self.assertTrue(android_errors(d))
 def test_U11_06_partial_named(self):
  d=self.base();d['targetMatrix']=[{'kind':'emulator','serial':'fixture'}];d['cases']=[{'result':'pass','method':'journey_observation','evidenceRefs':['E1'],'buildHash':'h1'},{'result':'not_run','reason':'No TalkBack operator'}];self.assertEqual(android_errors(d),[]);self.assertFalse(d['physicalDeviceValidated'])
