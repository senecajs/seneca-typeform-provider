
/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

const { createClient } = require('@typeform/api-client')

type TypeformProviderOptions = {}

function TypeformProvider(this: any, options: TypeformProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')

  seneca.message('sys:provider,provider:typeform,get:info', get_info)

  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'typeform',
      version: Pkg.version,
      sdk: {
        name: 'typeform',
        version: Pkg.dependencies['@typeform/api-client'],
      },
    }
  }

  entityBuilder(this, {
    provider: {
      name: 'typeform',
    },
    entity: {
      form: {
        cmd: {
          list: {
            action: async function(this: any, entsize: any, msg: any) {
              let res = await this.shared.sdk.forms.list()
              let list = res.items.map((data: any) => entsize(data))
              return list
            },
          },

          load: {
            action: async function(this: any, entize: any, msg: any) {
              let q = msg.q || {}
              let id = q.id

              try {
                let res = await this.shared.sdk.forms.get({ uid: id })
                return entize(res)
              } catch (e: any) {
                if (e.message.includes('invalid id')) {
                  return null
                } else {
                  throw e
                }
              }
            },
          },
        },
      },

      addform: {
        cmd: {
          load: {
            action: async function(this: any, entsize: any, msg: any) {
              let q = msg.q || {}
              let data = q.data

              try {
                let res = await this.shared.sdk.forms.create(
                  {
                    data: data
                  }
                )
                return entsize(res)
              } catch (e: any) {
                throw e
              }
            },
          }
        }
      },

      editform: {
        cmd: {
          load: {
            action: async function(this: any, entsize: any, msg: any) {
              let q = msg.q || {}
              let id = q.id
              let data = q.data
              let override = q.override

              try {
                let res = await this.shared.sdk.forms.update(
                  {
                    uid: id,
                    data: data,
                    override: override
                  }
                )
                return entsize(res)
              } catch (e: any) {
                if (e.message.includes('invalid id')) {
                  return null
                } else {
                  throw e
                }
              }
            },
          },
        }
      }
    },
  })

  seneca.prepare(async function(this: any) {
    let res = await this.post(
      'sys:provider,get:keymap,provider:typeform,key:accesstoken'
    )

    let token = res.keymap.accesstoken.value

    console.log('TOKEN', token)

    this.shared.sdk = createClient({ token })
  })

  return {
    exports: {
      sdk: () => this.shared.sdk,
    },
  }
}

// Default options.
const defaults: TypeformProviderOptions = {
  // TODO: Enable debug logging
  debug: false,
}

Object.assign(TypeformProvider, { defaults })

export default TypeformProvider

if ('undefined' !== typeof module) {
  module.exports = TypeformProvider
}
