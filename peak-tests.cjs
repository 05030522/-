const assert=require('assert');require('./core.js');require('./peak-schema.js');const P=require('./peak-core.js'),D=require('./data-spec.js');
let n=0;const rec=(module,entity,date,metrics,extra={})=>({id:'t'+(n++),brandId:'b',module,entity,start:date,end:date,tz:'UTC-08:00',currency:'USD',basis:'period',complete:true,createdAt:'2026-10-01T00:00:00Z',revision:1,source:'',note:'',metrics,...extra});
const day=i=>P.shift('2026-09-01',i);
// ROI is judged against the brand target: far below / below / met / headroom
const J=(r,t)=>P.roiJudge(r,t).key;assert.equal(J(1.3,1.6),'far');assert.equal(J(1.5,1.6),'below');assert.equal(J(1.7,1.6),'met');assert.equal(J(1.84,1.6),'headroom');assert.equal(J(1.5,null),'unset');assert.equal(J(null,1.6),'none');
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
// actions: ROI gap against target in attributed-GMV terms, scale-up headroom, content supply drops, data gaps last
const fr=P.freshness(recs,day(39),D.specs);assert.equal(fr.find(f=>f.id==='shop').status,'missing');assert.equal(fr.find(f=>f.id==='ads').status,'ok');assert(!D.specs.some(s=>s.id==='economics'));
const aff=[];for(let i=26;i<40;i++)aff.push(rec('affiliate','전체',day(i),{gmv:100,videos:i>=33?5:10,postedCreators:i>=33?4:6,sellingCreators:3}));const cw=P.contentWindows(aff,day(39));assert.equal(cw.videos7,35);assert.equal(cw.previousVideos7,70);assert.equal(cw.posted,4);assert.equal(cw.previousPosted,6);
const act=P.actions({asOf:day(39),ads:w,targetRoi:1.6,content:cw,event:ev,milestones:ms,stock:st,freshness:fr,hasShop:true,hasProducts:true,forecast:{normal:900},previousGmv:1000});
assert(act.some(x=>/7일 ROI 1.50× · 목표 1.60× 미달/.test(x.title)&&x.level==='soon'&&Math.abs(x.impact-(1050-700*1.6))<1e-9));assert.equal(act.at(-1).level,'data');
assert(act.some(x=>/영상 7일 35개 · 직전 7일 70개 대비 -50%/.test(x.title)));assert(act.some(x=>/A .* 품절 예상/.test(x.title)&&Math.abs(x.impact+200*30)<1e-9));assert(act.some(x=>/10.0% 낮음/.test(x.title)));
assert(P.actions({asOf:day(39),ads:w,targetRoi:1.9}).some(x=>/크게 미달/.test(x.title)&&x.level==='urgent'));
const up=P.actions({asOf:day(39),ads:w,targetRoi:1.2});assert(up.some(x=>/예산 증액으로 매출 확대/.test(x.title)&&Math.abs(x.impact-700*.2*1.5)<1e-9));
assert(P.actions({asOf:day(39),ads:w,targetRoi:null}).some(x=>x.level==='data'&&/목표 ROI 설정/.test(x.title)));assert(P.actions({asOf:day(39),hasShop:true}).some(x=>/크리에이터 실적\(영상 수\) 입력/.test(x.title)));
assert(!JSON.stringify(act).includes('손익분기'));
// every spec has a valid template that the existing CSV importer and validator accept
for(const s of D.specs){const rows=BG.csvParse(D.template(s.id,{currency:'USD',tz:'UTC-08:00'},'2026-10-19'));assert.equal(rows.length,1);const metrics={};for(const f of BG.schemas[s.module].fields)if(rows[0][f.key])metrics[f.key]=Number(rows[0][f.key]);for(const k of s.required)assert(Number.isFinite(metrics[k]),s.id+' '+k);
 BG.validateRecord({...rec(s.module,rows[0].entity,'2026-10-19',metrics),basis:rows[0].basis,brandId:'b'},[{id:'b'}]);}
const late=P.actions({asOf:day(46),stock:st,event:ev});assert(late.some(x=>/발주 마감\(.*\)이 지났습니다/.test(x.todo)&&x.level==='urgent'));
// the demo workspace is valid, fictional and exercises an ROI miss, a video drop, stockouts and the BFCM timeline
const demo=require('./demo-data.js').build('2026-10-20');BG.validateDB(demo);assert(demo.records.every(r=>r.source==='가상 예시'));assert(!demo.records.some(r=>r.module==='economics'));const dst=P.stock(demo.records,'2026-10-20');assert(dst.find(r=>r.entity==='예시 세럼').stockout<'2026-11-11');
assert.equal(P.roiJudge(P.adsWindows(demo.records,'2026-10-20').windows[0].roi,1.6).key,'below');const dc=P.contentWindows(demo.records,'2026-10-20');assert(dc.videos7<dc.previousVideos7*.85);
console.log('PASS: demo workspace, target ROI judgement, content windows, consecutive ad windows, stock cover without inbound, event milestones, ranked actions, freshness and importable templates');
