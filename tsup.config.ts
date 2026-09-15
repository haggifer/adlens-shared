import { defineConfig } from 'tsup'

// Dual-format build so an ESM consumer (the Next.js frontend) and a CommonJS consumer (the NestJS
// API) both import the package naturally. Types are generated once from the Zod schemas by `gen`.
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    outDir: 'dist',
    target: 'es2022',
    sourcemap: true,
})
