/**
 * More info about this file:
 * https://v2.quasar.dev/quasar-cli-vite/developing-ssr/ssr-webserver
 *
 * Runs in Node context.
 */

/**
 * Make sure to yarn add / npm install (in your project root)
 * anything you import here (except for express and compression).
 */
import type { Server } from 'node:http'
import compression from 'compression'
import type { Application, Request, Response } from 'express'
import express from 'express'
import {
  defineSsrCreate,
  defineSsrInjectDevMiddleware,
  defineSsrListen,
  defineSsrClose,
  defineSsrServeStaticContent,
  defineSsrRenderPreloadTag
} from '#q-app/wrappers'

declare module '#q-app' {
  interface SsrDriver {
    app: Application;
    listenResult: Server;
    request: Request;
    response: Response;
  }
}

/**
 * Create your webserver and return its instance.
 *
 * Can be async: defineSsrCreate(async ({ ... }) => { ... })
 */
export const create = defineSsrCreate((/* { ... } */) => {
  const app = express()

  app.use(express.json())

  // attackers can use this header to detect apps running Express
  // and then launch specifically-targeted attacks
  app.disable('x-powered-by')

  // place here any middlewares that
  // absolutely need to run before anything else
  if (process.env.PROD) {
    app.use(compression())
  }

  return app
})

/**
 * Used by Quasar SSR dev server to inject middleware into the webserver.
 * It uses it to handle Vite dev server, handle public paths, etc.
 * The given middleware is compatible with `node:http`'s Server, Express, Connect, etc.
 *
 * Can be async: defineSsrInjectDevMiddleware(async ({ app }) => { ... })
 */
export const injectDevMiddleware = defineSsrInjectDevMiddleware(({ app }) => {
  return (middleware) => {
    app.use(middleware)
  }
})

/**
 * You need to make the server listen to the indicated port
 * and return the listening instance or whatever you need to
 * close the server with.
 *
 * The "listenResult" param for the "close()" definition below
 * is what you return here.
 *
 * For production, you can instead export your
 * handler for serverless use or whatever else fits your needs.
 *
 * Can be async: defineSsrListen(async ({ app, devHttpsApp, port }) => { ... })
 */
export const listen = defineSsrListen(({ app, devHttpsApp, port }) => {
  // If running in a serverless environment (like Netlify), we don't want to start the HTTP server.
  // Instead, the wrapper function will use the exported 'app' instance.
  if (process.env.SERVERLESS || process.env.NETLIFY) {
    return {} as Server
  }

  const server = devHttpsApp || app

  return server.listen(port, () => {
    if (process.env.PROD) {
      console.log('Server listening at port ' + port)
    }
  })
})

/**
 * Should close the server and free up any resources.
 * Will be used on development only when the server needs
 * to be rebooted.
 *
 * Should you need the result of the "listen()" call above,
 * you can use the "listenResult" param.
 *
 * Can be async: defineSsrClose(async ({ listenResult }) => { ... }))
 */
export const close = defineSsrClose(({ listenResult }) => {
  return listenResult.close()
})

const maxAge = process.env.DEV ? 0 : 1000 * 60 * 60 * 24 * 30

/**
 * Should return a function that will be used to configure the webserver
 * to serve static content at "urlPath" from "pathToServe" folder/file.
 *
 * Notice resolve.urlPath(urlPath) and resolve.public(pathToServe) usages.
 *
 * Can be async: defineSsrServeStaticContent(async ({ app, resolve }) => {
 * Can return an async function: return async ({ urlPath = '/', pathToServe = '.', opts = {} }) => {
 */
export const serveStaticContent = defineSsrServeStaticContent(({ app, resolve }) => {
  return ({ urlPath = '/', pathToServe = '.', opts = {} }) => {
    const serveFn = express.static(resolve.public(pathToServe), { maxAge, ...opts })

    app.use(resolve.urlPath(urlPath), serveFn)
  }
})

/**
 * Should return a String with HTML output
 * (if any) for preloading indicated file
 */
export const renderPreloadTag = defineSsrRenderPreloadTag((file/* , { ssrContext } */) => {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" href="${file}" crossorigin>`
  }

  if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}" crossorigin>`
  }

  if (file.endsWith('.woff')) {
    return `<link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
  }

  if (file.endsWith('.woff2')) {
    return `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
  }

  if (file.endsWith('.gif')) {
    return `<link rel="preload" href="${file}" as="image" type="image/gif" crossorigin>`
  }

  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    return `<link rel="preload" href="${file}" as="image" type="image/jpeg" crossorigin>`
  }

  if (file.endsWith('.png')) {
    return `<link rel="preload" href="${file}" as="image" type="image/png" crossorigin>`
  }

  return ''
})
