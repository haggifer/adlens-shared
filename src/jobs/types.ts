// AUTO-GENERATED from schema.ts — do not edit by hand.
/* eslint-disable */
import type { z } from 'zod'
import { advisorySchema, analysisSchema, analysisSettingsSchema, createJobInputSchema, findingSchema, jobDocSchema, jobFileSchema, jobMediaSchema, jobSchema, jobStatusSchema, metadataCheckSchema } from './schema.js'

export type Advisory = z.infer<typeof advisorySchema>
export type Analysis = z.infer<typeof analysisSchema>
export type AnalysisSettings = z.infer<typeof analysisSettingsSchema>
export type CreateJobInput = z.infer<typeof createJobInputSchema>
export type Finding = z.infer<typeof findingSchema>
export type JobDoc = z.infer<typeof jobDocSchema>
export type JobFile = z.infer<typeof jobFileSchema>
export type JobMedia = z.infer<typeof jobMediaSchema>
export type Job = z.infer<typeof jobSchema>
export type JobStatus = z.infer<typeof jobStatusSchema>
export type MetadataCheck = z.infer<typeof metadataCheckSchema>
