import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
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
        if (process.env.SERVER) {
          const { getRadarData } = await import('src/services/radarService')

          this.radarData = await getRadarData({
            mock: params?.mock === 'true',
            data: params?.data
          })
        } else {
          const response = await api.get('/api/radar', { params })

          this.radarData = response.data
        }
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
