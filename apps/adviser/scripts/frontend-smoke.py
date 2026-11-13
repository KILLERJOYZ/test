"""Current-adviser regression checks using the repository Android smoke helper.
Only the sample decision created by this run is deleted. Existing app data is retained.
"""
import importlib.util, json, re, sys, time
from pathlib import Path
spec=importlib.util.spec_from_file_location('smoke',Path(__file__).with_name('android-smoke.py'))
s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
s.OUT=Path(__file__).resolve().parents[1]/'verification'/'frontend-expressive'
s.OUT.mkdir(exist_ok=True)
sys.stdout.reconfigure(encoding='utf-8')
def input_text(label,value):
    root=s.dump()
    n=next(n for n in root.iter('node') if n.get('class')=='android.widget.EditText' and n.get('content-desc')==label)
    a,b,c,d=map(int,re.findall(r'\d+',n.get('bounds')))
    s.adb('shell','input','tap',(a+c)//2,(b+d)//2)
    s.adb('shell','input','keyevent','123',*(['67']*30))
    s.adb('shell','input','text',value)
    s.back()
def capture(name):s.dump();s.capture(name)
def run():
    s.adb("shell","am","force-stop","vn.lua.adviser");s.adb("shell","am","start","-n","vn.lua.adviser/.MainActivity");time.sleep(2)
    s.tap('Tư vấn',scroll=False);s.top();capture('home')
    s.tap('Điều chỉnh nhu cầu');s.assert_text('Nhu cầu của bạn')
    s.tap('16 GB');root=s.dump()
    assert any(n.get('checked')=='true' and n.get('content-desc')=='16 GB' for n in root.iter('node')),'Selection must be checked in native accessibility'
    s.top();input_text('Ngân sách tối đa (VND)','0')
    s.tap('Xác nhận & đánh giá lại');s.assert_text('Nhập ngân sách nguyên dương');capture('invalid-budget')
    s.tap('Đóng',scroll=False)
    s.tap('Khám phá',scroll=False);s.top();input_text('Tìm tên máy, CPU, RAM hoặc nhà bán','zzzz-no-product')
    s.assert_text('Không tìm thấy tin khớp');capture('empty-search')
    s.tap('Xóa tìm kiếm & bộ lọc');s.assert_text('48 tin cần kiểm tra')
    s.tap('So sánh');s.tap('So sánh')
    s.tap('So sánh 2',scroll=False);s.assert_text('Đặt cạnh nhau. Chọn có căn cứ.');capture('comparison')
    s.tap('Chi tiết');s.tap('Lưu quyết định này');s.assert_text('Đã lưu bản quyết định');capture('save-feedback')
    s.tap('Đóng',scroll=False);s.tap('Đã lưu',scroll=False)
    s.tap('Xóa bản lưu',0);s.assert_text('Xác nhận xóa');capture('delete-confirmation');s.tap('Hủy')
    s.assert_text('Mở bản lịch sử')
    s.tap('Xóa bản lưu',0);s.tap('Xác nhận xóa');s.assert_text('Đã xóa lịch sử đã chọn')
    s.tap('Tư vấn',scroll=False);s.top();capture('final-home')
try:
    run();result={'status':'passed','checks':['persistent navigation','native checked semantics','inline invalid budget','cancel draft','search recovery','two-item comparison','modal save acknowledgement','delete cancel and confirm'],'serial':s.SERIAL}
except Exception as e:
    try:capture('failure')
    except Exception:pass
    result={'status':'failed','error':str(e),'serial':s.SERIAL}
(s.OUT/'smoke-result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False));sys.exit(0 if result['status']=='passed' else 1)
