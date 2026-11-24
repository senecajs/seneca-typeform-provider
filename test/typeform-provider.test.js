/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Fs = require('fs')
const Http = require('http')

// Live tests call the Typeform API. They need a Typeform personal access
// token: test/local-config.js (see local-config-template.js) with the token
// in test/local-env.js, or the environment variable TYPEFORM_ACCESSTOKEN.
// Without them the same tests run against a local mock of the Typeform API,
// and the env plugin gets a dummy token.
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}

const LIVE = null != Config || !!process.env.TYPEFORM_ACCESSTOKEN

if (!LIVE) {
  process.env.TYPEFORM_ACCESSTOKEN ??= 'test-accesstoken'
}

let mock = null

// The plugin has no option for the API host, so the test adds the
// documented apiBaseUrl option of the SDK to the client that the plugin
// creates. The plugin still passes its own token.
const mockClients = []
jest.mock('@typeform/api-client', () => {
  const actual = jest.requireActual('@typeform/api-client')
  return {
    ...actual,
    createClient: (args) => {
      const client = actual.createClient(
        mock ? { ...args, apiBaseUrl: mock.url } : args
      )
      mockClients.push(client)
      return client
    },
  }
})

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

const TypeformProvider = require('../src/typeform-provider')
const TypeformProviderDoc = require('../src/TypeformProvider-doc')

const BasicMessages = require('./basic.messages.js')

const MOCK_FORM0_ID = 'Mock0Frm'

beforeAll(async () => {
  if (!LIVE) {
    mock = await makeMockTypeformApi()
  }
})

afterAll(async () => {
  if (mock) {
    await mock.close()
  }
})

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

    await seneca.close()
  })

  test('messages', async () => {
    const seneca = await makeSeneca()
    await SenecaMsgTest(seneca, BasicMessages)()
    await seneca.close()
  })

  test('form-basic', async () => {
    const seneca = await makeSeneca()

    const list = await seneca.entity('provider/typeform/form').list$()

    expect(list.length > 0).toBeTruthy()

    const firstItem = list[0]

    const form0 = await seneca
      .entity('provider/typeform/form')
      .load$(firstItem.id)

    expect(form0.id).toEqual(firstItem.id)

    if (mock) {
      expect(form0.title).toEqual('Mock Form 0')
      expect(mock.calls.map((c) => c.method + ' ' + c.path)).toEqual([
        'GET /forms',
        'GET /forms/' + MOCK_FORM0_ID,
      ])
    }

    await seneca.close()
  }, 20000)

  // Live, this test creates and replaces a form in the Typeform account, so
  // it runs only against the mock.
  ;(LIVE ? test.skip : test)('form-modify', async () => {
    const seneca = await makeSeneca()

    const reqBody = { title: 'Mock Form 1' }

    const form1 = await seneca.entity('provider/typeform/addform').load$({
      data: reqBody,
    })
    expect(form1.title).toEqual(reqBody.title)
    expect(form1.id).toBeDefined()

    const updatedData = {
      ...reqBody,
      title: 'hola',
    }

    const uform1 = await seneca.entity('provider/typeform/editform').load$({
      id: form1.id,
      data: updatedData,
      override: true,
    })
    expect(uform1.id).toEqual(form1.id)
    expect(uform1.title).toEqual(updatedData.title)

    expect(mock.calls.map((c) => c.method + ' ' + c.path)).toEqual([
      'POST /forms',
      'PUT /forms/' + form1.id,
    ])
    expect(mock.calls[0].body).toEqual(reqBody)
    expect(mock.calls[1].body).toEqual(updatedData)

    await seneca.close()
  }, 20000)
})

async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('@seneca/entity')
    .use('@seneca/env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $TYPEFORM_ACCESSTOKEN: String,
      },
    })
    .use('@seneca/provider', {
      provider: {
        typeform: {
          keys: {
            accesstoken: { value: '$TYPEFORM_ACCESSTOKEN' },
          },
        },
      },
    })
    .use(TypeformProvider)

  await seneca.ready()

  if (mock) {
    mock.calls.length = 0

    // Fail here rather than send a request to Typeform if the plugin ever
    // builds its client some other way.
    if (!mockClients.includes(seneca.export('TypeformProvider/sdk')())) {
      throw new Error('typeform SDK: cannot point the client at the mock API')
    }
  }

  return seneca
}

// A local stand-in for the Typeform Create API calls that the tests make:
// GET /forms, GET /forms/{form_id}, POST /forms and PUT /forms/{form_id}.
// It needs a bearer token, as Typeform does. The form objects and the error
// bodies ({ code, description }) have the shape of the Typeform API
// reference, with a few fields.
async function makeMockTypeformApi() {
  const calls = []
  let nextId = 1

  const forms = {
    [MOCK_FORM0_ID]: makeForm(MOCK_FORM0_ID, { title: 'Mock Form 0' }),
  }

  function makeForm(id, data) {
    return {
      fields: [],
      settings: { is_public: true, is_trial: false, language: 'en' },
      ...data,
      id,
      type: 'form',
      workspace: { href: 'https://api.typeform.com/workspaces/Mock0Wsp' },
      theme: { href: 'https://api.typeform.com/themes/qHWOQ7' },
      _links: { display: 'https://mock.typeform.com/to/' + id },
    }
  }

  function summary(form) {
    return {
      id: form.id,
      title: form.title,
      last_updated_at: '2026-11-21T00:00:00.000Z',
      created_at: '2026-11-21T00:00:00.000Z',
      settings: { is_public: form.settings.is_public },
      self: { href: 'https://api.typeform.com/forms/' + form.id },
      theme: form.theme,
      _links: form._links,
    }
  }

  const server = Http.createServer((req, res) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const path = url.pathname
      const text = Buffer.concat(chunks).toString()
      const body = '' === text ? undefined : JSON.parse(text)

      // The token never reaches the record of calls.
      calls.push({ method: req.method, path, body })

      const send = (status, out) => {
        res.writeHead(status, { 'Content-Type': 'application/json' })
        res.end(undefined === out ? undefined : JSON.stringify(out))
      }

      const auth = req.headers.authorization || ''
      if (auth !== 'bearer ' + process.env.TYPEFORM_ACCESSTOKEN) {
        return send(401, {
          code: 'AUTHENTICATION_FAILED',
          description:
            'Authentication credentials not found on the Request Headers',
        })
      }

      if ('/forms' === path) {
        if ('GET' === req.method) {
          const items = Object.values(forms).map(summary)
          return send(200, { total_items: items.length, page_count: 1, items })
        }

        if ('POST' === req.method) {
          const id = 'Mock' + nextId++ + 'Fr'
          forms[id] = makeForm(id, body)
          return send(201, forms[id])
        }
      }

      const formPath = path.match(/^\/forms\/([^/]+)$/)
      if (formPath) {
        const id = formPath[1]
        const form = forms[id]
        if (null == form) {
          return send(404, {
            code: 'FORM_NOT_FOUND',
            description: 'Non existing form with uid ' + id,
          })
        }

        if ('GET' === req.method) {
          return send(200, form)
        }

        if ('PUT' === req.method) {
          forms[id] = makeForm(id, body)
          return send(200, forms[id])
        }
      }

      send(404, { code: 'NOT_FOUND', description: 'Endpoint not found' })
    })
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  const port = server.address().port

  return {
    url: `http://127.0.0.1:${port}`,
    calls,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections()
        server.close(() => resolve())
      }),
  }
}
