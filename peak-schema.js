/* Stock is a point-in-time snapshot per product; never summed as period activity. */
(()=>{'use strict';const f=(key,label,unit='count',description='')=>({key,label,unit,description});
BG.schemas.inventory={name:'재고',icon:'▣',desc:'판매 가능 재고·입고 예정·리드타임',fields:[f('onHand','판매 가능 재고','count','확인일 기준 판매 가능 수량'),f('inbound','입고 예정 수량','count','발주했지만 아직 판매 불가한 수량'),f('leadTimeDays','재입고 리드타임(일)','count','발주부터 판매 가능까지 걸리는 일수')],hero:['onHand','inbound','leadTimeDays']};
})();
