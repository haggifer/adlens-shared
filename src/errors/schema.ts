import { z } from 'zod'

// Why a job ended in `error`. The client maps each code to its own copy; internal details stay in the API logs.
export enum JobErrorCode {
    VideoUnreadable = 'VIDEO_UNREADABLE',
    VideoTooLong = 'VIDEO_TOO_LONG',
    VideoTooLarge = 'VIDEO_TOO_LARGE',
    UnsupportedFormat = 'UNSUPPORTED_FORMAT',
    AnalysisFailed = 'ANALYSIS_FAILED',
    AnalysisTimedOut = 'ANALYSIS_TIMED_OUT',
    // The video couldn't be checked (storage or the prober failed), so the run never started.
    VideoCheckFailed = 'VIDEO_CHECK_FAILED',
    // No complete upload when the run was started, or none hours after the job was created.
    UploadFailed = 'UPLOAD_FAILED',
}

export enum RequestErrorCode {
    UploadIncomplete = 'UPLOAD_INCOMPLETE',
    QuotaExceeded = 'QUOTA_EXCEEDED',
    // An anonymous user has run their one analysis, or the anonymous analyses allowed from one network are used up; an
    // account with a confirmed email lifts both rules.
    SignUpRequired = 'SIGN_UP_REQUIRED',
    // The same rules for an account whose email isn't confirmed yet: confirming it lifts them.
    EmailConfirmationRequired = 'EMAIL_CONFIRMATION_REQUIRED',
    ChallengeRequired = 'CHALLENGE_REQUIRED',
    ChallengeFailed = 'CHALLENGE_FAILED',
    // Everyone on one network together reached its weekly cap.
    NetworkQuotaExceeded = 'NETWORK_QUOTA_EXCEEDED',
    // Sent by sign-up as a Better Auth error code, not in the API error body.
    DisposableEmail = 'DISPOSABLE_EMAIL',
    JobNotPending = 'JOB_NOT_PENDING',
    // The job is being verified, queued or analyzed, so it can't be deleted yet.
    JobInProgress = 'JOB_IN_PROGRESS',
    // Another preset of this user has the name, ignoring case.
    PresetNameTaken = 'PRESET_NAME_TAKEN',
    // The user already keeps the most presets allowed (`MAX_PRESETS`).
    PresetLimitReached = 'PRESET_LIMIT_REACHED',
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
