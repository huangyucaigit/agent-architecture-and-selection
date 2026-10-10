/* All values are local teaching examples. No business requests are performed. */
(()=>{
const one=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];if(!one('#cases.practice'))return;
const select=(selector,attribute,key)=>all(selector).forEach(button=>{const active=button.dataset[attribute]===key;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
const number=value=>Math.abs(value).toLocaleString('zh-CN');
const signed=value=>value===0?'0':`${value<0?'−':'+'}${number(value)}`;
const queryExamples={
 normal:{start:12000,end:10800,status:'结果可核对',explanation:'已确认同一关闭期间、A 库点、账面库存、单位为吨。',evidence:'来源示例：两期库存快照。所有数值均为虚构验收数据。',step:'answer',states:['已明确','已调用','已校验','可交付']},
 ambiguous:{status:'先澄清',title:'月份尚未结束，先确认比较哪两个时点',explanation:'“本月末”快照尚不存在。请明确比较上月末与当前时点，还是两个已关闭月末；确认后再查询。',evidence:'未明确指标、期间与范围前，不应猜测参数或给出数值。',step:'clarify',stop:0,states:['等待澄清','暂不调用','暂不查询','等待条件']},
 increase:{start:12000,end:12600,status:'纠正问题预设',explanation:'按同一关闭期间与账面口径核对，实际是增加，不能沿用“减少”的预设。',evidence:'来源示例：两期库存快照。增加 600 吨由业务程序计算，不由模型猜测。',step:'answer',states:['已明确','已调用','已校验','纠正预设']},
 empty:{status:'缺少有效数据',title:'授权范围内没有有效快照，不能据此回答库存为 0',explanation:'检查数据时点、同步状态与授权范围；缺少其中一期，也不能完成变动计算。',evidence:'返回数据缺口与查询范围，不编造快照或将缺失值当作 0。',step:'business',stop:2,states:['已明确','已调用','无有效数据','说明缺口']},
 denied:{status:'访问被拒绝',title:'当前身份无权访问该库点，不返回业务数据',explanation:'服务端按可信身份执行授权。模型修改用户参数、改写问题或更换工具，均不能绕过授权。',evidence:'反馈可用范围或申请访问的正常业务入口，不泄露受限数据。',step:'business',stop:2,states:['已明确','已调用','授权拒绝','说明限制']},
 timeout:{status:'本次未取得结果',title:'查询接口超时，当前无法给出库存结论',explanation:'在允许的预算内重试只读查询，或说明失败并停止；不能把超时解释成无库存或无异常。',evidence:'记录工具错误和未完成部分；该示例未实际发起请求。',step:'business',stop:2,states:['已明确','已调用','接口超时','停止或重试']}
};
function showQuery(key){const data=queryExamples[key];select('[data-query-demo]','queryDemo',key);const hasNumbers=typeof data.end==='number';one('#practice-query-numbers').hidden=!hasNumbers;one('#practice-query-answer').classList.toggle('attention',!hasNumbers);const badge=one('#practice-query-status');badge.textContent=data.status;badge.className=`tag ${hasNumbers?'teal':'amber'}`;
 let title=data.title;if(hasNumbers){const delta=data.end-data.start;title=`期末库存 ${number(data.end)} 吨，比期初${delta<0?'减少':delta>0?'增加':'变动'} ${number(delta)} 吨`;one('#practice-query-start').textContent=number(data.start);one('#practice-query-end').textContent=number(data.end);one('#practice-query-delta').textContent=signed(delta);}
 one('#practice-query-title').textContent=title;one('#practice-query-explanation').textContent=data.explanation;one('#practice-query-evidence').textContent=data.evidence;
 all('[data-query-step]').forEach((article,index)=>{article.classList.toggle('current',article.dataset.queryStep===data.step);article.classList.toggle('blocked',index===data.stop);article.classList.toggle('waiting',data.stop===0&&index>0);article.querySelector('.pr-step-state').textContent=data.states[index];});
}
all('[data-query-demo]').forEach(button=>button.addEventListener('click',()=>showQuery(button.dataset.queryDemo)));showQuery('normal');

const chart=one('#practice-inventory-chart'),ns='http://www.w3.org/2000/svg';
const svg=(tag,attrs,text)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,String(value)));if(text!==undefined)el.textContent=text;return el;};
const inventory={start:12000,changes:[2000,-3000,-100,-100]};
const explained=inventory.changes.reduce((sum,value)=>sum+value,0);
const analysisExamples={
 balanced:{end:10800,status:'可以解释变动构成',title:'数量核平，还不能直接断言业务原因',explanation:'出库、范围外净调拨与调整共同解释净减少。要解释出库规模及其业务原因，仍需补查订单、计划等证据；判断是否增加，还需可比期间或计划基准。',next:'下一步：按任务需要补查原因；若证据不足，交付已解释构成与未决问题。'},
 gap:{end:10750,status:'差额未核平',title:'还有 50 吨净减少未解释，不能交付完整解释',explanation:'快照显示净减少 1,250 吨，有效记录解释净减少 1,200 吨。继续检查缺失单据、调整记录、时点与口径；不把差额编成业务原因。',next:'下一步：补查差额来源；若达到预算或无法获取数据，保留未解释差额并说明限制。'},
 cause:{end:10800,status:'原因证据仍不足',title:'“出库影响最大”不等于“需求增长导致下降”',explanation:'变动记录能说明出库减少库存，但不能单凭数值断言市场、客户需求或经营决策。业务原因需要订单、调拨计划、单据等独立证据。',next:'下一步：提出可检验的假设并补查；证据不足时只交付变动构成，不虚构因果结论。'}
};
function drawInventory(end){chart.querySelectorAll('[data-generated-chart]').forEach(node=>node.remove());const g=svg('g',{'data-generated-chart':'true'});const y=value=>235-value/15000*210;
 [0,5000,10000,15000].forEach(value=>{g.append(svg('line',{x1:45,y1:y(value),x2:525,y2:y(value),stroke:'#e3eaf3','stroke-width':1}));g.append(svg('text',{x:38,y:y(value)+4,class:'pr-axis-label'},value===0?'0':`${value/1000}k`));});
 let total=inventory.start;const bars=[{from:0,to:total,value:total,label:['期初','快照'],kind:'total'}];inventory.changes.forEach((value,index)=>{const from=total;total+=value;bars.push({from,to:total,value,label:[['有效','入库'],['有效','出库'],['范围外','净调拨'],['其他有效','调整']][index],kind:value>0?'positive':'negative'});});bars.push({from:0,to:end,value:end,label:['期末','快照'],kind:'total'});
 bars.forEach((bar,index)=>{const x=55+index*80,w=50,top=y(Math.max(bar.from,bar.to)),height=Math.max(1.4,Math.abs(y(bar.from)-y(bar.to)));g.append(svg('rect',{x,y:top,width:w,height,rx:bar.kind==='total'?3:0,fill:{total:'#7098d5',positive:'#60ac8d',negative:'#d28a78'}[bar.kind]}));g.append(svg('text',{x:x+w/2,y:top-10,class:'pr-chart-value'},bar.kind==='total'?number(bar.value):signed(bar.value)));bar.label.forEach((text,i)=>g.append(svg('text',{x:x+w/2,y:257+i*16},text)));if(index<bars.length-1){const nextX=55+(index+1)*80;g.append(svg('line',{x1:x+w,y1:y(bar.to),x2:nextX,y2:y(bar.to),stroke:'#a6b8d0','stroke-width':1,'stroke-dasharray':'3 3'}));}});
 chart.append(g);one('#practice-inventory-chart-desc').textContent=`虚构库存例子：期初 ${inventory.start} 吨，入库增加 2000 吨，出库减少 3000 吨，范围外净调拨和其他有效调整各减少 100 吨；期末快照 ${end} 吨，未解释差额 ${signed(end-inventory.start-explained)} 吨。`;
}
function showAnalysis(key){const data=analysisExamples[key],snapshot=data.end-inventory.start,residual=snapshot-explained;select('[data-analysis-demo]','analysisDemo',key);drawInventory(data.end);one('#practice-snapshot-change').textContent=signed(snapshot)+' 吨';one('#practice-explained-change').textContent=signed(explained)+' 吨';one('#practice-residual').textContent=signed(residual)+' 吨';one('#practice-residual-box').classList.toggle('attention',residual!==0);one('#practice-analysis-result').classList.toggle('attention',key!=='balanced');const badge=one('#practice-analysis-status');badge.textContent=data.status;badge.className=`tag ${key==='balanced'?'teal':'amber'}`;one('#practice-analysis-title').textContent=data.title;one('#practice-analysis-explanation').textContent=data.explanation;one('#practice-analysis-next').textContent=data.next;}
all('[data-analysis-demo]').forEach(button=>button.addEventListener('click',()=>showAnalysis(button.dataset.analysisDemo)));showAnalysis('balanced');

const industries={
 grain:{title:'粮食行业能力包',knowledge:'库存、入出库、调拨与调整',metrics:'账面库存、期间、库点、吨',method:'核对变动 → 定位贡献 → 补查证据',rules:'有效单据、去重、差额核对',mapping:'库点、品种、状态码、接口映射与授权',question:'“本月库存为什么下降？”'},
 retail:{title:'零售行业能力包',knowledge:'商品、门店、交易、退货与促销',metrics:'销售额、净额口径、门店、期间、币种',method:'核对销售变动 → 拆销量与价格 → 定位门店',rules:'退货口径、促销归属、交易去重',mapping:'商品、门店、交易接口、状态码与授权',question:'“本月销售额为什么下降？”'},
 manufacturing:{title:'制造行业能力包',knowledge:'工单、产线、计划、完工与合格产出',metrics:'计划产量、合格产量、期间、件或吨',method:'核对计划达成 → 定位产线工单 → 补查异常',rules:'完工状态、良品口径、工单归属',mapping:'产线、工单、数据接口、状态码与授权',question:'“本月生产计划为什么未完成？”'}
};
function showIndustry(key){const data=industries[key];select('[data-practice-industry]','practiceIndustry',key);one('#practice-industry-title').textContent=data.title;one('#practice-industry-question').textContent=data.question;all('[data-practice-field]').forEach(el=>el.textContent=data[el.dataset.practiceField]);}
all('[data-practice-industry]').forEach(button=>button.addEventListener('click',()=>showIndustry(button.dataset.practiceIndustry)));showIndustry('grain');
const deliveries={
 query:{tag:'查询验证',title:'先接通受控查询，再决定采用范围',minimum:'问数工具插件＋模型与工具配置＋查询接口连接＋结果与来源展示。',test:'与原业务查询比对结果、口径与权限；测试歧义、无数据、超时和越权。',trigger:'需要模型结合目标与证据自主选择补查或结束，或 DSH 的适配、兼容与升级成本超过复用收益。'},
 analysis:{tag:'分析验证',title:'证明调查与校验有效，再增加协作复杂度',minimum:'复用查询型；新增行业分析技能、分析计算工具、规则和证据校验。',test:'检查变动分解、证据链和未决问题；测试缺失、重复、口径冲突、差额与停止条件。',trigger:'独立子目标带来明确收益，或任务确需持久恢复；回到能力选择逐项补齐。'},
 config:{tag:'复用验证',title:'验证资产跨企业复用，再判断是否平台化',minimum:'复用分析型；新增行业包格式、企业映射、结构与业务校验、版本发布和装载适配。',test:'同一行业两家企业＋第二行业样例；测试错误配置、版本回退与企业隔离，记录仍需开发的部分。',trigger:'重复建设与集中运行治理诉求已明确，或配置不能覆盖新的公式、连接器与算法。'}
};
function showDelivery(key){const data=deliveries[key];select('[data-delivery-stage]','deliveryStage',key);one('#practice-delivery-tag').textContent=data.tag;one('#practice-delivery-title').textContent=data.title;one('#practice-delivery-minimum').textContent=data.minimum;one('#practice-delivery-test').textContent=data.test;one('#practice-delivery-trigger').textContent=data.trigger;}
all('[data-delivery-stage]').forEach(button=>button.addEventListener('click',()=>showDelivery(button.dataset.deliveryStage)));showDelivery('query');
})();
