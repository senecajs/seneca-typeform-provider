const Typeform = require('typeform-api')
const token = require('./local-env').WEBFLOW_ACCESSTOKEN

run()

async function run() {
  // initialize the client with the access token
  const typeform = new Typeform({ token })

  const col = await typeform.collection({
    collectionId: '',
  })
  const colItems = await col.items()
  console.log(colItems)
}
