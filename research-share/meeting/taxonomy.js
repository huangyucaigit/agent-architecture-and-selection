(() => {
'use strict';
const item = (name, role, source, url, origin = '研究补充') => ({name, role, source, url, origin});
const groups = [
  {id:'integration', title:'模型接入与应用集成', icon:'i-model', question:'在已有业务中接入模型', choice:'业务代码继续掌握执行流程。', projects:[item('LangChain4j','Java 模型接入、结构化输出与函数工具','原文 Q10','https://docs.langchain4j.dev/tutorials/ai-services/','原始研究')]},
  {id:'development', title:'通用智能体开发', icon:'i-tool', question:'用开发抽象组织智能体', choice:'按业务需要定义智能体、工具与协作。', projects:[item('LangChain','模型、工具与可配置执行抽象','研究补充','https://docs.langchain.com/oss/python/langchain/overview'),item('Google ADK','智能体开发工具包；工具、协作与工作流','原文 Q5 / Q7 / Q10','https://adk.dev/','原始研究'),item('OpenAI Agents SDK','智能体开发工具包；循环、会话与任务移交','原文 Q5 / Q7 / Q10','https://developers.openai.com/api/docs/guides/agents/sdk','原始研究'),item('Microsoft Agent Framework','智能体开发框架；此处比较基础智能体抽象','原文 Q5 / Q7','https://learn.microsoft.com/agent-framework/','原始研究')]},
  {id:'workflow', title:'状态与流程编排', icon:'i-nodes', question:'显式控制步骤、状态与恢复', choice:'当复杂度集中在流程与状态时优先比较。', projects:[item('LangGraph','状态图、持久执行与人工介入','原文 Q7 / Q10','https://docs.langchain.com/oss/python/langgraph/overview','原始研究'),item('Microsoft Agent Framework · Workflow','框架内的工作流组件','原文 Q7','https://learn.microsoft.com/agent-framework/overview','原始研究')]},
  {id:'harness-library', title:'预置执行支架', icon:'i-loop', question:'复用已组合好的任务执行能力', choice:'在现成执行机制上配置与扩展。', projects:[item('Deep Agents','执行库；预置上下文、文件与委派能力','研究补充','https://docs.langchain.com/oss/python/deepagents/overview'),item('Microsoft Agent Harness','Agent Framework 内的预置执行支架组件','原文 Q7','https://learn.microsoft.com/agent-framework/agents/harness','原始研究')]},
  {id:'host', title:'可扩展执行宿主', icon:'i-layers', question:'复用执行系统，继续做行业定制', choice:'下一页比较组件组合、默认能力与改造成本。', projects:[item('DSH','执行系统；统一组件组合','原文 Q7 / Q10 / 第四部分','https://github.com/deepseek-ai/deepseek-harness','原始研究'),item('Pi · 执行与嵌入','比较可复用执行部分，非成品界面','研究补充','https://github.com/earendil-works/pi'),item('OpenCode · 执行与嵌入','此处比较 V2 执行与嵌入式接口','研究补充','https://opencode.ai/v2/docs/build/sdk')]}
];
const categories = [
  {id:'model',number:'01',title:'模型与推理',subtypes:['模型与模型服务','推理引擎'],purpose:'提供语言理解、推理和生成能力。',boundary:'比较模型或推理服务本身；应用如何组织任务由②负责。',projects:[item('vLLM','推理引擎','生态示例','https://docs.vllm.ai/en/latest/','生态示例'),item('Ollama','模型运行与服务','生态示例','https://docs.ollama.com/','生态示例')]},
  {id:'control',number:'02',title:'智能体构建与执行控制',subtypes:['模型接入','通用开发','状态编排','预置支架','执行宿主'],purpose:'定义任务，并组织模型、工具、状态和执行过程。',boundary:'开发框架与执行系统在此比较任务控制方式；运行环境在⑤比较。',projects:groups.flatMap(group=>group.projects),preview:groups.find(group=>group.id==='host').projects},
  {id:'knowledge',number:'03',title:'知识、检索与记忆',subtypes:['索引与检索','长期记忆'],purpose:'组织、检索和保留任务需要的信息。',boundary:'此处比较信息管理能力；工具接口只负责让它可被调用。',projects:[item('LlamaIndex · 检索组件','比较索引与检索部分','生态示例','https://developers.llamaindex.ai/python/framework/','生态示例'),item('Mem0','长期记忆','生态示例','https://docs.mem0.ai/features/contextual-add','生态示例')]},
  {id:'tools',number:'04',title:'工具连接与能力复用',subtypes:['工具与连接协议实现','技能与插件包'],purpose:'让外部业务能力可被发现、调用和复用。',boundary:'模型上下文协议（MCP）是连接规范；开发包和工具服务是具体实现。',projects:[item('MCP TypeScript SDK','模型上下文协议开发包；构建客户端与工具服务','生态示例','https://github.com/modelcontextprotocol/typescript-sdk','生态示例')],extra:'问数插件、行业技能属于案例中的业务能力包。'},
  {id:'runtime',number:'05',title:'运行环境与基础设施',subtypes:['组件组合运行时','执行沙箱与托管服务'],purpose:'管理组件生命周期、动作隔离环境和部署资源。',boundary:'LangGraph 的任务状态控制在②；组件运行时、动作沙箱、云托管分别比较。',projects:[item('Cordis','组件组合运行时；DSH 使用的插件框架','DSH 架构资料','https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-primer.md'),item('Chord','组件组合运行时；Pi 仓库中的独立包','Pi 架构资料','https://github.com/earendil-works/pi/blob/main/packages/chord/README.md'),item('E2B','动作执行沙箱','生态示例','https://e2b.dev/ai-agents/databerry','生态示例'),item('AWS Bedrock AgentCore Runtime','云端托管运行服务','原文 Q7','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html','原始研究'),item('Google Agent Runtime / Agent Engine','云端托管运行；名称沿用原始资料，官方名称有演进','原文 Q7','https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/runtime','原始研究'),item('Microsoft Foundry Hosted Agents','云端托管运行服务','原文 Q7','https://learn.microsoft.com/agent-framework/hosting/','原始研究')]},
  {id:'governance',number:'06',title:'观测、评估与安全治理',subtypes:['执行追踪与效果评估','权限与策略控制'],purpose:'追踪执行、评估质量，并实施权限和风险策略。',boundary:'这里比较专门的观测或治理系统；框架自带日志记作其能力。',projects:[item('Langfuse','观测与评估平台','生态示例','https://langfuse.com/docs','生态示例'),item('LangSmith','此处比较追踪、调试与评估部分','生态示例','https://docs.langchain.com/oss/python/langchain/overview','生态示例')],extra:'权限、审计与强制业务规则仍需确定具体承载系统。'},
  {id:'platform',number:'07',title:'应用搭建与管理平台',subtypes:['可视化搭建','应用发布与管理'],purpose:'为创建、发布和管理智能体应用提供工作台。',boundary:'平台可以内置执行、知识和治理能力，主归属按工作台定位记录。',projects:[item('Dify','可视化应用搭建与管理','研究补充','https://docs.dify.ai/en/home'),item('Flowise','可视化智能体与工作流搭建','研究补充','https://docs.flowiseai.com/')]},
  {id:'product',number:'08',title:'成品智能体应用',subtypes:['编程助手','个人、办公与行业助手'],purpose:'直接帮助最终用户完成某类任务。',boundary:'此处比较产品形态；OpenCode 和 Pi 的执行与嵌入部分在②单独比较。',projects:[item('OpenCode · 编程助手','成品编程应用','研究补充','https://opencode.ai/'),item('Pi · 编程助手','成品编程应用','研究补充','https://github.com/earendil-works/pi'),item('OpenClaw','个人助手产品','原文 Q1','https://docs.openclaw.ai/','原始研究'),item('WorkBuddy','办公助手产品；定位沿用原文 Q1','原文 Q1',null,'原始研究')]}
];
const relations = [
  {from:'platform',to:'product',label:'交付应用',kind:'publish'},
  {from:'platform',to:'control',label:'构建 / 配置',kind:'build'},
  {from:'product',to:'control',label:'任务 / 结果',kind:'request',both:true},
  {from:'control',to:'model',label:'推理',kind:'model'},
  {from:'control',to:'knowledge',label:'检索 / 记忆',kind:'knowledge'},
  {from:'control',to:'tools',label:'调用',kind:'tools'},
  {from:'runtime',to:'control',label:'运行支撑',kind:'runtime'},
  {from:'governance',to:'control',label:'追踪 / 评估 / 约束',kind:'governance'}
];
const map = document.querySelector('#ecosystem-map');
const stage = map.querySelector('.eco-stage');
const svg = map.querySelector('.eco-links');
const nodeById = Object.fromEntries(categories.map(category=>[category.id,category]));
let selected = 'control';
let queued = false;
function projectName(project, className) {
  const el = document.createElement(project.url?'a':'strong');
  el.textContent = project.name;
  el.className = className;
  if(project.url){el.href=project.url;el.target='_blank';el.rel='noopener noreferrer';}
  return el;
}
categories.forEach(category=>{
  const button = document.createElement('button');
  button.type='button';button.className='eco-node';button.dataset.ecoNode=category.id;
  button.setAttribute('aria-controls','ecosystem-detail');button.setAttribute('aria-pressed','false');
  const title = document.createElement('strong');title.textContent=`${category.number} ${category.title}`;
  const small = document.createElement('span');small.textContent=category.subtypes.join(' · ');
  button.append(title,small);stage.append(button);
  button.addEventListener('click',()=>selectCategory(category.id));
});
function selectCategory(id) {
  const category=nodeById[id];if(!category)return;
  selected=id;
  stage.querySelectorAll('[data-eco-node]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ecoNode===id)));
  document.querySelector('#eco-detail-title').textContent=`${category.number} ${category.title}`;
  document.querySelector('#eco-detail-purpose').textContent=category.purpose;
  document.querySelector('#eco-detail-boundary').textContent=category.boundary+(category.extra?' '+category.extra:'');
  const list=document.querySelector('#eco-detail-projects');list.replaceChildren();
  const preview=category.preview||(id==='runtime'?[category.projects[0],category.projects[2],category.projects[3]]:category.projects);
  preview.forEach(project=>{
    const row=document.createElement('li');row.append(projectName(project,'eco-project-name'));
    const description=document.createElement('span');description.textContent=project.role;row.append(description);list.append(row);
  });
  document.querySelector('#eco-project-label').textContent=id==='control'?'执行宿主代表':id==='runtime'?`代表对象 · 全部 ${category.projects.length} 项见项目归属表`:'代表项目 / 比较对象';
  const onward=document.querySelector('#eco-focus-next');onward.hidden=id!=='control';
  document.querySelector('#eco-focus-back').hidden=id==='control';
  map.querySelector('#eco-announcement').textContent=`已选择${category.title}，代表项目已更新。`;
  scheduleDraw();
}
document.querySelector('#eco-focus-back').addEventListener('click',()=>selectCategory('control'));
const namespace='http://www.w3.org/2000/svg';
const svgEl=(tag,attrs,text)=>{const el=document.createElementNS(namespace,tag);Object.entries(attrs||{}).forEach(([key,value])=>el.setAttribute(key,String(value)));if(text!==undefined)el.textContent=text;return el;};
function draw() {
  queued=false;
  if(stage.getBoundingClientRect().width===0)return;
  const outer=stage.getBoundingClientRect(),width=stage.clientWidth,height=stage.clientHeight;
  const boxes={};stage.querySelectorAll('[data-eco-node]').forEach(el=>{const b=el.getBoundingClientRect();boxes[el.dataset.ecoNode]={x:b.left-outer.left,y:b.top-outer.top,w:b.width,h:b.height,cx:b.left-outer.left+b.width/2,cy:b.top-outer.top+b.height/2};});
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.replaceChildren();
  const defs=svgEl('defs');['active','quiet'].forEach(state=>{const marker=svgEl('marker',{id:`meeting-eco-arrow-${state}`,viewBox:'0 0 8 8',refX:7,refY:4,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(svgEl('path',{d:'M 1 1 L 7 4 L 1 7',fill:'none',stroke:state==='active'?'var(--blue)':'#adb9cf','stroke-width':1.2}));defs.append(marker);});svg.append(defs);
  const edges=svgEl('g'),labels=svgEl('g');svg.append(edges,labels);
  const mobile=getComputedStyle(stage).gridTemplateColumns.trim().split(/\s+/).length===1;
  relations.forEach(r=>{
    const a=boxes[r.from],b=boxes[r.to],active=r.from===selected||r.to===selected;
    let path,lx,ly,rotation=0;
    if(mobile){
      const adjacent=(r.from==='platform'&&r.to==='product')||(r.from==='product'&&r.to==='control')||(r.from==='control'&&r.to==='model');
      if(adjacent){path=`M ${a.cx} ${a.y+a.h} V ${b.y}`;lx=a.cx;ly=(a.y+a.h+b.y)/2;}
      else{const left=['build','knowledge','runtime'].includes(r.kind),rail=left?8+(r.kind==='knowledge'?8:0):width-8-(r.kind==='tools'?8:0),sy=a.cy+(r.kind==='knowledge'?10:0),ey=b.cy+(r.kind==='knowledge'?10:0);path=`M ${left?a.x:a.x+a.w} ${sy} H ${rail} V ${ey} H ${left?b.x:b.x+b.w}`;lx=rail;ly=(sy+ey)/2;rotation=-90;}
    }else if(r.kind==='publish'){path=`M ${a.cx} ${a.y} V 9 H ${b.cx} V ${b.y}`;lx=(a.cx+b.cx)/2;ly=9;}
    else if(['build','request'].includes(r.kind)){const x=b.x+b.w*(r.kind==='build'?.2:.8),y=(a.y+a.h+b.y)/2;path=`M ${a.cx} ${a.y+a.h} V ${y} H ${x} V ${b.y}`;lx=(a.cx+x)/2;ly=y;}
    else if(['model','knowledge','tools'].includes(r.kind)){const x=a.x+a.w*({model:.15,knowledge:.5,tools:.85}[r.kind]),y=(a.y+a.h+b.y)/2;path=`M ${x} ${a.y+a.h} V ${y} H ${b.cx} V ${b.y}`;lx=(x+b.cx)/2;ly=y;}
    else{const left=r.kind==='runtime',rail=left?8:width-8;path=`M ${left?a.x:a.x+a.w} ${a.cy} H ${rail} V ${b.cy} H ${left?b.x:b.x+b.w}`;lx=rail;ly=(a.cy+b.cy)/2;rotation=-90;}
    const marker=`url(#meeting-eco-arrow-${active?'active':'quiet'})`,edge=svgEl('path',{d:path,fill:'none',stroke:active?'var(--blue)':'#adb9cf','stroke-width':active?1.6:1.1,'marker-end':marker});if(r.both)edge.setAttribute('marker-start',marker);edges.append(edge);
    if(!mobile||active||['publish','request','model'].includes(r.kind)){const group=svgEl('g',{transform:`translate(${lx} ${ly}) rotate(${rotation})`}),label=svgEl('text',{'text-anchor':'middle','dominant-baseline':'central',fill:'var(--ink)'},r.label);group.append(label);labels.append(group);const box=label.getBBox();group.insertBefore(svgEl('rect',{x:box.x-3,y:box.y-1,width:box.width+6,height:box.height+2,fill:'var(--paper)'}),label);}
  });
}
function scheduleDraw(){if(queued)return;queued=true;requestAnimationFrame(draw);}
new ResizeObserver(scheduleDraw).observe(stage);
window.addEventListener('meeting-slide-change',scheduleDraw);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(scheduleDraw);
const cards=document.querySelector('#framework-routes');
groups.forEach((group,i)=>{
  const card=document.createElement('article');card.className=`route-card${group.id==='host'?' route-card-host':''}`;
  const title=document.createElement('h3');title.textContent=`${String(i+1).padStart(2,'0')} ${group.title}`;
  const question=document.createElement('p');question.textContent=group.question;
  const list=document.createElement('ul');
  group.projects.forEach(project=>{const row=document.createElement('li');row.append(projectName(project,'route-project-name'));list.append(row);});
  const choice=document.createElement('small');choice.textContent=group.choice;
  const icon=svgEl('svg',{class:'icon','aria-hidden':'true'});icon.append(svgEl('use',{href:`#${group.icon}`}));
  card.append(icon,title,question,list,choice);cards.append(card);
});
const inventory=document.querySelector('#project-inventory');
categories.forEach(category=>{
  category.projects.forEach(project=>{
    const row=document.createElement('tr'),name=document.createElement('th'),position=document.createElement('td'),role=document.createElement('td'),source=document.createElement('td');
    name.scope='row';name.append(projectName(project,'inventory-name'));position.textContent=`${category.number} ${category.title}`;role.textContent=project.role;source.textContent=project.origin===project.source?project.origin:`${project.origin} · ${project.source}`;row.append(name,position,role,source);inventory.append(row);
  });
});
const inventoryDialog=document.querySelector('#inventory-dialog');
document.querySelectorAll('[data-open-inventory]').forEach(button=>button.addEventListener('click',()=>inventoryDialog.showModal()));
document.querySelector('#inventory-close').addEventListener('click',()=>inventoryDialog.close());
selectCategory('control');
})();
