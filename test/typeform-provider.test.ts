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

  test('form-basic', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    // does this:   const sites = await typeform.sites();
    const list = await seneca.entity('provider/typeform/forms').list$()
    expect(list.length > 0).toBeTruthy()

    const form0 = await seneca
      .entity('provider/typeform/forms')
      .load$(Config.form0.id)
    expect(form0.name).toContain(Config.form0.name)

    const form1 = await seneca.entity('provider/typeform/forms').create$(
      Config.form1CreateReqBody
    )
    expect(form1.name).toContain(Config.form1CreateReqBody.name)

    const updatedData = {
      ...Config.form1CreateReqBody,
      name: 'Updated Name'
    }

    const uform1 = await seneca.entity('provider/typeform/forms').create$(
      form1.id, updatedData, true
    )
    expect(uform1.name).toContain(updatedData.name)
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
        $TYPEFORM_ACCESSTOKEN: String,
      },
    })
    .use('provider', {
      provider: {
        typeform: {
          keys: {
            accesstoken: { value: '$TYPEFORM_ACCESSTOKEN' },
          },
        },
      },
    })
    .use(TypeformProvider)

  return seneca.ready()
}
