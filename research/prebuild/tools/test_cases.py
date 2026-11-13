import unittest,copy,inspect
from build_cases import build,validate_corpus,real_suitability,record_holdout,SCENARIOS,GROUPS
class CaseTests(unittest.TestCase):
    def config(self):return {'seed':20261113,'corpus':{'profileCount':120,'groupCounts':dict(GROUPS)}}
    def test_U05_01_quotas(self):
        d=build(self.config(),{});self.assertEqual(len(d['cases']),120);self.assertEqual(validate_corpus(d),[]);self.assertEqual(sum(c['partition']=='heldout' for c in d['cases']),40)
    def test_U05_02_stable(self):
        a=self.config();b={'corpus':a['corpus'],'seed':a['seed']};self.assertEqual(build(a,{'b':'2','a':'1'})['freezeHash'],build(b,{'a':'1','b':'2'})['freezeHash'])
    def test_U05_03_duplicate(self):
        d=build(self.config(),{});d['cases'][1]=copy.deepcopy(d['cases'][0]);self.assertTrue(validate_corpus(d));d['cases'].pop();self.assertTrue(validate_corpus(d))
    def test_U05_04_real_unknown(self):self.assertEqual(real_suitability([],False),'unknown');self.assertEqual(real_suitability(['unreviewed'],False),'unknown')
    def test_U05_05_budget_golden(self):
        self.assertEqual(SCENARIOS[0]['expected']['affordability'],'within_budget');self.assertEqual(SCENARIOS[1]['expected']['affordability'],'over_budget');self.assertEqual(20000000+200000+300000-500000,SCENARIOS[0]['expected']['completeTotalVnd'])
    def test_U05_06_hard_golden(self):
        d=copy.deepcopy(SCENARIOS[6]);d['softPreference']='power';self.assertEqual(d['expected'],{'state':'no_fit','fit':'fail'})
    def test_U05_07_holdout(self):
        corpus=build(self.config(),{});before=copy.deepcopy(corpus);ledger=record_holdout({},corpus['freezeHash'],'config','run1');ledger=record_holdout(ledger,corpus['freezeHash'],'config','run2');self.assertEqual([r['classification'] for r in ledger['runs']],['first_qualifying','diagnostic_reuse']);self.assertEqual(corpus,before)
    def test_U05_08_independent(self):
        import build_cases
        source=inspect.getsource(build_cases);self.assertNotIn('subprocess',source);self.assertNotIn('run_eval',source);self.assertNotIn('import rank',source);self.assertEqual(SCENARIOS[2]['expected']['completeTotalVnd'],None)
