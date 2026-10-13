import { z } from 'zod'

// Preset ids are 24-character ObjectId strings; a length cap rather than a pattern keeps the contract loose.
export const presetIdSchema = z.string().min(1).max(64)
