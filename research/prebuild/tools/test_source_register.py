import unittest
from pathlib import Path
from artifact_contracts import validate_artifact
class SourceTests(unittest.TestCase):
    def use(self,status='unresolved'): return {'purpose':'research','status':status,'evidenceRefs':[],'scope':'public page inspection','expiresAt':None}
    def check(self,uses,extra=None):
        source={'id':'S1','accessRoute':'https://example.test','coverage':'unknown','uses':uses,'cadence':None,'retention':None,'evidenceRefs':[],'unresolved':['agreement']};source.update(extra or {})
        return validate_artifact('03-source-register.json',{'schemaVersion':1,'taskId':'R03','inputs':[],'data':{'sources':[source]},'evidenceRefs':[],'gaps':[]},'R03',Path('.'),{'E1'})
    def test_U03_01_separate(self):
        u=self.use('documented_basis');u.update(evidenceRefs=['E1'],basisKind='explicit_terms',observedAt='2026-11-13');self.assertEqual(self.check([u,self.use()]),[])
    def test_U03_02_public(self): self.assertTrue(self.check([self.use('documented_basis')]))
    def test_U03_03_prohibited_expired(self):
        for status in ('prohibited','unresolved'):
            u=self.use(status);u['ready']=True;self.assertTrue(self.check([u]))
        u=self.use('documented_basis');u.update(ready=True,expired=True);self.assertTrue(self.check([u]))
    def test_U03_04_scoped(self):
        u=self.use('documented_basis');u.update(evidenceRefs=['E1'],basisKind='agreement',observedAt='2026-11-13');self.assertEqual(self.check([u]),[]);u['scope']=None;self.assertTrue(self.check([u]))
    def test_U03_05_sensitive(self):
        self.assertTrue(self.check([self.use()],{'api_key':'dummy-not-a-secret'}));self.assertEqual(self.check([self.use()],{'keyEnvName':'SOURCE_KEY'}),[])
