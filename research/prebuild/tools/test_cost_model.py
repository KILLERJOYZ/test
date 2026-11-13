import unittest,copy
from cost_model import calculate
class CostTests(unittest.TestCase):
 def data(self,components=None,denominator=2):return {'currency':'VND','scenarios':[{'id':'base','components':components or [{'id':'calls','units':3,'rate':20,'category':'recurring','currency':'VND'}],'usefulSessions':denominator}]}
 def result(self,d):return calculate(d)['scenarios'][0]
 def test_U13_01_retries(self):self.assertEqual(self.result(self.data())['knownSubtotal'],60)
 def test_U13_02_unknown(self):
  d=self.data();d['scenarios'][0]['components'][0]['rate']=None;r=self.result(d);self.assertIsNone(r['completeTotal']);self.assertEqual(r['missingComponents'],['calls'])
 def test_U13_03_denominator(self):
  for denominator in (None,0):self.assertIsNone(self.result(self.data(denominator=denominator))['costPerUsefulSession'])
 def test_U13_04_currency(self):
  d=self.data();d['scenarios'][0]['components'][0]['currency']='USD';self.assertIsNone(self.result(d)['completeTotal']);d['conversions']={'USD':{'rate':25000,'observedAt':'2026-11-13'}};self.assertEqual(self.result(d)['completeTotal'],1500000)
 def test_U13_05_invalid(self):
  for v in (-1,True,1.5,9007199254740992):
   d=self.data();d['scenarios'][0]['components'][0]['units']=v
   with self.assertRaises(ValueError):calculate(d)
 def test_U13_06_repeat(self):
  d=self.data();before=copy.deepcopy(d);a=calculate(d);b=calculate(d);a['scenarios'][0]['components'][0]['units']=99;self.assertEqual(calculate(d),b);self.assertEqual(d,before)
 def test_U13_07_categories(self):
  d=self.data([{'id':'build','units':1,'rate':100,'category':'one_time'},{'id':'calls','units':2,'rate':20,'category':'recurring'}]);r=self.result(d);self.assertEqual(r['categories'],{'one_time':100,'recurring':40,'staff':0});self.assertEqual(r['costPerUsefulSession'],20)
