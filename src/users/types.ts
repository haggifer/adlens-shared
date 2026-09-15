// AUTO-GENERATED from schema.ts — do not edit by hand.
/* eslint-disable */
import type { z } from 'zod'
import { profileSchema, quotaSchema, updateProfileInputSchema } from './schema.js'

export type Profile = z.infer<typeof profileSchema>
export type Quota = z.infer<typeof quotaSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>
