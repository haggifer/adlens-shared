import { z } from 'zod'
import { timestampSchema } from '../common/index.js'

// The stored profile document — source of truth for the `profiles` collection.
export const profileDocSchema = z.object({
    userId: z.string(),
    displayName: z.string().min(1).max(80).optional(),
    photoURL: z.url().optional(),
})

// The API-returned profile: no server-owned userId; timestamps are ISO strings over the wire.
export const profileSchema = profileDocSchema.omit({ userId: true }).extend({
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})

// The PATCH /v1/me/profile body — strict allowlist of client-writable fields.
export const updateProfileInputSchema = profileDocSchema.pick({ displayName: true, photoURL: true }).strict()

// The stored quota document — source of truth for the `quotas` collection. userId is the owner key.
export const quotaDocSchema = z.object({
    userId: z.string(),
    used: z.number().default(0),
    limit: z.number(),
    windowStart: z.number(),
})

// The API-returned quota: the stored document minus the server-owned owner id.
export const quotaSchema = quotaDocSchema.omit({ userId: true })
