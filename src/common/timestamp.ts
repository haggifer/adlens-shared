import { z } from 'zod'

// A timestamp is a Date on the server (Mongoose) and an ISO string over the wire (JSON), so the
// shared contract accepts either. This replaces the Firestore-specific Timestamp shape.
export const timestampSchema = z.union([z.date(), z.string()])

export type Timestamp = z.infer<typeof timestampSchema>
