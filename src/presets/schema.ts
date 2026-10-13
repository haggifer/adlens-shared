import { z } from 'zod'
import { isoTimestampSchema } from '../common/timestamp.js'
import { analysisSettingsSchema } from '../jobs/schema.js'
import { presetIdSchema } from './id.js'

// A user keeps at most this many presets; the API refuses a new one past it.
export const MAX_PRESETS = 20

export const PRESET_NAME_MAX_LENGTH = 50

// Names are unique per user ignoring case; the API compares them lowercased.
export const presetNameSchema = z.string().trim().min(1).max(PRESET_NAME_MAX_LENGTH)

// Create and edit. `overwrite` replaces the preset that already has the name; `isDefault` sets or clears the default.
export const savePresetInputSchema = z.strictObject({
    name: presetNameSchema,
    settings: analysisSettingsSchema,
    isDefault: z.boolean().optional(),
    overwrite: z.boolean().optional(),
})

export const setDefaultPresetInputSchema = z.strictObject({
    presetId: presetIdSchema.nullable(),
})

export const presetSchema = z.object({
    id: z.string(),
    name: z.string(),
    settings: analysisSettingsSchema,
    isDefault: z.boolean(),
    // Runs started with this preset applied and unchanged.
    usageCount: z.number().int().nonnegative(),
    lastUsedAt: isoTimestampSchema.nullable(),
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
})

export const presetResponseSchema = z.object({ preset: presetSchema })

export const presetListResponseSchema = z.object({ presets: z.array(presetSchema) })

export type SavePresetInput = z.input<typeof savePresetInputSchema>
export type SavePresetPayload = z.output<typeof savePresetInputSchema>
export type SetDefaultPresetInput = z.input<typeof setDefaultPresetInputSchema>
export type Preset = z.infer<typeof presetSchema>
export type PresetResponse = z.infer<typeof presetResponseSchema>
export type PresetListResponse = z.infer<typeof presetListResponseSchema>
