import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isoTimestampSchema } from '../dist/index.js'

test('timestamps are UTC ISO-8601 strings, with or without fractional seconds', () => {
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00.000Z').success, true)
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00Z').success, true)
})

test('timestamps reject non-UTC offsets, missing zones, and non-date strings', () => {
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00.000+02:00').success, false)
    assert.equal(isoTimestampSchema.safeParse('2026-09-23T10:00:00.000').success, false)
    assert.equal(isoTimestampSchema.safeParse('not-a-date').success, false)
})
