import { z } from 'zod'
import { MAX_UPLOAD_BYTES } from '../common/constants.js'
import { isoTimestampSchema } from '../common/timestamp.js'
import { jobErrorCodeSchema } from '../errors/schema.js'

export enum JobStatus {
    Pending = 'pending',
    Verifying = 'verifying',
    Queued = 'queued',
    Analyzing = 'analyzing',
    Analyzed = 'analyzed',
    Error = 'error',
}

export enum Platform {
    Meta = 'Meta',
    TikTok = 'TikTok',
    YouTube = 'YouTube',
    Snapchat = 'Snapchat',
    Pinterest = 'Pinterest',
    LinkedIn = 'LinkedIn',
    Amazon = 'Amazon',
}

// Platforms a rule can cite: every targetable platform, Google Ads (the policy owner behind YouTube ads) and `all`.
export enum RulePlatform {
    Meta = 'Meta',
    TikTok = 'TikTok',
    YouTube = 'YouTube',
    Snapchat = 'Snapchat',
    Pinterest = 'Pinterest',
    LinkedIn = 'LinkedIn',
    Amazon = 'Amazon',
    Google = 'Google',
    All = 'all',
}

export enum Placement {
    MetaFeed = 'meta_feed',
    MetaReels = 'meta_reels',
    MetaStories = 'meta_stories',
    TikTokInFeed = 'tiktok_in_feed',
    YouTubeSkippableInStream = 'youtube_skippable_in_stream',
    YouTubeNonSkippableInStream = 'youtube_non_skippable_in_stream',
    YouTubeBumper = 'youtube_bumper',
    YouTubeShorts = 'youtube_shorts',
    SnapchatSingleVideo = 'snapchat_single_video',
    PinterestStandardVideo = 'pinterest_standard_video',
    LinkedInSingleVideo = 'linkedin_single_video',
    AmazonSponsoredBrandsVideo = 'amazon_sponsored_brands_video',
}

export enum Market {
    US = 'US',
    UK = 'UK',
    EU = 'EU',
    Other = 'Other',
}

// MIME types Gemini accepts for video that browsers also report and can play: the app previews and replays the upload.
export enum VideoMimeType {
    Mp4 = 'video/mp4',
    QuickTime = 'video/quicktime',
    WebM = 'video/webm',
    ThreeGpp = 'video/3gpp',
}

export const PLACEMENT_PLATFORM: Record<Placement, Platform> = {
    [Placement.MetaFeed]: Platform.Meta,
    [Placement.MetaReels]: Platform.Meta,
    [Placement.MetaStories]: Platform.Meta,
    [Placement.TikTokInFeed]: Platform.TikTok,
    [Placement.YouTubeSkippableInStream]: Platform.YouTube,
    [Placement.YouTubeNonSkippableInStream]: Platform.YouTube,
    [Placement.YouTubeBumper]: Platform.YouTube,
    [Placement.YouTubeShorts]: Platform.YouTube,
    [Placement.SnapchatSingleVideo]: Platform.Snapchat,
    [Placement.PinterestStandardVideo]: Platform.Pinterest,
    [Placement.LinkedInSingleVideo]: Platform.LinkedIn,
    [Placement.AmazonSponsoredBrandsVideo]: Platform.Amazon,
}

export const jobStatusSchema = z.enum(JobStatus)
export const platformSchema = z.enum(Platform)
export const rulePlatformSchema = z.enum(RulePlatform)
export const placementSchema = z.enum(Placement)
export const marketSchema = z.enum(Market)
export const videoMimeTypeSchema = z.enum(VideoMimeType)
export const severitySchema = z.enum(['blocker', 'warning', 'info'])
export const ruleScopeSchema = z.enum(['compliance', 'best_practice'])

// Each option at most once, so a list is never longer than its enum: the request body can't grow the stored job or the
// prompt with repeats.
const uniqueOptions = <T extends z.ZodEnum>(option: T) =>
    z
        .array(option)
        .max(option.options.length)
        .refine((list) => new Set(list).size === list.length, { message: 'Each option may be chosen only once' })
        .default([])

// Strict: a client can only set allowlisted fields. A placement is only valid with its platform selected.
export const analysisSettingsSchema = z
    .strictObject({
        platforms: uniqueOptions(platformSchema),
        placements: uniqueOptions(placementSchema),
        markets: uniqueOptions(marketSchema),
    })
    .refine(
        (settings) => {
            const platforms = new Set(settings.platforms)

            return settings.placements.every((placement) => platforms.has(PLACEMENT_PLATFORM[placement]))
        },
        { message: 'Each placement must belong to a selected platform', path: ['placements'] },
    )

// What the client declares about the file before uploading it.
export const uploadFileSchema = z.strictObject({
    name: z.string().min(1).max(255),
    contentType: videoMimeTypeSchema,
    size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
})

// A Cloudflare Turnstile token: single-use, at most 2048 characters. Job creation sends one only when a rule asks for it;
// a Contact message sends one unless it sends an upload draft id.
export const challengeTokenSchema = z.string().min(1).max(2048)

// Facts measured from the uploaded object during verification, not taken from the client.
export const jobMediaSchema = z.object({
    durationS: z.number().positive(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    hasAudio: z.boolean(),
    sizeBytes: z.number().int().positive(),
    contentType: z.string(),
})

export const timeRangeSchema = z.object({
    startS: z.number().nonnegative(),
    endS: z.number().nonnegative().optional(),
})

// A content rule (text / visual / audiovisual) the model judged against the video.
export const findingSchema = z.object({
    id: z.string(),
    platform: z.array(rulePlatformSchema),
    topic: z.string(),
    scope: ruleScopeSchema,
    severity: severitySchema,
    verdict: z.enum(['fail', 'warning', 'unknown']),
    evidence: z.string(),
    time: timeRangeSchema.optional(),
    quote: z.string(),
    ref: z.string(),
})

// A deterministic (metadata) rule checked in code against the measured media facts.
export const metadataCheckSchema = z.object({
    id: z.string(),
    topic: z.string(),
    severity: severitySchema,
    verdict: z.enum(['pass', 'fail', 'unknown']),
    detail: z.string(),
    quote: z.string(),
    ref: z.string(),
})

// An out-of-creative rule (targeting, local law, verification): surfaced as advice, never judged.
export const advisorySchema = z.object({
    id: z.string(),
    platform: z.array(rulePlatformSchema),
    topic: z.string(),
    severity: severitySchema,
    check: z.string(),
    quote: z.string(),
    ref: z.string(),
})

export const analysisSchema = z.object({
    model: z.string(),
    promptVersion: z.string(),
    rulesetVersion: z.string(),
    transcript: z.string(),
    findings: z.array(findingSchema),
    metadataChecks: z.array(metadataCheckSchema),
    advisories: z.array(advisorySchema),
    completedAt: isoTimestampSchema,
})

// A job as the API returns it. Storage details (owner, bucket path, execution, accounting) stay server-side.
export const jobSchema = z.object({
    id: z.string(),
    status: jobStatusSchema,
    settings: analysisSettingsSchema,
    file: uploadFileSchema,
    media: jobMediaSchema.optional(),
    analysis: analysisSchema.optional(),
    errorCode: jobErrorCodeSchema.optional(),
    // Set when the job analyzes one of AdLens's sample ads instead of an upload.
    sampleId: z.string().optional(),
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
})

export const createJobInputSchema = z.strictObject({
    settings: analysisSettingsSchema,
    file: uploadFileSchema,
    challengeToken: challengeTokenSchema.optional(),
})

// Where and how to PUT a file (a video, or a Contact form image): the client must send exactly these headers, because
// they are signed.
export const uploadTargetSchema = z.object({
    url: z.url(),
    headers: z.record(z.string(), z.string()),
})

export const createJobResponseSchema = z.object({
    job: jobSchema,
    upload: uploadTargetSchema,
})

export const jobResponseSchema = z.object({
    job: jobSchema,
})

export const jobListResponseSchema = z.object({
    jobs: z.array(jobSchema),
    nextCursor: z.string().nullable(),
})

// A short-lived signed URL for replaying the uploaded video.
export const jobVideoResponseSchema = z.object({
    url: z.url(),
    expiresAt: isoTimestampSchema,
})

// A sample ad anyone can try: stored by AdLens and measured when it was published, with suggested settings.
export const sampleSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    settings: analysisSettingsSchema,
    media: jobMediaSchema,
    contentType: videoMimeTypeSchema,
    // Short-lived signed URL for previewing the video.
    previewUrl: z.url(),
})

export const sampleListResponseSchema = z.object({
    samples: z.array(sampleSchema),
})

// Analyzing a sample needs no upload: the job points at the stored sample, and the settings may differ from the
// suggested ones.
export const createSampleJobInputSchema = z.strictObject({
    sampleId: z.string().min(1),
    settings: analysisSettingsSchema,
    challengeToken: challengeTokenSchema.optional(),
})

export type Severity = z.infer<typeof severitySchema>
export type RuleScope = z.infer<typeof ruleScopeSchema>
export type AnalysisSettings = z.output<typeof analysisSettingsSchema>
export type AnalysisSettingsInput = z.input<typeof analysisSettingsSchema>
export type UploadFile = z.infer<typeof uploadFileSchema>
export type JobMedia = z.infer<typeof jobMediaSchema>
export type TimeRange = z.infer<typeof timeRangeSchema>
export type Finding = z.infer<typeof findingSchema>
export type MetadataCheck = z.infer<typeof metadataCheckSchema>
export type Advisory = z.infer<typeof advisorySchema>
export type Analysis = z.infer<typeof analysisSchema>
export type Job = z.infer<typeof jobSchema>
export type CreateJobInput = z.input<typeof createJobInputSchema>
export type CreateJobPayload = z.output<typeof createJobInputSchema>
export type UploadTarget = z.infer<typeof uploadTargetSchema>
export type CreateJobResponse = z.infer<typeof createJobResponseSchema>
export type JobResponse = z.infer<typeof jobResponseSchema>
export type JobListResponse = z.infer<typeof jobListResponseSchema>
export type JobVideoResponse = z.infer<typeof jobVideoResponseSchema>
export type Sample = z.infer<typeof sampleSchema>
export type SampleListResponse = z.infer<typeof sampleListResponseSchema>
export type CreateSampleJobInput = z.input<typeof createSampleJobInputSchema>
export type CreateSampleJobPayload = z.output<typeof createSampleJobInputSchema>
