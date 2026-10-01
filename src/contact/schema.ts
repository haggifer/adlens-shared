import { z } from 'zod'
import { challengeTokenSchema, uploadTargetSchema } from '../jobs/schema.js'

export const CONTACT_MESSAGE_MAX_LENGTH = 2000

export const CONTACT_MAX_ATTACHMENTS = 5

// A 4K screenshot is usually 1-4 MB as a PNG. The total keeps the email the API sends, attachments included, under its
// mail provider's 40 MB limit after base64 encoding.
export const CONTACT_ATTACHMENT_MAX_BYTES = 8 * 1000 * 1000

export const CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES = 25 * 1000 * 1000

export const contactAttachmentTypeSchema = z.enum(['image/png', 'image/jpeg', 'image/webp'])

// What the visitor writes. `website` is a honeypot: the form hides it, so a filled-in value marks a bot.
export const contactMessageInputSchema = z.strictObject({
    email: z.email().max(254),
    message: z.string().trim().min(10).max(CONTACT_MESSAGE_MAX_LENGTH),
    website: z.string().max(200).optional(),
})

// A message to the AdLens team as the API receives it: either a fresh human check, or the draft id returned with the
// image uploads, which stands in for that check once and attaches the uploaded images.
export const sendContactMessageInputSchema = contactMessageInputSchema
    .extend({
        challengeToken: challengeTokenSchema.optional(),
        draftId: z.string().min(1).max(64).optional(),
    })
    .refine((input) => Boolean(input.challengeToken) !== Boolean(input.draftId), {
        message: 'Send either a challenge token or a draft id',
        path: ['challengeToken'],
    })

// An image the visitor wants to attach, declared before it's uploaded.
export const contactAttachmentFileSchema = z.strictObject({
    name: z.string().min(1).max(255),
    contentType: contactAttachmentTypeSchema,
    size: z.number().int().positive().max(CONTACT_ATTACHMENT_MAX_BYTES),
})

export const createContactUploadsInputSchema = z.strictObject({
    files: z
        .array(contactAttachmentFileSchema)
        .min(1)
        .max(CONTACT_MAX_ATTACHMENTS)
        .refine((files) => files.reduce((total, file) => total + file.size, 0) <= CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES, {
            message: 'The images are too large together',
        }),
    challengeToken: challengeTokenSchema,
})

// One signed upload per declared file, in the same order.
export const createContactUploadsResponseSchema = z.object({
    draftId: z.string(),
    uploads: z.array(uploadTargetSchema),
})

export type ContactMessageInput = z.input<typeof contactMessageInputSchema>
export type ContactMessagePayload = z.output<typeof contactMessageInputSchema>
export type SendContactMessageInput = z.input<typeof sendContactMessageInputSchema>
export type SendContactMessagePayload = z.output<typeof sendContactMessageInputSchema>
export type ContactAttachmentType = z.infer<typeof contactAttachmentTypeSchema>
export type ContactAttachmentFile = z.infer<typeof contactAttachmentFileSchema>
export type CreateContactUploadsInput = z.input<typeof createContactUploadsInputSchema>
export type CreateContactUploadsResponse = z.infer<typeof createContactUploadsResponseSchema>
