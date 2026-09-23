import { defineConfig } from 'tsup'

// Dual-format build so an ESM consumer (the Next.js frontend) and a CommonJS consumer (the NestJS API) both import
// the package natively, each with its own declaration file (.d.ts / .d.cts).
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    outDir: 'dist',
    target: 'es2022',
    sourcemap: true,
})
