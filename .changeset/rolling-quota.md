---
'adlens-shared': minor
---

Breaking: the quota is a rolling window. `quotaSchema.windowStart` is replaced by `nextFreeAt`, the time the oldest
counted run stops counting (null when no run counts); `used` is the number of runs charged within the last
`QUOTA_WINDOW_MS`.
