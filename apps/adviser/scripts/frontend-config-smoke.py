"""Reversible emulator configuration checks; restore every modified setting."""
import importlib.util,json,re,sys,time
from pathlib import Path
spec=importlib.util.spec_from_file_location('s',Path(__file__).with_name('android-smoke.py'))
s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
s.OUT=Path(__file__).resolve().parents[1]/'verification'/'frontend-expressive'
s.OUT.mkdir(exist_ok=True);sys.stdout.reconfigure(encoding='utf-8')
settings=[('system','font_scale'),('global','animator_duration_scale'),('global','transition_animation_scale'),('global','window_animation_scale')]
original={(table,key):s.adb('shell','settings','get',table,key).decode().strip() for table,key in settings}
size=s.adb('shell','wm','size').decode();density=s.adb('shell','wm','density').decode()
result={'original':{f'{t}/{k}':v for (t,k),v in original.items()},'size':size,'density':density,'checks':[]}
def restart():
    s.adb('shell','am','force-stop','vn.lua.adviser');s.adb('shell','am','start','-n','vn.lua.adviser/.MainActivity');time.sleep(2)
def capture(name):s.dump();s.capture(name)
try:
    restart();s.tap('Tư vấn',scroll=False);s.top()
    s.adb('shell','settings','put','system','font_scale','2.0');time.sleep(2)
    restart();s.assert_text('Điều chỉnh nhu cầu');capture('large-text-2x')
    print('Completed configuration step',flush=True)
    result['checks'].append('2.0x font: navigation and needs action present')
    for key in ['animator_duration_scale','transition_animation_scale','window_animation_scale']:s.adb('shell','settings','put','global',key,'0')
    s.adb('shell','settings','put','system','font_scale','1.0');restart()
    s.tap('Điều chỉnh nhu cầu');s.tap('16 GB');s.tap('Đóng',scroll=False);s.assert_text('Điều chỉnh nhu cầu');capture('disabled-motion')
    print('Completed configuration step',flush=True)
    result['checks'].append('disabled system animations: modal open/select/cancel operable')
    s.adb('shell','wm','size','1800x1200');s.adb('shell','wm','density','240');restart()
    s.tap('Khám phá',scroll=False);s.top();s.tap('So sánh');s.tap('So sánh');s.tap('So sánh 2',scroll=False)
    s.assert_text('Đặt cạnh nhau. Chọn có căn cứ.');capture('expanded-comparison')
    print('Completed configuration step',flush=True)
    result['checks'].append('1200dp expanded comparison with paired identities')
    result['status']='passed'
except Exception as e:
    result['status']='failed';result['error']=str(e)
finally:
    for (table,key),value in original.items():s.adb('shell','settings','delete' if value=='null' else 'put',table,key,*([] if value=='null' else [value]))
    for command,raw in [('size',size),('density',density)]:
        match=re.search(r'Override (?:size|density):\s*(\S+)',raw)
        s.adb('shell','wm',command,match[1] if match else 'reset')
    restart()
    (s.OUT/'configuration-result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False));sys.exit(0 if result.get('status')=='passed' else 1)
