"""Small, explicit ADB checks against an already-running emulator (no extra packages)."""
from pathlib import Path
import json, os, re, subprocess, sys, time
import xml.etree.ElementTree as ET

ADB = Path(os.environ.get('ANDROID_HOME', str(Path.home()/'AppData/Local/Android/Sdk')))/'platform-tools/adb.exe'
SERIAL = os.environ.get('ANDROID_SERIAL', 'emulator-5554')
OUT = Path(__file__).resolve().parents[1]/'verification'
OUT.mkdir(exist_ok=True)
def adb(*args):
    return subprocess.check_output([str(ADB),'-P',os.environ.get('ADB_SERVER_PORT','5037'),'-s',SERIAL,*map(str,args)],stderr=subprocess.STDOUT,timeout=30)
def dump():
    output=adb('shell','uiautomator','dump','/sdcard/lua-smoke.xml')
    assert b'dumped to' in output, output.decode(errors='replace')
    raw=adb('exec-out','cat','/sdcard/lua-smoke.xml')
    (OUT/'emulator-current.xml').write_bytes(raw)
    root=ET.fromstring(raw)
    expected=os.environ.get('APP_PACKAGE','vn.lua.adviser')
    assert any(n.get('package')==expected for n in root.iter('node')), 'Expected foreground package '+expected
    return root
def nodes():
    return [n for n in dump().iter('node') if n.get('text') or n.get('content-desc')]
def texts():
    return [n.get('text') or n.get('content-desc') for n in nodes()]
def tap(label, index=0, scroll=True):
    for attempt in range(7 if scroll else 1):
        matches=[n for n in nodes() if n.get('text')==label or n.get('content-desc')==label]
        # Prefer clickable containers, then text centers inside a button.
        clickable=[n for n in matches if n.get('clickable')=='true']
        choices=clickable or matches
        if len(choices)>index:
            n=choices[index];x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds')))
            if x2>x1 and y2>y1:
                adb('shell','input','tap',(x1+x2)//2,(y1+y2)//2);time.sleep(.35);return
        adb('shell','input','swipe','540','1800','540','650','350');time.sleep(.25)
    raise AssertionError('Not found: '+label+'; visible: '+str(texts()))
def assert_text(fragment):
    found=texts()
    assert any(fragment in t for t in found), f'Missing {fragment}: {found}'
def capture(name):
    image=adb('exec-out','screencap','-p')
    image=image[image.index(b'\x89PNG\r\n\x1a\n'):]
    (OUT/f'{name}.png').write_bytes(image)
    (OUT/f'{name}.xml').write_bytes(adb('exec-out','cat','/sdcard/lua-smoke.xml'))
def back():adb('shell','input','keyevent','4');time.sleep(.4)
def top():
    for _ in range(4):adb('shell','input','swipe','540','700','540','1800','180')
def phase_picker():
    tap('Tìm máy cho tôi ↗');assert_text('Việc gì quan trọng?')
    tap('Chọn',0);tap('Chọn',0)
    tap('Tiếp tục');assert_text('Trần rõ, ưu tiên rõ.')
    tap('Xem hồ sơ trước khi xác nhận');assert_text('Đúng ý bạn chưa?')
    tap('Xác nhận & tìm cấu hình');assert_text('Dành cho việc của bạn');capture('expo-confirmed')
    tap('Bộ lọc');tap('1 kg');tap('Áp dụng bộ lọc')
    assert_text('Bộ lọc đang ẩn mọi kết quả');capture('expo-filter-empty')
    tap('Chỉ xóa bộ lọc');assert_text('cấu hình đạt điều kiện mẫu')
    tap('Lưu Néo Air 14')
    tap('Đã lưu',scroll=False);assert_text('Phương án 1');capture('expo-saved')
def phase_saved():
    tap('Đã lưu',scroll=False);assert_text('Phương án 1');capture('expo-saved')

def phase_reopen():
    assert_text('lựa.')
    tap('Đã lưu',scroll=False);assert_text('Phương án 1')
    tap('Mở lại');assert_text('Bản quyết định lịch sử');capture('expo-restored')
    tap('Khám phá',scroll=False);top();tap('So sánh Forma Pro 14')
    tap('⇄, So sánh 2',scroll=False);assert_text('Đặt cạnh nhau.');capture('expo-comparison')
def phase_detail():
    tap('Khám phá',scroll=False);top();tap('Chi tiết Néo Air 14');assert_text('Néo Air 14')
    tap('32 GB / 1024 GB');assert_text('Néo Air 14 Plus');assert_text('Cấu hình P4');capture('expo-variant')
    tap('Xem tóm tắt offer mẫu');assert_text('Đây không phải trang thanh toán.');capture('expo-sample-offer');tap('Quay lại đúng cấu hình');tap('Đóng',scroll=False)
    tap('Cho bạn',scroll=False);top();tap('Hỏi thêm ✦')
    tap('Giải thích phương án');assert_text('dự phòng');capture('expo-ai-fallback');back()
def phase_chat():
    tap('Đóng',scroll=False)
    tap('Cho bạn',scroll=False);top();tap('Hỏi thêm ✦')
    tap('Giải thích phương án');assert_text('dự phòng');capture('expo-ai-fallback');tap('Đóng',scroll=False)

def phase_nofit():
    tap('Cho bạn',scroll=False);top();tap('Tìm máy cho tôi ↗');tap('Tiếp tục')
    tap('Tổng ngân sách tối đa · VND',scroll=False)
    adb('shell','input','keyevent','123',*(['67']*12));adb('shell','input','text','1');adb('shell','input','keyevent','66')
    tap('Xem hồ sơ trước khi xác nhận');tap('Xác nhận & tìm cấu hình')
    top();assert_text('Chưa có máy đáp ứng');capture('expo-no-fit')
    tap('Tìm máy cho tôi ↗');tap('Tiếp tục')
    tap('Tổng ngân sách tối đa · VND',scroll=False)
    adb('shell','input','keyevent','123',*(['67']*12));adb('shell','input','text','22000000');adb('shell','input','keyevent','66')
    tap('Xem hồ sơ trước khi xác nhận');tap('Xác nhận & tìm cấu hình')
    top();assert_text('Dành cho việc của bạn')

def phase_back():
    tap('Cho bạn',scroll=False);top();tap('Tìm máy cho tôi ↗');tap('Tiếp tục');tap('Xem hồ sơ trước khi xác nhận')
    back();assert_text('Trần rõ, ưu tiên rõ.')
    back();assert_text('Việc gì quan trọng?');tap('Đóng',scroll=False)
    capture('expo-android-back')

def phase_delete():
    tap('Đã lưu',scroll=False);tap('Xóa');assert_text('Chưa có phương án đã lưu.');capture('expo-deleted')

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv)<2 or sys.argv[1]=='inspect': print('\n'.join(texts()))
    else:
        name=sys.argv[1]
        globals()['phase_'+name]()
        print(json.dumps({'phase':name,'status':'passed','serial':SERIAL},ensure_ascii=False))
