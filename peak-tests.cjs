const assert=require('assert');require('./core.js');require('./peak-schema.js');const P=require('./peak-core.js'),D=require('./data-spec.js');
let n=0;const rec=(module,entity,date,metrics,extra={})=>({id:'t'+(n++),brandId:'b',module,entity,start:date,end:date,tz:'UTC-08:00',currency:'USD',basis:'period',complete:true,createdAt:'2026-10-01T00:00:00Z',revision:1,source:'',note:'',metrics,...extra});
const day=i=>P.shift('2026-09-01',i);
// break-even: 38*(1-.04) - 9.5 - 4.2 - 38*.15 = 36.48-13.7-5.7 = 17.08 → margin .4495 → ROI 2.2248
const e=P.economics(rec('economics','전체','2026-09-01',{price:38,cogs:9.5,shippingCost:4.2,platformFeePct:8,commissionPct:7,refundPct:4},{basis:'snapshot'}));
assert(Math.abs(e.net-17.08)<1e-9);assert(Math.abs(e.breakEvenRoi-38/17.08)<1e-9);
assert.deepEqual(P.economics(rec('economics','A','2026-09-01',{price:38,cogs:9})).missing,['shippingCost','platformFeePct','commissionPct','refundPct']);
assert.equal(P.economics(rec('economics','A','2026-09-01',{price:10,cogs:9,shippingCost:2,platformFeePct:0,commissionPct:0,refundPct:0})).breakEvenRoi,null);
const zero=P.economics(rec('economics','A','2026-09-01',{price:0,cogs:0,shippingCost:0,platformFeePct:0,commissionPct:0,refundPct:0}));assert.deepEqual(zero.missing,['price']);
// blended margin weights by product GMV and ignores products without complete economics
const econ=new Map([['A',{missing:[],margin:.5}],['B',{missing:[],margin:.2}],['C',{missing:['cogs'],margin:null}]]);
const b=P.blended(econ,new Map([['A',300],['B',100],['C',100]]));assert(Math.abs(b.margin-.425)<1e-12);assert.equal(b.coverage,.8);assert.equal(P.blended(new Map(),new Map([['A',1]])),null);
// ads windows need every consecutive day; a gap makes the window unavailable instead of shorter
const ads=[];for(let i=0;i<40;i++)ads.push(rec('ads','전체',day(i),{cost:100,revenue:i>=33?150:200,skuOrders:5}));
const w=P.adsWindows(ads,day(39));assert.equal(w.windows[0].current.cost,700);assert.equal(w.windows[0].roi,1.5);assert.equal(w.windows[0].previousRoi,2);assert.equal(w.windows[2].previous,null);
assert.equal(P.adsWindows(ads.filter(r=>r.end!==day(36)),day(39)).windows[0].current,null);
assert.equal(P.adsWindows(ads,day(20)).end,day(20));
// stock cover uses the latest snapshot, at least 7 sales days, and leaves inbound out of the stockout date
const recs=[...ads];for(let i=26;i<40;i++)recs.push(rec('products','A',day(i),{gmv:200,orders:8,items:10}));
recs.push(rec('inventory','A',day(30),{onHand:999,leadTimeDays:5},{basis:'snapshot'}),rec('inventory','A',day(39),{onHand:100,inbound:400,leadTimeDays:5},{basis:'snapshot'}),rec('inventory','B',day(39),{onHand:50,leadTimeDays:5},{basis:'snapshot'}));
const st=P.stock(recs,day(39));const a=st.find(r=>r.entity==='A');assert.equal(a.onHand,100);assert.equal(a.cover,10);assert.equal(a.stockout,day(49));assert.equal(a.reorderBy,day(44));assert.equal(st.find(r=>r.entity==='B').cover,null);
const few=P.stock(recs.filter(r=>!(r.module==='products'&&r.end<day(34))),day(39));assert.equal(few.find(r=>r.entity==='A').avgUnits,null);
// milestones count backwards from the event and flag stock that runs out before it ends
const ev={id:'x',name:'BFCM',start:day(60),end:day(79),type:'platform'};assert.equal(P.nextEvent([{...ev,end:day(1)},ev,{...ev,type:'holiday',start:day(40)}],day(39)).start,day(60));
const ms=P.milestones(ev,day(39),{shipDays:5,postDays:10},st);assert.equal(ms[0].date,day(45));assert.equal(ms[0].daysLeft,6);assert.equal(ms[0].status,'soon');assert.equal(ms[1].date,day(44));assert.equal(ms[2].date,day(57));
assert.equal(P.milestones(ev,day(39),{},[])[1].date,null);assert.deepEqual(P.milestones(null,day(39),{},[]),[]);
// actions: loss below break-even ranks first; data gaps last; no break-even means no loss claim
const fr=P.freshness(recs,day(39),D.specs);assert.equal(fr.find(f=>f.id==='shop').status,'missing');assert.equal(fr.find(f=>f.id==='ads').status,'ok');assert.equal(fr.find(f=>f.id==='economics').status,'missing');
const act=P.actions({asOf:day(39),ads:w,margin:{margin:.5,breakEvenRoi:2},targetRoi:1.6,event:ev,milestones:ms,stock:st,freshness:fr,hasProducts:true,forecast:{normal:900},previousGmv:1000});
assert.equal(act[0].level,'urgent');assert(act.some(x=>/손익분기 2.00× 미달/.test(x.title)&&x.impact===1050*.5-700));assert.equal(act.at(-1).level,'data');
assert(act.some(x=>/A .* 품절 예상/.test(x.title)&&Math.abs(x.impact+200*30)<1e-9));assert(act.some(x=>/10.0% 낮음/.test(x.title)));
const none=P.actions({asOf:day(39),ads:w,margin:null,targetRoi:1.6,freshness:[]});assert(!none.some(x=>/미달/.test(x.title)&&x.level==='urgent'));assert(none.some(x=>/목표 1.60× 미달/.test(x.title)));assert(none.some(x=>x.level==='data'&&/손익분기/.test(x.title)));
assert(P.actions({asOf:day(39),margin:{margin:-.1,breakEvenRoi:null}}).some(x=>/남는 돈이 없음/.test(x.title)));
// every spec has a valid template that the existing CSV importer and validator accept
for(const s of D.specs){const rows=BG.csvParse(D.template(s.id,{currency:'USD',tz:'UTC-08:00'},'2026-10-19'));assert.equal(rows.length,1);const metrics={};for(const f of BG.schemas[s.module].fields)if(rows[0][f.key])metrics[f.key]=Number(rows[0][f.key]);for(const k of s.required)assert(Number.isFinite(metrics[k]),s.id+' '+k);
 BG.validateRecord({...rec(s.module,rows[0].entity,'2026-10-19',metrics),basis:rows[0].basis,brandId:'b'},[{id:'b'}]);}
const late=P.actions({asOf:day(46),stock:st,event:ev});assert(late.some(x=>/발주 마감\(.*\)이 지났습니다/.test(x.todo)&&x.level==='urgent'));
// the demo workspace is valid, fictional and exercises losses, stockouts and the BFCM timeline
const demo=require('./demo-data.js').build('2026-10-20');BG.validateDB(demo);assert(demo.records.every(r=>r.source==='가상 예시'));const dst=P.stock(demo.records,'2026-10-20');assert(dst.find(r=>r.entity==='예시 세럼').stockout<'2026-11-11');assert(P.adsWindows(demo.records,'2026-10-20').windows[0].roi<P.economics(demo.records.find(r=>r.module==='economics'&&r.entity==='전체')).breakEvenRoi);
console.log('PASS: demo workspace, break-even margin, missing economics, GMV-weighted margin, consecutive ad windows, stock cover without inbound, event milestones, ranked actions, freshness and importable templates');
