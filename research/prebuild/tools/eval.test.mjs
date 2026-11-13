import test from 'node:test';import assert from 'node:assert/strict';import {metric,compare,qualify,summary,integrity,unavailable,retrieve,queries} from './run_eval.mjs';import {EMPTY_NEEDS} from '../../../apps/adviser/src/picker.ts';
test('U09-01 exact recall and unknown denominator',()=>{assert.equal(metric(['A','B'],['A','C']).recall,.5);assert.equal(metric(null,['A']).denominator,0);assert.equal(metric(null,[]).unknown,1);});
test('U09-02 wrong sibling gets no credit',()=>assert.equal(metric(['v1'],['v2']).numerator,0));
test('U09-03 different policy or snapshot rejects comparison',()=>{assert.throws(()=>compare([{snapshotHash:'a',policyHash:'p'},{snapshotHash:'b',policyHash:'p'}]));});
test('U09-04 unavailable vector has no measurement',()=>{assert.deepEqual(unavailable('vector','missing'),{arm:'vector',status:'not_run',reason:'missing',latencyMs:null,metric:null});});
test('U09-05 deterministic development inputs and outputs',()=>{const needs={...EMPTY_NEEDS,tasks:['study'],primaryUseOrder:['study'],useOrderConfirmed:true};assert.deepEqual(queries(),queries());assert.deepEqual(retrieve(queries()[0],'lexical',needs),retrieve(queries()[0],'lexical',needs));});
test('U09-06 consumed holdout cannot be fresh qualification',()=>{assert.throws(()=>qualify(true,true));assert.equal(qualify(true,false),'diagnostic_reuse');});
test('U09-07 failures retained and empty denominator null',()=>{const s=summary([{result:'fail',metric:metric(null,[])}]);assert.equal(s.failures,1);assert.equal(s.rate,null);assert.equal(s.attempts,1);});
test('U09-08 hard violation is integrity failure regardless relevance',()=>{assert.deepEqual(integrity(['expensive'],['affordable']),['expensive']);});

test('U09-01 unknown query cannot lower known recall denominator',()=>assert.equal(summary([{result:'pass',metric:metric(['A','B'],['A'])},{result:'pass',metric:metric(null,[])}]).rate,.5));
