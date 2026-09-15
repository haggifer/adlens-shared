# adlens-shared

Shared **Zod schemas** for AdLens — the single source of truth for the data model — with TypeScript types generated from them. Consumed by both the `adlens` frontend and the `adlens-api` backend, so validation and types never drift.

## Install

No npm registry — installed straight from GitHub:

```bash
npm install github:haggifer/adlens-shared
```

Pin to a tag or commit for reproducibility:

```bash
npm install github:haggifer/adlens-shared#v0.4.0
```

npm clones the repo and runs the `prepare` script (`gen` + `tsc`) at install time, so consumers get compiled `dist/` with `.d.ts` declarations. If the repo is private, the installing machine needs Git credentials (a `gh`-configured git, an SSH key, or a token).

## Usage

```ts
// runtime validators + inferred types both come from the package root
import { createJobInputSchema, type Job, type Analysis } from 'adlens-shared'
```

Timestamp fields use `FirestoreTimestamp`, a structural type that both `firebase-admin` and `firebase` (client) `Timestamp` objects satisfy — so this package depends on neither SDK.

## Develop

Schemas are the source of truth: edit `src/**/schema.ts`; the `gen` script regenerates the sibling `types.ts` files from the exported Zod schemas.

```bash
npm install     # runs prepare (gen + build) automatically
npm run build   # gen + tsc → dist/
```

Bump the `version` in `package.json`, commit, tag, and push; consumers pull via `npm update adlens-shared` (or by re-pinning the tag).
