export const MAX_DURATION_S = 3 * 60

export const MAX_UPLOAD_BYTES = 50 * 1000 * 1000

// Enforced by the API's Better Auth config; the web validates and hints with the same value.
export const MIN_PASSWORD_LENGTH = 8

// The quota's rolling window: a charged run counts for this long after it started.
export const QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
