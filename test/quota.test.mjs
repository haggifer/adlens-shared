import assert from 'node:assert/strict'
import { test } from 'node:test'
import { quotaResponseSchema, quotaSchema } from '../dist/index.js'

test('a quota counts recent runs, is capped or unlimited, and says when a run frees up', () => {
    assert.equal(quotaSchema.safeParse({ used: 2, limit: 3, nextFreeAt: null }).success, true)
    assert.equal(quotaSchema.safeParse({ used: 3, limit: 3, nextFreeAt: '2026-10-01T10:00:00.000Z' }).success, true)
    assert.equal(quotaSchema.safeParse({ used: 40, limit: null, nextFreeAt: null }).success, true)
})

test('used is a non-negative count and limit, when set, is a positive count', () => {
    assert.equal(quotaSchema.safeParse({ used: -1, limit: 3, nextFreeAt: null }).success, false)
    assert.equal(quotaSchema.safeParse({ used: 0, limit: 0, nextFreeAt: null }).success, false)
    assert.equal(quotaSchema.safeParse({ used: 0, limit: -1, nextFreeAt: null }).success, false)
})

test('nextFreeAt is required', () => {
    assert.equal(quotaSchema.safeParse({ used: 0, limit: 3 }).success, false)
})

test('the quota response wraps a single quota', () => {
    assert.equal(quotaResponseSchema.safeParse({ quota: { used: 0, limit: 3, nextFreeAt: null } }).success, true)
})
