const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const p of ['core.js','automation-schema.js','forecast-core.js'])vm.runInThisContext(fs.readFileSync(__dirname+'/'+p,'utf8'));
const r=(start,end,value,id)=>({id,revision:1,brandId:'b',module:'shop',entity:'전체',start,end,currency:'USD',tz:'UTC-08:00',complete:true,basis:'period',metrics:{gmv:value}});
const rs=[r('2026-09-01','2026-09-07',700,'a'),r('2026-09-01','2026-09-14',1400,'b'),r('2026-09-08','2026-09-14',700,'c')];
const picked=BGForecast.select(rs,{brandId:'b',module:'shop',entity:'전체',metric:'gmv',asOf:'2026-09-14'});
assert.equal(picked.length,2);assert.equal(picked.reduce((s,r)=>s+r.metrics.gmv,0),1400);
const f=BGForecast.project(picked,'gmv',{start:'2026-10-15',end:'2026-10-21',weekendEffect:.4,spread:.2});
assert.ok(Math.abs(f.total-700)<.00001);assert.equal(f.rows.length,7);
assert.equal(BGForecast.learn(picked,'gmv').weekend,null);
assert.throws(()=>BGForecast.project(picked,'gmv',{start:'2026-09-01',end:'2026-09-07'}));
assert.throws(()=>BGForecast.project(picked,'gmv',{start:'2026-12-31',end:'2027-01-07'}));
const daily=[];for(let t=Date.parse('2026-08-01');t<=Date.parse('2026-10-11');t+=86400000){const s=new Date(t).toISOString().slice(0,10);daily.push(r(s,s,s>='2026-10-02'?150:100,s));}
const learned=BGForecast.learn(daily,'gmv');assert.ok(learned.campaigns.fall);assert.ok(Math.abs(learned.campaigns.fall.uplift-.5)<.000001);
const zero=BGForecast.project(picked,'gmv',{start:'2026-11-27',end:'2026-11-27',effects:{bfcm:.5,blackfriday:1},spread:0});assert.equal(zero.total,200);
const snap={...r('2026-10-14','2026-10-14',100,'snap'),module:'automations',basis:'snapshot',metrics:{sent:100,replies:5}};
assert.equal(BGForecast.select([snap],{brandId:'b',module:'automations',entity:'전체',metric:'sent',asOf:'2026-10-14'}).length,0);
assert.equal(BG.previous(snap,[{...snap,id:'old',start:'2026-10-13',end:'2026-10-13'}]),null);
console.log('PASS: overlap exclusion, weekday normalization, campaign calibration, evidence gates, no double uplift, no snapshot-as-daily forecasts');
