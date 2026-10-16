import { z } from 'zod'

// Messages on a user's live channel. Each only says what changed, never how: a tab refetches it through the API, which
// stays the one place that decides what a user may read.
export enum LiveEvent {
    // A preset was saved, edited, deleted, made the default or counted for a run.
    Presets = 'presets',
    // A job's status, analysis, error or counted preset changed.
    Job = 'job',
}

export const liveJobEventSchema = z.object({
    id: z.string(),
})

// One channel per user, anonymous users included. A tab may only subscribe to its own (the API's token says so).
export const getLiveChannel = (userId: string) => `user:${userId}`

// An Ably token request, signed by the API with its key: the tab exchanges it with Ably for a token, so the key never
// leaves the API.
export const liveTokenRequestSchema = z.object({
    keyName: z.string(),
    ttl: z.number().int().positive().optional(),
    timestamp: z.number().int(),
    capability: z.string(),
    clientId: z.string().optional(),
    nonce: z.string(),
    mac: z.string(),
})

// null when live updates are off (the API has no key): the tab then relies on its reads alone.
export const liveTokenResponseSchema = z.object({
    tokenRequest: liveTokenRequestSchema.nullable(),
})

export type LiveJobEvent = z.infer<typeof liveJobEventSchema>
export type LiveTokenRequest = z.infer<typeof liveTokenRequestSchema>
export type LiveTokenResponse = z.infer<typeof liveTokenResponseSchema>
