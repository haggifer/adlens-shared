---
'adlens-shared': minor
---

Add restarting a failed analysis: `isJobRestartable(job, now?)`, with `RESTARTABLE_JOB_ERRORS` and
`JOB_START_WINDOW_MS` (how long after its creation a job can still be started) and `JOB_RESTART_WINDOW_MS` (10 minutes
shorter, for restarts), and the
`JOB_NOT_RESTARTABLE` request error code for the API's `POST /v1/jobs/:id/restart`. Add the `MODEL_UNAVAILABLE` job
error code for a run the AI model failed on its side (overloaded, rate-limited, erred or too slow).
