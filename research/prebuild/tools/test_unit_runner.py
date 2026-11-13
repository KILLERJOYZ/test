import unittest
from unittest.mock import patch
import subprocess
from run_unit_packs import assess, aggregate, parse_results, run
class RunnerTests(unittest.TestCase):
    def test_U00_06_missing_skip_empty(self):
        cases=[{'id':'U00-01'}]
        for results in ({},{'test_U00_02_other':'passed'},{'test_U00_01_example':'skipped'}): self.assertEqual(assess(cases,results,0)[1],1)
        self.assertEqual(assess(cases,{'test_U00_01_example':'passed'},0)[1],0)
        self.assertEqual(parse_results('test_U00_01_example (test.X) ... ok','python'),{'test_U00_01_example':'passed'})
        self.assertEqual(parse_results('ok 1 - U00-01 example # SKIP unavailable','node'),{'U00-01 example':'skipped'})
    def test_U00_07_failure_timeout(self):
        self.assertEqual(aggregate([1,0,2]),1)
        with patch('subprocess.run',side_effect=subprocess.TimeoutExpired(['python'],120)):
            rc,log,reason=run(['python'],'.'); self.assertEqual(rc,1); self.assertEqual(reason,'timeout'); self.assertTrue(log)
    def test_U00_08_absent(self):
        self.assertEqual(aggregate([0,2]),2)
        with patch('subprocess.run',side_effect=FileNotFoundError): self.assertEqual(run(['missing'],'.'),(None,'','executable unavailable'))
    def test_U00_10_unavailable(self):
        rows,code=assess([{'id':'U00-10'}],{},2)
        self.assertEqual(rows,[{'id':'U00-10','status':'not_run'}]); self.assertNotEqual(code,0)
if __name__=='__main__': unittest.main()

class RunnerIntegrationTests(unittest.TestCase):
    def test_planned_all_and_required_absence(self):
        import tempfile,json,shutil,argparse
        from pathlib import Path
        from provenance import ROOT
        from run_unit_packs import execute
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            for ref in ('docs/planning/PREBUILD_RESEARCH_TRACKER.json','docs/planning/PREBUILD_TEST_PACKS.json'):
                p=root/ref;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/ref,p)
            catalog=json.loads((root/'docs/planning/PREBUILD_TEST_PACKS.json').read_text())
            for pack in catalog['packs']:
                if pack['availability']=='existing':
                    for ref in pack['testFiles']:
                        p=root/ref;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('')
            args=argparse.Namespace(all=False,task='R00',pack=None,changed=None)
            with patch('run_unit_packs.run',return_value=(0,'',None)):
                self.assertEqual(execute(args,root),1)
            report=json.loads(next((root/'research/prebuild/runs/unconfigured/unit-packs').glob('*.json')).read_text())
            self.assertTrue(any(p['id']=='U00' and p['exitCode']==2 for p in report['packs']))
            args=argparse.Namespace(all=False,task=None,pack=None,changed=['unmapped.py'])
            with self.assertRaises(ValueError): execute(args,root)
