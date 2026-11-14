import { build } from "esbuild";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mocks = {
  "./DeviceAdvisorApp": `import React from 'react';export default function Feature(props){return React.createElement('DeviceAdvisorFeature',props,'Complete Device Advisor feature')}`,
  "./ExpressiveButton": `import React from 'react';export function ExpressiveButton(p){return React.createElement('Button',p,p.label)}`,
  "./ExpressiveSurface": `import React from 'react';export function ExpressiveSurface({children}){return React.createElement('View',{},children)}`,
  "./ExpressiveLoading": `export const ExpressiveLoading=()=>null`,
  "./ComparisonView": `export const ComparisonView=()=>null`,
  "./NavigationIcon": `export const NavigationIcon=()=>null`,
  "./api/config": `export const DEFAULT_API_ENDPOINT=''`,
  "@react-native-async-storage/async-storage": `const data=new Map();export default {getItem:async k=>data.get(k)??null,setItem:async(k,v)=>{data.set(k,v)}}`,
  "react-native-safe-area-context": `export const SafeAreaProvider='SafeAreaProvider',SafeAreaView='SafeAreaView'`,
  "react-native": `import React from 'react';export const NativeModules={},Platform={OS:'web'};export const useColorScheme=()=> 'light',useWindowDimensions=()=>({width:390,height:844});export const AccessibilityInfo={isReduceMotionEnabled:async()=>true,addEventListener:()=>({remove(){}})};export const AppState={addEventListener:()=>({remove(){}})},BackHandler=AppState;export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',ScrollView='ScrollView',StatusBar='StatusBar',ActivityIndicator='ActivityIndicator',Image='Image';export const StyleSheet={create:x=>x};export const Modal=({visible,children})=>visible?children:null;export const FlatList=({ListHeaderComponent})=>React.createElement('FlatList',{},ListHeaderComponent);export const Share={share:async()=>({})},Linking={openURL:async()=>({})}`,
};
await mkdir(".expo/host-feature-tests", { recursive: true });
await build({
  entryPoints: ["src/AdviserApp.tsx"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: ".expo/host-feature-tests/app.cjs",
  external: ["react"],
  plugins: [
    {
      name: "native-boundaries",
      setup(b) {
        b.onResolve({ filter: /.*/ }, (a) =>
          a.path in mocks ? { path: a.path, namespace: "mock" } : undefined,
        );
        b.onLoad({ filter: /.*/, namespace: "mock" }, (a) => ({
          contents: mocks[a.path],
          loader: "js",
          resolveDir: process.cwd(),
        }));
      },
    },
  ],
});
const App = createRequire(import.meta.url)(
  "../.expo/host-feature-tests/app.cjs",
).default;
let app;
await act(async () => {
  app = create(React.createElement(App));
});
const snapshot = () => JSON.stringify(app.toJSON());
assert.equal(
  app.root.findAllByType("DeviceAdvisorFeature").length,
  0,
  "host opens first",
);
const open = () =>
  app.root.findAll(
    (n) =>
      n.props.label === "Mở Device Advisor" && typeof n.type === "function",
  )[0];
assert.ok(open(), "host exposes the feature entry");
const query = app.root.findAllByType("TextInput")[0];
assert.ok(query);
await act(async () => query.props.onChangeText("route-persistence-check"));
await act(async () => open().props.onPress());
const feature = app.root.findByType("DeviceAdvisorFeature");
assert.equal(feature.props.asFeature, true);
assert.equal(
  app.root.findAllByProps({ accessibilityRole: "tab" }).length,
  5,
  "host navigation remains available",
);
await act(async () => feature.props.onExit());
assert.equal(app.root.findAllByType("DeviceAdvisorFeature").length, 0);
assert.ok(
  app.root
    .findAllByType("TextInput")
    .some((n) => n.props.value === "route-persistence-check"),
  "return retains host search state",
);
await act(async () => open().props.onPress());
await act(async () =>
  app.root
    .findByProps({ accessibilityRole: "tab", accessibilityLabel: "Đã lưu" })
    .props.onPress(),
);
assert.equal(
  app.root.findAllByType("DeviceAdvisorFeature").length,
  0,
  "host tabs leave the feature",
);
assert.ok(snapshot().includes("Đã lưu"));
await act(async () => app.unmount());
console.log(
  "PASS: M3 host opens first; full Device Advisor is an explicit feature; exit preserves host state and all five host tabs remain available.",
);
