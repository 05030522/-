# Brand Growth

브랜드별 TikTok Shop 지표를 기간별로 저장하는 개인용 대시보드입니다. 설치·빌드·외부 라이브러리·API 키가 필요 없습니다. HTML, CSS, JavaScript만 사용합니다.

## GitHub Pages에 올리기

1. GitHub에서 새 저장소(예: `brand-growth-hub`)를 만드세요.
2. 이 폴더 **안의 파일들**을 저장소 최상위에 업로드하세요. `index.html`이 최상위여야 합니다.
3. 저장소 **Settings → Pages → Build and deployment → Deploy from a branch**를 선택하세요.
4. Branch는 `main`, Folder는 `/ (root)`를 선택하고 Save를 누르세요.
5. 배포가 완료되면 `https://05030522.github.io/brand-growth-hub/`에서 사용합니다. 저장소 이름이 다르면 URL도 달라집니다.

로컬 확인은 `index.html`을 브라우저로 여세요. 브라우저별 file URL 저장 동작이 다를 수 있으므로, 본 사용은 GitHub Pages 주소에서 권장합니다. 로컬 테스트 서버는 `python -m http.server 8080`으로 실행할 수 있습니다.

## 데이터 저장의 범위

- 기록은 **현재 주소의 현재 브라우저 localStorage**에 저장됩니다. 서버·GitHub에는 전송하지 않습니다.
- 새로고침·브라우저 재실행 뒤에도 보관되지만, 브라우저 데이터 삭제/시크릿 모드/저장소 차단/기기 변경 시 복구되지 않을 수 있습니다.
- `전체 JSON 백업`을 정기적으로 다운로드하세요. 다른 기기에서는 `가져오기`로 복원합니다.
- GitHub Pages의 같은 도메인(`05030522.github.io`) 아래 다른 앱은 같은 브라우저 저장 영역에 접근할 수 있습니다. 신뢰할 수 있는 코드만 같은 도메인에 배포하세요.
- 사이트 주소를 열 수 있다고 해서 다른 방문자가 사용자의 브라우저 기록을 볼 수 있는 것은 아닙니다. 다만 같은 PC·브라우저 프로필을 공유하면 기록도 공유됩니다.
- 기기 간 자동 동기화·서버 백업·로그인은 구현하지 않았습니다. 필요한 경우 별도 인증과 데이터베이스를 연결해야 합니다.
- 공개 저장소에 실제 매출 JSON, CSV, 스크린샷을 업로드하지 마세요. 전달된 비비랩 초기자료는 사이트의 `가져오기`에서만 여세요.

## 사용 순서

1. `새 브랜드`로 이름·통화·시간대·목표 ROI를 지정합니다. 모든 브랜드에 동일 메뉴가 적용됩니다.
2. `지표 입력`에서 메뉴, 대상, 시작·종료일, 시간대를 선택하고 측정값을 입력합니다.
3. 브랜드 전체 합계는 대상에 정확히 `전체`를 입력합니다. 개별 캠페인이나 상품은 고유 이름/ID를 사용합니다.
4. 실제로 완료된 기간만 `기간 완료`에 체크합니다. 미완료 자료는 증감률에서 제외합니다.
5. 동일 브랜드/메뉴/대상/기간/시간대/통화/코호트에 재입력하면 새 수정 버전이 만들어집니다. 이전 값은 `입력·수정 이력 → 이전 수정 버전 표시`에서 확인합니다.
6. `기록 보관`은 삭제 대신 새 보관 버전을 남깁니다. 이력에서 `복원본 추가`로 복원할 수 있습니다.
7. 캠페인별 t.ROI 변경은 GMV Max 메뉴의 `목표 ROI 변경 기록`에 남깁니다. 이 기능은 실제 광고 설정을 변경하지 않습니다.

## 분석 규칙

- 숍 GMV, 광고 귀속 매출, 어필리에이트 GMV, 프로모션 GMV를 합산하지 않습니다.
- 각 메뉴의 전체 카드는 `전체` 기록만 사용합니다. 일부 상품·캠페인 기록을 임의로 전체라고 추정하지 않습니다.
- 대상별 표는 대상별 최신 기록입니다. 다른 기간 자료가 나란히 표시될 수 있어 각 행에 기간을 명시합니다. 정확한 기간 비교는 상단 기간 필터를 사용하세요.
- 추이는 선택된 최신/조회 기록과 같은 기간 길이·시간대·통화의 기간 활동 기록을 사용합니다. 점의 x좌표는 기간 종료일입니다. 중첩된 기간은 합산하지 않습니다.
- 증감률은 같은 대상·시간대·통화의 동일 길이, 직전 연속 완료 기간에만 표시합니다. 이전 값 0은 증감률을 만들지 않습니다. 코호트의 증감률도 자동 계산하지 않습니다.
- 빈칸은 0이 아닙니다. ROI=귀속 매출/비용, CPO=비용/SKU 주문, 객단가=GMV/Orders. 분모 0은 `—`입니다.
- 광고 CVR은 광고 전환 수/클릭입니다. SKU 주문을 광고 전환 수로 대체하지 않습니다.
- 45일·90일 샘플 ROI는 플랫폼 원본값입니다. 같은 기간 콘텐츠 GMV/샘플 원가로 재계산하지 않습니다.
- t.ROI 기본값 변경은 과거 데이터에 소급 적용되지 않습니다. 과거 기록에 목표가 없으면 미입력 상태를 유지합니다.
- 자료만으로 인과관계·순증 매출·수익성을 확정하거나 소재를 자동 제외하지 않습니다.

## 가져오기 / 내보내기

JSON은 브랜드와 모든 수정 이력·변경 로그를 포함합니다. 같은 ID의 동일 기록은 중복 추가하지 않으며, ID 충돌은 기존 자료를 덮어쓰지 않고 거절합니다. 저장 전 미리보기와 확인을 거칩니다.

CSV는 현재 브랜드로 가져옵니다. 플랫폼 원본 CSV를 바로 읽는 기능은 없으며 `CSV 양식` 형식을 사용하세요. 필수 열은 `module, entity, start, end`입니다. 통화/시간대가 없으면 브랜드 기본값을 사용합니다. `complete`는 `true`일 때만 완료입니다. `basis`는 `period` 또는 `cohort`이며 코호트는 `cohortStart,cohortEnd`가 필요합니다. 날짜 형식은 YYYY-MM-DD입니다. 숫자에는 통화 기호나 천 단위 쉼표를 넣지 마세요. 비율(시청률)은 0~100 단위입니다.

| module | 용도 | 주요 지표 열 |
|---|---|---|
| shop | 숍 전체 | gmv,orders,customers,items,visitors,refunds,creatorGmv,sellerVideoGmv,sellerLiveGmv,searchGmv,shopTabGmv |
| ads | GMV Max / 캠페인 | cost,revenue,skuOrders,targetRoi,dailyBudget,impressions,clicks,adConversions |
| products | 숍 상품 분석 | gmv,orders,items,visitors,creatorGmv,sellerLiveGmv,sellerVideoGmv,refunds |
| creative | 광고 소재 | cost,revenue,skuOrders,impressions,clicks,adConversions,view2s,view6s,completion |
| affiliate | 크리에이터 | gmv,orders,items,commission,refunds,videos,liveStreams,postedCreators,sellingCreators,videoGmv,liveGmv,cardGmv |
| samples | 샘플 | shipped,contentGmv,cogs,shipping,contents,roi45,roi90,approvedCohort,postedCohort,soldCohort |
| outreach | 아웃리치 | contacted,invited,messaged,added,requested,received,posted,selling |
| promotions | 프로모션 | gmv,orders,discount,liveDealGmv,productDiscountGmv,subscriptionGmv,couponGmv |

CSV 수식 삽입 방지를 위해 내보내는 텍스트의 위험한 시작 문자 앞에는 `'`를 붙입니다. 정확한 이력 복원에는 JSON을 사용하세요.

## 파일 구성

- `index.html`: 화면 구조
- `styles.css`: 반응형 디자인
- `core.js`: 검증, 계산, 버전·비교 규칙
- `app.js`: UI, 브라우저 저장, 입력·백업·차트
- `tests.cjs`: 순수 데이터 규칙 테스트 (`node tests.cjs`)
- `.nojekyll`: GitHub Pages 정적 배포

네트워크 요청·외부 추적·CDN은 없습니다. 예시 모드는 가상 데이터만 사용하며 저장되지 않습니다.
