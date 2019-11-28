'use strict'

const crypto = require('crypto')
const axios = require('axios')
const { test } = require('tap')
const sinon = require('sinon')
const Fastify = require('fastify')
const fastifyMailgun = require('../src/index')

const createRandomHex = function (size) {
  return new Array(size).fill('').map(i => Math.ceil(Math.random() * 15).toString(16)).join('')
}

const createApiKey = function () {
  return `${createRandomHex(30)}-${createRandomHex(8)}-${createRandomHex(8)}`
}

const createWebhookPayload = function ({ apiKey: _apiKey } = {}) {
  const timestamp = Math.round((new Date().getTime()) / 1000)
  const token = createRandomHex(50)
  const apiKey = _apiKey || createApiKey()
  const signature = crypto.createHmac('sha256', apiKey).update(`${timestamp}${token}`).digest('hex')
  return { signature: { timestamp, token, signature }, 'event-data': { event: '' } }
}

test('valid configuration', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMailgun, { apiKey: '1234567890', domain: 'mydomain.com', webhookHandler: () => {} })

  await fastify.ready()
  t.strictEqual(fastify.mailgun.client.apiKey, '1234567890')
  t.strictEqual(fastify.mailgun.client.domain, 'mydomain.com')
  await fastify.close()
})

test('missing configuration', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMailgun)

  try {
    await fastify.ready()
    t.fail('should not boot successfully')
  } catch (err) {
    t.ok(err)
    await fastify.close()
  }
})

test('webhook is a function', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMailgun, { apiKey: '1234567890', domain: 'mydomain.com', webhookHandler: {} })

  try {
    await fastify.ready()
    t.fail('should not boot successfully')
  } catch (err) {
    t.ok(err)
    await fastify.close()
  }
})

test('invalid webhook signature', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMailgun, { apiKey: createApiKey(), domain: 'mydomain.com', webhookHandler: async () => { return 'ok' } })

  await fastify.ready()
  const req = { url: '/mailgun/webhook', method: 'POST', payload: createWebhookPayload() }
  const res = await fastify.inject(req)
  const result = JSON.parse(res.body)
  t.strictEqual(result.statusCode, 500)
  t.strictEqual(result.message, 'Invalid webhook signature')
  await fastify.close()
})

test('ignore invalid webhook signature', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMailgun, { apiKey: createApiKey(), domain: 'mydomain.com', validateWebhooks: false, webhookHandler: async () => { return 'ok' } })

  await fastify.ready()
  const req = { url: '/mailgun/webhook', method: 'POST', payload: createWebhookPayload() }
  const res = await fastify.inject(req)
  t.strictEqual(res.statusCode, 200)
  t.strictEqual(res.body, 'ok')
  await fastify.close()
})

test('valid webhook signature', async t => {
  const fastify = Fastify()
  const apiKey = createApiKey()
  fastify.register(fastifyMailgun, { apiKey, domain: 'mydomain.com', webhookHandler: async () => { return 'ok' } })

  await fastify.ready()
  const req = { url: '/mailgun/webhook', method: 'POST', payload: createWebhookPayload({ apiKey }) }
  const res = await fastify.inject(req)
  t.strictEqual(res.statusCode, 200)
  t.strictEqual(res.body, 'ok')
  await fastify.close()
})

test('retrieving stored message', async t => {
  const fastify = Fastify()
  const apiKey = createApiKey()
  fastify.register(fastifyMailgun, { apiKey, domain: 'mydomain.com', webhookHandler: async () => { return 'ok' } })

  const stubGet = sinon.stub(axios, 'get').resolves({ data: 'data' })
  await fastify.ready()
  const data = { url: 'https://se.api.mailgun.net/v3/domains/mydomain.com/messages/message_key', mime: true }
  const res = await fastify.mailgun.getStoredMessage(data)
  t.strictEqual(res, 'data')
  stubGet.restore()
  await fastify.close()
})

test('retrieving stored message failure', async t => {
  const fastify = Fastify()
  const apiKey = createApiKey()
  fastify.register(fastifyMailgun, { apiKey, domain: 'mydomain.com', webhookHandler: async () => { return 'ok' } })

  const stubGet = sinon.stub(axios, 'get').rejects()
  await fastify.ready()
  try {
    await fastify.mailgun.getStoredMessage({})
    t.fail('should not resolve')
  } catch (err) {
    t.ok(err)
  }
  stubGet.restore()
  await fastify.close()
})
