import {writeFileSync} from 'node:fs';
import {LIGHT,DARK,SHAPE} from '../src/design-tokens.ts';
const rules=(values)=>Object.entries(values).map(([k,v])=>`  --lua-${k}: ${v};`).join('\n');
writeFileSync(new URL('../src/design-tokens.css',import.meta.url),`/* Generated from design-tokens.ts; run npm run tokens. */\n:root {\n${rules(LIGHT)}\n${rules(Object.fromEntries(Object.entries(SHAPE).map(([k,v])=>[`shape-${k}`,`${v}px`])))}\n}\n[data-lua-theme="dark"] {\n${rules(DARK)}\n}\n`);
