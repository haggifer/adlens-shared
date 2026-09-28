export const MAX_DURATION_S = 60

export const MAX_UPLOAD_BYTES = 200 * 1000 * 1000

// Enforced by the API's Better Auth config; the web validates and hints with the same value.
export const MIN_PASSWORD_LENGTH = 8

// Quota windows roll: the first analysis starts a window, and the next analysis after it expires starts a new one.
export const QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
