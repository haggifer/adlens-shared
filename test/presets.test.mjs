import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
    presetListResponseSchema,
    presetNameSchema,
    presetResponseSchema,
    presetSchema,
    PRESET_NAME_MAX_LENGTH,
    savePresetInputSchema,
    setDefaultPresetInputSchema,
} from '../dist/index.js'

const validPreset = {
    id: 'p1',
    name: 'Meta reels',
    settings: { platforms: ['Meta'], placements: ['meta_reels'], markets: ['US'] },
    isDefault: false,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-13T10:00:00.000Z',
}

test('a preset name is trimmed and must keep 1 to PRESET_NAME_MAX_LENGTH characters', () => {
    assert.equal(presetNameSchema.parse('  Meta reels  '), 'Meta reels')
    assert.equal(presetNameSchema.safeParse('').success, false)
    assert.equal(presetNameSchema.safeParse('   ').success, false)
    assert.equal(presetNameSchema.safeParse('a'.repeat(PRESET_NAME_MAX_LENGTH)).success, true)
    assert.equal(presetNameSchema.safeParse('a'.repeat(PRESET_NAME_MAX_LENGTH + 1)).success, false)
})

test('saving a preset trims the name, takes optional flags and defaults the settings lists', () => {
    const saved = savePresetInputSchema.parse({ name: '  Meta reels  ', settings: {} })

    assert.deepEqual(saved, { name: 'Meta reels', settings: { platforms: [], placements: [], markets: [] } })
    assert.equal(savePresetInputSchema.safeParse({ name: 'a', settings: {}, isDefault: true }).success, true)
    assert.equal(savePresetInputSchema.safeParse({ name: 'a', settings: {}, overwrite: false }).success, true)
    assert.equal(savePresetInputSchema.safeParse({ name: 'a', settings: {}, isDefault: 'yes' }).success, false)
    assert.equal(savePresetInputSchema.safeParse({ name: 'a', settings: {}, overwrite: 1 }).success, false)
})

test('saving a preset rejects a blank or too long name and unknown keys', () => {
    assert.equal(savePresetInputSchema.safeParse({ name: '', settings: {} }).success, false)
    assert.equal(savePresetInputSchema.safeParse({ name: '   ', settings: {} }).success, false)
    assert.equal(savePresetInputSchema.safeParse({ name: 'a'.repeat(51), settings: {} }).success, false)
    assert.equal(savePresetInputSchema.safeParse({ name: 'a'.repeat(50), settings: {} }).success, true)
    assert.equal(savePresetInputSchema.safeParse({ name: 'a', settings: {}, userId: 'u1' }).success, false)
    assert.equal(savePresetInputSchema.safeParse({ settings: {} }).success, false)
})

test('saving a preset applies the settings rules', () => {
    assert.equal(
        savePresetInputSchema.safeParse({ name: 'a', settings: { platforms: [], placements: ['meta_reels'] } }).success,
        false,
    )
})

test('setting the default names a preset (at most 64 characters) or clears it with null, and the field is required', () => {
    assert.equal(setDefaultPresetInputSchema.safeParse({ presetId: 'x' }).success, true)
    assert.equal(setDefaultPresetInputSchema.safeParse({ presetId: null }).success, true)
    assert.equal(setDefaultPresetInputSchema.safeParse({}).success, false)
    assert.equal(setDefaultPresetInputSchema.safeParse({ presetId: '' }).success, false)
    assert.equal(setDefaultPresetInputSchema.safeParse({ presetId: 'a'.repeat(64) }).success, true)
    assert.equal(setDefaultPresetInputSchema.safeParse({ presetId: 'a'.repeat(65) }).success, false)
    assert.equal(setDefaultPresetInputSchema.safeParse({ presetId: 'x', extra: 1 }).success, false)
})

test('a preset carries its settings, default flag, usage and ISO timestamps', () => {
    assert.equal(presetSchema.safeParse(validPreset).success, true)
    assert.equal(presetSchema.safeParse({ ...validPreset, lastUsedAt: '2026-10-13T11:00:00.000Z' }).success, true)
    assert.equal(presetSchema.safeParse({ ...validPreset, lastUsedAt: undefined }).success, false)
    assert.equal(presetSchema.safeParse({ ...validPreset, usageCount: -1 }).success, false)
    assert.equal(presetSchema.safeParse({ ...validPreset, usageCount: 1.5 }).success, false)
    assert.equal(presetSchema.safeParse({ ...validPreset, createdAt: new Date() }).success, false)
    assert.equal('userId' in presetSchema.parse({ ...validPreset, userId: 'u1' }), false)
})

test('the preset responses wrap one preset or a list', () => {
    assert.equal(presetResponseSchema.safeParse({ preset: validPreset }).success, true)
    assert.equal(presetResponseSchema.safeParse({ presets: [validPreset] }).success, false)
    assert.equal(presetListResponseSchema.safeParse({ presets: [validPreset] }).success, true)
    assert.equal(presetListResponseSchema.safeParse({ presets: [] }).success, true)
    assert.equal(presetListResponseSchema.safeParse({ preset: validPreset }).success, false)
})
