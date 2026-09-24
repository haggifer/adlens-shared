import { z } from 'zod'

export const CONTACT_MESSAGE_MAX_LENGTH = 5000

// A message to the AdLens team. `website` is a honeypot: the form hides it, so a filled-in value marks a bot.
export const contactMessageInputSchema = z.strictObject({
    email: z.email().max(254),
    message: z.string().trim().min(10).max(CONTACT_MESSAGE_MAX_LENGTH),
    website: z.string().max(200).optional(),
})

export type ContactMessageInput = z.input<typeof contactMessageInputSchema>
export type ContactMessagePayload = z.output<typeof contactMessageInputSchema>
