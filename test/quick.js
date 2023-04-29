const Typeform = require('typeform-api')
const token = require('./local-env').TYPEFORM_ACCESSTOKEN

run()

async function run() {
  // initialize the client with the access token
  const typeform = new Typeform({ token })

  const col = await typeform.form({
    id: '',
  })
  const list = await col.list()
  console.log(list)
}
