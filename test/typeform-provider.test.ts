/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

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
    const list = await seneca.entity('provider/typeform/form').list$()

    expect(list.length > 0).toBeTruthy()

    const form0 = await seneca
      .entity('provider/typeform/form')
      .load$(Config.form0.id)

    expect(form0.id).toEqual(Config.form0.id)
  }, 20000)

  test('form-modify', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    const reqBody = Config.form1CreateReqBody

    const form1 = await seneca.entity('provider/typeform/addform').load$(
      {
        data: reqBody
      }
    )
    expect(form1.title).toEqual(reqBody.title)

    const updatedData = {
      ...reqBody,
      title: 'hola'
    }

    const uform1 = await seneca.entity('provider/typeform/editform').load$(
      {
        id: Config.form0.id, 
        data: updatedData, 
        override: true
      }
    )
    expect(uform1.title).toEqual(updatedData.title)
  }, 20000)
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
