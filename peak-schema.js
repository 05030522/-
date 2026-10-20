/* Unit economics and stock are point-in-time snapshots per product; never summed as period activity. */
(()=>{'use strict';const f=(key,label,unit='count',description='')=>({key,label,unit,description});
BG.schemas.economics={name:'원가·수수료',icon:'＄',desc:'상품 1개 판매 시 남는 돈과 손익분기 ROI',fields:[f('price','평균 판매가','money','할인 후 실제 결제 단가'),f('cogs','상품 원가','money','1개당 매입·제조 원가'),f('shippingCost','배송·포장비','money','1개당 셀러 부담 배송·포장비'),f('platformFeePct','플랫폼 수수료','percent','판매가 대비 %'),f('commissionPct','평균 크리에이터 커미션','percent','전체 GMV 대비 % (커미션 총액 ÷ GMV)'),f('refundPct','환불률','percent','GMV 대비 환불 금액 %')],hero:['price','cogs','platformFeePct','commissionPct']};
BG.schemas.inventory={name:'재고',icon:'▣',desc:'판매 가능 재고·입고 예정·리드타임',fields:[f('onHand','판매 가능 재고','count','확인일 기준 판매 가능 수량'),f('inbound','입고 예정 수량','count','발주했지만 아직 판매 불가한 수량'),f('leadTimeDays','재입고 리드타임(일)','count','발주부터 판매 가능까지 걸리는 일수')],hero:['onHand','inbound','leadTimeDays']};
})();
