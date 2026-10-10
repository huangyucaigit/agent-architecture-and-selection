(() => {
'use strict';
const root=document.querySelector('#q1');
if(!root)return;
const axes=[...root.querySelectorAll('[data-axis]')];
function updateIdentity(){
  const values=Object.fromEntries(axes.map(axis=>[axis.dataset.axis,axis.querySelector('[aria-pressed=true]').dataset.value]));
  const title=document.querySelector('#identity-title');
  title.textContent=`${values.scope==='企业'?'企业级':'个人'}${values.domain==='通用'?'通用':values.domain}${values.task}${values.delivery==='平台'?'智能体平台':'智能体'}`;
  const tags=document.querySelector('#identity-tags');tags.replaceChildren();
  Object.values(values).forEach(value=>{const tag=document.createElement('span');tag.textContent=value;tags.append(tag);});
  document.querySelector('#identity-explanation').textContent=`${values.scope==='企业'?'企业说明组织身份、权限、流程与治理要求。':'个人说明围绕个人用户工作。'}${values.domain==='通用'?'通用说明不以某一行业专业化为前提。':values.domain+'说明需要相应术语、指标、规则与方法。'}${values.team==='多智能体'?'多个单元协作需要独立收益证据。':'单智能体也可以完成多工具任务。'}${values.delivery==='平台'?'平台进一步提供共享的构建、运行与治理能力。':''}`;
  root.querySelectorAll('[data-cell]').forEach(cell=>cell.classList.toggle('selected',cell.dataset.cell===`${values.scope}-${values.domain==='通用'?'通用':'行业'}`));
}
axes.forEach(axis=>axis.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{axis.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));updateIdentity();})));
updateIdentity();
const duties={
  model:{number:'①',title:'模型与推理',purpose:'模型（Model）与推理（Inference）负责语言理解、判断和生成。',example:'理解“库存为什么下降”，选择下一项获准查询，依据返回证据组织解释。',boundary:'模型给出判断与建议；可信数值计算、身份授权和强制规则由程序执行。'},
  control:{number:'②',title:'智能体构建与执行控制',purpose:'组织模型、工具、任务状态与执行过程。',example:'调查库存下降：判断还缺什么证据，再决定补查或结束。智能体循环、固定工作流和任务编排可以组合。',boundary:'决定任务怎么推进；运行环境管理组件和资源，业务服务执行授权与计算。'},
  knowledge:{number:'③',title:'知识、检索与记忆',purpose:'组织任务需要的信息，检索领域知识，并保留有价值的历史信息。',example:'读取库存口径与调拨规则；按需要使用用户的历史显示偏好。',boundary:'领域定义、跨任务历史与当前任务进度分别管理。检索是取用知识的一种办法。'},
  tools:{number:'④',title:'工具连接与能力复用',purpose:'让外部业务能力可发现、可调用，并把方法与能力包装为可复用单元。',example:'注册获准的库存查询工具，连接 Java 业务服务，供应库存调查方法。',boundary:'技能指导方法，工具执行动作，插件组织能力，协议规范连接；它们有不同职责。'},
  runtime:{number:'⑤',title:'运行环境与基础设施',purpose:'运行时（Runtime）管理组件生命周期和资源；沙箱（Sandbox）约束动作执行环境，托管服务负责部署运行。',example:'启动组件、隔离代码执行、为任务分配计算资源，维护部署服务的可用性。',boundary:'执行控制决定任务步骤，运行环境提供承载条件。组件卸载、任务恢复、业务回滚需分别定义。'},
  governance:{number:'⑥',title:'观测、评估与安全治理',purpose:'可观测性（Observability）追踪执行事实，评估检验任务效果，治理控制权限和策略。',example:'关联查询编号，追踪工具错误、耗时与成本；评估库存解释是否有完整证据。',boundary:'图中突出对执行的支撑，实际治理也覆盖模型、数据、工具和发布环节。业务授权由可信服务端执行。'},
  platform:{number:'⑦',title:'应用搭建与管理平台',purpose:'智能体平台（Agent Platform）提供创建、配置、发布和管理多个应用的工作台。',example:'供团队装配分析助手，管理应用版本、共享行业能力并查看运行情况。',boundary:'平台可以内置多类能力；平台化来自共享与治理需求，单个应用不必先建完整平台。'},
  product:{number:'⑧',title:'成品智能体应用',purpose:'智能体应用（Agent Application）直接帮助最终用户完成具体业务任务。',example:'用户打开问数页面或经营分析助手，提出目标，查看结果、来源和未决问题。',boundary:'应用是面向用户的交付物；可复用执行部分在②比较，不把产品界面等同于执行内核。'}
};
const stage=document.querySelector('.responsibility-stage'),svg=stage.querySelector('svg');
let selected='control',queued=false;
const ns='http://www.w3.org/2000/svg';
const element=(tag,attrs={},text)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,String(value)));if(text!==undefined)el.textContent=text;return el;};
const relations=[{from:'platform',to:'product',label:'交付应用',kind:'publish'},{from:'platform',to:'control',label:'构建 / 配置',kind:'build'},{from:'product',to:'control',label:'任务 / 结果',kind:'request',both:true},{from:'control',to:'model',label:'推理',kind:'model'},{from:'control',to:'knowledge',label:'检索 / 记忆',kind:'knowledge'},{from:'control',to:'tools',label:'调用',kind:'tools'},{from:'runtime',to:'control',label:'运行支撑',kind:'runtime'},{from:'governance',to:'control',label:'追踪 / 评估 / 约束',kind:'governance'}];
function selectDuty(id){
  selected=id;const duty=duties[id];
  stage.querySelectorAll('[data-duty]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.duty===id)));
  document.querySelector('#duty-detail .label').textContent=`当前职责 · ${duty.number}`;
  document.querySelector('#duty-title').textContent=duty.title;
  document.querySelector('#duty-purpose').textContent=duty.purpose;
  document.querySelector('#duty-example').textContent=duty.example;
  document.querySelector('#duty-boundary').textContent=duty.boundary;
  document.querySelector('#duty-announcement').textContent=`已选择${duty.title}，解释与关联连线已更新。`;
  scheduleDraw();
}
stage.querySelectorAll('[data-duty]').forEach(b=>b.addEventListener('click',()=>selectDuty(b.dataset.duty)));
function draw(){
  queued=false;if(stage.getBoundingClientRect().width===0)return;
  const outer=stage.getBoundingClientRect(),width=stage.clientWidth,height=stage.clientHeight,boxes={};
  stage.querySelectorAll('[data-duty]').forEach(el=>{const b=el.getBoundingClientRect();boxes[el.dataset.duty]={x:b.left-outer.left,y:b.top-outer.top,w:b.width,h:b.height,cx:b.left-outer.left+b.width/2,cy:b.top-outer.top+b.height/2};});
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.replaceChildren();
  const defs=element('defs');['active','quiet'].forEach(state=>{const marker=element('marker',{id:`duty-arrow-${state}`,viewBox:'0 0 8 8',refX:7,refY:4,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(element('path',{d:'M1 1L7 4L1 7',fill:'none',stroke:state==='active'?'var(--blue)':'#a7b9d2','stroke-width':1.2}));defs.append(marker);});svg.append(defs);
  const edges=element('g'),labels=element('g');svg.append(edges,labels);
  const mobile=getComputedStyle(stage).gridTemplateColumns.trim().split(/\s+/).length===1;
  relations.forEach(r=>{
    const a=boxes[r.from],b=boxes[r.to],active=r.from===selected||r.to===selected;
    let path,lx,ly,rotation=0;
    if(mobile){
      const adjacent=(r.from==='platform'&&r.to==='product')||(r.from==='product'&&r.to==='control')||(r.from==='control'&&r.to==='model');
      if(adjacent){path=`M${a.cx} ${a.y+a.h}V${b.y}`;lx=a.cx;ly=(a.y+a.h+b.y)/2;}
      else{const left=['build','knowledge','runtime'].includes(r.kind),rail=left?8+(r.kind==='knowledge'?8:0):width-8-(r.kind==='tools'?8:0),sy=a.cy+(r.kind==='knowledge'?10:0),ey=b.cy+(r.kind==='knowledge'?10:0);path=`M${left?a.x:a.x+a.w} ${sy}H${rail}V${ey}H${left?b.x:b.x+b.w}`;lx=rail;ly=(sy+ey)/2;rotation=-90;}
    }else if(r.kind==='publish'){path=`M${a.cx} ${a.y}V9H${b.cx}V${b.y}`;lx=(a.cx+b.cx)/2;ly=9;}
    else if(['build','request'].includes(r.kind)){const x=b.x+b.w*(r.kind==='build'?.2:.8),y=(a.y+a.h+b.y)/2;path=`M${a.cx} ${a.y+a.h}V${y}H${x}V${b.y}`;lx=(a.cx+x)/2;ly=y;}
    else if(['model','knowledge','tools'].includes(r.kind)){const x=a.x+a.w*({model:.15,knowledge:.5,tools:.85}[r.kind]),y=(a.y+a.h+b.y)/2;path=`M${x} ${a.y+a.h}V${y}H${b.cx}V${b.y}`;lx=(x+b.cx)/2;ly=y;}
    else{const left=r.kind==='runtime',rail=left?8:width-8;path=`M${left?a.x:a.x+a.w} ${a.cy}H${rail}V${b.cy}H${left?b.x:b.x+b.w}`;lx=rail;ly=(a.cy+b.cy)/2;rotation=-90;}
    const marker=`url(#duty-arrow-${active?'active':'quiet'})`,edge=element('path',{d:path,fill:'none',stroke:active?'var(--blue)':'#a7b9d2','stroke-width':active?1.7:1.1,'marker-end':marker});if(r.both)edge.setAttribute('marker-start',marker);edges.append(edge);
    if(!mobile||active||['publish','request','model'].includes(r.kind)){const g=element('g',{transform:`translate(${lx} ${ly}) rotate(${rotation})`}),label=element('text',{'text-anchor':'middle','dominant-baseline':'central',fill:'var(--ink)'},r.label);g.append(label);labels.append(g);const box=label.getBBox();g.insertBefore(element('rect',{x:box.x-3,y:box.y-1,width:box.width+6,height:box.height+2,fill:'#fff'}),label);}
  });
}
function scheduleDraw(){if(queued)return;queued=true;requestAnimationFrame(draw);}
new ResizeObserver(scheduleDraw).observe(stage);
window.addEventListener('research-view-change',scheduleDraw);
window.addEventListener('beforeprint',draw);
window.addEventListener('afterprint',scheduleDraw);
if(document.fonts?.ready)document.fonts.ready.then(scheduleDraw);
selectDuty('control');
const steps=[
  ['judge','判断','先确认时点、统计范围与库存口径。'],
  ['tool','行动','调用获准工具，取得期初、期末与变动明细。'],
  ['observe','观察','结果表明出库贡献较大，但还缺明细证据。'],
  ['judge','再次判断','根据中间结果，决定继续补查主要库点与出库明细。'],
  ['tool','补查与校验','工具返回证据，业务程序核对变动与未解释差额。'],
  ['finish','交付','形成带来源的解释；证据不足或达到预算时，交付未决问题。']
];
let step=0;
function renderStep(){
  document.querySelectorAll('[data-loop-node]').forEach(node=>node.classList.toggle('loop-active',node.dataset.loopNode===steps[step][0]));
  const text=document.querySelector('#loop-step-text');text.replaceChildren();const strong=document.createElement('strong');strong.textContent=`${step+1} / ${steps.length} · ${steps[step][1]}`;text.append(strong,document.createTextNode(steps[step][2]));document.querySelector('#loop-next').disabled=step===steps.length-1;
}
document.querySelector('#loop-next').addEventListener('click',()=>{step=Math.min(step+1,steps.length-1);renderStep();});
document.querySelector('#loop-reset').addEventListener('click',()=>{step=0;renderStep();});
renderStep();
})();
