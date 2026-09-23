# adlens-shared

The AdLens API contract: **Zod schemas** that are the single source of truth for the data model, plus the
TypeScript types inferred from them. The `adlens` web app (ESM) and the `adlens-api` backend (CommonJS) both
consume it, so validation and types never drift between them.

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
`z.input` for request bodies the client fills in). The package holds only the **contract**; the API composes its
MongoDB document schemas from these building blocks, so storage details never leak into it.

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

`file:` dependencies are never committed; each consumer has a `check:deps` guard against them.

## Release

Releases are published by CI with npm trusted publishing (OIDC, no token, provenance attached):

1. Describe the change: `npx changeset` (pick patch / minor / major).
2. Apply it: `npm run version-packages` bumps `version` and writes `CHANGELOG.md`. Commit both.
3. Tag and push: `git tag v<version> && git push --follow-tags`. The `Release` workflow checks that the tag
   matches `package.json` and runs `npm publish`.

Consumers then receive a Dependabot pull request that bumps the exact pin.
