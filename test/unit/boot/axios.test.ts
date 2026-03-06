import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import type { App } from 'vue'

describe('boot: axios', () => {
  let app: App

  beforeEach(() => {
    app = {
      config: {
        globalProperties: {}
      }
    } as unknown as App

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('should not add interceptors when SERVER is false', async () => {
    vi.stubEnv('SERVER', '')
    const { api } = await import('../../../src/boot/axios')

    expect(api.interceptors.request.handlers?.length).toBeOneOf([0, undefined])
    expect(api.interceptors.response.handlers?.length).toBeOneOf([0, undefined])
  })

  it('should add $axios and $api to globalProperties', async () => {
    vi.stubEnv('SERVER', '')
    const { default: boot, api } = await import('../../../src/boot/axios')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await boot({ app } as any)

    expect(app.config.globalProperties.$axios).toBe(axios)
    expect(app.config.globalProperties.$api).toBe(api)
  })

  describe('SERVER true interceptors', () => {
    it('should add interceptors when SERVER is true', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      expect(api.interceptors.request.handlers?.length).toBe(1)
      expect(api.interceptors.response.handlers?.length).toBe(1)
    })

    it('should log request without baseURL and method', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      const config: InternalAxiosRequestConfig = { url: '/test' } as InternalAxiosRequestConfig
      const handler = api.interceptors.request.handlers?.[0]?.fulfilled

      if (handler) {
        await handler(config)
      }

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[API Request] undefined /test'))
    })

    it('should log request with baseURL and method', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      const config: InternalAxiosRequestConfig = { baseURL: 'http://localhost', url: '/test', method: 'get' } as InternalAxiosRequestConfig
      const handler = api.interceptors.request.handlers?.[0]?.fulfilled

      if (handler) {
        await handler(config)
      }

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[API Request] GET http://localhost/test'))
    })

    it('should log request error', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      const error = new Error('Request failed') as AxiosError
      const handler = api.interceptors.request.handlers?.[0]?.rejected

      if (handler) {
        try {
          await handler(error)
        } catch {
          // ignore
        }
      }

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[API Request Error] UNKNOWN UNKNOWN - NO_RESPONSE - Request failed'))
    })

    it('should log response without baseURL and method', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      const response: AxiosResponse = { config: { url: '/test' } as InternalAxiosRequestConfig, status: 200, statusText: 'OK', data: {}, headers: {} } as AxiosResponse
      const handler = api.interceptors.response.handlers?.[0]?.fulfilled

      if (handler) {
        await handler(response)
      }

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[API Response] undefined /test - 200 OK'))
    })

    it('should log response with baseURL and method', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      const response: AxiosResponse = { config: { baseURL: 'http://localhost', url: '/test', method: 'post' } as InternalAxiosRequestConfig, status: 201, statusText: 'Created', data: {}, headers: {} } as AxiosResponse
      const handler = api.interceptors.response.handlers?.[0]?.fulfilled

      if (handler) {
        await handler(response)
      }

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[API Response] POST http://localhost/test - 201 Created'))
    })

    it('should log response error with config and response', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      const error = new Error('Response failed') as AxiosError

      error.config = { baseURL: 'http://localhost', url: '/test', method: 'get' } as InternalAxiosRequestConfig
      error.response = { status: 500, statusText: 'Internal Server Error' } as AxiosResponse

      const handler = api.interceptors.response.handlers?.[0]?.rejected

      if (handler) {
        try {
          await handler(error)
        } catch {
          // ignore
        }
      }

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[API Response Error] GET http://localhost/test - 500 Internal Server Error - Response failed'))
    })

    it('should log response error with config but no baseURL', async () => {
      vi.stubEnv('SERVER', 'true')
      const { api } = await import('../../../src/boot/axios')

      const error = new Error('Response failed') as AxiosError

      error.config = { url: '/test', method: 'get' } as InternalAxiosRequestConfig

      const handler = api.interceptors.response.handlers?.[0]?.rejected

      if (handler) {
        try {
          await handler(error)
        } catch {
          // ignore
        }
      }

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[API Response Error] GET /test - NO_RESPONSE - Response failed'))
    })
  })
})
