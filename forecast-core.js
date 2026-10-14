(function(root){'use strict';
const DAY=86400000,opm='https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/#url=2026',calendar='https://www.timeanddate.com/calendar/?year=2026&country=1',tiktok='https://seller-us.tiktok.com/university/essay?knowledge_id=8974080364971789';
const events=[
['valentine','Valentine’s Day','02-14','02-14','retail','기프트·뷰티 제안',calendar],['easter','Easter','04-05','04-05','retail','봄 프로모션 기회',calendar],['mother','Mother’s Day','05-10','05-10','retail','뷰티·웰니스 기프트',calendar],['memorial','Memorial Day','05-25','05-25','holiday','연휴 수요·배송 변동',opm],['father','Father’s Day','06-21','06-21','retail','선물 수요',calendar],['independence','Independence Day','07-04','07-04','holiday','연휴 수요·배송 변동 (연방 관측일 7/3)',opm],['labor','Labor Day','09-07','09-07','holiday','연휴·가을 전환',opm],['fall','TikTok Shop Fall Deals','10-02','10-11','platform','계정별 참여 일정 확인 필요',tiktok],['halloween','Halloween','10-31','10-31','retail','시즌 콘텐츠 수요',calendar],['bfcm','TikTok Shop BFCM','11-11','12-01','platform','계정별 등록·참여 여부 확인 필요',tiktok],['thanksgiving','Thanksgiving','11-26','11-26','holiday','구매와 배송 일정 변동',opm],['blackfriday','Black Friday','11-27','11-27','retail','BFCM 안의 쇼핑 피크',calendar],['cyber','Cyber Monday','11-30','11-30','retail','BFCM 안의 온라인 쇼핑 피크',calendar],['christmas','Christmas','12-25','12-25','holiday','선물·배송 마감에 따른 변동',opm]
].map(([id,name,s,e,type,effect,source])=>({id,name,start:'2026-'+s,end:'2026-'+e,type,effect,source,verifiedAt:'2026-10-14'}));
const additive={customers:['newCustomers','repeatCustomers'],automations:['sent','replies','sampleRequests'],shop:['gmv','orders','items','refunds'],ads:['cost','revenue','skuOrders','impressions','clicks'],products:['gmv','orders','items','refunds'],creative:['cost','revenue','skuOrders','impressions','clicks'],affiliate:['gmv','orders','items','commission','refunds','videos','liveStreams'],samples:['shipped','contentGmv','cogs','shipping','contents'],outreach:['contacted','invited','messaged','added','requested','received','posted','selling'],promotions:['gmv','orders','discount']};
const day=s=>Date.parse(s+'T00:00:00Z'),date=n=>new Date(n).toISOString().slice(0,10),weekday=s=>new Date(day(s)).getUTCDay(),weekend=s=>[0,6].includes(weekday(s)),mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null,inside=(s,e)=>s>=e.start&&s<=e.end;
function select(records,{brandId,module,entity,metric,asOf}){if(module==='customers')return [];

 const rs=BG.latest(records).filter(r=>r.brandId===brandId&&r.module===module&&r.entity===entity&&r.complete&&r.basis==='period'&&r.end<=asOf&&Number.isFinite(BG.metric(r,metric))).sort((a,b)=>b.end.localeCompare(a.end)||b.start.localeCompare(a.start));
 if(!rs.length)return [];
 const currency=rs[0].currency,tz=rs[0].tz,picked=[];
 // Prefer newest, shorter windows; never subtract overlapping aggregates or manufacture daily points.
 for(const r of rs){if(r.currency!==currency||r.tz!==tz)continue;if(picked.some(p=>r.start<=p.end&&r.end>=p.start))continue;picked.push(r);}return picked.sort((a,b)=>a.start.localeCompare(b.start));
}
function learn(rs,k,calendarEvents=events){const daily=rs.filter(r=>r.start===r.end).map(r=>({date:r.end,value:BG.metric(r,k)}));const clean=daily.filter(p=>!calendarEvents.some(e=>inside(p.date,e)));const byDay=Array.from({length:7},(_,w)=>clean.filter(p=>weekday(p.date)===w));const result={dailyCount:daily.length,weekend:null,campaigns:{}};
 const we=clean.filter(p=>weekend(p.date)),wd=clean.filter(p=>!weekend(p.date));
 // Recent eight-week window; disclosed descriptive ratio, not causal evidence.
 const cutoff=daily.length?day(daily.at(-1).date)-56*DAY:0,wr=we.filter(p=>day(p.date)>=cutoff),dr=wd.filter(p=>day(p.date)>=cutoff);
 if(wr.length>=4&&dr.length>=10&&[0,6].every(w=>wr.some(p=>weekday(p.date)===w))&&mean(dr.map(p=>p.value))>0)result.weekend={uplift:mean(wr.map(p=>p.value))/mean(dr.map(p=>p.value))-1,eventN:wr.length,controlN:dr.length,start:date(cutoff),end:daily.at(-1).date};
 for(const e of calendarEvents){const event=daily.filter(p=>inside(p.date,e)),control=clean.filter(p=>day(p.date)>=day(e.start)-56*DAY&&p.date<e.start);let ratios=[];for(const p of event){const matched=control.filter(c=>weekday(c.date)===weekday(p.date));if(matched.length>=2&&mean(matched.map(c=>c.value))>0)ratios.push(p.value/mean(matched.map(c=>c.value)));}
 if(event.length>=3&&ratios.length===event.length&&control.length>=14)result.campaigns[e.id]={uplift:mean(ratios)-1,eventN:event.length,controlN:control.length,start:e.start,end:e.end};
 }
 return result;
}
function project(rs,k,{start,end,growth=0,spread=.2,weekendEffect=0,effects={}},learned){if(!BG.dateValid(start)||!BG.dateValid(end)||start>end||end>'2026-12-31'||BG.days(start,end)>92)throw Error('예측은 2026년 내 1~92일 범위로 지정하세요.');if(!Number.isFinite(growth)||growth<-.5||growth>1||!Number.isFinite(spread)||spread<0||spread>1)throw Error('성장 가정 또는 시나리오 폭 오류');if(!rs.length)return null;if(rs.some(r=>r.end>=start))throw Error('기준 실적 종료 다음 날 이후를 예측하세요.');const clean=rs.filter(r=>!events.some(e=>r.start<=e.end&&r.end>=e.start));const selected=(clean.length?clean:rs).slice(-8),n=selected.reduce((s,r)=>s+BG.days(r.start,r.end),0),baseline=selected.reduce((s,r)=>s+BG.metric(r,k),0)/n;const rows=[];
 for(let t=day(start);t<=day(end);t+=DAY){const d=date(t),idx=rows.length,plain=baseline*Math.pow(1+growth,idx/7);let candidates=events.filter(e=>inside(d,e)).map(e=>({event:e,value:Number.isFinite(effects[e.id])?effects[e.id]:learned?.campaigns[e.id]?.uplift})).filter(c=>Number.isFinite(c.value));candidates.sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));const campaign=candidates[0];let weekendMultiplier=1;
 // Normalize weekend/weekday factors to preserve a seven-day average at zero campaign uplift.
 const w=Number.isFinite(weekendEffect)?weekendEffect:0;const norm=(5+2*(1+w))/7;weekendMultiplier=(weekend(d)?1+w:1)/norm;
 const adjusted=plain*weekendMultiplier*(1+(campaign?.value||0));rows.push({date:d,baseline:plain,scenario:Math.max(0,adjusted),low:Math.max(0,adjusted*(1-spread)),high:Math.max(0,adjusted*(1+spread)),event:campaign?.event.name||'',eventUplift:campaign?.value??null});}
 return {baseline,total:rows.reduce((s,r)=>s+r.scenario,0),plainTotal:rows.reduce((s,r)=>s+r.baseline,0),rows,sourceCount:selected.length,sourceStart:selected[0].start,sourceEnd:selected.at(-1).end,currency:selected.at(-1).currency,tz:selected.at(-1).tz};}
root.BGForecast={events,additive,select,learn,project,weekend};
})(typeof window==='undefined'?globalThis:window);
