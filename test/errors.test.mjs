import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
    apiErrorCodeSchema,
    apiErrorSchema,
    JobErrorCode,
    jobErrorCodeSchema,
    RequestErrorCode,
} from '../dist/index.js'

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
})
