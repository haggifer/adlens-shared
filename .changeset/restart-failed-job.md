---
'adlens-shared': minor
---

Add restarting a failed analysis: `isJobRestartable(job, now?)` (a failed job, not restarted yet, within
`JOB_START_WINDOW_MS` of its creation), `restartedAs` on the public job (the job that runs a restarted one again), and
the `JOB_NOT_RESTARTABLE` request error code for the API's `POST /v1/jobs/:id/restart`. Add the `MODEL_UNAVAILABLE` job
error code for a run the AI model failed on its side (overloaded, rate-limited, erred or too slow).
