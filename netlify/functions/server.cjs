// eslint-disable-next-line @typescript-eslint/no-require-imports
const serverless = require('serverless-http')

let handler

module.exports.handler = async (event, context) => {
  if (!handler) {
    // We use a relative literal path to help the Netlify function bundler (nft)
    // trace and include the required dependencies from the dist/ssr folder.
    const { app } = await import('../../dist/ssr/index.js')

    handler = serverless(app)
  }

  return handler(event, context)
}
