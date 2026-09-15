import { readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'

const SRC = path.resolve('src')

const typeName = (schemaExport: string) => {
    const base = schemaExport.replace(/Schema$/, '')
    return base.charAt(0).toUpperCase() + base.slice(1)
}

const fileExists = async (p: string) => {
    try {
        await stat(p)
        return true
    } catch {
        return false
    }
}

const removeTypes = async (typesPath: string) => {
    const hasTypes = await fileExists(typesPath)

    if (hasTypes) {
        await rm(typesPath, { force: true })
    }
}

// Generate (or delete) the types.ts sibling for one folder that contains a schema.ts.
export const genFolder = async (dir: string) => {
    const schemaPath = path.join(dir, 'schema.ts')
    const typesPath = path.join(dir, 'types.ts')

    const hasSchema = await fileExists(schemaPath)

    if (!hasSchema) {
        await removeTypes(typesPath)
        return
    }

    // Cache-bust the import so watch mode picks up edits (Node caches ES modules by URL).
    const mod = await import(`${pathToFileURL(schemaPath).href}?t=${Date.now()}`)
    const schemas = Object.keys(mod).filter((key) => mod[key] instanceof z.ZodType)

    if (!schemas.length) {
        await removeTypes(typesPath)
        return
    }

    const out = [
        '// AUTO-GENERATED from schema.ts — do not edit by hand.',
        '/* eslint-disable */',
        `import type { z } from 'zod'`,
        `import { ${schemas.join(', ')} } from './schema.js'`,
        '',
        ...schemas.map((s) => `export type ${typeName(s)} = z.infer<typeof ${s}>`),
        '',
    ].join('\n')

    await writeFile(typesPath, out)
}

const findSchemaDirs = async (dir: string): Promise<string[]> => {
    const entries = await readdir(dir, { withFileTypes: true })
    const here = entries.some((e) => e.isFile() && e.name === 'schema.ts') ? [dir] : []
    const sub = await Promise.all(
        entries.filter((e) => e.isDirectory()).map((e) => findSchemaDirs(path.join(dir, e.name))),
    )
    return [here, ...sub].flat()
}

const runOnce = async () => {
    const dirs = await findSchemaDirs(SRC)
    await Promise.all(dirs.map(genFolder))
    console.log(`Generated types for ${dirs.length} folder(s).`)
}

const runWatch = async () => {
    const { default: chokidar } = await import('chokidar')
    await runOnce()
    const onEvent = (changed: string) => {
        genFolder(path.dirname(changed)).catch((err) => console.error(err))
    }
    chokidar
        .watch(path.join(SRC, '**', 'schema.ts'), { ignoreInitial: true })
        .on('add', onEvent)
        .on('change', onEvent)
        .on('unlink', onEvent)
    console.log('Watching src/**/schema.ts for changes …')
}

if (process.argv.includes('--watch')) {
    await runWatch()
} else {
    await runOnce()
}
