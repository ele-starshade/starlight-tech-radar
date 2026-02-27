import { RadarConfigurationSchema, type RadarConfiguration } from 'src/models/radar'
import { enrichBlips } from 'src/utils/radar-enrichment'
import { appConfig } from 'src/config'
import radarData from 'src/data/radar.json'
// @ts-expect-error - list is a JSON file
import blueOak from '@blueoak/list' with { type: 'json' }

/**
 * Fetches and enriches radar data.
 * This can be called directly on the server to avoid HTTP calls to itself.
 */
export async function getRadarData (params?: { mock?: boolean, data?: string }): Promise<RadarConfiguration> {
  let data = radarData

  // Allow overriding data for E2E tests via params
  if (params?.mock === true && params.data) {
    try {
      data = JSON.parse(params.data)
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

  return {
    ...validatedData,
    blips: enrichedBlips
  }
}
