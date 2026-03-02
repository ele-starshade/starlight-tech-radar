// eslint-disable-next-line @typescript-eslint/no-require-imports
const serverless = require('serverless-http')

let handler

module.exports.handler = async (event, context) => {
  if (!handler) {
    const { app } = await import('../../dist/ssr/index.js')

    handler = serverless(app)
  }

  return handler(event, context)
}
