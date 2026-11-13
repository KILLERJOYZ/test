import unittest,copy
from pathlib import Path
from artifact_contracts import validate_artifact
class JourneyTests(unittest.TestCase):
    def row(self,status='inaccessible'): return {'sourceUrl':'https://example.test','observedAt':'2026-11-13T12:00:00+07:00','method':'web fetch','taskId':'needs','status':status,'observations':[],'evidenceRefs':[],'timingMs':None}
    def check(self,rows): return validate_artifact('02-journey-benchmark.json',{'schemaVersion':1,'taskId':'R02','inputs':[],'data':{'taskIds':['needs'],'entries':rows,'hypotheses':[]},'evidenceRefs':[],'gaps':[]},'R02',Path('.'),{'E1'})
    def test_U02_01_inaccessible(self): self.assertEqual(self.check([self.row()]),[])
    def test_U02_02_advertised(self):
        r=self.row('observed');r.update(observationKind='advertised',evidenceRefs=['E1']);self.assertTrue(self.check([r]))
    def test_U02_03_participant(self):
        r=self.row();r['participantSuccessCount']=1;self.assertTrue(self.check([r]))
    def test_U02_04_identity_timing(self):
        for key,value in [('sourceUrl',None),('observedAt',None),('taskId','other'),('timingMs',20)]:
            r=self.row();r[key]=value;self.assertTrue(self.check([r]))
    def test_U02_05_mixed(self):
        r=self.row('observed');r.update(observations=['Visible budget heading'],evidenceRefs=['E1']);rows=[r,self.row()];before=copy.deepcopy(rows);self.assertEqual(self.check(rows),[]);self.assertEqual(rows,before)
