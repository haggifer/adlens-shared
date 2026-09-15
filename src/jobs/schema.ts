import { z } from 'zod'
import { timestampSchema } from '../common/index.js'

export const jobStatusSchema = z.enum(['pending', 'queued', 'analyzing', 'analyzed', 'error'])

// Strict: rejects unknown keys so a client can only set allowlisted fields.
export const analysisSettingsSchema = z.strictObject({
    platform: z.array(z.enum(['Meta', 'TikTok', 'YouTube'])).default([]),
    objective: z.enum(['Conversion', 'Awareness', 'Consideration']),
    focus: z.array(z.string()).default([]),
    audience: z.string().max(500).optional(),
    brand: z.string().max(2000).optional(),
})

// The stored record for an uploaded file.
export const jobFileSchema = z.object({
    bucket: z.string(),
    path: z.string(),
    name: z.string(),
    contentType: z.string(),
    size: z.number(),
})

// Extracted at verification time; deterministic (metadata) rules are checked against this.
export const jobMediaSchema = z.object({
    durationS: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    hasAudio: z.boolean().optional(),
})

const findingSeveritySchema = z.enum(['blocker', 'warning', 'info'])

// A content rule (text/visual/audiovisual) evaluated against the video by the model.
export const findingSchema = z.object({
    id: z.string(),
    platform: z.array(z.string()),
    topic: z.string(),
    scope: z.enum(['compliance', 'best_practice']),
    severity: findingSeveritySchema,
    verdict: z.enum(['fail', 'warning', 'pass', 'unknown']),
    evidence: z.string(),
    timestamp: z.string().optional(),
    quote: z.string(),
    ref: z.string(),
})

// A deterministic (metadata) rule checked in code against jobMedia.
export const metadataCheckSchema = z.object({
    id: z.string(),
    topic: z.string(),
    severity: findingSeveritySchema,
    verdict: z.enum(['pass', 'fail', 'unknown']),
    detail: z.string(),
    quote: z.string(),
    ref: z.string(),
})

// An out_of_creative rule (targeting / local-law / verification) — surfaced as advice, never auto-judged.
export const advisorySchema = z.object({
    id: z.string(),
    platform: z.array(z.string()),
    topic: z.string(),
    severity: findingSeveritySchema,
    check: z.string(),
    quote: z.string(),
    ref: z.string(),
})

export const analysisSchema = z.object({
    model: z.string(),
    rulesetVersion: z.string(),
    transcript: z.string(),
    findings: z.array(findingSchema),
    metadataChecks: z.array(metadataCheckSchema),
    advisories: z.array(advisorySchema),
    completedAt: timestampSchema,
})

// The entity (a stored Job). Non-strict so a read tolerates fields added elsewhere.
export const jobSchema = z.object({
    id: z.string(),
    userId: z.string(),
    status: jobStatusSchema,
    settings: analysisSettingsSchema,
    file: jobFileSchema.nullable(),
    media: jobMediaSchema.optional(),
    analysis: analysisSchema.optional(),
    error: z.string().optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})

// The POST /v1/jobs body. file is a subset of JobFile (no server-owned bucket/path), so it can't
// derive from jobFileSchema — authored explicitly, with the upload constraints.
export const createJobInputSchema = z.strictObject({
    settings: analysisSettingsSchema,
    file: z.strictObject({
        name: z.string().min(1).max(255),
        contentType: z.string().regex(/^video\//),
        size: z
            .number()
            .int()
            .positive()
            .max(200 * 1000 * 1000),
    }),
})
