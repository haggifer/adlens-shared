import { z } from 'zod'
import { isoTimestampSchema } from '../common/timestamp.js'

// windowStart is null until the first analysis opens a window; the window ends QUOTA_WINDOW_MS after it.
export const quotaSchema = z.object({
    used: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    windowStart: isoTimestampSchema.nullable(),
})

export const quotaResponseSchema = z.object({
    quota: quotaSchema,
})

export type Quota = z.infer<typeof quotaSchema>
export type QuotaResponse = z.infer<typeof quotaResponseSchema>
