---
'adlens-shared': minor
---

Analysis without an account: `createJobInputSchema` and `createSampleJobInputSchema` accept an optional
`challengeToken` (a Cloudflare Turnstile token, 1-2048 characters), and `RequestErrorCode` adds `SIGN_UP_REQUIRED`,
`CHALLENGE_REQUIRED`, `CHALLENGE_FAILED`, `NETWORK_QUOTA_EXCEEDED` and `DISPOSABLE_EMAIL`.
