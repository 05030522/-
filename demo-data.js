/* Deterministic, clearly fictional demo workspace so every screen can be previewed before real imports. Never saved. */
(function(root){'use strict';
const DAY=864e5,dt=s=>Date.parse(s+'T00:00:00Z'),shift=(s,n)=>new Date(dt(s)+n*DAY).toISOString().slice(0,10);
function build(today){let seed=20261020;const rnd=()=>(seed=seed*16807%2147483647)/2147483647,noise=(a=.12)=>1-a+2*a*rnd(),records=[],brandId='demo';let n=0;
 const add=(module,entity,date,metrics,basis='period')=>records.push({id:'demo-'+(n++),brandId,module,entity,start:date,end:date,tz:'UTC-08:00',currency:'USD',basis,metrics,complete:true,createdAt:today+'T00:00:00.000Z',revision:1,source:'가상 예시',note:'화면 확인용 가상 데이터입니다. 실제 성과가 아닙니다.'});
 const products=[['예시 세럼',.5],['예시 크림',.3],['예시 마스크',.2]],last=shift(today,-1),days=200,items={};
 for(let i=0;i<days;i++){const date=shift(last,i-days+1),dow=new Date(dt(date)).getUTCDay(),event=date>='2026-10-02'&&date<='2026-10-11'?1.3:1,wk=dow===0||dow===6?1.12:1;
  const gmv=Math.round(2000*(1+i/250)*wk*event*noise()),orders=Math.max(1,Math.round(gmv/38*noise(.05))),unit=Math.round(orders*1.3);
  add('shop','전체',date,{gmv,orders,items:unit,visitors:Math.round(orders*27*noise(.08)),customers:Math.round(orders*.94),refunds:Math.round(gmv*.04*noise(.3)),creatorGmv:Math.round(gmv*.45*noise(.08)),sellerVideoGmv:Math.round(gmv*.2),sellerLiveGmv:Math.round(gmv*.05),searchGmv:Math.round(gmv*.1),shopTabGmv:Math.round(gmv*.15)});
  const cost=Math.round(gmv*.26*noise(.15)),roi=(i>=days-10?1.45:1.85)*noise(.1),revenue=Math.round(cost*roi);
  add('ads','전체',date,{cost,revenue,skuOrders:Math.round(revenue/40),targetRoi:1.6,dailyBudget:900});
  for(const [name,share] of products){const g=Math.round(gmv*share*noise(.08)),o=Math.max(0,Math.round(orders*share)),u=Math.round(o*1.3);(items[name]=items[name]||[]).push(u);add('products',name,date,{gmv:g,orders:o,items:u,visitors:Math.round(o*27)});}
  add('affiliate','전체',date,{gmv:Math.round(gmv*.45),orders:Math.round(orders*.45),videos:Math.round(i>=days-7?5+4*rnd():9+6*rnd()),postedCreators:Math.round(6+4*rnd()),sellingCreators:Math.round(3+3*rnd()),commission:Math.round(gmv*.45*.15)});
  if(i%7===6)add('samples','전체',date,{shipped:Math.round(35+15*rnd()),contents:Math.round(14+8*rnd()),contentGmv:Math.round(1800+900*rnd())});}
 for(const [name,cover,lead,inbound] of [['예시 세럼',19,14,0],['예시 크림',85,21,0],['예시 마스크',30,10,600]]){const a=items[name].slice(-14),avg=a.reduce((s,v)=>s+v,0)/a.length;add('inventory',name,last,{onHand:Math.round(avg*cover),inbound,leadTimeDays:lead},'snapshot');}
 return {app:'brand-growth-hub',schemaVersion:1,version:0,brands:[{id:brandId,name:'DEMO BRAND · 예시',currency:'USD',tz:'UTC-08:00',targetRoi:1.6,strategy:'가상 데이터 · 실제 성과 아님'}],records,events:[]};}
root.BGDemoData={build};if(typeof module!=='undefined')module.exports=root.BGDemoData;
})(typeof window==='undefined'?globalThis:window);
