const assert=require('assert');const S=require('./strategy-core.js');
const close=(a,b,e=1e-6)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
// Shapley contributions reconcile exactly and are order-invariant
const c=S.shapley([100,.1,20],[80,.12,21]);close(c.reduce((s,v)=>s+v,0),80*.12*21-100*.1*20);close(S.shapley([.1,100,20],[.12,80,21])[1],c[0]);
// funnel depth follows the richest complete evidence; zero or missing never fabricates a factor
const prev={gmv:10000,orders:250,visitors:8000,impressions:200000,clicks:6000},cur={gmv:9000,orders:240,visitors:8000,impressions:150000,clicks:6000};
const f4=S.funnel(cur,prev);assert.equal(f4.depth,4);close(f4.factors.reduce((s,k)=>s+k.contribution,0),-1000);assert.equal(f4.factors[0].key,'impressions');
assert.equal(S.funnel({...cur,impressions:null},{...prev,impressions:null}).depth,3);assert.equal(S.funnel({gmv:9000,orders:240},{gmv:10000,orders:250}).depth,2);
assert.equal(S.funnel({gmv:9000,orders:0},{gmv:1,orders:1}),null);assert.equal(S.funnel(null,prev),null);
// bottleneck = most negative operating driver; channels/products are shown but never chosen over funnel drivers
const b=S.bottleneck({currency:'USD',funnel:f4,forecastNormal:9000,channels:[{key:'creatorGmv',label:'크리에이터',before:5000,current:2000}],products:[{entity:'A',before:3000,current:1000}],refunds:{before:300,current:450,gmvBefore:10000,gmvAfter:9000},content:{before:10,current:6,days:14},ads:{roi7:1.5,target:2,cost7:700,revenue7:1050}});
assert.equal(b.main.key,'impressions');assert.equal(b.items.find(i=>i.key==='ch-creatorGmv').status,'worse');close(b.items.find(i=>i.key==='refund').impact,-(0.05-0.03)*9000);
const imp=b.items.find(i=>i.key==='impressions');close(imp.recovery30,9000*(200000/150000-1));assert.equal(b.items.find(i=>i.key==='videos').status,'worse');
assert.equal(S.bottleneck({funnel:null}).items[0].status,'unknown');
// strategies: ad loss is today's work, bottleneck playbook follows, nothing claims unsupported money
const st=S.strategies(b,{currency:'USD',ads:{roi7:1.5,target:2,cost7:700,revenue7:1050},stock:[],creatorShare:.7,gmvPerVideo:50,event:{name:'BFCM',start:'2026-11-11',end:'2026-11-30'},eventDays:20});
assert.equal(st[0].id,'ads-roi');assert.equal(st[0].horizon,'오늘');assert(/\+\$350/.test(st[0].expected));close(b.items.find(i=>i.key==='ads').impact,1050-1400);assert(st.some(s=>s.id==='impressions'&&/\+\$3,000/.test(s.expected)));assert(st.some(s=>s.id==='content'));assert(st.some(s=>s.id==='mix-creator'));assert(st.some(s=>s.id==='event'));
assert(S.strategies(b,{ads:{roi7:3,target:2,cost7:700}}).some(s=>s.id==='ads-scale'));assert(S.strategies({items:[],funnel:null},{ads:{roi7:2}}).some(s=>s.id==='roi-target'));assert(!JSON.stringify(st).includes('손익분기'));
assert.equal(S.strategies({items:[],funnel:{diff:500,depth:3}},{}).at(-1).id,'grow');
// goal levers scale one factor at a time and warn when ads are below break-even
const g=S.goal({target:12000,forecastNormal:10000,current:{gmv:9000,orders:240,visitors:8000},ads:{roi7:1.5,target:2},gmvPerVideo:50,videosPerSample:.5});
close(g.gap,2000);close(g.levers.find(l=>l.label.startsWith('방문자')).need,9600);close(g.levers.find(l=>l.label.startsWith('추가 광고비')).need,2000/1.5);assert(/효율 개선을 먼저/.test(g.levers.find(l=>l.label.startsWith('추가 광고비')).note));close(g.levers.find(l=>l.label.startsWith('추가 샘플')).need,80);
assert.equal(S.goal({target:9000,forecastNormal:10000}).levers.length,0);assert.equal(S.goal({target:0,forecastNormal:1}),null);
// data unlocks: consecutive run lengths, dates assume daily collection from the last date
assert.deepEqual(S.run(['2026-10-01','2026-10-03','2026-10-04','2026-10-04']),{length:2,last:'2026-10-04'});assert.deepEqual(S.run([]),{length:0,last:null});
const u=S.unlocks({asOf:'2026-10-20',shop:{length:40,last:'2026-10-19'},foldsNeedDays:70,ads:{length:0,last:null},inventory:false,samplesFirst:'2026-10-01',event:{name:'BFCM',start:'2026-11-11',end:'2026-11-30'}});
const by=id=>u.find(x=>x.id===id);assert.equal(by('forecast').status,'ready');assert.equal(by('status').date,'2026-11-08');assert.equal(by('range').date,'2026-12-28');assert.equal(by('ads').status,'missing');assert(!by('econ'));assert.equal(by('stock').status,'missing');assert.equal(by('samples').date,'2026-11-15');assert.equal(by('event').date,'2026-12-01');
assert.equal(S.unlocks({asOf:'2026-10-20',shop:{length:200,last:'2026-10-19'},rangeReady:true}).find(x=>x.id==='range').status,'ready');
console.log('PASS: exact Shapley funnel, evidence depth, bottleneck ranking, refund/content/ad/stock constraints, strategy ordering, single-lever goal math and data unlock dates');
