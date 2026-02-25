import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import { RadarConfigurationSchema } from 'src/models/radar'
import radarData from 'src/data/radar.json'
// @ts-expect-error-error
import blueOak from '@blueoak/list' with { type: 'json' }

export default defineSsrMiddleware(({ app }) => {
  app.get('/api/radar', (async (_req: Request, res: Response) => {
    try {
      // Validate the local radar data
      const validatedData = RadarConfigurationSchema.parse(radarData)

      // Placeholder logic for enriching blips with license and Blue Oak data
      // eslint-disable-next-line @typescript-eslint/require-await -- Remove this disable when github and gitlab requests happen.
      const enrichedBlips = await Promise.all(validatedData.blips.map(async (blip) => {
        let license = {
          spdx_id: 'MIT',
          name: 'MIT License',
          url: 'https://opensource.org/licenses/MIT'
        }

        // Placeholder: In a real implementation, we would fetch from GitHub/GitLab
        if (blip.repoUrl.includes('github.com')) {
          console.log(`Placeholder: Fetching GitHub license for ${blip.name}`)

          // Mock fetch result
          license = {
            spdx_id: 'MIT',
            name: 'MIT License',
            url: `https://api.github.com/repos/${blip.name}/license` // placeholder url
          }
        } else if (blip.repoUrl.includes('gitlab.com')) {
          console.log(`Placeholder: Fetching GitLab license for ${blip.name}`)

          // Mock fetch result
          license = {
            spdx_id: 'MIT',
            name: 'MIT License',
            url: `https://gitlab.com/api/v4/projects/${blip.name}/license` // placeholder url
          }
        }

        // Compare against Blue Oak list (Placeholder)
        // Blue Oak list usually maps SPDX IDs to ratings like 'Gold', 'Silver', 'Bronze', 'Lead'
        let rating = 'Unknown'

        interface BlueOakLicense {
          id: string
          rating?: string
        }

        if (Array.isArray(blueOak)) {
          const found = (blueOak as BlueOakLicense[]).find((l) => l.id === license.spdx_id)

          if (found) {
            rating = found.rating || 'Approved'
          }
        } else {
          // Manual placeholder check if the library structure is different than expected
          if (license.spdx_id === 'MIT') {
            rating = 'Gold'
          }

          if (license.spdx_id === 'Apache-2.0') {
            rating = 'Gold'
          }
        }

        return {
          ...blip,
          license,
          rating
        }
      }))

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
