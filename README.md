# adlens-shared

> Part of **[AdLens](https://github.com/haggifer/adlens)**, AI policy checks for video ads · [Live](https://www.useadlens.com)

[![CI](https://github.com/haggifer/adlens-shared/actions/workflows/ci.yml/badge.svg?branch=init-setup)](https://github.com/haggifer/adlens-shared/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/adlens-shared)](https://www.npmjs.com/package/adlens-shared)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

The AdLens API contract: **Zod schemas** that are the single source of truth for requests, responses, errors and the
public job shape, plus the TypeScript types inferred from them. Both sides of AdLens consume it, so validation and
types can't drift between them:

-   [`adlens`](https://github.com/haggifer/adlens): the Next.js web app (ESM)
-   [`adlens-api`](https://github.com/haggifer/adlens-api): the NestJS API and analysis worker (CommonJS)

## Install

```bash
npm install adlens-shared zod
```

`zod` (v4) is a peer dependency, so the consumer's own copy is used.

## Usage

```ts
import { createJobInputSchema, type Job } from 'adlens-shared'
```

## Develop

Schemas live in `src/<area>/schema.ts` (`common`, `contact`, `errors`, `jobs`, `live`, `presets`, `quota`), each followed by its
inferred types (`z.output` for what the API returns, `z.input` for request bodies the client fills in). The preset id
schema sits in `src/presets/id.ts`, apart from the presets schemas, because the job inputs use it too.
`src/jobs/restart.ts` holds the one rule both sides apply to restarting a failed job: the API refuses what
`isJobRestartable` refuses, and the web offers a restart only where it allows one.

```bash
npm run build          # tsup → dist/ (ESM + CJS, with .d.ts and .d.cts)
npm test               # contract tests against the built package
npm run lint
npm run check:package  # publint + are-the-types-wrong
```

To try unreleased changes in a consumer without touching its `package.json`, pack them under a prerelease version, so
a local build can never pass for a published one:

```bash
npm run build && npm version <next>-dev.0 --no-git-tag-version   # in adlens-shared, e.g. 0.18.0-dev.0
npm pack --pack-destination <a folder outside the repo>
npm version <current> --no-git-tag-version --allow-same-version  # back to the released version; git shows no change
npm install --no-save <that folder>/adlens-shared-<next>-dev.0.tgz # in the consumer
```

Any later `npm install` or `npm ci` in the consumer restores the pinned version. Consumers pin a published version,
never a `file:` dependency, which would only resolve on a developer's machine.

## Release

Releases are published by CI with npm trusted publishing (OIDC, no token, provenance attached):

1. Describe the change: `npx changeset` (pick patch / minor / major).
2. Apply it: `npm run version-packages` bumps `version`, writes `CHANGELOG.md` and syncs the lockfile. Commit them.
3. Tag and push the tag by name: `git tag v<version> && git push origin HEAD v<version>`. The `Release` workflow checks
   that the tag matches `package.json` and runs `npm publish`.

Consumers then receive a Dependabot pull request that bumps the exact pin.

## Design decisions

-   **Schemas first, types inferred.** Types come from the schemas with `z.output` and `z.input`, so there is no codegen
    step and a type can't disagree with the validation that enforces it.
-   **The package holds only the contract.** Persistence schemas and server-only fields (owner, storage paths,
    accounting) live in the API, which composes its documents from these building blocks, so they can never reach a
    client.
-   **Dual ESM and CommonJS builds with separate declaration files**, because the web app is ESM and the API is
    CommonJS. CI checks both entry points with `publint` and are-the-types-wrong.
-   **A published, versioned package rather than a monorepo.** The web app and the API deploy independently (Vercel and
    Cloud Run), and an exact version pin makes every contract change an explicit, reviewable bump. The cost is a release
    step, which CI automates.

## License

[MIT](LICENSE).
