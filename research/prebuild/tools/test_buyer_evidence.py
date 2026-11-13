import unittest,copy
from pathlib import Path
from validate import evidence_errors
from artifact_contracts import validate_artifact
class BuyerEvidenceTests(unittest.TestCase):
    def value(self,data): return {'schemaVersion':1,'taskId':'R01','inputs':[],'data':data,'evidenceRefs':[],'gaps':[]}
    def check(self,data,name='01-buyer-observations.json'):
        v=self.value(data);return evidence_errors(v)+validate_artifact(name,v,'R01',Path('.'),{'E1'})
    def empty(self): return {'collectedCount':0,'participants':[],'observations':[],'hypotheses':[]}
    def test_U01_01_empty_partial(self): self.assertEqual(self.check(self.empty()),[])
    def test_U01_02_inflation(self):
        d=self.empty();d['collectedCount']=2;self.assertTrue(self.check(d))
        d['participants']=[{'id':'P1','kind':'observed','evidenceRefs':['E1']}]*2;self.assertTrue(self.check(d))
    def test_U01_03_synthetic(self):
        d=self.empty();d.update(collectedCount=1,participants=[{'id':'S1','kind':'synthetic','evidenceRefs':['E1']}]);self.assertTrue(self.check(d))
    def test_U01_04_negative_and_gaps(self):
        d=self.empty();d['observations']=[{'id':'N1','kind':'hypothesis','finding':'Could not distinguish history','valence':'negative'}];before=copy.deepcopy(d)
        self.assertEqual(self.check(d),[]);self.assertEqual(d,before);self.assertEqual(d['collectedCount'],0)
    def test_U01_05_mapping(self):
        d={'cohorts':[],'targetCount':12,'screening':[],'questions':[{'id':'Q1'}],'taskEffectByQuestion':{},'consent':{},'retention':{}}
        self.assertTrue(self.check(d,'01-buyer-protocol.json'));d['taskEffectByQuestion']['Q1']='Hypothesis: test whether this changes budget';self.assertEqual(self.check(d,'01-buyer-protocol.json'),[])
