# fastify-mailgun

[![Travis](https://img.shields.io/travis/com/ovhemert/fastify-mailgun.svg?branch=master&logo=travis)](https://travis-ci.com/ovhemert/fastify-mailgun)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/fbe6390adeba49a5a62349410a8439cc)](https://www.codacy.com/app/ovhemert/fastify-mailgun?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ovhemert/fastify-mailgun&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/npm/fastify-mailgun/badge.svg)](https://snyk.io/test/npm/fastify-mailgun)
[![Coverage Status](https://coveralls.io/repos/github/ovhemert/fastify-mailgun/badge.svg?branch=master)](https://coveralls.io/github/ovhemert/fastify-mailgun?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ovhemert/fastify-mailgun.svg)](https://greenkeeper.io/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

Fastify plugin that adds MailGun support with incoming webhooks.
Under the hood the [mailgun-js](https://www.npmjs.com/package/mailgun-js) module is used.

## Installation

```bash
$ npm install fastify-mailgun
```

## Usage

```js
fastify.register(require('fastify-mailgun'), {
    prefix: '/mailgun', // register your webhook (in MailGun) with '/mailgun/webhooks'
    apiKey: 'apikey-...', // your MailGun API Key
    domain: 'mydomain.com',  // you domain name
    webhookHandler: async function (data) {
      // handle you webhook data

      // example: retrieve the message from mailgun store
      const storedMessage = await fastify.mailgun.getStoredMessage({ url: data.storage.url })

      // example: send a new mail using the mailgun client
      await fastify.mailgun.client.messages().send(...)

      return true
    }
  })
```

## Maintainers

Osmond van Hemert
[![Github](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=github)](https://github.com/ovhemert)
[![Web](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=nextdoor)](https://ovhemert.dev)

## Contributing

If you would like to help out with some code, check the [details](./.github/CONTRIBUTING.md).

Not a coder, but still want to support? Have a look at the options available to [donate](https://ovhemert.dev/donate).

## License

Licensed under [MIT](./LICENSE.md).
