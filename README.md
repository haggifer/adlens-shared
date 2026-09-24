# adlens-shared

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

Schemas live in `src/**/schema.ts`, each followed by its inferred types (`z.output` for what the API returns,
`z.input` for request bodies the client fills in).

```bash
npm run build          # tsup → dist/ (ESM + CJS, with .d.ts and .d.cts)
npm test               # contract tests against the built package
npm run lint
npm run check:package  # publint + are-the-types-wrong
```

To try unreleased changes in a consumer without touching its `package.json`:

```bash
npm pack                                                             # in adlens-shared
npm install --no-save ../adlens-shared/adlens-shared-<version>.tgz   # in the consumer
```

Any later `npm install` or `npm ci` in the consumer restores the pinned version. `file:` dependencies are never
committed; each consumer has a `check:deps` guard against them.

## Release

Releases are published by CI with npm trusted publishing (OIDC, no token, provenance attached):

1. Describe the change: `npx changeset` (pick patch / minor / major).
2. Apply it: `npm run version-packages` bumps `version`, writes `CHANGELOG.md` and syncs the lockfile. Commit them.
3. Tag and push the tag by name: `git tag v<version> && git push origin HEAD v<version>`. The `Release` workflow checks
   that the tag matches `package.json` and runs `npm publish`.

Consumers then receive a Dependabot pull request that bumps the exact pin.

## Design decisions

-   **Schemas first, types inferred.** Types come from the schemas with `z.infer`, so there is no codegen step and a
    type can't disagree with the validation that enforces it.
-   **The package holds only the contract.** Persistence schemas and server-only fields (owner, storage paths,
    accounting) live in the API, which composes its documents from these building blocks, so they can never reach a
    client.
-   **Dual ESM and CommonJS builds with separate declaration files**, because the web app is ESM and the API is
    CommonJS. CI checks both entry points with `publint` and are-the-types-wrong.
-   **A published, versioned package rather than a monorepo.** The web app and the API deploy independently (Vercel and
    Cloud Run), and an exact version pin makes every contract change an explicit, reviewable bump. The cost is a release
    step, which CI automates.
