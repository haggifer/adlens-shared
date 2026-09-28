# Changelog

## 0.13.0

### Minor Changes

-   e3616d7: Analysis without an account: `createJobInputSchema` and `createSampleJobInputSchema` accept an optional
    `challengeToken` (a Cloudflare Turnstile token, 1-2048 characters), and `RequestErrorCode` adds `SIGN_UP_REQUIRED`,
    `CHALLENGE_REQUIRED`, `CHALLENGE_FAILED`, `NETWORK_QUOTA_EXCEEDED` and `DISPOSABLE_EMAIL`.

## 0.12.0

### Minor Changes

-   b23b76e: Breaking: the quota is a rolling window. `quotaSchema.windowStart` is replaced by `nextFreeAt`, the time the oldest
    counted run stops counting (null when no run counts); `used` is the number of runs charged within the last
    `QUOTA_WINDOW_MS`.

## 0.11.0

### Minor Changes

-   353f973: Add `MIN_PASSWORD_LENGTH` (8), the minimum password length the API enforces, so clients validate and hint with the
    same value.

## 0.10.0

### Minor Changes

-   29aa90a: Breaking: `VideoMimeType` drops `Mpeg` (`video/mpeg`) and `Flv` (`video/x-flv`). Gemini reads them, but browsers
    can't play them, so the web app could neither preview nor replay such uploads.

## 0.9.0

### Minor Changes

-   74bcca0: Breaking: `quotaSchema.limit` is now nullable. `null` marks an unlimited account, whose runs are counted but never
    capped; clients must treat it as "no limit" rather than a number.

## 0.8.0

### Minor Changes

-   90394e1: Breaking: remove `audience` and `brand` from the analysis settings. No rule was selected or judged by them; they only
    added free text to the review prompt. Settings now reject them as unknown keys.

## 0.7.0

### Minor Changes

-   694ccf1: Add `contactMessageInputSchema` (and `CONTACT_MESSAGE_MAX_LENGTH`) for the Contact form: a reply address, the message, and an optional honeypot field.
-   f71f15f: Add the `JOB_IN_PROGRESS` request error code, returned when deleting an analysis that is still being verified or analyzed.

## 0.6.0

### Minor Changes

-   Breaking: remove `objective` from the analysis settings (and the `objectiveSchema` / `Objective` exports). No rule was selected by it; settings now reject it as an unknown key.
-   Add sample ads: `sampleSchema` and `sampleListResponseSchema` for listing them with measured media, suggested settings and a preview URL, `createSampleJobInputSchema` for analyzing one without an upload, and an optional `sampleId` on the public job.

## 0.5.0

### Minor Changes

-   Build, test and publish on Node 24 LTS. The contract is unchanged from 0.4.0.

## 0.4.0

### Minor Changes

-   Redesign the contract around what the API actually exposes.

    -   **Breaking:** `jobSchema` is now the public job: no `userId`, `execution`, or storage `bucket`/`path`; `errorCode`
        replaces the free-text `error`; timestamps are ISO-8601 strings (`isoTimestampSchema`).
    -   **Breaking:** the persistence schemas (`jobDocSchema`, `profileDocSchema`, `quotaDocSchema`) and the profile schemas
        are removed; the API composes its documents from the exported building blocks.
    -   **Breaking:** settings target `platforms` (7), `placements` (12) and `markets`; `focus` is removed. A placement
        requires its platform.
    -   Uploads are limited to the video MIME types Gemini reads (`VideoMimeType`); `MAX_DURATION_S`, `MAX_UPLOAD_BYTES` and
        `QUOTA_WINDOW_MS` are exported.
    -   Findings carry a structured `time` range; analyses record `promptVersion`.
    -   New: `jobErrorCodeSchema`, `apiErrorSchema`, response envelopes (`createJobResponseSchema` with a signed upload
        target, `jobListResponseSchema` with a cursor, `jobVideoResponseSchema`) and a nullable quota `windowStart`.
    -   Types are inferred next to each schema; the type generator is gone. CommonJS consumers get `.d.cts` declarations.

## 0.3.0 — not published

Superseded by 0.4.0 before it reached npm.

### Added

-   Persistence-first document schemas (`jobDocSchema`, `profileDocSchema`, `quotaDocSchema`) describing the stored MongoDB
    documents; the API wire schemas are derived from them.

## 0.2.0 — 2026-09-15

### Added

-   `Job.execution` (optional string): the Cloud Run Job execution name that ran a job's analysis, recorded for traceability now that analysis runs as an on-demand Cloud Run Job instead of a BullMQ worker.

## 0.1.0

-   Initial release: Zod schemas (the source of truth) and generated types for jobs and users, shared by the AdLens web app (ESM) and API (CJS) through a dual tsup build.
