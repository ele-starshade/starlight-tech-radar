import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import { clearEnrichmentCache } from 'src/utils/radar-enrichment'
import { getRadarData } from 'src/services/radarService'
import { api } from 'src/boot/axios'
import { appConfig } from 'src/config'

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

  app.post('/api/feedback', (async (req: Request, res: Response) => {
    try {
      const { blipName, feedbackType, comment } = req.body

      if (!appConfig.isFeedbackEnabled) {
        return res.status(400).json({ error: 'Feedback is not enabled (no webhooks configured)' })
      }

      const promises = []

      if (appConfig.teamsWebhook) {
        promises.push(api.post(appConfig.teamsWebhook, {
          type: 'message',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: {
                type: 'AdaptiveCard',
                body: [
                  {
                    type: 'TextBlock',
                    size: 'Medium',
                    weight: 'Bolder',
                    text: `New Feedback for ${blipName}`
                  },
                  {
                    type: 'FactSet',
                    facts: [
                      { title: 'Type', value: feedbackType },
                      { title: 'Comment', value: comment }
                    ]
                  }
                ],
                $schema: 'https://adaptivecards.io/schemas/adaptive-card.json',
                version: '1.0'
              }
            }
          ]
        }))
      }

      if (appConfig.slackWebhook) {
        promises.push(api.post(appConfig.slackWebhook, {
          text: `*New Feedback for ${blipName}*\n*Type:* ${feedbackType}\n*Comment:* ${comment}`
        }))
      }

      await Promise.all(promises)

      return res.json({ success: true })
    } catch (error) {
      console.error('Error sending feedback:', error)

      return res.status(500).json({ error: 'Failed to send feedback' })
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any)
})
