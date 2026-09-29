import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
    isoTimestampSchema,
    MAX_DURATION_S,
    MAX_UPLOAD_BYTES,
    MIN_PASSWORD_LENGTH,
    QUOTA_WINDOW_MS,
} from '../dist/index.js'

test('the shared limits match what the API enforces', () => {
    assert.equal(MAX_DURATION_S, 60)
    assert.equal(MAX_UPLOAD_BYTES, 200_000_000)
    assert.equal(MIN_PASSWORD_LENGTH, 8)
    assert.equal(QUOTA_WINDOW_MS, 7 * 24 * 60 * 60 * 1000)
})

test('timestamps are UTC ISO-8601 strings, with or without fractional seconds', () => {
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00.000Z').success, true)
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00Z').success, true)
})

test('timestamps reject non-UTC offsets, missing zones, and non-date strings', () => {
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00.000+02:00').success, false)
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00.000').success, false)
    assert.equal(isoTimestampSchema.safeParse('not-a-date').success, false)
})
