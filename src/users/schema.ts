import { z } from 'zod'
import { timestampSchema } from '../common/index.js'

export const profileSchema = z.object({
    displayName: z.string().min(1).max(80).optional(),
    photoURL: z.url().optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})

// The PATCH /v1/me/profile body — strict allowlist of client-writable fields.
export const updateProfileInputSchema = profileSchema.pick({ displayName: true, photoURL: true }).strict()

export const quotaSchema = z.object({
    used: z.number(),
    limit: z.number(),
    windowStart: z.number(),
})
