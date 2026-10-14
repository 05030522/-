const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');for(const f of ['core.js','automation-schema.js','forecast-core.js','forecast-auto.js'])vm.runInThisContext(fs.readFileSync(__dirname+'/'+f,'utf8'));
const make=(date,v)=>({id:date,revision:1,brandId:'b',module:'shop',entity:'全',start:date,end:date,complete:true,basis:'period',currency:'USD',tz:'UTC-08:00',metrics:{gmv:v}});
let rs=[];for(let i=0;i<28;i++){let d=new Date(Date.parse('2026-08-01')+i*86400000).toISOString().slice(0,10);rs.push(make(d,100));}
let f=BGForecast.auto(rs,'gmv',{start:'2026-10-15',end:'2026-10-21'});assert.ok(Math.abs(f.normal-700)<1e-7);assert.equal(f.conservative,f.normal);assert.equal(f.normal,f.bull);assert.equal(f.weeklyGrowth,0);assert.equal(f.learned.weekend.uplift,0);
f=BGForecast.auto([make('2026-10-13',200)],'gmv',{start:'2026-10-15',end:'2026-10-21'});assert.equal(f.normal,1400);assert.equal(f.conservative,f.bull);assert.equal(f.weeklyGrowth,null);assert.equal(f.spreadPercent,null);
rs=rs.map((r,i)=>({...r,metrics:{gmv:100*Math.pow(1.05,i/7)}}));f=BGForecast.auto(rs,'gmv',{start:'2026-09-01',end:'2026-09-07'});assert.ok(f.weeklyGrowth>0);assert.ok(f.conservative<=f.normal&&f.normal<=f.bull);assert.ok(Number.isFinite(f.growthPercent));
rs=rs.map(r=>({...r,metrics:{gmv:0}}));f=BGForecast.auto(rs,'gmv',{start:'2026-10-15',end:'2026-10-21'});assert.equal(f.growthPercent,null);assert.equal(f.normal,0);
assert.throws(()=>BGForecast.auto(rs,'gmv',{start:'2026-12-31',end:'2027-01-01'}));
console.log('PASS: automatic level, growth, scenario ordering, insufficient evidence, zero denominators, no manual percentages');
