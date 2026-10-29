import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Marked} from 'marked';
import {studyMenu} from '../navigation.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(here, name), 'utf8');
const source = fs.readFileSync(path.join(here, '../../企业Agent集成架构与MCP能力接入体系设计决策备忘录.md'), 'utf8');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const renderer = new Marked({renderer:{html: token => escape(token.text)}});
let heading = 0;
const original = renderer.parse(source).replace(/<h([1-6])>/g, (_, level) => '<h' + level + ' id="original-enterprise-' + (++heading) + '">');
const body = read('content.html').replace('<!-- STUDY_SWITCH -->', studyMenu('enterprise')).replace('<!-- ORIGINAL_ENTERPRISE -->', original);
const html = '<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="图解企业 Agent 集成架构与 MCP 能力接入体系：身份入口、DSH 通用执行、能力安全出口、三类企业能力与分阶段演进。"><title>企业 Agent 集成架构与 MCP 能力接入体系</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' rx=\'8\' fill=\'%23102744\'/%3E%3Cpath d=\'M8 8h16v7c0 6-8 10-8 10S8 21 8 15z\' fill=\'none\' stroke=\'%2380dfd1\' stroke-width=\'2\'/%3E%3C/svg%3E"><style>' + read('style.css') + '\n' + read('../navigation.css') + '</style></head><body>' + body + '<script>' + read('app.js') + '\n' + read('../navigation.js') + '</script></body></html>';
const output = path.join(here, '../dist/enterprise-agent.html');
fs.mkdirSync(path.dirname(output), {recursive:true});
fs.writeFileSync(output, html);
console.log('Generated ' + output + ' (' + Buffer.byteLength(html).toLocaleString() + ' bytes)');
