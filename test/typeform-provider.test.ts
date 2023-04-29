/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')
const { Maintain } = require('@seneca/maintain')

import TypeformProvider from '../src/typeform-provider'
import TypeformProviderDoc from '../src/TypeformProvider-doc'

const BasicMessages = require('./basic.messages.js')

// Only run some tests locally (not on Github Actions).
let Config: undefined = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}

describe('typeform-provider', () => {
  test('happy', async () => {
    expect(TypeformProvider).toBeDefined()
    expect(TypeformProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(
      await seneca.post('sys:provider,provider:typeform,get:info')
    ).toMatchObject({
      ok: true,
      name: 'typeform',
    })
  })

  test('messages', async () => {
    const seneca = await makeSeneca()
    await SenecaMsgTest(seneca, BasicMessages)()
  })

  test('site-basic', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    // does this:   const sites = await typeform.sites();
    const list = await seneca.entity('provider/typeform/site').list$()
    expect(list.length > 0).toBeTruthy()

    const site0 = await seneca
      .entity('provider/typeform/site')
      .load$(Config.site0.id)
    expect(site0.name).toContain(Config.site0.name)
  })

  test('collection-basic', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    const list = await seneca
      .entity('provider/typeform/collection')
      .list$(Config.site0.id)
    expect(list.length > 0).toBeTruthy()

    const collection0 = await seneca
      .entity('provider/typeform/collection')
      .load$({
        siteId: Config.site0.id,
        collectionId: Config.site0.collections.collection0.id,
      })
    expect(collection0.name).toContain(
      Config.site0.collections.collection0.name
    )
  })

  test('item-basic', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    const list = await seneca
      .entity('provider/typeform/item')
      .list$(Config.site0.collections.collection0.id)
    expect(list.length > 0).toBeTruthy()

    const item0 = await seneca.entity('provider/typeform/item').load$({
      collectionId: Config.site0.collections.collection0.id,
      itemId: Config.site0.collections.collection0.items.item0.id,
    })
    expect(item0.name).toContain(
      Config.site0.collections.collection0.items.item0.name
    )
  })

  test('maintain', async () => {
    await Maintain()
  })
})

async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use('env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $WEBFLOW_ACCESSTOKEN: String,
      },
    })
    .use('provider', {
      provider: {
        typeform: {
          keys: {
            accesstoken: { value: '$WEBFLOW_ACCESSTOKEN' },
          },
        },
      },
    })
    .use(TypeformProvider)

  return seneca.ready()
}
