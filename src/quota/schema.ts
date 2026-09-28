import { z } from 'zod'
import { isoTimestampSchema } from '../common/timestamp.js'

// `used` counts the runs charged within the last QUOTA_WINDOW_MS; each one stops counting that long after it started,
// and `nextFreeAt` says when the oldest of them does (null when none count). A null limit means the account is
// unlimited: its runs are still counted but never capped.
export const quotaSchema = z.object({
    used: z.number().int().nonnegative(),
    limit: z.number().int().positive().nullable(),
    nextFreeAt: isoTimestampSchema.nullable(),
})

export const quotaResponseSchema = z.object({
    quota: quotaSchema,
})

export type Quota = z.infer<typeof quotaSchema>
export type QuotaResponse = z.infer<typeof quotaResponseSchema>
