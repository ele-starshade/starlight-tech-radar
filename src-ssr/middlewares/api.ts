import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import { RadarConfigurationSchema } from 'src/models/radar'
import { enrichBlips } from 'src/utils/radar-enrichment'
import radarData from 'src/data/radar.json'
// @ts-expect-error-error
import blueOak from '@blueoak/list' with { type: 'json' }

export default defineSsrMiddleware(({ app }) => {
  app.get('/api/radar', (async (_req: Request, res: Response) => {
    try {
      // Validate the local radar data
      const validatedData = RadarConfigurationSchema.parse(radarData)

      // Use the enrichment utility
      const enrichedBlips = await enrichBlips(validatedData.blips, blueOak as unknown[])

      return res.json({
        ...validatedData,
        blips: enrichedBlips
      })
    } catch (error) {
      console.error('Error serving radar data:', error)

      return res.status(500).json({ error: 'Internal Server Error' })
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any) // Keep 'as any' only for the outer handler to satisfy Express/Quasar middleware signatures
})
