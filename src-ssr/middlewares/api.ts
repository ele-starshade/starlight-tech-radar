import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import { RadarConfigurationSchema } from 'src/models/radar'
import { enrichBlips, clearEnrichmentCache } from 'src/utils/radar-enrichment'
import { appConfig } from 'src/config'
import radarData from 'src/data/radar.json'
// @ts-expect-error-error
import blueOak from '@blueoak/list' with { type: 'json' }

export default defineSsrMiddleware(({ app }) => {
  app.get('/api/radar', (async (req: Request, res: Response) => {
    try {
      if (req.query.clearCache === 'true') {
        clearEnrichmentCache()
      }

      let data = radarData

      // Allow overriding data for E2E tests via query param
      if (req.query.mock === 'true' && req.query.data) {
        try {
          data = JSON.parse(req.query.data as string)
        } catch (e) {
          console.error('Failed to parse mock data:', e)
        }
      }

      // Validate the radar data
      const validatedData = RadarConfigurationSchema.parse(data)

      // Use the enrichment utility
      const enrichedBlips = await enrichBlips(
        validatedData.blips,
        blueOak as unknown[],
        appConfig.githubToken,
        appConfig.gitlabToken,
        appConfig.githubApiBaseUrl,
        appConfig.gitlabApiBaseUrl
      )

      return res.json({
        ...validatedData,
        blips: enrichedBlips
      })
    } catch (error) {
      console.error('Error serving radar data:', error)

      return res.status(500).json({ error: 'Internal Server Error' })
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any)
})
