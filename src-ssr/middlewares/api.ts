import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import { clearEnrichmentCache } from 'src/utils/radar-enrichment'
import { getRadarData } from 'src/services/radarService'

export default defineSsrMiddleware(({ app }) => {
  app.get('/api/radar', (async (req: Request, res: Response) => {
    try {
      if (req.query.clearCache === 'true') {
        clearEnrichmentCache()
      }

      const data = await getRadarData({
        mock: req.query.mock === 'true',
        data: req.query.data as string
      })

      return res.json(data)
    } catch (error) {
      console.error('Error serving radar data:', error)

      return res.status(500).json({ error: 'Internal Server Error' })
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any)
})
