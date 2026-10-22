# Changelog

## 1.0.0

### Major Changes

-   cabf937: First stable release. The contract is unchanged from 0.20.0; from now on, removing or narrowing anything
    consumers use bumps the major version.

## 0.20.0

### Minor Changes

-   d495fff: Add restarting a failed analysis: `isJobRestartable(job, now?)` (a failed job, not restarted yet, within
    `JOB_START_WINDOW_MS` of its creation), `restartedAs` on the public job (the job that runs a restarted one again), and
    the `JOB_NOT_RESTARTABLE` request error code for the API's `POST /v1/jobs/:id/restart`. Add the `MODEL_UNAVAILABLE`
    job error code for a run the AI model failed on its side (overloaded, rate-limited, erred or too slow).
-   3708cb2: Add the admin response contract: `adminJobsResponseSchema` and `adminUsersResponseSchema`, with the
    `AdminJob`, `AdminUser` and `AdminModelCall` records they carry, for the API's admin routes and the web app's Admin
    page.
-   0297263: Change the video limits: `MAX_DURATION_S` 60 → 180 (3 minutes), `MAX_UPLOAD_BYTES` 200 MB → 50 MB. The
    smaller upload cap narrows the job input schemas, so a client still allowing up to 200 MB is refused above 50 MB.

## 0.19.1

### Patch Changes

-   Tests only: the contract tests no longer repeat static values and can fail. The published code is unchanged.

## 0.19.0

### Minor Changes

-   c0a7fed: Add live updates: the `LiveEvent` enum (`presets`, `job`), `liveJobEventSchema`, `getLiveChannel(userId)`, and
    `liveTokenRequestSchema` / `liveTokenResponseSchema` for the API's `GET /v1/live/token`.

## 0.18.0

### Minor Changes

-   462431f: Add settings presets: `presetSchema`, `savePresetInputSchema`, `setDefaultPresetInputSchema`, the preset responses,
    `MAX_PRESETS`, `PRESET_NAME_MAX_LENGTH` and the `PRESET_NAME_TAKEN` / `PRESET_LIMIT_REACHED` codes; `presetId` (at
    most 64 characters) on both job inputs and on the public job (the preset the run was counted for, or null).

## 0.17.1

### Patch Changes

-   08e254f: License the package under MIT; it was published as UNLICENSED.

## 0.17.0

### Minor Changes

-   Add `demoSchema` and `demoListResponseSchema` (types `Demo`, `DemoListResponse`): a finished analysis shown on the demo page, with its tab label, summary title and subtitle, the public job and a signed video URL.

## 0.16.0

### Minor Changes

-   c544c35: A metadata check can name the platforms (`platform`) and the selected placements (`placements`) its spec binds, and
    state its rule as a sentence (`check`), so a report can say which placement a video won't work for. All three are
    optional: results stored before them still parse.

## 0.15.1

### Patch Changes

-   Internal only: the settings refinement's placement check is a named function and the schema helpers sit before the
    schemas. No change to any schema, message or export.

## 0.15.0

### Minor Changes

-   Two job error codes for a run that never started: `VIDEO_CHECK_FAILED` (the video couldn't be checked) and
    `UPLOAD_FAILED` (no complete upload when the run was started, or none hours after the job was created). A job that
    fails to start now ends with one of them instead of staying `pending`.

## 0.14.2

### Patch Changes

-   Package metadata only: `license` is `UNLICENSED` (no rights are granted to use the package outside AdLens) and
    `engines.node` is `>=20`. No change to any schema or export.

## 0.14.1

### Patch Changes

-   Documentation only: corrected schema comments (`SIGN_UP_REQUIRED`, `JOB_IN_PROGRESS`, `challengeTokenSchema`,
    `uploadTargetSchema`) and the README's note on how types are inferred. No change to any schema or export.

## 0.14.0

### Minor Changes

-   353e64a: Contact messages: the message cap drops from 5000 to 2000 characters (`CONTACT_MESSAGE_MAX_LENGTH`), and a message can
    attach up to 5 images (PNG, JPEG or WebP; 8 MB each, 25 MB together). `createContactUploadsInputSchema` and
    `createContactUploadsResponseSchema` describe the signed image uploads; `sendContactMessageInputSchema` is the request
    body, which adds a Turnstile `challengeToken` or the uploads' single-use `draftId` to the visitor's fields
    (`contactMessageInputSchema`). `challengeTokenSchema` is now exported.
-   cb931f7: New request error code `EMAIL_CONFIRMATION_REQUIRED`: an account whose email isn't confirmed has run the one analysis it
    may run before confirming. `SIGN_UP_REQUIRED` now also covers an anonymous user's one analysis.
-   859693b: `analysisSettingsSchema` accepts each platform, placement and market at most once, so no list is longer than its enum;
    a repeated option is rejected. Narrows what the API accepts.

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
