# Candidate seed discovery

Run `node scripts/viral-candidate-engine.mjs`. The original 12 seeds are always
scored. Discovery fetches the direct publisher RSS feeds declared in
`candidate-discovery.mjs`, then scores newly qualified categories through the
existing attention/supplier research pipeline. Feed failures add no evidence.
This process writes research reports only; it does not create catalog listings,
Stripe prices, or supplier orders.

The maintained taxonomy restricts discovery to explicit home, cleaning and
organization categories. To expand coverage, add a unique canonical slug,
category, display name, query and narrowly defined phrase aliases to `taxonomy`.
Review aliases for ambiguity and overlap with existing seeds. Matching ignores
case, whitespace and hyphen style, but requires contiguous phrases with word
boundaries. Titles indicate research interest, not an endorsement, positive
sentiment, a particular SKU, or a verified product claim.

Admission requires two distinct article titles/URLs from at least two configured
publisher ownership groups within the preceding 30 days. Only HTTPS article URLs
on the configured publisher host count. Missing, invalid and future publication
dates are rejected. Duplicate normalized titles and URLs (without tracking query
strings or fragments) count once. Aggregator names never establish independence.
Maintain publisher ownership groups when adding or changing feed sources.

`growth-reports/viral-seed-pool.json` retains pending and qualified evidence across
runs using a temporary write followed by rename. Each run revalidates stored
evidence against the current dictionary and source allowlist. Categories become
observing when they lose the two-publisher threshold and disappear when all
evidence exceeds 30 days. Missing or malformed JSON starts an empty pool; other
filesystem errors stop the run instead of silently overwriting state. Run one
engine process at a time; concurrent state writers are not supported.

Dynamic categories use a conservative fixed video-fit prior of 0.5, not a measured
video performance claim. Every candidate remains unlisted with promotion,
freight, media rights and live Stripe pricing gates false. CJ search results
remain preliminary supplier evidence and do not satisfy those gates. This change
does not alter the existing CJ response adapter.

Validation: `node --test scripts/candidate-discovery.test.mjs`. Tests mock feed
headlines and network responses; they do not contact publishers or suppliers.
