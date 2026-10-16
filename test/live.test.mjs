import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getLiveChannel, LiveEvent, liveJobEventSchema, liveTokenResponseSchema } from '../dist/index.js'

const TOKEN_REQUEST = {
    keyName: 'app.key',
    ttl: 3600000,
    timestamp: 1760000000000,
    capability: '{"user:u1":["subscribe"]}',
    nonce: 'n1',
    mac: 'm1',
}

test('each user has a channel of their own', () => {
    assert.equal(getLiveChannel('u1'), 'user:u1')
    assert.notEqual(getLiveChannel('u1'), getLiveChannel('u2'))
})

test('the live events are presets and job', () => {
    assert.deepEqual(Object.values(LiveEvent).sort(), ['job', 'presets'])
})

test('a job event names the job and nothing more', () => {
    assert.deepEqual(liveJobEventSchema.parse({ id: 'j1', status: 'analyzed' }), { id: 'j1' })
    assert.equal(liveJobEventSchema.safeParse({}).success, false)
})

test('the token response carries a signed token request, or null when live updates are off', () => {
    assert.deepEqual(liveTokenResponseSchema.parse({ tokenRequest: TOKEN_REQUEST }).tokenRequest, TOKEN_REQUEST)
    assert.equal(liveTokenResponseSchema.parse({ tokenRequest: null }).tokenRequest, null)
    assert.equal(liveTokenResponseSchema.safeParse({}).success, false)
    assert.equal(
        liveTokenResponseSchema.safeParse({ tokenRequest: { ...TOKEN_REQUEST, mac: undefined } }).success,
        false,
    )
})
