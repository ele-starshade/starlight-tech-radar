import serverless from 'serverless-http'
import { app } from '../../dist/ssr/index.js'

export const handler = serverless(app)
