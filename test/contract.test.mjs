import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import {
    analysisSettingsSchema,
    apiErrorCodeSchema,
    createJobInputSchema,
    jobSchema,
    MAX_UPLOAD_BYTES,
    Placement,
    Platform,
    VideoMimeType,
} from '../dist/index.js'

const validFile = { name: 'ad.mp4', contentType: VideoMimeType.Mp4, size: 1000 }

test('settings default the list fields and reject unknown keys', () => {
    assert.deepEqual(analysisSettingsSchema.parse({ objective: 'Awareness' }), {
        platforms: [],
        placements: [],
        markets: [],
        objective: 'Awareness',
    })
    assert.equal(analysisSettingsSchema.safeParse({ objective: 'Awareness', userId: 'x' }).success, false)
})

test('a placement requires its platform', () => {
    const withoutPlatform = { objective: 'Conversion', placements: [Placement.MetaReels] }
    const withPlatform = { ...withoutPlatform, platforms: [Platform.Meta] }

    assert.equal(analysisSettingsSchema.safeParse(withoutPlatform).success, false)
    assert.equal(analysisSettingsSchema.safeParse(withPlatform).success, true)
})

test('uploads are limited to Gemini-readable video types and the size cap', () => {
    const settings = { objective: 'Conversion' }

    assert.equal(createJobInputSchema.safeParse({ settings, file: validFile }).success, true)
    assert.equal(
        createJobInputSchema.safeParse({ settings, file: { ...validFile, contentType: 'video/x-matroska' } }).success,
        false,
    )
    assert.equal(
        createJobInputSchema.safeParse({ settings, file: { ...validFile, size: MAX_UPLOAD_BYTES + 1 } }).success,
        false,
    )
})

test('the public job carries ISO timestamps and no storage internals', () => {
    const job = {
        id: 'j1',
        status: 'pending',
        settings: { objective: 'Conversion' },
        file: validFile,
        createdAt: '2026-09-23T10:00:00.000Z',
        updatedAt: '2026-09-23T10:00:00.000Z',
    }

    assert.equal(jobSchema.safeParse(job).success, true)
    assert.equal(jobSchema.safeParse({ ...job, createdAt: new Date() }).success, false)
    assert.equal('userId' in jobSchema.parse({ ...job, userId: 'u1' }), false)
})

test('api error codes cover job failures and request failures', () => {
    assert.equal(apiErrorCodeSchema.safeParse('VIDEO_TOO_LONG').success, true)
    assert.equal(apiErrorCodeSchema.safeParse('QUOTA_EXCEEDED').success, true)
})

test('the CommonJS build exposes the same API', () => {
    const cjs = createRequire(import.meta.url)('../dist/index.cjs')

    assert.equal(typeof cjs.jobSchema.parse, 'function')
    assert.equal(cjs.MAX_UPLOAD_BYTES, MAX_UPLOAD_BYTES)
})
