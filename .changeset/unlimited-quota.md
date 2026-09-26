---
'adlens-shared': minor
---

Breaking: `quotaSchema.limit` is now nullable. `null` marks an unlimited account, whose runs are counted but never
capped; clients must treat it as "no limit" rather than a number.
