/* Store traffic at its own grain; never sum an All row with its channels. */
(()=>{'use strict';const f=(key,label,unit='count')=>({key,label,unit,description:''});
BG.schemas.traffic={name:'상품·채널 트래픽',icon:'▦',desc:'숍 채널별 일별 성과와 상품별 기간 합계를 구분',fields:[f('gmv','GMV','money'),f('orders','Orders'),f('skuOrders','SKU orders'),f('items','Items sold'),f('impressions','Product impressions'),f('clicks','Product clicks'),f('atc','Add-to-cart count'),f('refunds','Refunds','money')],hero:['gmv','impressions','clicks','skuOrders']};
})();
