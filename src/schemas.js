'use strict'

const WEBHOOK_SIGNATURE = {
  type: 'object',
  required: ['timestamp', 'token', 'signature'],
  properties: {
    timestamp: { type: 'integer' },
    token: { type: 'string', maxLength: 50, minLength: 50 },
    signature: { type: 'string' }
  }
}

const WEBHOOK_EVENTDATA = {
  type: 'object',
  required: ['event'],
  properties: {
    event: { type: 'string' }
  }
}

const WEBHOOK_BODY = {
  type: 'object',
  required: ['signature', 'event-data'],
  properties: {
    signature: WEBHOOK_SIGNATURE,
    'event-data': WEBHOOK_EVENTDATA
  }
}

const WEBHOOK = {
  body: WEBHOOK_BODY
}

module.exports = {
  WEBHOOK
}
