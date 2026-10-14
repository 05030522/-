# Automatic scenario forecasts

Manual growth, weekend, campaign and spread fields have been removed. Only the scope, measure and horizon are selected. forecast-auto.js calculates recent robust daily levels, median pairwise log slopes, empirical 20/50/80 percentile scenario levels, and supported weekend/campaign corrections. Sparse observations use equal scenario levels and disclose missing evidence. Historical saved manual forecastSettings remain in backups but are not used by automatic forecasts.

A rolling 56-day recency window is applied before choosing a common grain. Incomplete, overlapping, currency/timezone mismatched, cumulative snapshot and cohort records are excluded. A prior campaign coefficient is never transferred to another event automatically. Scenario bounds are descriptive observed levels, not calibrated probability intervals. Growth is capped at +/-25% weekly and extrapolated at most 28 days; these are stability rules, not observed effects. Period growth compares the central scenario against the recent reference level over equal forecast days. Customer unique counts remain excluded from additive projections.

Run node forecast-auto-tests.cjs and node forecast-tests.cjs. The existing evidence explanations and 2026 date sources remain available in the dashboard. No personal data or storage changes are deployed.
