import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
    CONTACT_ATTACHMENT_MAX_BYTES,
    CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES,
    CONTACT_MAX_ATTACHMENTS,
    CONTACT_MESSAGE_MAX_LENGTH,
    contactMessageInputSchema,
    createContactUploadsInputSchema,
    sendContactMessageInputSchema,
} from '../dist/index.js'

const validMessage = { email: 'someone@example.com', message: 'I would like to know more about AdLens.' }

test('a contact message needs a reply address and a message, and may carry the honeypot', () => {
    assert.equal(contactMessageInputSchema.safeParse(validMessage).success, true)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, website: '' }).success, true)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, email: 'not an email' }).success, false)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, message: '   hi   ' }).success, false)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, userId: 'u1' }).success, false)
})

test('CONTACT_MESSAGE_MAX_LENGTH is the message cap the schema enforces', () => {
    const atLimit = { ...validMessage, message: 'x'.repeat(CONTACT_MESSAGE_MAX_LENGTH) }
    const overLimit = { ...validMessage, message: 'x'.repeat(CONTACT_MESSAGE_MAX_LENGTH + 1) }

    assert.equal(contactMessageInputSchema.safeParse(atLimit).success, true)
    assert.equal(contactMessageInputSchema.safeParse(overLimit).success, false)
})

test('the email and honeypot fields are length-capped', () => {
    const longLocalPart = 'a'.repeat(250) // + '@b.co' = 255 chars, one past the 254-char email cap

    assert.equal(
        contactMessageInputSchema.safeParse({ ...validMessage, email: `${longLocalPart}@b.co` }).success,
        false,
    )
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, website: 'w'.repeat(200) }).success, true)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, website: 'w'.repeat(201) }).success, false)
})

test('a sent message carries either a fresh human check or the draft id of its uploaded images, never both', () => {
    assert.equal(sendContactMessageInputSchema.safeParse({ ...validMessage, challengeToken: 'token' }).success, true)
    assert.equal(sendContactMessageInputSchema.safeParse({ ...validMessage, draftId: 'draft' }).success, true)
    assert.equal(sendContactMessageInputSchema.safeParse(validMessage).success, false)
    assert.equal(
        sendContactMessageInputSchema.safeParse({ ...validMessage, challengeToken: 'token', draftId: 'draft' }).success,
        false,
    )
    assert.equal(
        sendContactMessageInputSchema.safeParse({ ...validMessage, challengeToken: 't', extra: 1 }).success,
        false,
    )
})

test('image uploads are PNG, JPEG or WebP, limited in number, each and together within their size caps', () => {
    const image = { name: 'screenshot.png', contentType: 'image/png', size: 3_000_000 }
    const uploads = (files) => createContactUploadsInputSchema.safeParse({ files, challengeToken: 'token' }).success
    // Files at their own cap, one more than the total cap holds, and still within the count cap.
    const overTotalCount = Math.floor(CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES / CONTACT_ATTACHMENT_MAX_BYTES) + 1

    assert.equal(uploads([image]), true)
    assert.equal(
        uploads([
            { ...image, contentType: 'image/webp' },
            { ...image, contentType: 'image/jpeg' },
        ]),
        true,
    )
    assert.equal(uploads([]), false)
    assert.equal(uploads(Array(CONTACT_MAX_ATTACHMENTS + 1).fill(image)), false)
    assert.equal(uploads([{ ...image, contentType: 'image/gif' }]), false)
    assert.equal(uploads([{ ...image, size: CONTACT_ATTACHMENT_MAX_BYTES + 1 }]), false)
    assert.ok(overTotalCount <= CONTACT_MAX_ATTACHMENTS)
    assert.equal(uploads(Array(overTotalCount).fill({ ...image, size: CONTACT_ATTACHMENT_MAX_BYTES })), false)
    assert.equal(createContactUploadsInputSchema.safeParse({ files: [image] }).success, false)
})
