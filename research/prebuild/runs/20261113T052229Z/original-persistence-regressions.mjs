// Historical desired-behavior regressions against the immutable pre-fix Git blob.
import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createRequire} from 'node:module';import {resolve} from 'node:path';
const ts=createRequire(resolve('apps/adviser/package.json'))('typescript');
const source=execFileSync('git',['show','d2f26ee62e50d661e30bc2aa271ae061f9e4e823:apps/adviser/src/AndroidApp.tsx'],{encoding:'utf8'});
const ast=ts.createSourceFile('AndroidApp.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function find(predicate){let found=[];function visit(n){if(predicate(n))found.push(n);ts.forEachChild(n,visit);}visit(ast);assert.equal(found.length,1);return found[0];}
function bind(node,deps){const js=ts.transpileModule('const handler='+node.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;return new Function(...Object.keys(deps),js+';return handler')(...Object.values(deps));}
const node=find(n=>ts.isVariableDeclaration(n)&&n.name.getText(ast)==='persist').initializer;
const base={dark:false,saved:[]};
function persist(storage){return bind(node,{rawRecovery:'',notify(){},saving:{current:Promise.resolve()},fault:'none',AsyncStorage:storage,KEY:'test',setStore(){},setStorageError(){}});}
test('U06-09 desired behavior fails on original stale snapshots',async()=>{let disk;const p=persist({async setItem(k,raw){disk=JSON.parse(raw);}});await Promise.all([p({...base,dark:true}),p({...base,saved:[{id:'old'}]})]);assert.equal(disk.dark,true);});
test('U06-10 desired write barrier fails on original failed-read state',async()=>{const p=persist({async setItem(){}});assert.equal(await p({...base,dark:true}),false);});
test('U06-11 desired deletion ordering fails on original handlers',async()=>{let release,started;const gate=new Promise(r=>release=r),begun=new Promise(r=>started=r);let disk,writes=0;const storage={async setItem(k,raw){disk=JSON.parse(raw);if(++writes===1){started();await gate;}},async multiRemove(){disk=null;}};const p=persist(storage);const a=p({...base,dark:true}),b=p({...base,saved:[{id:'old'}]});await begun;const no=()=>{};const del=find(n=>ts.isArrowFunction(n)&&n.getText(ast).includes('await AsyncStorage.multiRemove'));await bind(del,{AsyncStorage:storage,KEY:'test',INITIAL_STORE:base,setStore:no,setRawRecovery:no,setStorageError:no,setSelected:no,setHistory:no,revision:{current:0},requestId:{current:0},notify:no})();release();await Promise.all([a,b]);assert.equal(disk,null);});
