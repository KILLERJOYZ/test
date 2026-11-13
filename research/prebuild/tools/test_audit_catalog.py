import unittest,copy
from audit_catalog import audit,price_context,money
class AuditTests(unittest.TestCase):
    def row(self,condition='new',ram='8GB',sku='A'):return {'id':'1','source':'s','condition':condition,'sku':sku,'name':'Same family','specs':{'ram':ram},'pricing':{'current':20000000},'availability':'in_stock'}
    def costs(self):return {'baseVnd':20000000,'shippingVnd':200000,'mandatoryExtraFeesVnd':300000,'discountVnd':500000,'discountEligibility':'confirmed','stackingConfirmed':True}
    def test_U04_01_conditions(self):
        result=audit({'products':[self.row(c) for c in ('new','new','used','other')]},'fixture');self.assertEqual(result['counts']['rows'],4);self.assertEqual(result['counts']['byCondition'],{'new':2,'unknown':1,'used':1})
    def test_U04_02_exact(self):
        r=audit({'products':[self.row(),self.row(ram='16GB',sku='B')]},'fixture');self.assertEqual(len({c['id'] for c in r['canonicalCandidates']}),2);self.assertTrue(all(c['matchStatus']=='unresolved' for c in r['canonicalCandidates']))
    def test_U04_03_duplicate(self):
        raw=self.row();r=audit({'products':[raw,raw]},'fixture');self.assertEqual(r['counts']['duplicateRows'],2);self.assertEqual(r['reviewedCount'],0);self.assertEqual(len(r['listings']),2)
    def test_U04_04_totals(self):
        c=self.costs();self.assertEqual(price_context(c)['completeTotalVnd'],20000000);c['includedCharges']=['shippingVnd'];self.assertEqual(price_context(c)['completeTotalVnd'],19800000)
    def test_U04_05_unknown(self):
        c=self.costs();c['discountEligibility']='unknown';self.assertEqual(price_context(c)['completeTotalVnd'],20500000);c['shippingVnd']=None;self.assertIsNone(price_context(c)['completeTotalVnd'])
    def test_U04_06_invalid(self):
        for v in (-1,1.5,True,9007199254740992,'20'):
            with self.assertRaises(ValueError):money(v)
        self.assertIsNone(money(None));self.assertEqual(money(0),0)
    def test_U04_07_stock(self):
        r=audit({'products':[self.row()]},'fixture')['listings'][0];self.assertEqual(r['originalAvailability'],'in_stock');self.assertEqual(r['offer']['offerValidity'],'unknown');self.assertIn('inferred',r['availabilityBasis'])
    def test_U04_08_repeat(self):
        raw={'products':[self.row()]};before=copy.deepcopy(raw);self.assertEqual(audit(raw,'fixture'),audit(raw,'fixture'));self.assertEqual(raw,before)
