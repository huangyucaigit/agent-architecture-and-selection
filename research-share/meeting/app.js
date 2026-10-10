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
  window.dispatchEvent(new Event('meeting-slide-change'));
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

function hashNavigation() { const target = slides.findIndex(slide => `#${slide.id}` === location.hash); go(target < 0 ? 0 : target, false); }
window.addEventListener('hashchange', hashNavigation);
let mounted = true;
document.querySelector('#plugin-toggle').addEventListener('click', event => {
  mounted = !mounted;
  event.currentTarget.textContent = mounted ? '卸载插件' : '挂载插件';
  event.currentTarget.setAttribute('aria-pressed', String(mounted));
  document.querySelectorAll('.resource').forEach(item => item.classList.toggle('off', !mounted));
  document.querySelector('#plugin-status').textContent = mounted ? '已挂载：示意资源共 3 项。' : '已卸载：工具注册、监听器与连接均已清理，剩余 0 项。';
});
let service = true;
document.querySelector('#service-toggle').addEventListener('click', event => {
  service = !service;
  event.currentTarget.textContent = service ? '移除服务' : '恢复服务';
  event.currentTarget.setAttribute('aria-pressed', String(service));
  const status = document.querySelector('#dependency-status');
  status.textContent = service ? '查询服务可用 → 分析插件启用' : '查询服务缺失 → 分析插件等待依赖';
  status.classList.toggle('wait', !service);
});
document.querySelectorAll('.sources-trigger').forEach(button => button.addEventListener('click', () => dialog.showModal()));
const components = {
  loop: ['执行循环','驱动“请求模型 → 调用工具 → 读取结果 → 继续判断”，直到本轮任务结束。','循环本身可通过组件配置替换；修改执行方式有明确的架构入口。'],
  model: ['模型适配','将具体模型服务接入统一的消息与流式响应接口。','模型服务与执行逻辑之间有适配边界；新模型的具体能力仍须核验。'],
  tools: ['工具注册','管理当前可用工具，并组织带有执行前后介入点的调用过程。','将业务能力作为工具接入；权限和业务规则需要通过具体策略与服务落实。'],
  session: ['会话日志','记录执行事实，并从日志构建模型所见的消息历史。','为上下文重建与过程追溯提供基础；业务审计与故障恢复仍需专项验证。']
};
document.querySelectorAll('[data-component]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-component]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const [title, description, meaning] = components[button.dataset.component];
  document.querySelector('#component-title').textContent = title;
  document.querySelector('#component-description').textContent = description;
  document.querySelector('#component-meaning').textContent = meaning;
}));
hashNavigation();
})();
