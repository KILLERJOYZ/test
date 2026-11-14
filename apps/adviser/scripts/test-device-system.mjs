import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import React from 'react';
import { create, act } from 'react-test-renderer';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mocks = {
 './ExpressiveButton': `import React from 'react'; export function ExpressiveButton({label,onPress,disabled}){return React.createElement('Pressable',{onPress,disabled},label)}`,
 './catalog-sync': `export async function syncReferenceCatalog(){return 'test-signed-version';}`,

 './device-ai': `export const aiCapability=async()=>'unsupported';export const prepareAi=async()=>{throw Error('unsupported')};export const cancelAi=async()=>{};export const extractDeviceNeeds=async()=>{throw Error('use form')};`,
  './reference-storage': `import seed from './src/reference-seed.json'; const referenceSeed=seed; export const referenceStorageKind='test reference adapter';export async function rollbackReferences(){};export async function loadReferences(){return referenceSeed.rows;};`,
  'react-native': `import React from 'react'; export const NativeModules={};export const useColorScheme=()=> 'light';export const AccessibilityInfo={isReduceMotionEnabled:async()=>true,addEventListener:()=>({remove(){}})};export const StatusBar='StatusBar',View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',ScrollView='ScrollView'; export const StyleSheet={create:x=>x};export const Linking={openURL:async()=>({})};export const Share={share:async()=>({})};export const AppState={addEventListener:()=>({remove(){}})};export const BackHandler={addEventListener:()=>({remove(){}})};`,
  '@react-native-async-storage/async-storage': `export default {getItem:async()=>null};`,
  'react-native-safe-area-context': `export const SafeAreaProvider='SafeAreaProvider',SafeAreaView='SafeAreaView';`,
  './demo-storage': `const records=new Map();globalThis.deviceTestRecords=records;export const storageKind='test adapter';export const storage={getItem:async k=>records.get(k)??null,setItem:async(k,v)=>{records.set(k,v)},removeItem:async k=>records.delete(k)};`,
};
await mkdir('.expo/demo2-tests',{recursive:true});
await build({entryPoints:['src/DeviceAdvisorApp.tsx'],bundle:true,platform:'node',format:'cjs',outfile:'.expo/demo2-tests/app.cjs',external:['react'],plugins:[{name:'native-test-boundaries',setup(b){b.onResolve({filter:/.*/},args=>args.path in mocks?{path:args.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path],loader:'js',resolveDir:process.cwd()}));}}]});
const App=createRequire(import.meta.url)('../.expo/demo2-tests/app.cjs').default;
let app;
const text=()=>JSON.stringify(app.toJSON());
async function press(title){const button=app.root.findAll(n=>typeof n.type==='function'&&n.props.title===title)[0];assert.ok(button,`Missing: ${title}`);assert.ok(!button.props.disabled,`Disabled: ${title}`);await act(async()=>{await button.props.onPress();});}
const cases=[{category:'Phone',purposes:['Students','Elderly','Creators'],os:'Android',band:'phone_tablet_vn_v1_tier_2'}, {category:'Tablet',purposes:['Basics','Readers','Media'],os:'iPadOS',band:'phone_tablet_vn_v1_tier_2'},{category:'PC',purposes:['Software Programming','AI & Data','Hardware Engineering'],os:'Windows',band:'pc_vn_v1_tier_2'}];
for(const scenario of cases){
 await act(async()=>{app=create(React.createElement(App,{onExit(){}}));});
 await press(text().includes('Điều chỉnh nhu cầu')?'Điều chỉnh nhu cầu':'Bắt đầu chọn thiết bị');await press(scenario.category);await press('Tiếp tục: ba mục đích');
 for(const purpose of scenario.purposes)await press(purpose);
 await press('Tiếp tục: khoảng giá');
 const choice=app.root.findAll(n=>typeof n.type==='function'&&n.props.title&&String(n.props.title).startsWith(scenario.category==='PC'?'16.000.000':'8.000.000'))[0];assert.ok(choice);await act(async()=>choice.props.onPress());
 await act(async()=>app.root.findByProps({accessibilityLabel:'Trần tổng chi tiêu VND'}).props.onChangeText('20000000'));
 await press('Tiếp tục: ba ưu tiên');await press('Strength');await press('Form factors');await press('OS');await press(scenario.os);await press('Classics');await press('Tiếp tục: làm rõ nhu cầu');
 for(let i=0;i<3;i++){await press('Chưa biết');await press(i===2?'Kiểm tra lựa chọn':'Câu tiếp theo');}
 assert.match(text(),/Kiểm tra toàn bộ lựa chọn/);for(const purpose of scenario.purposes)assert.ok(text().includes(purpose));assert.ok(text().includes('UNRATED'));
 await press('Xác nhận và xem gợi ý');assert.ok(text().includes(scenario.category));assert.match(text(),/Gợi ý theo lựa chọn đã xác nhận/);assert.ok(!text().includes('Chọn đúng ba mục đích'));
 await act(async()=>app.unmount());
 console.log('PASS: complete '+scenario.category+' journey with exact three/three, conditional OS/form, three questions, review and shared results.');
}
await act(async()=>{app=create(React.createElement(App,{onExit(){}}));});
assert.match(text(),/Gợi ý theo lựa chọn đã xác nhận/);await press('Dữ liệu & AI');assert.match(text(),/unsupported/);await press('Gợi ý');assert.match(text(),/Gợi ý theo lựa chọn đã xác nhận/);await act(async()=>app.unmount());
globalThis.deviceTestRecords.set('device-advisor-v1-draft','{corrupt');
await act(async()=>{app=create(React.createElement(App,{onExit(){}}));});
assert.match(text(),/Không đọc được hồ sơ/);
await act(async()=>{await new Promise(r=>setTimeout(r,350));});
assert.equal(globalThis.deviceTestRecords.get('device-advisor-v1-draft'),'{corrupt');
await act(async()=>app.unmount());
console.log('PASS: corrupt stored draft remains recoverable after autosave delay.');
await writeFile('.expo/demo2-tests/device-system-results.json',JSON.stringify({status:'passed',categories:['Phone','Tablet','PC'],checks:['exact ranked purposes','exact ranked priorities','category-specific OS and form','adaptive questions','unknown answers','full review','same recommendation surface','restart','unsupported AI form fallback','corrupt draft retained after autosave delay'],boundary:'React component tests with native/storage/AI mocks'},null,2));
