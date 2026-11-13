import unittest, tempfile
from pathlib import Path
from provenance import defaults, definition, digest, file_hash
from validate import evidence_errors, freshness
from plan_contracts import load_repository_spec, validate_spec
class ValidatorTests(unittest.TestCase):
    def test_U00_01_partial(self):
        self.assertEqual(evidence_errors({'evidenceStatus':'partial','decision':'pending','collectedCount':0,'participants':[]}),[])
    def test_U00_02_graph_paths(self):
        from provenance import ROOT, contained
        t,c=load_repository_spec(ROOT)
        t['tasks'][0]['requiresArtifacts']=['R14']; self.assertTrue(validate_spec(t,c,ROOT))
        t['tasks'][0]['requiresArtifacts']=['absent']; self.assertTrue(validate_spec(t,c,ROOT))
        for ref in ('../secret','C:/secret','/secret'):
            with self.assertRaises(ValueError): contained(ROOT,ref)
    def test_U00_03_resume(self):
        old={'ai':{'maxRequests':7},'history':['old']}; defaults(old,{'ai':{'maxRequests':None,'model':None},'history':[]})
        self.assertEqual(old,{'ai':{'maxRequests':7,'model':None},'history':['old']})
    def test_U00_04_consumption(self):
        entry={'id':'E1','claim':'old'}; record={'consumedEvidenceHashes':{'E1':digest(entry)},'consumedConfig':{'ai.maxRequests':7}}
        self.assertEqual(freshness(record,Path('.'),{'ai':{'maxRequests':7}},{'items':[entry,{'id':'E2'}]}),[])
        self.assertTrue(freshness(record,Path('.'),{'ai':{'maxRequests':8}},{'items':[entry]}))
    def test_U00_05_false_evidence(self):
        for value in ({'collectedCount':1,'participants':[]},{'physicalDeviceValidated':True,'deviceKind':'emulator'},{'mode':'controlled','livePassed':True},{'missingComponents':['rate'],'completeTotal':0},{'shippingVnd':None,'completeTotalVnd':0},{'decision':'accept','decisionRef':None},{'cases':[{'id':'x'},{'id':'x'}]}):
            with self.subTest(value=value): self.assertTrue(evidence_errors(value))
        self.assertTrue(freshness({'inputHashes':{'absent':'fake'}},Path('.'),{},{}))
    def test_U00_09_definition(self):
        a={'id':'R00','steps':['a'],'automationStatus':'todo'}; b={**a,'automationStatus':'done','timestamp':'now'}
        self.assertEqual(definition(a),definition(b)); b['steps']=['b']; self.assertNotEqual(definition(a),definition(b))
if __name__=='__main__': unittest.main()

class RepositoryNegativeTests(unittest.TestCase):
    def test_done_missing_and_fake_pass(self):
        import json, shutil
        from provenance import ROOT
        from validate import validate
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            for rel in ('docs/planning/PREBUILD_RESEARCH_TRACKER.json','docs/planning/PREBUILD_TEST_PACKS.json','research/prebuild/run-config.json','research/prebuild/00-evidence-index.json'):
                target=root/rel; target.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(ROOT/rel,target)
            tracker,catalog=load_repository_spec(root)
            tracker['tasks'][0]['automationStatus']='done'
            (root/'docs/planning/PREBUILD_RESEARCH_TRACKER.json').write_text(json.dumps(tracker))
            code,errors=validate(root)
            self.assertEqual(code,1)
            self.assertTrue(any('missing output' in e for e in errors))
            record_ref=tracker['tasks'][0]['runRecord']; target=root/record_ref; target.parent.mkdir(parents=True,exist_ok=True)
            record=json.loads((ROOT/record_ref).read_text()); record['checks']=[{'id':cid,'result':'pass','exitCode':0} for cid in tracker['tasks'][0]['requiredCommands']]
            target.write_text(json.dumps(record))
            code,errors=validate(root)
            self.assertEqual(code,1); self.assertTrue(any('required execution absent' in e for e in errors))

class ArtifactTests(unittest.TestCase):
    def test_missing_envelope_and_references(self):
        from artifact_contracts import validate_artifact
        self.assertTrue(validate_artifact('01-buyer-protocol.json',{},'R01',Path('.'),set()))
    def test_leaked_partition_and_unknown_money(self):
        from artifact_contracts import validate_artifact
        value={'schemaVersion':1,'taskId':'R05','inputs':[],'evidenceRefs':[],'gaps':[],'data':{'corpusVersion':'v1','seed':1,'snapshotHashes':{},'freezeHash':'fake','cases':[{'id':'same','partition':'development'},{'id':'same','partition':'heldout'}]}}
        errors=validate_artifact('05-evaluation-cases.json',value,'R05',Path('.'),set())
        self.assertTrue(any('duplicate' in e for e in errors)); self.assertTrue(any('80/40' in e for e in errors)); self.assertTrue(any('freeze' in e for e in errors))
    def test_partial_buyer_artifact(self):
        from artifact_contracts import validate_artifact
        v={'schemaVersion':1,'taskId':'R01','inputs':[],'evidenceRefs':[],'gaps':[{'id':'G1','reason':'No participants','nextAction':'Recruit'}],'data':{'collectedCount':0,'participants':[],'observations':[],'hypotheses':[]}}
        self.assertEqual(validate_artifact('01-buyer-observations.json',v,'R01',Path('.'),set()),[])
