(() => {
'use strict';
const slides = [...document.querySelectorAll('.slide')];
const chapterButtons = [...document.querySelectorAll('.chapters button')];
const chapterPages = document.querySelector('#chapter-pages');
const chapterProgress = document.querySelector('#chapter-progress');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const chapters = chapterButtons.map(button => {
  const pages = slides.map((slide, i) => ({slide, i})).filter(page => page.slide.dataset.chapter === button.dataset.chapter);
  const name = button.querySelector('.chapter-name').textContent.replace(/^\d+\s+/, '');
  button.querySelector('.chapter-count').textContent = '共 ' + pages.length + ' 页';
  button.setAttribute('aria-label', button.querySelector('.chapter-name').textContent + '，共 ' + pages.length + ' 页');
  return {id:button.dataset.chapter, name, pages, button};
});
const pageButtons = slides.map((slide, i) => {
  const chapter = chapters.find(item => item.id === slide.dataset.chapter);
  const pageNumber = chapter.pages.findIndex(page => page.i === i)+1;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chapter-page';
  button.textContent = pageNumber + '  ' + slide.dataset.title;
  button.setAttribute('aria-label', chapter.name + '，第 ' + pageNumber + ' 页：' + slide.dataset.title);
  button.addEventListener('click', () => go(i));
  chapterPages.append(button);
  return button;
});
let index = 0;
let reading = false;
const wheelGesture = {lastTime:-Infinity, direction:0, distance:0, scrolled:false, paged:false, lockedUntil:0};
function blockWheelNavigation() {
  wheelGesture.distance = 0;
  wheelGesture.scrolled = true;
  wheelGesture.paged = true;
  wheelGesture.lockedUntil = performance.now() + 700;
}

function go(target, updateHash = true) {
  if (target < 0) return;
  blockWheelNavigation();
  index = Math.max(0, Math.min(slides.length-1, target));
  const current = slides[index];
  const chapter = chapters.find(item => item.id === current.dataset.chapter);
  const chapterIndex = chapter.pages.findIndex(page => page.i === index);
  const focused = document.activeElement;
  const focusInHiddenContent = !reading && slides.some(slide => slide !== current && slide.contains(focused));
  const focusInPages = chapterPages.contains(focused);
  slides.forEach((slide, i) => { slide.hidden = !reading && i !== index; });
  chapters.forEach(item => item.button.setAttribute('aria-current', String(item === chapter)));
  pageButtons.forEach((button, i) => {
    button.hidden = slides[i].dataset.chapter !== chapter.id;
    button.setAttribute('aria-current', i === index ? 'page' : 'false');
  });
  chapterPages.style.setProperty('--chapter-pages', chapter.pages.length);
  chapterPages.setAttribute('aria-label', chapter.name + '的页面');
  chapterProgress.textContent = chapter.name + ' · 第 ' + (chapterIndex+1) + ' / ' + chapter.pages.length + ' 页';
  document.querySelector('#counter').textContent = '全篇 ' + String(index+1).padStart(2,'0') + ' / ' + String(slides.length).padStart(2,'0');
  document.querySelector('#foot-label').textContent = current.dataset.title;
  previous.disabled = index === 0;
  previous.setAttribute('aria-label', index > 0 ? '上一页：' + slides[index-1].dataset.title : '已经是第一页');
  next.disabled = index === slides.length-1;
  const following = slides[index+1];
  const nextKind = following ? (following.dataset.chapter === chapter.id ? '本章下一页' : '下一章') : '全篇结束';
  const nextTitle = following ? following.dataset.title : '已到最后一页';
  document.querySelector('#next-kind').textContent = nextKind;
  document.querySelector('#next-title').textContent = nextTitle;
  next.setAttribute('aria-label', nextKind + '：' + nextTitle);
  if (updateHash && location.hash !== '#' + current.id) history.replaceState(null, '', '#' + current.id);
  if (focusInHiddenContent || focusInPages) pageButtons[index].focus({preventScroll:true});
  if (reading) current.scrollIntoView({behavior:'instant', block:'start'});
  else window.scrollTo({top:0, behavior:'instant'});
  window.dispatchEvent(new Event('enterprise-slide-change'));
}
previous.addEventListener('click', () => go(index-1));
next.addEventListener('click', () => go(index+1));
chapters.forEach(chapter => chapter.button.addEventListener('click', () => go(chapter.pages[0].i)));
chapterPages.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
  const chapter = chapters.find(item => item.id === slides[index].dataset.chapter);
  const focusedIndex = pageButtons.findIndex(button => button.contains(event.target));
  const local = chapter.pages.findIndex(page => page.i === (focusedIndex < 0 ? index : focusedIndex));
  const target = event.key === 'Home' ? 0 : event.key === 'End' ? chapter.pages.length-1 : Math.max(0, Math.min(chapter.pages.length-1, local + (event.key === 'ArrowRight' ? 1 : -1)));
  event.preventDefault();
  event.stopPropagation();
  go(chapter.pages[target].i);
});

document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => go(slides.findIndex(slide => slide.id === button.dataset.go))));
document.querySelector('#reading').addEventListener('click', event => {
  reading = !reading;
  document.body.classList.toggle('reading', reading);
  event.currentTarget.setAttribute('aria-pressed', String(reading));
  event.currentTarget.textContent = reading ? '逐页模式' : '阅读模式';
  go(index);
});
const dialog = document.querySelector('#sources');
document.querySelector('#sources-open').addEventListener('click', () => dialog.showModal());
document.querySelector('#sources-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
document.addEventListener('keydown', event => {
  if (reading || document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable || event.target.closest('.study-switch, [role="tablist"]')) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); go(index+1); }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(index-1); }
  if (event.key === 'Home') { event.preventDefault(); go(0); }
  if (event.key === 'End') { event.preventDefault(); go(slides.length-1); }
});
// Preserve scrolling inside long pages; only a fresh gesture at an edge changes pages.
function canScrollVertically(target, direction) {
  const root = document.scrollingElement || document.documentElement;
  for (let element = target; element && element !== root && element !== document.body; element = element.parentElement) {
    const overflow = getComputedStyle(element).overflowY;
    if (/(auto|scroll|overlay)/.test(overflow) && element.scrollHeight > element.clientHeight + 2) {
      if (direction > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 2 : element.scrollTop > 2) return true;
    }
  }
  return direction > 0 ? root.scrollTop + root.clientHeight < root.scrollHeight - 2 : root.scrollTop > 2;
}
document.addEventListener('wheel', event => {
  const now = performance.now();
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  if (reading || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ||
      !target || target.closest('input, textarea, select, [contenteditable], .study-switch, dialog, iframe') ||
      document.querySelector('dialog[open], .study-switch[open]') || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) {
    wheelGesture.distance = 0;
    wheelGesture.scrolled = true;
    wheelGesture.lastTime = now;
    return;
  }
  const direction = Math.sign(event.deltaY);
  const freshGesture = now - wheelGesture.lastTime > 220;
  if (freshGesture) {
    wheelGesture.distance = 0;
    wheelGesture.scrolled = false;
    wheelGesture.paged = false;
  } else if (direction !== wheelGesture.direction) {
    wheelGesture.distance = 0;
  }
  wheelGesture.direction = direction;
  wheelGesture.lastTime = now;
  if (wheelGesture.paged || now < wheelGesture.lockedUntil) {
    wheelGesture.paged = true;
    wheelGesture.distance = 0;
    if (event.cancelable) event.preventDefault();
    return;
  }
  if (canScrollVertically(target, direction)) {
    wheelGesture.distance = 0;
    wheelGesture.scrolled = true;
    return;
  }
  // Do not turn the tail of a content scroll into an accidental page change.
  if (wheelGesture.scrolled || !event.cancelable) return;
  const destination = index + direction;
  if (destination < 0 || destination >= slides.length) {
    wheelGesture.distance = 0;
    return;
  }
  event.preventDefault();
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  wheelGesture.distance += Math.abs(event.deltaY) * unit;
  if (wheelGesture.distance >= 80) go(destination);
}, {passive:false});
document.addEventListener('toggle', event => {
  if (event.target.matches('.study-switch, dialog')) blockWheelNavigation();
}, true);

function hashNavigation() { if (location.hash === '#main' && pageButtons.some(button => button.getAttribute('aria-current') === 'page')) return; const target = slides.findIndex(slide => `#${slide.id}` === location.hash); go(target < 0 ? 0 : target, false); }
window.addEventListener('hashchange', hashNavigation);

document.querySelectorAll('.sources-trigger').forEach(button => button.addEventListener('click', () => dialog.showModal()));
document.querySelector('#print-page').addEventListener('click', () => window.print());

const architecture = {
 ai: ['身份入口','AI Gateway','确认企业用户是谁，将既有身份转换为智能体可使用的身份上下文，并限定可使用的能力。','复用企业身份和权限来源；不另建一套与业务系统脱节的用户权限。','原文 §3.1'],
 dsh: ['通用执行','DSH Runtime','运行时（Runtime）组织任务推进、插件加载、技能使用、工具调用与会话管理。','不承接企业业务授权；受控工具、凭据与网络边界仍需配置。','原文 §3.2；运行边界为整理补充'],
 mcp: ['能力安全出口','MCP Gateway','校验可信身份上下文，检查本次工具调用的权限，并承接审计、限流和安全策略。','网关检查共性调用策略；最终数据范围、脱敏和业务规则需由对应服务落实。','原文 §3.3、§4；检查落点待确认'],
 knowledge: ['企业知识能力','知识库 MCP','连接现有知识库、文档与向量数据库，提供制度检索和企业知识问答。','通常不直接连接业务数据库；知识访问范围沿用现有系统规则。','原文 §4.1；知识访问策略为整理补充'],
 data: ['企业数据分析能力','问数 MCP','连接数据库、数仓或分析服务，承接自然语言查询、统计、分析与报表。','数据权限、组织范围和脱敏规则继续生效。','原文 §4.2'],
 business: ['企业业务操作能力','业务 MCP','连接业务系统接口与服务，可查询状态、提交业务操作或发起审批。','继续执行操作权限、审批权限和业务规则；不能只按读写区分三类能力。','原文 §4.3']
};
document.querySelectorAll('[data-architecture]').forEach(button => button.addEventListener('click', () => {
 document.querySelectorAll('[data-architecture]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
 const value = architecture[button.dataset.architecture];
 ['architecture-label','architecture-detail-title','architecture-detail-description','architecture-detail-boundary','architecture-detail-source'].forEach((id,i) => document.getElementById(id).textContent = (i === 4 ? '依据：' : '') + value[i]);
}));

function tabGroup(selector, render, initial) {
 const buttons = [...document.querySelectorAll(selector)];
 function choose(button, focus = false) {
  buttons.forEach(item => {
   item.setAttribute('aria-selected', String(item === button));
   item.tabIndex = item === button ? 0 : -1;
  });
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  panel.setAttribute('aria-labelledby', button.id);
  render(button.dataset.identity || button.dataset.capability || button.dataset.phase);
  if (focus) button.focus({preventScroll:true});
 }
 buttons.forEach((button,i) => {
  button.addEventListener('click', () => choose(button));
  button.addEventListener('keydown', event => {
   if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) return;
   event.preventDefault();
   event.stopPropagation();
   const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
   choose(buttons[target], true);
  });
 });
 choose(buttons.find(button => button.dataset.identity === initial || button.dataset.capability === initial || button.dataset.phase === initial) || buttons[0]);
}
const identityCases = {
 valid: {
  label:'原文身份映射示例 · 用户 10086',
  context:{user_id:'10086',roles:['administrator'],permissions:['knowledge.use','data.query']},
  states:['已认证','可信映射','发起调用','调用获准','业务校验','返回结果'],stop:-1,
  title:'通过网关，再执行业务校验',description:'当前身份具备数据查询能力；业务服务仍按用户的数据范围与规则执行查询。'
 },
 denied: {
  label:'示意变化 · 当前身份没有 data.query',
  context:{user_id:'10086',roles:['administrator'],permissions:['knowledge.use']},
  states:['已认证','已映射','请求查询','权限不足','未执行','不返回数据'],stop:3,
  title:'在能力出口拦截本次查询',description:'身份已确认，但缺少数据查询工具权限。网关不发起下游业务调用；角色名称不能替代本次授权检查。'
 },
 untrusted: {
  label:'示意变化 · 调用只传用户 ID',
  context:{user_id:'10086'},
  states:['已认证','已映射','调用凭据缺失','身份来源无法验证','未执行','不返回数据'],stop:3,
  title:'用户字段不足以证明身份',description:'用户已通过企业认证并完成身份映射，但调用适配仅发送 user_id，未绑定可验证凭据。MCP 网关拒绝本次调用；入口认证不能代替出口校验。'
 }
};
tabGroup('[data-identity]', key => {
 const value = identityCases[key];
 document.getElementById('identity-context-label').textContent = value.label;
 document.getElementById('identity-context').textContent = JSON.stringify(value.context,null,2);
 document.querySelectorAll('[data-identity-step]').forEach((row,i) => {
  row.classList.toggle('blocked', i === value.stop);
  row.classList.toggle('unreached', value.stop >= 0 && i > value.stop);
  row.querySelector('em').textContent = value.states[i];
 });
 document.querySelector('.identity-result').classList.toggle('error', value.stop >= 0);
 document.getElementById('identity-result-title').textContent = value.title;
 document.getElementById('identity-result-description').textContent = value.description;
}, 'valid');

const capabilities = {
 knowledge: {question:'“安全生产管理制度是什么？”',service:'知识库 MCP',system:'知识库系统 · 文档库 · 向量数据库',output:'检索相关文档，返回可引用的知识内容。',title:'知识访问范围',rules:['用户可访问的知识与文档范围','既有知识库的访问策略'],boundary:'通常不直接连接业务数据库；具体接法依据已有知识系统。'},
 data: {question:'“本月库存是多少，变化原因是什么？”',service:'问数 MCP',system:'数据分析服务 · 业务数据库 · 数据仓库',output:'按已定义的指标与口径查询、统计和分析，返回业务结果。',title:'数据权限与脱敏规则',rules:['继承用户的数据权限','限定组织与数据范围','按既有规则执行脱敏'],boundary:'查询和分析仍需遵守业务口径、数据范围与权限，网关不替代分析服务的最终检查。'},
 business: {question:'“查看当前审批状态，并发起业务审批。”',service:'业务 MCP',system:'业务系统接口 · 业务服务 · 既有业务数据',output:'查询业务状态、提交获准操作或发起流程审批。',title:'操作、审批与业务规则',rules:['检查具体操作权限','遵循既有审批权限','执行业务规则与状态校验'],boundary:'业务 MCP 可读也可写。写操作、确认、失败重试和重复操作的控制方式仍需明确。'}
};
tabGroup('[data-capability]', key => {
 const value = capabilities[key];
 [['capability-question','question'],['capability-service','service'],['capability-system','system'],['capability-output','output'],['capability-rules-title','title'],['capability-boundary','boundary']].forEach(([id,field]) => document.getElementById(id).textContent = value[field]);
 document.getElementById('capability-rules').replaceChildren(...value.rules.map(text => {const li = document.createElement('li');li.textContent = text;return li;}));
}, 'knowledge');

const phases = {
 connect: {label:'第一阶段 · 目标：验证企业能力可被调用',route:['AI Gateway','DSH Runtime','知识库／问数 MCP'],focusTitle:'重点验证接入链路',focus:'身份接入、插件加载、知识库调用和问数调用。',boundary:'第一阶段尚未增加 MCP Gateway；身份校验、工具授权和调用审计仍要有承载位置，具体分工待确认。'},
 govern: {label:'第二阶段 · 目标：形成统一的企业能力出口',route:['AI Gateway','DSH Runtime','MCP Gateway','多个 MCP 服务'],focusTitle:'增加企业化治理',focus:'将工具权限、调用审计和安全策略集中到 MCP 网关，业务规则仍由对应系统承接。',boundary:'需要明确目标资源凭据、网关到下游的可信认证，以及网关策略与最终业务授权的分工。'},
 platform: {label:'第三阶段 · 目标：支持多行业、多企业系统',route:['企业用户与 AI 网关','通用执行运行时','MCP Gateway','行业能力生态'],focusTitle:'面向行业能力复用',focus:'保持执行底座通用，扩展知识库、问数与业务能力，接入不同企业系统和行业场景。',boundary:'行业能力范围、企业边界、接入契约及平台化进入条件仍需明确；不表示已经形成完整平台。'}
};
tabGroup('[data-phase]', key => {
 const value = phases[key],route = document.getElementById('phase-route'),items = [];
 value.route.forEach((text,i) => {
  if(i){const arrow = document.createElement('i');arrow.textContent = '→';arrow.setAttribute('aria-hidden','true');items.push(arrow);}
  const node = document.createElement('span');node.textContent = text;if(text === 'MCP Gateway')node.className = 'new-layer';items.push(node);
 });
 route.replaceChildren(...items);
 [['phase-label','label'],['phase-focus-title','focusTitle'],['phase-focus','focus'],['phase-boundary','boundary']].forEach(([id,field]) => document.getElementById(id).textContent = value[field]);
}, 'connect');

const header = document.querySelector('.topbar'),subnav = document.querySelector('.chapter-navigation');
if(typeof ResizeObserver !== 'undefined')new ResizeObserver(() => {
 document.documentElement.style.setProperty('--header-space',header.offsetHeight+'px');
 document.documentElement.style.setProperty('--subnav-space',subnav.offsetHeight+'px');
}).observe(header);
if(typeof ResizeObserver !== 'undefined')new ResizeObserver(() => {
 document.documentElement.style.setProperty('--subnav-space',subnav.offsetHeight+'px');
}).observe(subnav);
hashNavigation();
window.addEventListener('load', () => requestAnimationFrame(() => {
 if(!reading)window.scrollTo({top:0,behavior:'instant'});
}), {once:true});
})();
