import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
    apiErrorCodeSchema,
    apiErrorSchema,
    JobErrorCode,
    jobErrorCodeSchema,
    RequestErrorCode,
} from '../dist/index.js'

test('JobErrorCode pins the codes a job can fail with', () => {
    assert.deepEqual(Object.values(JobErrorCode), [
        'VIDEO_UNREADABLE',
        'VIDEO_TOO_LONG',
        'VIDEO_TOO_LARGE',
        'UNSUPPORTED_FORMAT',
        'ANALYSIS_FAILED',
        'ANALYSIS_TIMED_OUT',
    ])
    assert.deepEqual(jobErrorCodeSchema.options, Object.values(JobErrorCode))
})

test('RequestErrorCode pins the codes a request can fail with', () => {
    assert.deepEqual(Object.values(RequestErrorCode), [
        'UPLOAD_INCOMPLETE',
        'QUOTA_EXCEEDED',
        'SIGN_UP_REQUIRED',
        'EMAIL_CONFIRMATION_REQUIRED',
        'CHALLENGE_REQUIRED',
        'CHALLENGE_FAILED',
        'NETWORK_QUOTA_EXCEEDED',
        'DISPOSABLE_EMAIL',
        'JOB_NOT_PENDING',
        'JOB_IN_PROGRESS',
        'VALIDATION_FAILED',
        'UNAUTHENTICATED',
        'NOT_FOUND',
        'RATE_LIMITED',
        'UNAVAILABLE',
        'INTERNAL',
    ])
})

test('apiErrorCodeSchema accepts every job and request error code, and nothing else', () => {
    for (const code of [...Object.values(JobErrorCode), ...Object.values(RequestErrorCode)]) {
        assert.equal(apiErrorCodeSchema.safeParse(code).success, true, code)
    }
    assert.equal(apiErrorCodeSchema.safeParse('NOT_A_REAL_CODE').success, false)
})

test('jobErrorCodeSchema rejects request-only codes', () => {
    assert.equal(jobErrorCodeSchema.safeParse(RequestErrorCode.QuotaExceeded).success, false)
})

test('the API error body needs a status, a code and a message, and may carry validation issues', () => {
    const error = { statusCode: 400, errorCode: 'VALIDATION_FAILED', message: 'bad request' }

    assert.equal(apiErrorSchema.safeParse(error).success, true)
    assert.equal(apiErrorSchema.safeParse({ ...error, issues: [{ path: ['email'] }] }).success, true)
    assert.equal(apiErrorSchema.safeParse({ ...error, statusCode: 400.5 }).success, false)
    assert.equal(apiErrorSchema.safeParse({ ...error, errorCode: 'NOT_A_REAL_CODE' }).success, false)
})
