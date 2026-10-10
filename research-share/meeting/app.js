(() => {
'use strict';
const slides = [...document.querySelectorAll('.slide')];
const dots = document.querySelector('.dots');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
let index = 0;
let reading = false;
slides.forEach((slide, i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `第 ${i+1} 页：${slide.dataset.title}`);
  button.addEventListener('click', () => go(i));
  dots.append(button);
});
function go(target, updateHash = true) {
  index = Math.max(0, Math.min(slides.length-1, target));
  slides.forEach((slide, i) => { slide.hidden = !reading && i !== index; });
  [...dots.children].forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
  document.querySelectorAll('[data-chapter]').forEach(button => {
    if (button.tagName === 'BUTTON') button.setAttribute('aria-current', String(button.dataset.chapter === slides[index].dataset.chapter));
  });
  document.querySelector('#counter').textContent = `${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  document.querySelector('#foot-label').textContent = `${slides[index].dataset.title} · ← → 翻页`;
  previous.disabled = index === 0;
  next.disabled = index === slides.length-1;
  if (updateHash && location.hash !== `#${slides[index].id}`) history.replaceState(null, '', `#${slides[index].id}`);
  if (reading) slides[index].scrollIntoView({behavior:'instant', block:'start'});
  else window.scrollTo({top:0, behavior:'instant'});
  window.dispatchEvent(new Event('meeting-slide-change'));
}
previous.addEventListener('click', () => go(index-1));
next.addEventListener('click', () => go(index+1));
document.querySelectorAll('.chapters button').forEach(button => button.addEventListener('click', () => go(slides.findIndex(slide => slide.dataset.chapter === button.dataset.chapter))));
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
  if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.closest('.study-switch')) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); go(index+1); }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(index-1); }
  if (event.key === 'Home') { event.preventDefault(); go(0); }
  if (event.key === 'End') { event.preventDefault(); go(slides.length-1); }
});
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
