import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import {
    analysisSettingsSchema,
    apiErrorCodeSchema,
    contactMessageInputSchema,
    createJobInputSchema,
    createSampleJobInputSchema,
    jobSchema,
    MAX_UPLOAD_BYTES,
    Placement,
    Platform,
    sampleListResponseSchema,
    VideoMimeType,
} from '../dist/index.js'

const validFile = { name: 'ad.mp4', contentType: VideoMimeType.Mp4, size: 1000 }

test('settings default the list fields and reject unknown keys', () => {
    assert.deepEqual(analysisSettingsSchema.parse({}), { platforms: [], placements: [], markets: [] })
    assert.equal(analysisSettingsSchema.safeParse({ userId: 'x' }).success, false)
    assert.equal(analysisSettingsSchema.safeParse({ objective: 'Awareness' }).success, false)
    assert.equal(analysisSettingsSchema.safeParse({ audience: 'Parents' }).success, false)
    assert.equal(analysisSettingsSchema.safeParse({ brand: 'Acme' }).success, false)
})

test('a placement requires its platform', () => {
    const withoutPlatform = { placements: [Placement.MetaReels] }
    const withPlatform = { ...withoutPlatform, platforms: [Platform.Meta] }

    assert.equal(analysisSettingsSchema.safeParse(withoutPlatform).success, false)
    assert.equal(analysisSettingsSchema.safeParse(withPlatform).success, true)
})

test('uploads are limited to Gemini-readable video types and the size cap', () => {
    const settings = {}

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
        settings: {},
        file: validFile,
        createdAt: '2026-09-23T10:00:00.000Z',
        updatedAt: '2026-09-23T10:00:00.000Z',
    }

    assert.equal(jobSchema.safeParse(job).success, true)
    assert.equal(jobSchema.safeParse({ ...job, createdAt: new Date() }).success, false)
    assert.equal('userId' in jobSchema.parse({ ...job, userId: 'u1' }), false)
    assert.equal(jobSchema.parse({ ...job, sampleId: 's1' }).sampleId, 's1')
})

test('a sample job names the sample and its settings, never a file or storage path', () => {
    const settings = { platforms: [Platform.YouTube] }

    assert.equal(createSampleJobInputSchema.safeParse({ sampleId: 's1', settings }).success, true)
    assert.equal(createSampleJobInputSchema.safeParse({ sampleId: '', settings }).success, false)
    assert.equal(
        createSampleJobInputSchema.safeParse({ sampleId: 's1', settings, path: 'samples/a.mp4' }).success,
        false,
    )
})

test('samples are listed with measured media, suggested settings and a preview URL', () => {
    const sample = {
        id: 's1',
        title: 'Running shoes',
        description: 'A 15-second product spot',
        settings: { platforms: [Platform.Meta], placements: [Placement.MetaReels] },
        media: {
            durationS: 15,
            width: 1080,
            height: 1920,
            hasAudio: true,
            sizeBytes: 5000,
            contentType: VideoMimeType.Mp4,
        },
        contentType: VideoMimeType.Mp4,
        previewUrl: 'https://storage.googleapis.com/bucket/samples/s1.mp4?X-Goog-Signature=abc',
    }

    assert.equal(sampleListResponseSchema.safeParse({ samples: [sample] }).success, true)
    assert.equal(
        sampleListResponseSchema.safeParse({ samples: [{ ...sample, previewUrl: 'not a url' }] }).success,
        false,
    )
})

test('a contact message needs a reply address and a message, and may carry the honeypot', () => {
    const message = { email: 'someone@example.com', message: 'I would like to know more about AdLens.' }

    assert.equal(contactMessageInputSchema.safeParse(message).success, true)
    assert.equal(contactMessageInputSchema.safeParse({ ...message, website: '' }).success, true)
    assert.equal(contactMessageInputSchema.safeParse({ ...message, email: 'not an email' }).success, false)
    assert.equal(contactMessageInputSchema.safeParse({ ...message, message: '   hi   ' }).success, false)
    assert.equal(contactMessageInputSchema.safeParse({ ...message, userId: 'u1' }).success, false)
})

test('api error codes cover job failures and request failures', () => {
    assert.equal(apiErrorCodeSchema.safeParse('VIDEO_TOO_LONG').success, true)
    assert.equal(apiErrorCodeSchema.safeParse('QUOTA_EXCEEDED').success, true)
    assert.equal(apiErrorCodeSchema.safeParse('JOB_IN_PROGRESS').success, true)
})

test('the CommonJS build exposes the same API', () => {
    const cjs = createRequire(import.meta.url)('../dist/index.cjs')

    assert.equal(typeof cjs.jobSchema.parse, 'function')
    assert.equal(cjs.MAX_UPLOAD_BYTES, MAX_UPLOAD_BYTES)
})
