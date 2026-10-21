/* Content scope is separate from ad attribution and creator sample cohorts. */
(()=>{'use strict';const f=(key,label,unit='count')=>({key,label,unit,description:''}),common=[f('gmv','콘텐츠 귀속 GMV','money'),f('directGmv','직접 GMV','money'),f('indirectGmv','간접 GMV','money'),f('skuOrders','귀속 SKU 주문'),f('views','조회'),f('impressions','상품 노출'),f('clicks','상품 클릭')];
BG.schemas.videoContent={name:'영상·캐러셀 성과',icon:'▷',desc:'영상 원본 집계 · 광고 소재 비용과 구분',fields:[...common,f('dailyCustomers','일별 고객'),f('productViewers','상품 조회자')],hero:['gmv','views','clicks','skuOrders']};
BG.schemas.liveContent={name:'연결 계정 LIVE',icon:'◉',desc:'LIVE Room ID별 조회기간 성과 · 전체 어필리에이트 LIVE와 구분',fields:[...common,f('items','귀속 판매 수량'),f('viewers','시청자'),f('durationMinutes','방송 시간(분)','number')],hero:['gmv','views','skuOrders','durationMinutes']};
})();
