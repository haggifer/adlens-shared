import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONTACT_MESSAGE_MAX_LENGTH, contactMessageInputSchema } from '../dist/index.js'

const validMessage = { email: 'someone@example.com', message: 'I would like to know more about AdLens.' }

test('a contact message needs a reply address and a message, and may carry the honeypot', () => {
    assert.equal(contactMessageInputSchema.safeParse(validMessage).success, true)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, website: '' }).success, true)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, email: 'not an email' }).success, false)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, message: '   hi   ' }).success, false)
    assert.equal(contactMessageInputSchema.safeParse({ ...validMessage, userId: 'u1' }).success, false)
})

test('CONTACT_MESSAGE_MAX_LENGTH is the message cap the schema enforces', () => {
    assert.equal(CONTACT_MESSAGE_MAX_LENGTH, 5000)

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
