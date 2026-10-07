import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import * as adlensShared from '../dist/index.js'

// Every schema, enum and constant a consumer imports by name. A removed or renamed export breaks the web app or the
// API silently until their next build, so this list changes only deliberately, in the same commit as the export.
const EXPECTED_EXPORTS = [
    'MAX_DURATION_S',
    'MAX_UPLOAD_BYTES',
    'MIN_PASSWORD_LENGTH',
    'QUOTA_WINDOW_MS',
    'isoTimestampSchema',
    'CONTACT_MESSAGE_MAX_LENGTH',
    'CONTACT_MAX_ATTACHMENTS',
    'CONTACT_ATTACHMENT_MAX_BYTES',
    'CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES',
    'contactAttachmentTypeSchema',
    'contactMessageInputSchema',
    'sendContactMessageInputSchema',
    'contactAttachmentFileSchema',
    'createContactUploadsInputSchema',
    'createContactUploadsResponseSchema',
    'JobErrorCode',
    'RequestErrorCode',
    'jobErrorCodeSchema',
    'apiErrorCodeSchema',
    'apiErrorSchema',
    'JobStatus',
    'Platform',
    'RulePlatform',
    'Placement',
    'Market',
    'VideoMimeType',
    'PLACEMENT_PLATFORM',
    'jobStatusSchema',
    'platformSchema',
    'rulePlatformSchema',
    'placementSchema',
    'marketSchema',
    'videoMimeTypeSchema',
    'severitySchema',
    'challengeTokenSchema',
    'ruleScopeSchema',
    'analysisSettingsSchema',
    'uploadFileSchema',
    'jobMediaSchema',
    'timeRangeSchema',
    'findingSchema',
    'metadataCheckSchema',
    'advisorySchema',
    'analysisSchema',
    'jobSchema',
    'createJobInputSchema',
    'uploadTargetSchema',
    'createJobResponseSchema',
    'jobResponseSchema',
    'jobListResponseSchema',
    'jobVideoResponseSchema',
    'sampleSchema',
    'sampleListResponseSchema',
    'demoSchema',
    'demoListResponseSchema',
    'createSampleJobInputSchema',
    'quotaSchema',
    'quotaResponseSchema',
]

test('the ESM build exports exactly the documented public surface', () => {
    assert.deepEqual(Object.keys(adlensShared).sort(), [...EXPECTED_EXPORTS].sort())
})

test('the CommonJS build exposes the same API', () => {
    const cjs = createRequire(import.meta.url)('../dist/index.cjs')

    assert.deepEqual(Object.keys(cjs).sort(), [...EXPECTED_EXPORTS].sort())
    assert.equal(typeof cjs.jobSchema.parse, 'function')
    assert.equal(cjs.MAX_UPLOAD_BYTES, adlensShared.MAX_UPLOAD_BYTES)
})
