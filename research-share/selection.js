/* Requirements examples are teaching aids; no models or business systems are called. */
(()=>{
const one=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
if(!one('#selection-shape-form'))return;
const mark=(selector,key,attribute)=>all(selector).forEach(button=>{const active=button.dataset[attribute]===key;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
const shapeExamples={knowledge:[false,false,false,false],workflow:[true,false,false,false],agent:[true,true,false,false],complex:[true,true,true,false],platform:[true,true,false,true]};
const shapeInputs=['#select-has-execution','#select-dynamic','#select-complex','#select-shared'].map(one);
function renderShape(){
 const [executionInput,dynamicInput,complexInput,sharedInput]=shapeInputs;
 const execute=executionInput.checked,dynamic=execute&&dynamicInput.checked,complex=execute&&complexInput.checked,shared=sharedInput.checked;
 dynamicInput.disabled=!execute;complexInput.disabled=!execute;
 const type=!execute?'knowledge':!dynamic?'workflow':'agent';
 const path=new Set(['start','execution',...(execute?['path']:[]),type]);
 all('[data-shape-node]').forEach(node=>node.classList.toggle('current',path.has(node.dataset.shapeNode)));
 const edges=new Set(['start',...(execute?['execute']:[]),type]);
 all('[data-shape-edge]').forEach(edge=>edge.classList.toggle('active',edges.has(edge.dataset.shapeEdge)));
 const titles={knowledge:'知识型大模型应用',workflow:'确定性工作流应用',agent:complex?'复杂行业智能体系统':'行业智能体'};
 const texts={knowledge:'主要是理解、检索与生成，先组织模型与受权限约束的知识供给。',workflow:complex?'路径仍可预定义。保留工作流形态，按需增加审批、任务依赖或中断恢复。':'步骤与分支可预定义。优先复用固定查询、规则与业务程序。',agent:complex?'动态调查之外还需要复杂执行控制，补齐流程、任务记录与恢复；是否多智能体另行验证。':'先用一个智能体循环连接专业依据和受控工具，验证动态调查是否成立。'};
 one('#selection-agent-node-title').textContent=complex&&dynamic?'复杂行业智能体系统':'行业智能体';
 one('#selection-agent-node-sub').textContent=complex&&dynamic?'动态判断 ＋ 必要执行控制':'按结果动态选择下一步';
 one('#selection-shape-result-title').textContent=titles[type];one('#selection-shape-result-text').textContent=texts[type];
 one('#selection-platform').classList.toggle('active',shared);
 const state=one('#selection-platform-state');state.textContent=shared?'有信号，需核验收益':'尚无平台化信号';state.className=`tag ${shared?'teal':'gray'}`;
 one('#selection-platform-text').textContent=shared?(dynamic?'多个智能体应用已出现重复能力与集中治理诉求，可评估行业智能体平台；先核验共用范围、版本发布、隔离与运行成本。':'共享治理诉求成立，但当前任务无需动态判断。围绕已选系统共用能力，不据此改为行业智能体平台。'):'当前先交付一个系统。多个智能体应用出现重复能力、统一发布和运行治理需求后，再评估平台化。';
 one('#selection-shape-boundary').textContent=!execute?'主要形态由任务决定。共享、权限和版本管理可以需要，但不会自动产生智能体执行需求。':complex&&!dynamic?'固定流程也可能很长、需要审批或恢复。复杂度决定补哪些能力，不改变是否需要自主判断的依据。':'复杂任务可以由一个智能体配合工具与工作流完成；多智能体需要独立子目标和实际收益依据。';
 const next=one('#q8 .sel-next a');next.href=dynamic?'#q9':'#q10';next.firstChild.textContent=dynamic?'下一步：组合架构能力 ':'下一步：选择实现办法 ';
}
all('[data-shape-example]').forEach(button=>button.addEventListener('click',()=>{shapeInputs.forEach((input,i)=>input.checked=shapeExamples[button.dataset.shapeExample][i]);mark('[data-shape-example]',button.dataset.shapeExample,'shapeExample');renderShape();}));
shapeInputs.forEach(input=>input.addEventListener('change',()=>{mark('[data-shape-example]',null,'shapeExample');renderShape();}));
one('#selection-shape-form').addEventListener('submit',event=>event.preventDefault());renderShape();

const capExamples={
 basic:{caps:[],title:'基础自主',reason:'短任务与有限工具，先保证自主执行、业务访问和企业治理这三项基础要求。',caution:'基础要求是本节企业场景的起点，并不表示所有智能体都必须接入同一套治理平台。'},
 professional:{caps:['knowledge','method','rules'],title:'专业调查',reason:'“为什么本月库存下降？”需要行业口径、调查方法与程序校验，支持按证据继续补查。',caution:'知识可直接提供、查结构化数据或检索文档；按内容规模与更新方式选择实现。'},
 controlled:{caps:['knowledge','method','rules','flow','coordination'],title:'受控报告',reason:'调查需要动态判断，但报告的取数、校验、审阅与交付要按关键步骤组织。',caution:'流程控制约束关键步骤；任务编排组织依赖和汇总。二者都不自动要求多个智能体。'},
 long:{caps:['method','rules','recovery'],title:'中断恢复',reason:'调查跨越较长时间，可能等待人工输入或服务恢复，需要保存可继续执行的任务状态。',caution:'恢复重点是进度、检查点和重复动作处理；没有代码与文件执行需求时，不必因此增加沙箱。'},
 coding:{caps:['method','rules','isolation'],title:'代码与文件执行',reason:'确需运行分析脚本或处理文件时，增加执行环境与资源权限约束。',caution:'隔离约束执行动作，不能替代业务授权；任务短且不需跨进程恢复时，不必同时引入持久执行。'},
 collaboration:{caps:['method','rules','coordination','independent'],title:'独立分工调查',reason:'库存、物流等子目标可独立调查，需要独立上下文、执行预算和主任务汇总。',caution:'应先证明独立分工改善结果或效率。单纯多次查询、并行工具调用，不足以证明需要多智能体。'}
};
let selectedCaps=new Set(capExamples.professional.caps),capExample='professional';
function renderCaps(){
 all('[data-cap-option]').forEach(button=>{const on=selectedCaps.has(button.dataset.capOption);button.classList.toggle('on',on);button.setAttribute('aria-pressed',String(on));});
 mark('[data-cap-example]',capExample,'capExample');one('#selection-cap-count').textContent=`3 项基础要求 ＋ ${selectedCaps.size} 项按需能力`;
 const data=capExamples[capExample];one('#selection-cap-title').textContent=data?data.title:'自定义能力组合';
 one('#selection-cap-reason').textContent=data?data.reason:selectedCaps.size?`当前增加：${all('[data-cap-option]').filter(button=>selectedCaps.has(button.dataset.capOption)).map(button=>button.querySelector('b').textContent).join('、')}。逐项确认它解决的业务问题。`:'当前只保留自主决策、执行与数据访问、企业集成与治理。以真实任务检查是否需要更多能力。';
 one('#selection-cap-caution').textContent=data?data.caution:selectedCaps.has('independent')&&!selectedCaps.has('coordination')?'已选择独立任务执行；还需明确谁派发子目标、汇总证据与处理失败，通常需要相应任务编排。':'这是能力需求清单。每项能力仍需映射到具体机制、提供方和验证任务；勾选不代表已完成实现。';
 scheduleCapWires();
}
all('[data-cap-example]').forEach(button=>button.addEventListener('click',()=>{capExample=button.dataset.capExample;selectedCaps=new Set(capExamples[capExample].caps);renderCaps();}));
all('[data-cap-option]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.capOption;if(selectedCaps.has(key))selectedCaps.delete(key);else selectedCaps.add(key);capExample=null;renderCaps();}));
const wireSvg=one('#selection-cap-wires'),capMap=one('#selection-cap-map'),svgNS='http://www.w3.org/2000/svg';
const svg=(tag,attrs)=>{const el=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,String(value)));return el;};
let wireQueued=false;
function drawCapWires(){wireQueued=false;if(!capMap.clientWidth||!capMap.clientHeight||getComputedStyle(wireSvg).display==='none')return;wireSvg.setAttribute('viewBox',`0 0 ${capMap.clientWidth} ${capMap.clientHeight}`);wireSvg.replaceChildren();const rect=capMap.getBoundingClientRect(),boxes={};all('[data-cap-group]').forEach(el=>{const r=el.getBoundingClientRect();boxes[el.dataset.capGroup]={x:r.left-rect.left,y:r.top-rect.top,w:r.width,h:r.height};});const defs=svg('defs',{});['on','off'].forEach(state=>{const marker=svg('marker',{id:`selection-cap-arrow-${state}`,viewBox:'0 0 8 8',refX:7,refY:4,markerWidth:6,markerHeight:6,orient:'auto'});marker.append(svg('path',{d:'M1 1L7 4L1 7',fill:'none',stroke:state==='on'?'#6c96d2':'#c6d4e6','stroke-width':1.3}));defs.append(marker);});wireSvg.append(defs);
 const core=boxes.core,execution=boxes.execution;
 [{key:'professional',caps:['knowledge','method','rules'],target:core,left:true},{key:'organization',caps:['flow','coordination','independent'],target:core,left:false},{key:'reliability',caps:['recovery','isolation'],target:execution,left:false}].forEach(item=>{const a=boxes[item.key],b=item.target,on=item.caps.some(key=>selectedCaps.has(key)),startX=item.left?a.x+a.w:a.x,endX=item.left?b.x:b.x+b.w,startY=a.y+a.h/2,endY=item.key==='reliability'?b.y+b.h/2:b.y+80,midX=(startX+endX)/2;wireSvg.append(svg('path',{d:`M${startX} ${startY}H${midX}V${endY}H${endX}`,fill:'none',stroke:on?'#6c96d2':'#c6d4e6','stroke-width':on?1.6:1.2,'stroke-dasharray':on?'none':'4 4','marker-end':`url(#selection-cap-arrow-${on?'on':'off'})`}));});
}
function scheduleCapWires(){if(wireQueued)return;wireQueued=true;requestAnimationFrame(drawCapWires);}
new ResizeObserver(scheduleCapWires).observe(capMap);window.addEventListener('research-view-change',scheduleCapWires);window.addEventListener('beforeprint',drawCapWires);window.addEventListener('afterprint',scheduleCapWires);if(document.fonts)document.fonts.ready.then(scheduleCapWires);renderCaps();

const implementationCases={
 query:{assembly:'明确查询：沿用成熟业务流程，模型辅助理解与表达',assets:['指标定义与查询范围','先确认时点、单位和权限；少量定义可以直接提供。'],executor:['现有程序 / 确定性流程','由程序组织澄清、查询、计算与返回'],adapter:['查询接口适配','参数校验、可信身份与结果来源'],foundation:['业务授权与查询审计','复用权限和计算服务，核验模型输出及结果引用。'],title:'路径明确，优先复用现有程序与业务能力',reason:'固定查询和规则计算可由已有应用组织。接入模型改善理解与表达，不必为了框架功能增加自主调查或复杂任务系统。',trigger:'重新评估条件：用户问题开始依赖中间结果，必须动态补查与修正。',routes:['existing','integration'],extra:'范围、时点、单位与权限是否正确；模型输出格式正确时，业务结果是否仍然正确。'},
 analysis:{assembly:'动态调查：一个执行循环，连接专业依据与业务工具',assets:['行业知识、指标口径与调查方法','专业内容提供判断依据；公式和业务约束由程序校验。'],executor:['单智能体执行循环','目标、状态、工具调用与停止条件'],adapter:['受控业务工具','限定范围、传递身份、补查与证据'],foundation:['权限、审计与结果评估','连接已有业务授权，记录查询证据和调用过程，补齐任务级评估。'],title:'动态判断是主要变化，先验证单智能体',reason:'用执行循环组织补查，复用业务查询、计算与权限。专业方法和证据校验是行业侧需要补齐的内容。',trigger:'重新评估条件：出现必须跨进程恢复的任务，或独立调查分工的收益已明确。',routes:['development','prebuilt','host'],extra:'补查能否改善结论，证据是否完整，工具失败能否停止或修正。'},
 reuse:{assembly:'行业复用：保留执行方案，增加版本化资产与企业适配',assets:['版本化行业配置、方法与指标定义','统一管理行业内容、企业映射、加载与发布校验。'],executor:['保留已选执行方案','先复用已验证的循环或业务流程'],adapter:['企业接口与配置适配','加载企业映射、连接工具与可信身份'],foundation:['版本发布、租户边界与审计','增加配置兼容、发布校验和回滚；按实际部署核验企业隔离。'],title:'复用的重点是行业资产与企业连接',reason:'多企业交付可以先用配置、适配与发布校验支撑。只有实际组件组合或集中治理需要出现时，才进一步选择插件宿主或平台。',trigger:'重新评估条件：重复建设明显，多个应用需要集中发布、运行与统一治理。',routes:['existing'],extra:'同一行业配置能否适配不同企业；错误配置能否阻止发布，版本能否回滚，权限边界是否保持。'},
 recovery:{assembly:'中断恢复：执行状态必须可保存，并能安全继续',assets:['任务步骤、恢复规则与业务校验','明确哪些步骤可重试，哪些动作要先核实结果。'],executor:['执行控制 ＋ 持久状态','任务检查点、存储与恢复位置'],adapter:['可核对结果的业务工具','超时后核对执行结果，处理重复动作'],foundation:['恢复存储、审计与运行监控','补齐持久化与恢复配置，区分任务状态与聊天记录。'],title:'需要的是可恢复执行，框架名称本身不是保证',reason:'围绕进度、持久存储、人工暂停和恢复机制选型。重启后能读回对话，仍不足以证明能正确恢复业务任务。',trigger:'重新评估条件：恢复时产生重复业务动作，或现有状态机制无法满足等待与重启边界。',routes:['workflow'],extra:'执行中断、进程重启与人工暂停后能否恢复；工具结果未知时是否重复执行或越权。'},
 independent:{assembly:'独立调查：主任务组织子目标，子任务带证据返回',assets:['子目标边界、调查方法与证据规范','明确输入、输出、预算和主任务汇总责任。'],executor:['主智能体 ＋ 独立子任务','各自上下文、预算、停止与汇总'],adapter:['按子任务授权的工具','限定范围，返回证据与未解决问题'],foundation:['任务编排、预算与审计','处理失败、冲突证据与超时；避免不必要的重复调查。'],title:'先证明独立分工有收益，再引入多智能体',reason:'库存与物流等可独立调查时，比较单智能体和独立分工的结果与成本。多次工具调用或并行查询本身，不构成采用多智能体的依据。',trigger:'重新评估条件：协作成本超过收益，证据冲突或重复调查影响交付。',routes:['development','prebuilt','host'],extra:'与单智能体相比是否更准确或更高效；子任务失败、证据冲突、预算超限时谁负责收敛。'}
};
function renderImplementation(key){const data=implementationCases[key];mark('[data-implementation]',key,'implementation');one('#selection-assembly-title').textContent=data.assembly;
 [['assets',data.assets],['executor',data.executor],['adapter',data.adapter],['foundation',data.foundation]].forEach(([prefix,values])=>{one(`#selection-${prefix}-title`).textContent=values[0];one(`#selection-${prefix}-text`).textContent=values[1];});
 one('#selection-choice-title').textContent=data.title;one('#selection-choice-reason').textContent=data.reason;one('#selection-choice-trigger').textContent=data.trigger;one('#selection-verification-extra').replaceChildren();const strong=document.createElement('b');strong.textContent='本场景加测：';one('#selection-verification-extra').append(strong,data.extra);
 all('[data-selection-route]').forEach(article=>article.classList.toggle('relevant',data.routes.includes(article.dataset.selectionRoute)));
}
all('[data-implementation]').forEach(button=>button.addEventListener('click',()=>renderImplementation(button.dataset.implementation)));renderImplementation('analysis');
})();
