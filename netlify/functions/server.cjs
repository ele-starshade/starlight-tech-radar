// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const serverless = require('serverless-http')

let handler

module.exports.handler = async (event, context) => {
  if (!handler) {
    // In Netlify functions, process.cwd() is the root of the project.
    // We import the built SSR app dynamically.
    const appPath = path.resolve(process.cwd(), 'dist/ssr/index.js')
    const { app } = await import(appPath)

    handler = serverless(app)
  }

  return handler(event, context)
}
