/* Separate stock display quantities, search keywords and storefront populations. */
(()=>{'use strict';const f=(key,label,unit='count')=>({key,label,unit,description:''});
BG.schemas.inventory.fields.push(f('totalDisplayed','표시 총재고'),f('availableDisplayed','표시 판매 가능'),f('fbtStored','FBT 보관량'),f('reserved','예약 잠금'),f('committed','주문 확정 잠금'),f('sales30','화면 최근 30일 판매'),f('forecast30','플랫폼 향후 30일 예측'),f('suggestedRestock','플랫폼 권장 입고'));
BG.schemas.searchKeyword={name:'숍 검색어',icon:'⌕',desc:'검색어 원문별 성과 · 검색 결과 방문자와 상품 조회 구분',fields:[f('searchVisitors','검색 결과 방문자'),f('productViews','상품 조회'),f('customers','구매 고객'),f('orders','주문'),f('gmv','GMV','money')],hero:['searchVisitors','productViews','orders','gmv']};
BG.schemas.storefront={name:'숍 페이지·추천',icon:'▦',desc:'숍 페이지와 추천 영역의 독립 집계',fields:[f('gmv','GMV','money'),f('orders','주문'),f('skuOrders','SKU 주문'),f('items','판매 수량'),f('pageViews','페이지 조회'),f('uniqueViews','고유 조회'),f('customers','추정 고객'),f('impressions','상품 노출'),f('recommendedMin','일 추천 상품 최소'),f('recommendedMax','일 추천 상품 최대'),f('viewOrderRate','조회 대비 주문율','percent')],hero:['gmv','orders','pageViews','items']};
BG.schemas.fulfillment={name:'샘플 배송 운영',icon:'▣',desc:'승인 후 물류 처리 방식 · 배송 완료율과 구분',fields:[f('autoDispatch','승인 후 자동 출고 활성')],hero:['autoDispatch']};
})();
