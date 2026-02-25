import { defineStore } from 'pinia'
import axios from 'axios'
import type { RadarConfiguration } from 'src/models/radar'

export const useRadarStore = defineStore('radar', {
  state: () => ({
    radarData: null as RadarConfiguration | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchRadarData () {
      if (this.radarData && !this.error) return

      this.loading = true
      this.error = null

      try {
        // In SSR, relative URLs might fail without a base URL.
        // For development, we assume localhost:3000 if not specified.
        const isServer = typeof window === 'undefined'
        let url = '/api/radar'

        if (isServer) {
          // In Quasar dev -m ssr, the SSR server port is often different from the devServer port.
          // We'll try to use 127.0.0.1 to avoid some IPv6 vs IPv4 resolution issues with 'localhost'.
          const port = process.env.SSR_PORT || process.env.PORT || 9100

          url = `http://127.0.0.1:${port}/api/radar`
          console.log(`SSR: Fetching from ${url}`)
        }

        const response = await axios.get(url)

        this.radarData = response.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch radar data'

        console.error('Error fetching radar data:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
