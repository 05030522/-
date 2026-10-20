const assert=require('assert'),A=require('./ad-estimate-core.js');
const source={module:'ads',entity:'전체',start:'2026-10-01',end:'2026-10-19',complete:true,source:'스크린샷 4593da11 / GMV Max overview',metrics:{cost:16572.56,revenue:24075.86,skuOrders:647}},before=JSON.stringify(source),rows=A.estimate(source);
assert.equal(rows.length,19);assert.equal(rows[0].date,'2026-10-01');assert.equal(rows.at(-1).date,'2026-10-19');assert(rows.every(r=>r.estimated));
assert.equal(rows.reduce((s,r)=>s+Math.round(r.cost*100),0),1657256);assert.equal(rows.reduce((s,r)=>s+Math.round(r.revenue*100),0),2407586);assert.equal(rows.reduce((s,r)=>s+r.skuOrders,0),647);
for(const r of rows){assert(Math.abs(r.roi-r.revenue/r.cost)<1e-12);assert(Number.isInteger(r.skuOrders));assert(r.cost>=0);}
assert.equal(JSON.stringify(source),before);assert.equal(A.estimate({...source,end:'2026-10-20'}),null);assert.equal(A.estimate({...source,source:'other data'}),null);assert.equal(A.estimate({...source,entity:'Campaign A'}),null);assert.deepEqual(A.allocate(2,[1,1,1]),[1,1,0]);
const zero=A.estimate({...source,metrics:{cost:0,revenue:0,skuOrders:0}});assert(zero.every(r=>r.roi===null&&r.cpo===null));
console.log('PASS: 19 estimated dates, exact aggregate reconciliation, derived ROI, source isolation, zero handling and no actual-data mutation.');
