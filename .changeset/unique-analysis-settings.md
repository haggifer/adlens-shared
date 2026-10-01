---
'adlens-shared': minor
---

`analysisSettingsSchema` accepts each platform, placement and market at most once, so no list is longer than its enum;
a repeated option is rejected. Narrows what the API accepts.
