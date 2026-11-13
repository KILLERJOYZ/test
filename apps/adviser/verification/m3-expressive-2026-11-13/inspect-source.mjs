// Reproduce source-based evidence; this does not certify native rendering.
// Run: node apps/adviser/verification/m3-expressive-2026-11-13/inspect-source.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(output, '../../../..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const source = read('apps/adviser/src/AdviserApp.tsx');
const matches = [...source.matchAll(/bg: "(#[a-f0-9]+)",[\s\S]*?card: "(#[a-f0-9]+)",[\s\S]*?text: "(#[a-f0-9]+)",[\s\S]*?muted: "(#[a-f0-9]+)",[\s\S]*?accent: "(#[a-f0-9]+)",[\s\S]*?onAccent: "(#[a-f0-9]+)",[\s\S]*?line: "(#[a-f0-9]+)"/g)];
if(matches.length !== 2) throw Error('Palette structure changed: review extraction');
const lum = hex => {
  const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
  return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;
};
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+0.05)/(Math.min(lum(a),lum(b))+0.05);
const focus=read('apps/adviser/src/web.css').match(/outline: 2px solid (#[a-fA-F0-9]+)/)[1];
const palettes = matches.map((m,i)=>({theme:i===0?'dark':'light',...Object.fromEntries(['bg','card','text','muted','accent','onAccent','line'].map((k,j)=>[k,m[j+1]])),focus}));
const pairs=[['text','bg',4.5],['text','card',4.5],['muted','bg',4.5],['muted','card',4.5],['onAccent','accent',4.5],['line','card',3],['line','bg',3],['card','bg',3],['focus','card',3],['focus','bg',3]];
const report={date:'2026-11-13',method:'WCAG sRGB relative luminance; unrounded values determine thresholds. Opaque default colors only; inactive controls exempt. Non-text ratios require contextual review of which visual cues identify a control.',palettes,measurements:palettes.flatMap(p=>pairs.map(([fg,bg,threshold])=>({theme:p.theme,foreground:fg,background:bg,foregroundHex:p[fg],backgroundHex:p[bg],ratio:ratio(p[fg],p[bg]),threshold,meetsThreshold:ratio(p[fg],p[bg])>=threshold}))),activeSource:{importsSharedTokens:/from ["']\.\/design-tokens/.test(source),containsReducedMotionHandling:/reduceMotion|isReduceMotionEnabled/.test(source),containsWindowSizeHandling:/useWindowDimensions|Dimensions\.get/.test(source),containsSpringAnimation:/Animated\.spring|withSpring/.test(source),unconditionalModalSlide:source.includes('animationType="slide"')}};
fs.writeFileSync(path.join(output,'source-measurements.json'),JSON.stringify(report,null,2)+'\n');
const files=['apps/adviser/index.js','apps/adviser/src/main.web.tsx','apps/adviser/src/AdviserApp.tsx','apps/adviser/src/catalog.ts','apps/adviser/src/real-catalog.json','apps/adviser/src/web.css','apps/adviser/src/design-tokens.ts',...['uxui-evaluator','interface-auditor','ai-interface-reviewer','flow-checker','vibe-coding-advisor'].map(s=>`.agents/skills/${s}/SKILL.md`)];
fs.writeFileSync(path.join(output,'source-hashes.json'),JSON.stringify({date:'2026-11-13',algorithm:'sha256',files:files.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}))},null,2)+'\n');
console.log(JSON.stringify({activeSource:report.activeSource,ratios:report.measurements.map(x=>`${x.theme} ${x.foreground}/${x.background}: ${x.ratio.toFixed(2)} (${x.meetsThreshold?'pass':'below threshold'})`)},null,2));
