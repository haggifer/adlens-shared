import { z } from 'zod'
import { isoTimestampSchema } from '../common/timestamp.js'
import { jobSchema, uploadFileSchema } from '../jobs/schema.js'

// The Admin view's read of production: raw records, the page derives counts and costs.

// A billed Gemini call of a production job, with what its price depends on.
export const adminModelCallSchema = z.object({
    at: isoTimestampSchema,
    model: z.string(),
    location: z.string(),
    promptTokens: z.number().int().nonnegative(),
    candidatesTokens: z.number().int().nonnegative(),
    thoughtsTokens: z.number().int().nonnegative(),
    // Input tokens served from Vertex's implicit cache: a part of promptTokens.
    cachedTokens: z.number().int().nonnegative(),
    promptTokensByModality: z.record(z.string(), z.number().int().nonnegative()),
    cachedTokensByModality: z.record(z.string(), z.number().int().nonnegative()),
    // Absent on calls recorded before each was timed.
    durationMs: z.number().int().nonnegative().optional(),
    // Vertex's lane for the call: ON_DEMAND, or ON_DEMAND_FLEX at half price.
    trafficType: z.string().optional(),
})

// A job of any user, from the shared Job fields. `usage` is absent on a job that never reached Gemini; jobs from before
// calls were recorded have it without `calls`.
export const adminJobSchema = jobSchema.pick({ id: true, status: true, sampleId: true, createdAt: true }).extend({
    userId: z.string(),
    file: uploadFileSchema.pick({ name: true }),
    // Absent when the sample has been deleted since.
    sampleTitle: z.string().optional(),
    usage: z.object({ calls: z.array(adminModelCallSchema).optional() }).optional(),
})

// `email` is null for anonymous users, whose address is a placeholder.
export const adminUserSchema = z.object({
    id: z.string(),
    createdAt: isoTimestampSchema,
    email: z.string().nullable(),
    isAnonymous: z.boolean(),
    emailVerified: z.boolean(),
    isAdmin: z.boolean(),
})

export const adminJobsResponseSchema = z.object({
    jobs: z.array(adminJobSchema),
})

export const adminUsersResponseSchema = z.object({
    users: z.array(adminUserSchema),
})

export type AdminModelCall = z.infer<typeof adminModelCallSchema>
export type AdminJob = z.infer<typeof adminJobSchema>
export type AdminUser = z.infer<typeof adminUserSchema>
export type AdminJobsResponse = z.infer<typeof adminJobsResponseSchema>
export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>
