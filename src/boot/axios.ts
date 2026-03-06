import { defineBoot } from '#q-app/wrappers'
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError
} from 'axios'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create()

if (process.env.SERVER) {
  const logRequest = (type: string, config: InternalAxiosRequestConfig) => {
    const timestamp = new Date().toISOString()
    const method = config.method?.toUpperCase()
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url

    console.log(`[${timestamp}] [${type} Request] ${method} ${fullUrl}`)
  }

  const logResponse = (type: string, response: AxiosResponse) => {
    const timestamp = new Date().toISOString()
    const method = response.config.method?.toUpperCase()
    const fullUrl = response.config.baseURL ? `${response.config.baseURL}${response.config.url}` : response.config.url
    const status = `${response.status} ${response.statusText}`

    console.log(`[${timestamp}] [${type} Response] ${method} ${fullUrl} - ${status}`)
  }

  const logError = (type: string, error: AxiosError) => {
    const timestamp = new Date().toISOString()
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN'

    let fullUrl = 'UNKNOWN'

    if (error.config) {
      fullUrl = error.config.baseURL ? `${error.config.baseURL}${error.config.url}` : String(error.config.url)
    }

    const status = error.response ? `${error.response.status} ${error.response.statusText}` : 'NO_RESPONSE'

    console.error(`[${timestamp}] [${type} Error] ${method} ${fullUrl} - ${status} - ${error.message}`)
  }

  // 'api' instance interceptors
  api.interceptors.request.use((config) => {
    logRequest('API', config)

    return config
  }, (error: AxiosError) => {
    logError('API Request', error)

    return Promise.reject(error)
  })

  api.interceptors.response.use((response) => {
    logResponse('API', response)

    return response
  }, (error: AxiosError) => {
    logError('API Response', error)

    return Promise.reject(error)
  })
}

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
