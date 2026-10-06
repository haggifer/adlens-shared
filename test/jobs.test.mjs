import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { test } from 'node:test'
import {
    advisorySchema,
    analysisSchema,
    analysisSettingsSchema,
    createJobInputSchema,
    createJobResponseSchema,
    createSampleJobInputSchema,
    findingSchema,
    jobListResponseSchema,
    jobMediaSchema,
    jobResponseSchema,
    jobSchema,
    JobStatus,
    jobStatusSchema,
    jobVideoResponseSchema,
    Market,
    marketSchema,
    MAX_UPLOAD_BYTES,
    metadataCheckSchema,
    Placement,
    PLACEMENT_PLATFORM,
    placementSchema,
    Platform,
    platformSchema,
    RulePlatform,
    rulePlatformSchema,
    ruleScopeSchema,
    sampleListResponseSchema,
    sampleSchema,
    severitySchema,
    timeRangeSchema,
    uploadFileSchema,
    uploadTargetSchema,
    VideoMimeType,
    videoMimeTypeSchema,
} from '../dist/index.js'

const validFile = { name: 'ad.mp4', contentType: VideoMimeType.Mp4, size: 1000 }
const validMedia = { durationS: 15, hasAudio: false, sizeBytes: 5000, contentType: VideoMimeType.Mp4 }

// ---- Targeting enums and the placement-to-platform mapping ----

test('the targeting and status enums pin every option the web app offers', () => {
    assert.deepEqual(platformSchema.options, Object.values(Platform))
    assert.deepEqual(marketSchema.options, Object.values(Market))
    assert.deepEqual(placementSchema.options, Object.values(Placement))
    assert.deepEqual(rulePlatformSchema.options, Object.values(RulePlatform))
    assert.deepEqual(jobStatusSchema.options, Object.values(JobStatus))
    assert.deepEqual(videoMimeTypeSchema.options, Object.values(VideoMimeType))
})

test('every placement maps to exactly one platform, and settings need that platform selected', () => {
    assert.deepEqual(Object.keys(PLACEMENT_PLATFORM).sort(), Object.values(Placement).sort())

    for (const [placement, platform] of Object.entries(PLACEMENT_PLATFORM)) {
        const settings = { placements: [placement], platforms: [platform] }

        assert.equal(analysisSettingsSchema.safeParse(settings).success, true, placement)
        assert.equal(analysisSettingsSchema.safeParse({ ...settings, platforms: [] }).success, false, placement)
    }
})

// ---- Analysis settings ----

test('settings default the list fields and reject unknown keys', () => {
    assert.deepEqual(analysisSettingsSchema.parse({}), { platforms: [], placements: [], markets: [] })
    assert.equal(analysisSettingsSchema.safeParse({ userId: 'x' }).success, false)
    assert.equal(analysisSettingsSchema.safeParse({ objective: 'Awareness' }).success, false)
    assert.equal(analysisSettingsSchema.safeParse({ audience: 'Parents' }).success, false)
    assert.equal(analysisSettingsSchema.safeParse({ brand: 'Acme' }).success, false)
})

test('settings accept each option at most once, so no list outgrows its enum', () => {
    const everything = {
        platforms: Object.values(Platform),
        placements: Object.values(Placement),
        markets: Object.values(Market),
    }

    assert.equal(analysisSettingsSchema.safeParse(everything).success, true)
    assert.equal(analysisSettingsSchema.safeParse({ platforms: ['Meta', 'Meta'] }).success, false)
    assert.equal(analysisSettingsSchema.safeParse({ markets: ['US', 'US'] }).success, false)
    assert.equal(
        analysisSettingsSchema.safeParse({ platforms: ['Meta'], placements: ['meta_feed', 'meta_feed'] }).success,
        false,
    )
})

test('a request-sized flood of repeats is rejected quickly', () => {
    // About the API's 1 MB body limit: before the caps, this blocked the event loop for seconds and then passed.
    const flood = {
        platforms: [...Array(70_000).fill('TikTok'), 'Meta'],
        placements: Array(40_000).fill('meta_feed'),
    }
    const startedAt = performance.now()

    assert.equal(analysisSettingsSchema.safeParse(flood).success, false)
    assert.ok(performance.now() - startedAt < 200)
})

// ---- Upload file ----

test('job creation is limited to Gemini-readable video types and the size cap', () => {
    const settings = {}

    assert.equal(createJobInputSchema.safeParse({ settings, file: validFile }).success, true)
    assert.equal(
        createJobInputSchema.safeParse({ settings, file: { ...validFile, contentType: 'video/x-matroska' } }).success,
        false,
    )
    for (const contentType of ['video/mpeg', 'video/x-flv']) {
        assert.equal(createJobInputSchema.safeParse({ settings, file: { ...validFile, contentType } }).success, false)
    }
})

test('the upload file name and size are bounded, and reject unknown keys', () => {
    assert.equal(uploadFileSchema.safeParse({ ...validFile, name: '' }).success, false)
    assert.equal(uploadFileSchema.safeParse({ ...validFile, name: 'a'.repeat(255) }).success, true)
    assert.equal(uploadFileSchema.safeParse({ ...validFile, name: 'a'.repeat(256) }).success, false)
    assert.equal(uploadFileSchema.safeParse({ ...validFile, size: 0 }).success, false)
    assert.equal(uploadFileSchema.safeParse({ ...validFile, size: MAX_UPLOAD_BYTES }).success, true)
    assert.equal(uploadFileSchema.safeParse({ ...validFile, size: MAX_UPLOAD_BYTES + 1 }).success, false)
    assert.equal(uploadFileSchema.safeParse({ ...validFile, extra: 1 }).success, false)
})

test('job creation may carry a Turnstile token of up to 2048 characters', () => {
    const settings = {}
    const token = 'XXXX.DUMMY.TOKEN.XXXX'

    assert.equal(createJobInputSchema.safeParse({ settings, file: validFile, challengeToken: token }).success, true)
    assert.equal(createJobInputSchema.safeParse({ settings, file: validFile, challengeToken: '' }).success, false)
    assert.equal(
        createJobInputSchema.safeParse({ settings, file: validFile, challengeToken: 'x'.repeat(2049) }).success,
        false,
    )
    assert.equal(createJobInputSchema.safeParse({ settings, file: validFile, extra: 1 }).success, false)
})

// ---- Measured media and rule-check pieces of an analysis ----

test('measured media requires a positive duration and size; width and height are optional', () => {
    assert.equal(jobMediaSchema.safeParse(validMedia).success, true)
    assert.equal(jobMediaSchema.safeParse({ ...validMedia, durationS: 0 }).success, false)
    assert.equal(jobMediaSchema.safeParse({ ...validMedia, sizeBytes: 0 }).success, false)
    assert.equal(jobMediaSchema.safeParse({ ...validMedia, width: 1080, height: 1920 }).success, true)
})

test('a time range starts at or after zero and may omit its end', () => {
    assert.equal(timeRangeSchema.safeParse({ startS: 0 }).success, true)
    assert.equal(timeRangeSchema.safeParse({ startS: 0, endS: 5 }).success, true)
    assert.equal(timeRangeSchema.safeParse({ startS: -1 }).success, false)
})

test('severity has exactly three levels and rule scope exactly two', () => {
    assert.deepEqual(severitySchema.options, ['blocker', 'warning', 'info'])
    assert.deepEqual(ruleScopeSchema.options, ['compliance', 'best_practice'])
})

const baseFinding = {
    id: 'f1',
    platform: [RulePlatform.Meta],
    topic: 'unsubstantiated claims',
    scope: 'compliance',
    severity: 'blocker',
    verdict: 'fail',
    evidence: '"cures everything" at 0:05',
    quote: 'cures everything',
    ref: 'meta-ad-standards#health',
}

test('a finding judges a content rule and can only conclude fail, warning or unknown', () => {
    assert.equal(findingSchema.safeParse(baseFinding).success, true)
    assert.equal(findingSchema.safeParse({ ...baseFinding, time: { startS: 5 } }).success, true)
    assert.equal(findingSchema.safeParse({ ...baseFinding, verdict: 'pass' }).success, false)
    assert.equal(findingSchema.safeParse({ ...baseFinding, scope: 'legal' }).success, false)
})

test('a metadata check is judged in code and, unlike a finding, may also conclude pass', () => {
    const check = {
        id: 'm1',
        topic: 'duration',
        severity: 'warning',
        verdict: 'pass',
        detail: 'within the platform limit',
        quote: '',
        ref: 'meta-ad-standards#duration',
    }

    assert.equal(metadataCheckSchema.safeParse(check).success, true)
    assert.equal(metadataCheckSchema.safeParse({ ...check, verdict: 'unknown' }).success, true)
})

test('a metadata check can name the platforms and selected placements its spec binds, and state its rule', () => {
    const check = {
        id: 'youtube.creative_spec.bumper_duration',
        platform: [RulePlatform.Google],
        placements: [Placement.YouTubeBumper],
        topic: 'creative_spec:duration',
        check: 'Bumper ads must be at most 6 seconds long.',
        severity: 'blocker',
        verdict: 'fail',
        detail: 'It is 30.4 seconds long, over the 6-second limit.',
        quote: '',
        ref: 'https://support.google.com/google-ads/answer/2375464',
    }

    assert.equal(metadataCheckSchema.safeParse(check).success, true)
    assert.equal(metadataCheckSchema.safeParse({ ...check, placements: ['nowhere'] }).success, false)
})

test('an advisory is surfaced, never judged, so it carries a check but no verdict', () => {
    const advisory = {
        id: 'a1',
        platform: [RulePlatform.Google],
        topic: 'local disclosure law',
        severity: 'info',
        check: 'confirm local ad-disclosure rules for this market',
        quote: '',
        ref: 'google-ads-policy#disclosure',
    }

    assert.equal(advisorySchema.safeParse(advisory).success, true)
    assert.equal(advisorySchema.safeParse({ ...advisory, check: undefined }).success, false)
})

test('the analysis carries the model, prompt/ruleset versions, transcript and the three rule buckets', () => {
    const analysis = {
        model: 'gemini-2.5-pro',
        promptVersion: '2026-09-01',
        rulesetVersion: '2026-09-01',
        transcript: '[00:00] Voiceover: ...',
        findings: [baseFinding],
        metadataChecks: [],
        advisories: [],
        completedAt: '2026-09-23T10:00:00.000Z',
    }

    assert.equal(analysisSchema.safeParse(analysis).success, true)
    assert.equal(analysisSchema.safeParse({ ...analysis, completedAt: 'not-a-date' }).success, false)
})

// ---- The public job ----

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

test('a job in error status carries a JobErrorCode, never a request-only code, and rejects an unknown status', () => {
    const job = {
        id: 'j1',
        status: 'error',
        settings: {},
        file: validFile,
        errorCode: 'ANALYSIS_FAILED',
        createdAt: '2026-09-23T10:00:00.000Z',
        updatedAt: '2026-09-23T10:00:00.000Z',
    }

    assert.equal(jobSchema.safeParse(job).success, true)
    assert.equal(jobSchema.safeParse({ ...job, errorCode: 'QUOTA_EXCEEDED' }).success, false)
    assert.equal(jobSchema.safeParse({ ...job, status: 'not-a-status' }).success, false)
})

// ---- Response envelopes ----

test('response envelopes wrap the job with its upload target, list cursor or replay URL', () => {
    const job = {
        id: 'j1',
        status: 'pending',
        settings: {},
        file: validFile,
        createdAt: '2026-09-23T10:00:00.000Z',
        updatedAt: '2026-09-23T10:00:00.000Z',
    }
    const upload = { url: 'https://storage.googleapis.com/bucket/j1', headers: { 'content-type': 'video/mp4' } }

    assert.equal(uploadTargetSchema.safeParse(upload).success, true)
    assert.equal(createJobResponseSchema.safeParse({ job, upload }).success, true)
    assert.equal(jobResponseSchema.safeParse({ job }).success, true)
    assert.equal(jobListResponseSchema.safeParse({ jobs: [job], nextCursor: null }).success, true)
    assert.equal(jobListResponseSchema.safeParse({ jobs: [job], nextCursor: 'c1' }).success, true)
    assert.equal(jobListResponseSchema.safeParse({ jobs: [job] }).success, false)
    assert.equal(
        jobVideoResponseSchema.safeParse({ url: 'https://x/y.mp4', expiresAt: '2026-09-23T10:00:00.000Z' }).success,
        true,
    )
})

// ---- Samples ----

test('a sample job names the sample and its settings, never a file or storage path', () => {
    assert.equal(createSampleJobInputSchema.safeParse({ sampleId: 's1', settings: {} }).success, true)
    assert.equal(createSampleJobInputSchema.safeParse({ sampleId: '', settings: {} }).success, false)
    assert.equal(
        createSampleJobInputSchema.safeParse({ sampleId: 's1', settings: {}, path: 'samples/a.mp4' }).success,
        false,
    )
    assert.equal(
        createSampleJobInputSchema.safeParse({ sampleId: 's1', settings: {}, challengeToken: 'tok' }).success,
        true,
    )
})

test('samples are listed with measured media, suggested settings and a preview URL', () => {
    const sample = {
        id: 's1',
        title: 'Running shoes',
        description: 'A 15-second product spot',
        settings: { platforms: [Platform.Meta], placements: [Placement.MetaReels] },
        media: { ...validMedia, width: 1080, height: 1920, hasAudio: true },
        contentType: VideoMimeType.Mp4,
        previewUrl: 'https://storage.googleapis.com/bucket/samples/s1.mp4?X-Goog-Signature=abc',
    }

    assert.equal(sampleListResponseSchema.safeParse({ samples: [sample] }).success, true)
    assert.equal(sampleSchema.safeParse({ ...sample, previewUrl: 'not a url' }).success, false)
})
