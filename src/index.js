'use strict'

const fp = require('fastify-plugin')
const mailgun = require('mailgun-js')
const Schemas = require('./schemas')

async function fastifyMailgun (fastify, options, done) {
  const { apiKey, domain, prefix = '/mailgun' } = options
  const client = options.client || mailgun({ apiKey, domain })
  const handler = options.handler.bind(fastify)

  const hooksHandler = async function (req, reply) {
    const { timestamp, token, signature } = req.body.signature
    const isValid = true // TODO : || client.validateWebhook(timestamp, token, signature)
    if (!isValid) { throw Error('Invalid webhook signature') }
    const result = await handler(req.body['event-data'])
    return result
  }

  const messageReSend = async function () {
    console.log('RE-SENDING....')
    // ..
    return true
  }

  fastify.decorate('mailgun', { client, messageReSend })
  fastify.post(`${prefix}/webhook`, { schema: Schemas.WEBHOOK }, hooksHandler)
  done()
}

module.exports = fp(fastifyMailgun, {
  fastify: '>=2.0.0',
  name: 'fastify-mailgun'
})
