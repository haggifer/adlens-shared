import { type Job, JobStatus } from './schema.js'

// A job not analyzed this long after its creation never will be: one still pending is closed, and the video of one that
// ended without a result is deleted. Until then, a failed run can be restarted on the video it already has.
export const JOB_START_WINDOW_MS = 6 * 60 * 60 * 1000

// Whether to offer a restart: a failed run, not restarted yet, within the start window. The API also checks that the
// video is still stored, which a client can't see.
export const isJobRestartable = (job: Pick<Job, 'status' | 'restartedAs' | 'createdAt'>, now = Date.now()): boolean =>
    job.status === JobStatus.Error && !job.restartedAs && now - Date.parse(job.createdAt) < JOB_START_WINDOW_MS
