'use strict'

const fp = require('fastify-plugin')
const mailgun = require('mailgun-js')
const axios = require('axios')
const Schemas = require('./schemas')

async function fastifyMailgun (fastify, options, done) {
  const { apiKey, domain, prefix = '/mailgun', validateWebhooks = true } = options
  const client = options.client || mailgun({ apiKey, domain })
  const handler = options.handler.bind(fastify)

  const getStoredMessage = async function ({ url, mime = false }) {
    try {
      const headers = mime ? { Accept: 'message/rfc2822' } : {}
      const auth = { username: 'api', password: client.apiKey }
      const { data } = await axios.get(url, { auth, headers })
      return data
    } catch (err) {
      return null
    }
  }

  const hooksHandler = async function (req, reply) {
    const { timestamp, token, signature } = req.body.signature
    const isValid = (validateWebhooks) ? client.validateWebhook(timestamp, token, signature) : true
    if (!isValid) { throw Error('Invalid webhook signature') }
    const result = await handler(req.body['event-data'])
    return result
  }

  fastify.decorate('mailgun', { client, getStoredMessage })
  fastify.post(`${prefix}/webhook`, { schema: Schemas.WEBHOOK }, hooksHandler)
  done()
}

module.exports = fp(fastifyMailgun, {
  fastify: '>=2.0.0',
  name: 'fastify-mailgun'
})
