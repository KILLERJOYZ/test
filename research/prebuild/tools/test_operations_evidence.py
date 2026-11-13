import unittest
from evidence_rules import operations_errors
class OperationsTests(unittest.TestCase):
 def scenario(self):return {'mode':'tabletop','trigger':'test','authority':'pending','expectedTransitions':['suspend current claim'],'userState':'source_unavailable','recoveryCheck':'retry retains history','result':'not_run','evidenceRefs':[]}
 def check(self,s):return operations_errors({'scenarios':s})
 def test_U12_01_tabletop(self):self.assertEqual(self.check([self.scenario() for _ in range(6)]),[])
 def test_U12_02_unauthorized(self):self.assertTrue(self.check([{**self.scenario(),'unauthorized':True,'expectedPublication':'published'}]))
 def test_U12_03_outage(self):self.assertTrue(self.check([{**self.scenario(),'sourceStatus':'failed','refreshPrice':True}]))
 def test_U12_04_history(self):self.assertTrue(self.check([{**self.scenario(),'destroysHistory':True}]))
 def test_U12_05_unsupported_approval(self):self.assertTrue(self.check([{**self.scenario(),'approved':True,'providerCap':None}]))
 def test_U12_06_sandbox_scope(self):
  s={**self.scenario(),'mode':'sandbox','evidenceRefs':['E1']};self.assertEqual(self.check([s]),[]);s['productionControlsValidated']=True;self.assertTrue(self.check([s]))
