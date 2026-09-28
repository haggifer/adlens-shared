---
'adlens-shared': minor
---

Breaking: `VideoMimeType` drops `Mpeg` (`video/mpeg`) and `Flv` (`video/x-flv`). Gemini reads them, but browsers
can't play them, so the web app could neither preview nor replay such uploads.
