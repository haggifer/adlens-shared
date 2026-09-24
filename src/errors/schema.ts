import { z } from 'zod'

// Why a job ended in `error`. The client maps each code to its own copy; internal details stay in the API logs.
export enum JobErrorCode {
    VideoUnreadable = 'VIDEO_UNREADABLE',
    VideoTooLong = 'VIDEO_TOO_LONG',
    VideoTooLarge = 'VIDEO_TOO_LARGE',
    UnsupportedFormat = 'UNSUPPORTED_FORMAT',
    AnalysisFailed = 'ANALYSIS_FAILED',
    AnalysisTimedOut = 'ANALYSIS_TIMED_OUT',
}

export enum RequestErrorCode {
    UploadIncomplete = 'UPLOAD_INCOMPLETE',
    QuotaExceeded = 'QUOTA_EXCEEDED',
    JobNotPending = 'JOB_NOT_PENDING',
    // The job is being verified or analyzed, so it can't be deleted yet.
    JobInProgress = 'JOB_IN_PROGRESS',
    ValidationFailed = 'VALIDATION_FAILED',
    Unauthenticated = 'UNAUTHENTICATED',
    NotFound = 'NOT_FOUND',
    RateLimited = 'RATE_LIMITED',
    Unavailable = 'UNAVAILABLE',
    Internal = 'INTERNAL',
}

export const jobErrorCodeSchema = z.enum(JobErrorCode)

export const apiErrorCodeSchema = z.enum({ ...JobErrorCode, ...RequestErrorCode })

// The body of every non-2xx API response.
export const apiErrorSchema = z.object({
    statusCode: z.number().int(),
    errorCode: apiErrorCodeSchema,
    message: z.string(),
    issues: z.array(z.unknown()).optional(),
})

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>
export type ApiError = z.infer<typeof apiErrorSchema>
