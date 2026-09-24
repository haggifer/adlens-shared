# AGENTS.md

Guidance for coding agents working in this repository. Read [README.md](README.md) first: it covers development,
releases and the design decisions behind the package.

## Commands

```bash
npm run build            # tsup → dist/
npm run lint
npx tsc --noEmit
npm test                 # contract tests against the built package (build first)
npm run check:package    # publint + are-the-types-wrong
npx changeset            # describe a change for the next release
```

## Rules that must not break

-   Only the public contract belongs here: request and response bodies, errors, the public job shape, shared enums and
    limits. Server-only fields and persistence schemas stay in the API.
-   Every schema is followed by its inferred types: `z.output` for what the API returns, `z.input` for request bodies.
    Don't hand-write a type that a schema already describes.
-   Request schemas are strict (`z.strictObject`), so clients can only send allowlisted fields.
-   Anything that changes the published package needs a changeset. Never edit `version` or `CHANGELOG.md` by hand; run
    `npm run version-packages`.
-   Removing or narrowing anything consumers use is a breaking change: a minor bump while the version is 0.x.

## Conventions

-   More than three fixed options → a TypeScript enum with a `z.enum(...)` schema; fewer → a string union.
-   Formatting is Prettier (`.prettierrc`); linting is ESLint. Format only the files you touch.
-   Comments explain why, not what.
-   Commits follow Conventional Commits (`feat(scope): …`, `fix: …`, `docs: …`), one commit per distinct change.
-   When a change affects a command, the release flow or a design decision, update README.md or this file in the same
    commit.

## Gotchas

-   Consumers pin exact versions, so a merged change reaches them only after a release and a pin bump.
-   `git push --follow-tags` skips lightweight tags; push the release tag by name.
