import unittest,copy
from readiness import assess,gate_exit,backlog_errors,reassess
class ReadinessTests(unittest.TestCase):
 def task(self,state='done',evidence='partial'):return {'id':'R01','order':1,'automationStatus':state,'evidenceStatus':evidence,'requiresArtifacts':[],'nextAction':'Collect observations'}
 def gate(self,decision='pending'):return {'id':'G4','decision':decision,'decisionRef':None,'scope':None,'evidenceRefs':[]}
 def test_U14_01_automation_not_evidence(self):
  r=assess([self.task()],[self.gate()],[]);self.assertEqual(r['gates'][0]['assessmentExit'],2);self.assertFalse(r['evidenceSufficient'])
 def test_U14_02_d1_scoped(self):
  r=assess([self.task()],[self.gate()],[],[{'type':'D1','scope':['live_ai'],'decisionRef':'actual-fixture-decision'}]);self.assertEqual(r['deferrals'][0]['scope'],['live_ai']);self.assertFalse(r['deferrals'][0]['liveAIValidated']);self.assertEqual(r['gates'][0]['assessmentExit'],2)
 def test_U14_03_critical_blocker(self):
  g={**self.gate('accept'),'decisionRef':'decision','scope':['catalog'],'evidenceRefs':['E1']};self.assertEqual(gate_exit(g,True,[{'id':'X','severity':'S1','waiver':'approved'}]),1)
 def test_U14_04_unsupported_accept(self):self.assertEqual(gate_exit(self.gate('accept'),True,[]),1)
 def test_U14_05_exit_mapping(self):
  self.assertEqual(gate_exit(self.gate(),False,[]),2);self.assertEqual(gate_exit(self.gate('accept'),False,[]),1);g={**self.gate('accept'),'decisionRef':'actual','scope':['specific'],'evidenceRefs':['E1']};self.assertEqual(gate_exit(g,True,[]),0)
 def test_U14_06_backlog_fields(self):
  self.assertTrue(backlog_errors({'id':'B1'}));v={k:['fixture'] for k in ['requirementIds','findingIds','files','contractChanges','stateChanges','acceptanceCommands','acceptanceScenarios','evidenceRefs','estimateAssumptions']};v.update(id='B1',outcome='User outcome',dependsOn=[],exceptionBehavior='Retain prior state',scopeStatus='proposed');self.assertEqual(backlog_errors(v),[]);del v['files'];self.assertTrue(backlog_errors(v))
 def test_U14_07_blocked_task_retained(self):
  r=assess([self.task('blocked')],[self.gate()],[]);self.assertEqual(r['automationSummary']['blocked'],['R01']);self.assertIsNone(r['nextRunnableTask'])
 def test_U14_08_reassessment_preserves_history(self):
  old=assess([self.task()],[self.gate()],[]);before=copy.deepcopy(old);new=reassess(old,[self.task()],[self.gate()],[],{'decisionRef':'new','scope':['ai']});self.assertEqual(old,before);self.assertEqual(new['previousAssessment'],before);self.assertEqual(new['decisionHistory'][0]['scope'],['ai'])
