---
'adlens-shared': minor
---

Add restarting a failed analysis: `isJobRestartable(job, now?)`, with `RESTARTABLE_JOB_ERRORS` and
`JOB_START_WINDOW_MS` (how long after its creation a job can still be started or restarted), and the
`JOB_NOT_RESTARTABLE` request error code for the API's `POST /v1/jobs/:id/restart`.
