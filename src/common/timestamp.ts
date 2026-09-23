import { z } from 'zod'

// Timestamps travel as ISO-8601 strings; the API stores Dates and serializes them with toISOString().
export const isoTimestampSchema = z.iso.datetime()

export type IsoTimestamp = z.infer<typeof isoTimestampSchema>
