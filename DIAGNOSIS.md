# Integrated 30-day diagnosis

The diagnosis page uses the current brand's browser-local records. It selects a coherent completed daily shop source and requires two fully observed adjacent 30-day windows. Entity, currency, timezone, completion and aggregation basis remain separate. Missing values never become zero. Product results are internal comparisons and are not added to shop GMV.

GMV is decomposed into impressions, clicks/impressions, orders/clicks and GMV/orders. Factor contributions are the marginal product changes averaged across all 24 permutations. They reconcile to the actual GMV difference. This Shapley allocation is descriptive arithmetic, not a causal estimate. With missing traffic, a two-factor orders and AOV bridge is disclosed.

Conditional single-factor recovery equals normal 30-day forecast times max(previous factor/current factor minus one, zero). Hold other factors constant and do not sum these overlapping opportunities. The execution plan uses previous 30-day GMV as an automatic reference: additional GMV divided by observed AOV, then orders per click and CTR yields required orders, clicks and impressions. This is a conditional workload, not predicted acquisitions or a budget recommendation.

Forecasts reuse rolling-origin model selection and total-error scenarios. Model-implied AOV divides independent GMV and order forecasts without claiming a joint probability interval. Ads ROI and CPO use the same available contiguous daily block and are never extrapolated from four days to a month. Current target ROI is a planning reference, not historical configuration or profit break-even.

Automations use sent-positive campaigns from one observation date. Backlog requests sum each campaign's remaining times its own request/sent ratio. Daily dispatch requirement is remaining divided by 30. Snapshot maturity, duplicate contacts and different cohorts prevent multiplication with sample, content and sales rates. Customer metrics remain monthly distinct observations. Source aggregates and individual top rows overlap and are not summed.

Max delivery budget references use existing positive-cost campaign reports linked to one observed product ID. Historical daily spend is rounded upward to an operational ten-dollar step. Verify the current mode, product mix and latest seven-day actual spend before applying. No ad settings or spending are changed by this page.

References: https://doi.org/10.1515/9781400881970-018 and https://ads.tiktok.com/resources/help/article/how-to-turn-on-max-delivery-optimization-for-a-product-in-your-product-gmv .

Run diagnostic-tests.cjs to verify exact attribution, permutation invariance, complete windows, timezones, aggregation bases, missing versus zero and empty-brand handling. Private real-data checks remain outside this public repository.
