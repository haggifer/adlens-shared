---
'adlens-shared': minor
---

Breaking: remove `audience` and `brand` from the analysis settings. No rule was selected or judged by them; they only
added free text to the review prompt. Settings now reject them as unknown keys.
