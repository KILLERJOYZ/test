import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import React from 'react';
import { create, act } from 'react-test-renderer';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mocks = {
  './ExpressiveButton': `import React from 'react'; export function ExpressiveButton({label,onPress,disabled}){return React.createElement('Pressable',{onPress,disabled},label)}`,

  './reference-storage': `import seed from './src/reference-seed.json'; const referenceSeed=seed; export const referenceStorageKind='test reference adapter';export async function loadReferences(){return referenceSeed.rows;};`,
  'react-native': `import React from 'react'; export const NativeModules={};export const useColorScheme=()=> 'light';export const AccessibilityInfo={isReduceMotionEnabled:async()=>true,addEventListener:()=>({remove(){}})};export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',ScrollView='ScrollView'; export const StyleSheet={create:x=>x};export const Linking={openURL:async()=>({})};export const Share={share:async()=>({})};export const AppState={addEventListener:()=>({remove(){}})};export const BackHandler={addEventListener:()=>({remove(){}})};`,
  '@react-native-async-storage/async-storage': `export default {getItem:async()=>null};`,
  'react-native-safe-area-context': `export const SafeAreaProvider='SafeAreaProvider',SafeAreaView='SafeAreaView';`,
  './demo-storage': `const records=new Map();export const storageKind='test adapter';export const storage={getItem:async k=>records.get(k)??null,setItem:async(k,v)=>{records.set(k,v)},removeItem:async k=>records.delete(k)};`,
};
await mkdir('.expo/demo2-tests',{recursive:true});
await build({entryPoints:['src/DemoTwo.tsx'],bundle:true,platform:'node',format:'cjs',outfile:'.expo/demo2-tests/app.cjs',external:['react'],plugins:[{name:'native-test-boundaries',setup(b){b.onResolve({filter:/.*/},args=>args.path in mocks?{path:args.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path],loader:'js',resolveDir:process.cwd()}));}}]});
const App=createRequire(import.meta.url)('../.expo/demo2-tests/app.cjs').default;
let app;
const text=()=>JSON.stringify(app.toJSON());
async function press(title){const button=app.root.findAll(n=>typeof n.type==='function'&&n.props.title===title)[0];assert.ok(button,`Missing button: ${title}`);assert.ok(!button.props.disabled,`Disabled: ${title}`);await act(async()=>{await button.props.onPress();});}
await act(async()=>{app=create(React.createElement(App,{onExit(){}}));});
assert.match(text(),/Khám phá gợi ý laptop/);
assert.doesNotMatch(text(),/Bạn cần máy cho việc gì/);
await press('Tìm máy phù hợp với tôi');
assert.match(text(),/Bạn cần máy cho việc gì/);
assert.doesNotMatch(text(),/Bạn muốn chi tối đa bao nhiêu/);
await press('Tiếp tục: ngân sách');
assert.doesNotMatch(text(),/Bạn cần máy cho việc gì/);
await act(async()=>app.root.findByProps({accessibilityLabel:'Trần tổng chi tiêu VND'}).props.onChangeText('25000000'));
await press('Tiếp tục: ưu tiên');
assert.match(text(),/Điều gì quan trọng với bạn/);
await press('RAM tối thiểu 32 GB');await press('Bắt buộc Windows');
await press('Kiểm tra lựa chọn');
assert.match(text(),/Xác nhận lựa chọn của bạn/);
assert.doesNotMatch(text(),/Kết quả ·/);
await press('Sửa ngân sách');
assert.equal(app.root.findByProps({accessibilityLabel:'Trần tổng chi tiêu VND'}).props.value,'25000000');
await press('Tiếp tục: ưu tiên');await press('Kiểm tra lựa chọn');await press('Xác nhận và xem gợi ý');
assert.match(text(),/Gợi ý dành cho bạn/);
assert.doesNotMatch(text(),/Xác nhận lựa chọn của bạn/);
assert.match(text(),/25\.000\.000/);
await press('Điều chỉnh nhu cầu');await press('Hủy và về gợi ý hiện tại');
assert.match(text(),/Gợi ý dành cho bạn/);
await press('Đã lưu');assert.match(text(),/Quyết định tham chiếu đã lưu/);assert.doesNotMatch(text(),/Tìm tên, RAM, SSD/);
await press('Gợi ý');assert.match(text(),/Gợi ý dành cho bạn/);
await act(async()=>app.unmount());
await act(async()=>{app=create(React.createElement(App,{onExit(){}}));});
assert.match(text(),/Gợi ý dành cho bạn/);assert.match(text(),/25\.000\.000/);
await press('Chi tiết và nguồn dữ liệu');assert.match(text(),/Giá thân máy đã ghi nhận/);
await press('Lưu quyết định với giá lịch sử');await press('Đã lưu');assert.match(text(),/Xem bản ghi đã lưu/);
await press('Xem bản ghi đã lưu');assert.match(text(),/Mở trang nguồn để kiểm tra giá/);
await press('Quay lại gợi ý');await press('Chọn so sánh');await press('Chọn so sánh');await press('Mở so sánh');assert.match(text(),/So sánh hai bản ghi nguồn/);
await press('Đã lưu');await press('Xóa bản lưu');assert.match(text(),/Xem bản ghi đã lưu/);await press('Xác nhận xóa bản lưu');assert.doesNotMatch(text(),/Xem bản ghi đã lưu/);
await act(async()=>app.unmount());
await writeFile('.expo/demo2-tests/results.json',JSON.stringify({status:'passed',checks:['first-launch shared results','separate tasks screen','separate budget screen','separate preferences screen','review before results','review edit preserves input','confirmed recommendations','cancel preserves confirmed result','saved screen isolation','recommendations navigation','restart restores confirmed result','reference detail','real decision save','saved reference reopen','reference paired comparison','saved reference delete','mandatory RAM review','mandatory OS review'],boundary:'React component test with mocked native/storage adapters; not Android device acceptance'},null,2));
console.log('PASS: 18 Demo 2 navigation/review/restoration checks (mock native/storage boundaries).');
