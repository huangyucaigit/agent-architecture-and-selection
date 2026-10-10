import fs from 'node:fs';
import {studyMenu} from '../navigation.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(here, name), 'utf8');
const content = read('content.html').replace('<!-- STUDY_SWITCH -->',studyMenu('dsh')).replace('<!-- TAXONOMY_SLIDES -->', read('taxonomy.html'));
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="从设计论文到架构能力，以生态分类图定位项目，再比较构建与执行路线、DSH、OpenCode 和 Pi。"><meta name="color-scheme" content="light"><title>DeepSeek Harness 设计理念与架构解析</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%232a4ff2'/%3E%3Cpath d='M9 10h6v6H9zm8 0h6v6h-6zm-8 8h6v6H9zm8 0h6v6h-6z' fill='white'/%3E%3C/svg%3E"><style>${read('style.css')}\n${read('taxonomy.css')}
${read('../navigation.css')}</style></head><body>${content}<script>${read('app.js')}\n${read('taxonomy.js')}
${read('../navigation.js')}</script></body></html>`;
const output = path.join(here, '../dist/dsh-meeting.html');
fs.mkdirSync(path.dirname(output), {recursive:true});
fs.writeFileSync(output, html);
console.log(`Generated ${output} (${Buffer.byteLength(html)} bytes)`);
