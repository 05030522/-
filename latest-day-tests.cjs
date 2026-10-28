const assert=require('node:assert/strict');require('./core.js');require('./latest-day.js');
const r=(id,day,gmv,extra={})=>({id,brandId:'b',module:'shop',entity:'전체',tz:'T',currency:'USD',basis:'period',start:day,end:day,complete:true,revision:1,metrics:{gmv,orders:1},...extra});
const build=records=>BGLatestDay.build({records},'b','2026-10-28');
assert.equal(build([r('a','2026-10-25',100),r('b','2026-10-27',200)]),null,'Gaps must not become day-on-day comparisons');
assert.equal(build([r('a','2026-10-26',100),r('b','2026-10-27',200,{tz:'other'})]),null,'Different timezones must not be compared');
assert.equal(build([r('a','2026-10-26',100),r('b','2026-10-27',200,{complete:false})]),null,'Incomplete rows must not count');
const x=build([r('a','2026-10-26',688.19),r('b','2026-10-27',963.93),r('c','2026-10-28',2000)]);assert.equal(x.current.end,'2026-10-27');assert.ok(Math.abs(x.change-275.74)<1e-9);
console.log('latest-day comparison guards passed');
