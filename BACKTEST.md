# Forecast evaluation and regularized effects

`forecast-validation.js` adds rolling-origin comparisons without uploading user data.

- Scope: complete daily, additive metrics from one entity, currency and timezone. Never expand period aggregates into fabricated daily observations. Incomplete records remain excluded.
- Origins start after 56 training days and advance seven days. Evaluate complete 7-day and 30-day windows. Require six origins before selection. The final third of origins is for reporting; earlier origins choose the model using total-window WAPE. Exclude any development window whose actual end is not before the first holdout start (embargo).
- Five fixed candidates: previous automatic model, regularized trend/effects, last same weekday repeated, trailing 28-day mean, and damped Holt trend. Choose only by development WAPE. Display holdout results for every candidate, including worse results. Do not reselect using holdout scores.
- WAPE = sum(abs(predicted window total - actual window total))/sum(actual window total). Bias uses signed error. MAE is in original window-total units. Overlapping 30-day windows are not independent. Scenario coverage counts windows whose actual total falls inside the descriptive conservative–Bull range; it is not a probability estimate or calibrated confidence interval.
- Historical validation is retrospective and assumes the supplied calendar was known. Parameter and method development can benefit from hindsight; this small dataset does not establish prospective accuracy. Re-evaluate on subsequently arriving data.

The regularized candidate uses non-event weekend data over up to 112 days, requiring eight weekend and twenty weekday observations. Log trends use median slopes from pairs separated 7–28 days, capped at ±25% per week. Ratios use 20/80 percentile winsorization. Weekend and event ratios shrink toward zero using n/(n+14). Weekend/holiday effects are capped at ±50%; campaign effects at -50%/+100%. These are fixed stabilization rules, not learned facts. Trends extend at most 28 days. Same-weekday event comparisons use prior 56-day non-event controls, at least 14 controls and two same weekdays per event date. Never transfer a summer campaign effect to BFCM. Overlapping adjustments apply only once.

When the selected model is a simple baseline, no additional weekend/campaign uplift is applied. The weekday baseline already repeats observed weekdays. Current 60-day/year-end projections extend the 30-day selection and are not directly tested at that horizon. Fewer than 98 daily observations use the earlier automatic model.

Run `node backtest-tests.cjs`. The committed tests use synthetic fixtures. Private real-data validation is kept outside the repository. Existing validation, forecasting and core tests remain applicable.


## Data-derived scenario totals (2026-10-15)

`forecast-models.js` adds a damped Holt candidate with fixed alpha {0.15, 0.35, 0.65}, beta {0.02, 0.1} and phi {0.8, 0.95}. Fit level/trend on up to 84 completed daily observations; pick parameters by training-only one-step MAE after a seven-observation initialization. This is a bounded custom implementation inspired by Holt, not a complete ETS state-space package. No unobserved campaign lift is injected.

For every forecast including evaluation folds, calibrate totals from at most 12 previous weekly origins using the same model, actual forecast horizon and lead gap. Each pseudo-origin uses only earlier observations and at least 28 training days. Its actual target window must finish within the calling training set. Normalize (actual total - predicted total) by that origin's trailing 28-day mean × horizon. Require four valid error windows. Apply the empirical 10th/90th percentiles to the current trailing 28-day reference total and expand to include the point forecast, with a zero floor. These expanded endpoints are descriptive scenarios, not guaranteed quantiles or calibrated 80% coverage. Overlapping error windows are dependent. If errors are all on one side, an endpoint can equal the point forecast. Constant/zero observations may legitimately yield identical cases; never manufacture variance. Fewer than four error windows retain the earlier empirical-level fallback. Both data and date gap influence the range. Horizon >30 can calibrate if enough history exists, but point-model selection still uses 30-day evaluation and is not independently validated for that length.

Each case now shows its own growth against one common denominator: the latest up-to-28 completed daily mean × forecast days. Period-only data retain their stated period reference. A selected mean forecast has a legitimate 0% central growth. Scenario graph endpoints are the total endpoints allocated proportionally across the point path; they are not daily prediction intervals.

Sources: https://otexts.com/fpp3/holt.html and https://otexts.com/fpp3/toolbox.html (rolling-origin evaluation and distributional forecasts).
