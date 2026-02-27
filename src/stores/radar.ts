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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async fetchRadarData (params?: Record<string, any>) {
      if (this.radarData && !this.error && !params) return

      this.loading = true
      this.error = null

      try {
        const isServer = typeof window === 'undefined'
        let url = '/api/radar'

        if (isServer) {
          const port = process.env.SSR_PORT || process.env.PORT || 9100

          url = `http://127.0.0.1:${port}/api/radar`
        }

        const response = await axios.get(url, { params })

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
