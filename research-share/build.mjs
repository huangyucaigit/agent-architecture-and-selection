import fs from 'node:fs';
import {studyMenu} from './navigation.mjs';
import {marked} from 'marked';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(here, name), 'utf8');
const originalName = 'Agent技术架构地图与行业智能体系统技术选型备忘录_V1_已完成部分冻结版.md';
const original = fs.readFileSync(path.join(here, '..', originalName), 'utf8');
const appendix = marked.parse(original).replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
const cases = fs.readFileSync(path.join(here, '..', '第四部分_三类问数产品选型实战_V1_冻结版.md'), 'utf8');
const caseAppendix = marked.parse(cases).replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
const body = read('content.html').replace('<!-- STUDY_SWITCH -->', studyMenu('agent')).replace('<!-- FOUNDATION_CONTENT -->', read('foundation.html')).replace('<!-- ECOLOGY_CONTENT -->', read('ecology.html')).replace('<!-- SELECTION_CONTENT -->', read('selection.html')).replace('<!-- PRACTICE_CONTENT -->', read('practice.html')).replace('<!-- ORIGINAL_RESEARCH -->', appendix).replace('<!-- CASE_RESEARCH -->', caseAppendix);
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="四部分理解行业智能体系统：图解架构与概念、技术生态与实现、需求判断与选型、三类问数产品实战。">
<meta name="color-scheme" content="light"><title>Agent 技术架构与行业智能体选型研究</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230d2549'/%3E%3Cpath d='M7 23L16 7l9 16M11 18h10' fill='none' stroke='%235be0d0' stroke-width='3'/%3E%3C/svg%3E">
<style>${read('style.css')}\n${read('foundation.css')}
${read('ecology.css')}
${read('selection.css')}
${read('practice.css')}
${read('navigation.css')}</style></head><body>${body}<script>${read('app.js')}\n${read('foundation.js')}
${read('ecology.js')}
${read('selection.js')}
${read('practice.js')}
${read('navigation.js')}</script></body></html>`;
fs.mkdirSync(path.join(here, 'dist'), {recursive:true});
fs.writeFileSync(path.join(here, 'dist/agent-research.html'), html);
console.log(`Generated research-share/dist/agent-research.html (${Buffer.byteLength(html).toLocaleString()} bytes)`);

await import('./meeting/build.mjs');
const legacyIds=[...body.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const redirect='(()=>{const ids=new Set('+JSON.stringify(legacyIds)+');function redirectLegacy(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(ids.has(id)){const target=new URL("agent-research.html",location.href);target.hash=location.hash;location.replace(target.href);}}redirectLegacy();addEventListener("hashchange",redirectLegacy);})();';
const portal=read('portal.html').replace('<!-- PORTAL_STYLE -->',read('portal.css')).replace('<!-- LEGACY_REDIRECT -->',redirect);
fs.writeFileSync(path.join(here,'dist/index.html'),portal);
console.log('Generated research-share/dist/index.html ('+Buffer.byteLength(portal).toLocaleString()+' bytes)');
