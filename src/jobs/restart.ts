import { JobErrorCode } from '../errors/schema.js'
import { type Job, JobStatus } from './schema.js'

// A job not analyzed this long after its creation never will be: one still pending is closed, and the video of one that
// ended without a result is deleted. Until then, a failed run can be restarted on the video it already has.
export const JOB_START_WINDOW_MS = 6 * 60 * 60 * 1000

// Failures the video isn't to blame for, so a restart on the same video may succeed. A rejected video would be rejected
// again, and an upload that never arrived leaves nothing to restart.
export const RESTARTABLE_JOB_ERRORS: JobErrorCode[] = [
    JobErrorCode.AnalysisFailed,
    JobErrorCode.AnalysisTimedOut,
    JobErrorCode.VideoCheckFailed,
]

export const isJobRestartable = (job: Pick<Job, 'status' | 'errorCode' | 'createdAt'>, now = Date.now()): boolean =>
    job.status === JobStatus.Error &&
    job.errorCode !== undefined &&
    RESTARTABLE_JOB_ERRORS.includes(job.errorCode) &&
    now - Date.parse(job.createdAt) < JOB_START_WINDOW_MS
