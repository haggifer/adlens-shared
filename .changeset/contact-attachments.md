---
'adlens-shared': minor
---

Contact messages: the message cap drops from 5000 to 2000 characters (`CONTACT_MESSAGE_MAX_LENGTH`), and a message can
attach up to 5 images (PNG, JPEG or WebP; 8 MB each, 25 MB together). `createContactUploadsInputSchema` and
`createContactUploadsResponseSchema` describe the signed image uploads; `sendContactMessageInputSchema` is the request
body, which adds a Turnstile `challengeToken` or the uploads' single-use `draftId` to the visitor's fields
(`contactMessageInputSchema`). `challengeTokenSchema` is now exported.
