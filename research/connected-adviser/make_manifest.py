"""Assemble the current handoff only when executed evidence matches its APK."""
from pathlib import Path
import datetime,hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
apk=ROOT/'apps/adviser/artifacts/lua-adviser-0.4.0.apk'
apk_hash=sha(apk)
assert sha(ROOT/'apps/adviser/artifacts/lua-adviser-demo.apk')==apk_hash
assert sha(ROOT/'apps/adviser/android/app/build/outputs/apk/release/app-release.apk')==apk_hash
checks=json.loads((OUT/'checks-current.json').read_text())
assert all(x['exitCode']==0 for x in checks)
assert int((OUT/'delivered-pipeline-exit.txt').read_text())==0
assert int((OUT/'packaging-final-exit.txt').read_text())==0
assert int((OUT/'signature-delivered-exit.txt').read_text())==0
phases=[]
for mode in ['basic','compare','nano','source','outage']:
 record=json.loads((OUT/f'android-{mode}-result.json').read_text())
 assert record['result']=='pass' and record['apkSha256']==apk_hash,(mode,'stale or failed native evidence')
 phases.append(record)
baseline=json.loads((OUT/'baseline-packs-final.log').read_text())
assert baseline['exitCode']==0
for label,args,expected in [('artifact-validation',['--all'],0),('gate-g4',['--gate','G4'],2)]:
 r=subprocess.run(['python','research/prebuild/tools/validate.py',*args],cwd=ROOT,capture_output=True,text=True)
 (OUT/f'{label}-handoff.log').write_text(r.stdout+r.stderr,encoding='utf-8')
 assert r.returncode==expected,(label,r.returncode,r.stdout,r.stderr)
native=ROOT/'apps/adviser/native/adviser/LocalAiModule.kt'
assert sha(native)==sha(ROOT/'apps/adviser/android/app/src/main/java/vn/lua/adviser/LocalAiModule.kt')
sources=list((ROOT/'apps/adviser/src').glob('*'))+list((ROOT/'apps/adviser/plugins').glob('*'))+list((ROOT/'apps/adviser/scripts').glob('*'))+[native]
sources += [ROOT/p for p in ['apps/adviser/index.js','apps/adviser/app.json','apps/adviser/package.json','apps/adviser/package-lock.json','services/adviser/server.mjs','services/adviser/server.test.mjs','data/all_laptops_normalized.json','apps/adviser/android/app/build.gradle','apps/adviser/android/gradle.properties','apps/adviser/android/app/src/main/AndroidManifest.xml','apps/adviser/android/app/src/main/res/xml/adviser_network_security.xml']]
counts={name:int(re.search(r'tests (\d+)',(OUT/log).read_text(encoding='utf-8')).group(1)) for name,log in [('app','app-tests-current.log'),('service','service-current.log')]}
manifest={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'branch':subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip(),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'workingTreeDirty':True,'apk':str(apk.relative_to(ROOT)).replace('\\','/'),'apkSha256':apk_hash,'apkBytes':apk.stat().st_size,'version':'0.4.0','versionCode':2,'minimumAndroidApi':26,'targetAndroidApi':36,'architectures':['arm64-v8a','x86_64'],'signing':'development key; signature verified separately','catalog':{'rows':70,'sourceRef':'data/all_laptops_normalized.json','refresh':'repository-file changes; connected app polling every 30 seconds','liveRetailerFeed':False},'ai':{'mode':'on-device Gemini Nano / Android AICore','sdk':'com.google.mlkit:genai-prompt:1.0.0-beta4','kotlin':'2.2.10','apiKeyRequired':False,'cloudFallback':False,'paidCloudRequests':0,'emulatorNativeBridge':'registered; unavailable-model handling observed','successfulPhysicalInference':'not_run'},'checks':checks,'executedTestCounts':counts,'baselinePackReport':baseline,'nativePhases':phases,'sourceHashes':{p.relative_to(ROOT).as_posix():sha(p) for p in sources if p.is_file()},'evidenceHashes':{p.name:sha(p) for p in OUT.iterdir() if p.is_file() and p.name!='manifest.json'},'limitations':['Source data is dated and unreviewed; no current stock/complete checkout/workload capability claim','Physical-device model generation, accessibility/performance and buyer evidence remain unperformed','Private single-process catalog service; no public hosting/production identity or operating acceptance','G1-G4 remain pending; no gate acceptance inferred from implementation or passing tests']}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'manifest':str(OUT/'manifest.json'),'apkSha256':apk_hash,'testCounts':counts,'nativePhases':len(phases)}))
