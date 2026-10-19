---
'adlens-shared': minor
---

Change the video limits: `MAX_DURATION_S` 60 → 180 (3 minutes), `MAX_UPLOAD_BYTES` 200 MB → 50 MB. The smaller upload
cap narrows the job input schemas, so a client still allowing up to 200 MB is refused above 50 MB.
