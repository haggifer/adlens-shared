import { JobErrorCode } from '../errors/schema.js'
import { type Job, JobStatus } from './schema.js'

// A job not analyzed this long after its creation never will be: one still pending is closed, and the video of one that
// ended without a result is deleted. Until then, a failed run can be restarted on the video it already has.
export const JOB_START_WINDOW_MS = 6 * 60 * 60 * 1000

// Restarts stop short of the start window, so a restart never meets the cleanup deleting the video at its end, whatever
// the clocks of the two processes say.
export const JOB_RESTART_WINDOW_MS = JOB_START_WINDOW_MS - 10 * 60 * 1000

// Failures the video isn't to blame for, so a restart on the same video may succeed. A rejected video would be rejected
// again, and an upload that never arrived leaves nothing to restart.
export const RESTARTABLE_JOB_ERRORS: JobErrorCode[] = [
    JobErrorCode.AnalysisFailed,
    JobErrorCode.AnalysisTimedOut,
    JobErrorCode.ModelUnavailable,
    JobErrorCode.VideoCheckFailed,
]

export const isJobRestartable = (job: Pick<Job, 'status' | 'errorCode' | 'createdAt'>, now = Date.now()): boolean =>
    job.status === JobStatus.Error &&
    job.errorCode !== undefined &&
    RESTARTABLE_JOB_ERRORS.includes(job.errorCode) &&
    now - Date.parse(job.createdAt) < JOB_RESTART_WINDOW_MS
