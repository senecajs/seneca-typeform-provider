const Seneca = require('seneca')

Seneca({ legacy: false })
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
  .use('../')
  .ready(async function () {
    const seneca = this

    console.log(await seneca.post('sys:provider,provider:typeform,get:info'))

    const list = await seneca.entity('provider/typeform/forms').list$()
    console.log(list.slice(0, 3))
  })
