/* Evidence-weighted planning judgments. Coefficients are disclosed assumptions, not learned elasticities. */
(()=>{'use strict';
const finite=Number.isFinite,sum=a=>a.reduce((s,v)=>s+v,0);
function inferBfcm(plan,traffic){
 if(!plan?.plan||!traffic?.current||traffic.channels.length!==4)return null;
 const c=traffic.current,channels=traffic.channels;
 if(!(c.gmv>0)||channels.some(x=>x.current.start!==c.start||x.current.end!==c.end)||Math.abs(sum(channels.map(x=>x.current.gmv))-c.gmv)>.05)return null;
 const groups=[{label:'크리에이터',entities:['Affiliate'],lift:.25,reason:'시딩 콘텐츠 공급 확대와 행사 구매 수요. 최근 매출 약세·게시 시차를 고려해 큰 폭 성장은 제외.'},{label:'판매자 LIVE',entities:['Seller LIVE'],lift:.20,reason:'행사 중 실시간 구매 설명·혜택 안내 가능. 추가 방송·예산 확대는 가정하지 않음.'},{label:'판매자 영상·상품 카드',entities:['Seller video','Seller product card'],lift:.10,reason:'기존 콘텐츠와 쇼핑 수요의 완만한 개선. 작은 할인폭·추가 운영 확대 미확정을 반영.'}].map(g=>{const gmv=sum(channels.filter(x=>g.entities.includes(x.entity)).map(x=>x.current.gmv));return {...g,gmv,share:gmv/c.gmv,contribution:gmv/c.gmv*g.lift};});
 const weighted=sum(groups.map(x=>x.contribution)),lift=Math.round(weighted/.05)*.05;
 return {method:'channel-weighted-judgment-v1',start:c.start,end:c.end,groups,weighted,lift,centerFactor:1+lift,lowFactor:1,highFactor:1.4,assumed:true,note:'매출 비중은 실측, 채널별 상승률은 분석자 판단. 동일 규모·카테고리 평균 또는 인과효과 추정치 아님. 범위는 확률구간 아님.'};
}
function creativeReview(records,currency,asOf,target){
 const current=BG.latest(records),coverage=current.filter(r=>r.module==='ads'&&r.complete&&!r.estimated&&r.creativeSourceComplete&&typeof r.creativeSource==='string');
 const all=current.filter(r=>r.module==='creative'&&r.complete&&!r.estimated&&(r.fullSource||coverage.some(s=>s.brandId===r.brandId&&s.start===r.start&&s.end===r.end&&s.tz===r.tz&&s.currency===r.currency&&s.creativeSource===r.source))&&r.currency===currency&&r.end<=asOf),end=all.map(r=>r.end).sort().at(-1);if(!end)return null;
 const latest=all.filter(r=>r.end===end),start=latest.map(r=>r.start).sort().at(-1),tz=latest.find(r=>r.start===start)?.tz;
 const rows=latest.filter(r=>r.start===start&&r.tz===tz&&r.creativeType==='Video'&&['cost','revenue','skuOrders','impressions','clicks'].every(k=>finite(r.metrics[k]))).map(r=>({...r,account:r.account||r.creatorName,roi:r.metrics.cost>0?r.metrics.revenue/r.metrics.cost:null,ctr:r.metrics.impressions>0?r.metrics.clicks/r.metrics.impressions:null}));
 if(!rows.length)return null;const cost=sum(rows.map(r=>r.metrics.cost)),orders=sum(rows.map(r=>r.metrics.skuOrders)),cpo=orders>0?cost/orders:null,threshold=finite(cpo)?2*cpo:null;
 const weak=threshold===null?[]:rows.filter(r=>r.metrics.cost>=threshold&&(r.metrics.skuOrders===0||(r.metrics.skuOrders>=3&&r.roi<target))).sort((a,b)=>b.metrics.cost-a.metrics.cost);
 const strong=rows.filter(r=>r.metrics.skuOrders>=5&&r.metrics.cost>0&&r.roi>=target).sort((a,b)=>b.metrics.revenue-a.metrics.revenue);
 const products=[...new Set(rows.map(r=>r.productId))].map(pid=>{const a=rows.filter(r=>r.productId===pid),cost=sum(a.map(r=>r.metrics.cost)),revenue=sum(a.map(r=>r.metrics.revenue));return {pid,count:a.length,cost,revenue,orders:sum(a.map(r=>r.metrics.skuOrders)),roi:cost>0?revenue/cost:null,weak:weak.filter(r=>r.productId===pid).length,strong:strong.filter(r=>r.productId===pid).length};});
 return {start,end,tz,age:Math.max(0,BG.days(end,asOf)-1),threshold,cpo,target,weak,strong,products,note:'전체 추출물 중 Video 행만 비교. Product card·Images 제외. 목표 ROI는 손익분기점이 아니며 귀속 지연·집행 변화는 반영 불가. 자동 중단·부스팅 지시가 아닌 최신 재조회 후보.'};
}
function review(x,records){const t=x.traffic,weak=t?.channels.slice().sort((a,b)=>a.gmvChange-b.gmvChange)[0]||null,a=x.ads[0];return {weakChannel:weak,atcChange:t&&finite(t.current.atcRate)&&finite(t.previous.atcRate)?t.current.atcRate-t.previous.atcRate:null,adDecision:a?.current?(a.current.roi<a.target?'확대 보류 · 저효율 소재 재확인':'제한적 확대 검토 · 최신 소재 확인'):null,creative:creativeReview(records,x.currency,x.asOf,a?.target),priceAlerts:x.prices.filter(p=>p.reverse)};}
globalThis.BGOperatingAssessment={inferBfcm,creativeReview,review};
})();

