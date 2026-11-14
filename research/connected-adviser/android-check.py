"""Native smoke checks for the connected adviser, on an explicitly selected emulator."""
import os,re,subprocess,time,json,sys,hashlib
from pathlib import Path
import xml.etree.ElementTree as ET
ADB=Path(os.environ['LOCALAPPDATA'])/'Android/Sdk/platform-tools/adb.exe'
SERIAL=os.environ.get('ANDROID_SERIAL','emulator-5580')
OUT=Path(__file__).resolve().parent
def adb(*args):return subprocess.check_output([str(ADB),'-s',SERIAL,*map(str,args)],stderr=subprocess.STDOUT,timeout=35)
def nodes():
 adb('shell','uiautomator','dump','/sdcard/adviser-check.xml')
 raw=adb('exec-out','cat','/sdcard/adviser-check.xml');(OUT/'current.xml').write_bytes(raw)
 return list(ET.fromstring(raw).iter('node'))
def texts():return [n.get('text') or n.get('content-desc') for n in nodes() if n.get('text') or n.get('content-desc')]
def check(fragment):
 values=texts();assert any(fragment in x for x in values),ascii(values)
def tap(label,scroll=True):
 for _ in range(8 if scroll else 1):
  matches=[n for n in nodes() if n.get('text')==label or n.get('content-desc')==label]
  candidates=sorted(matches,key=lambda n:n.get('clickable')!='true')
  if candidates:
   bounds=list(map(int,re.findall(r'\d+',candidates[0].get('bounds'))));x1,y1,x2,y2=bounds
   if x2>x1 and y2>y1:adb('shell','input','tap',(x1+x2)//2,(y1+y2)//2);time.sleep(.5);return
  adb('shell','input','swipe',540,1800,540,650,300)
 raise AssertionError('Missing '+ascii(label))
def capture(name):
 nodes();(OUT/(name+'.xml')).write_bytes((OUT/'current.xml').read_bytes());image=adb('exec-out','screencap','-p');image=image[image.index(b'\x89PNG\r\n\x1a\n'):];(OUT/(name+'.png')).write_bytes(image)
def back():adb('shell','input','keyevent',4);time.sleep(.4)
def edit(label,value):
 tap(label);adb('shell','input','keyevent',123)
 for _ in range(65):adb('shell','input','keyevent',67)
 adb('shell','input','text',value);back()
mode=sys.argv[1] if len(sys.argv)>1 else 'basic'
if mode=='basic':
 for _ in range(8):
  if any('70 tin đăng thực tế' in text for text in texts()):break
  time.sleep(.5)
 check('70 tin đăng thực tế');capture('real-adviser-home')
 tap('Điều chỉnh nhu cầu');check('Ngân sách tối đa');tap('16 GB');tap('Lập trình');tap('Xác nhận & đánh giá lại');check('RAM ≥ 16 GB');capture('confirmed-real-needs')
 tap('Xem cấu hình');check('Chưa xác nhận giá hiện tại');tap('Lưu quyết định này');capture('real-detail');back()
 tap('Đã lưu',False);check('Mở bản lịch sử');tap('Mở bản lịch sử');check('Giá quan sát được giữ nguyên');capture('real-history');back()
 adb('shell','am','force-stop','vn.lua.adviser');adb('shell','am','start','-n','vn.lua.adviser/.MainActivity');time.sleep(2)
 tap('Đã lưu',False);check('Mở bản lịch sử');capture('real-history-after-restart')
elif mode=='compare':
 tap('Khám phá',False);tap('So sánh');tap('So sánh');tap('So sánh 2',False);check('Đối chiếu cấu hình');tap('Lưu quyết định so sánh');capture('real-comparison-saved')
elif mode=='source':
 tap('Tư vấn',False);tap('Cập nhật',False);time.sleep(1);check('Đã kết nối');capture('current-connected-source')
elif mode=='outage':
 tap('Tư vấn',False);tap('Cập nhật',False)
 for _ in range(8):
  if any('Nguồn không truy cập được' in text for text in texts()):break
  time.sleep(1)
 check('Nguồn không truy cập được');check('RAM ≥ 16 GB');capture('source-outage-keeps-confirmed-decision')
elif mode=='nano':
 tap('Khám phá',False);tap('Xem cấu hình');tap('Kiểm tra AI trên máy');check('Thiết bị chưa hỗ trợ hoặc AICore chưa sẵn sàng');capture('gemini-nano-native-unavailable')
 check('RAM:');capture('gemini-nano-failure-preserves-facts');back()
elif mode=='connect':
 adb('reverse','tcp:8788','tcp:8788');tap('Cài đặt',False)
 edit('Địa chỉ dịch vụ HTTPS (hoặc http://127.0.0.1:8788 qua ADB)','http://127.0.0.1:8788');tap('Lưu kết nối');time.sleep(2);check('Đã kết nối');capture('connected-repository-service')
 tap('Khám phá',False);tap('Xem cấu hình');check('RAM:');capture('unavailable-ai-is-explicit');back()
else:raise ValueError(mode)
(OUT/('android-'+mode+'-result.json')).write_text(json.dumps({'mode':mode,'result':'pass','serial':SERIAL,'observedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'physicalDevice':False,'apkSha256':hashlib.sha256((OUT.parents[1]/'apps/adviser/artifacts/lua-adviser-0.4.0.apk').read_bytes()).hexdigest()},indent=2))
print(mode,'passed')
