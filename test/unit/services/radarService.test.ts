import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRadarData } from 'src/services/radarService'
import * as enrichment from 'src/utils/radar-enrichment'

// Mock the radar data
vi.mock('src/data/radar.json', () => ({
  default: {
    quadrants: ['Techniques', 'Platforms', 'Tools', 'Languages & Frameworks'],
    rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
    blips: [
      {
        name: 'Vue.js',
        quadrant: 'Languages & Frameworks',
        ring: 'Adopt',
        isNew: false,
        repoUrl: 'https://github.com/vuejs/core',
        guidanceLink: 'https://github.com/vuejs/core',
        description: 'The Progressive JavaScript Framework'
      }
    ]
  }
}))

// Mock enrichment utility
vi.mock('src/utils/radar-enrichment', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enrichBlips: vi.fn((blips) => Promise.resolve(blips.map((b: any) => ({ ...b, license: { spdx_id: 'MIT', name: 'MIT License', url: 'https://opensource.org/licenses/MIT' }, rating: 'Gold' }))))
}))

// Mock blueoak list
vi.mock('@blueoak/list', () => ({
  default: [{ id: 'MIT', rating: 'Gold' }]
}))

describe('radarService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and enriches radar data successfully', async () => {
    const data = await getRadarData()

    expect(data.blips).toHaveLength(1)
    expect(data?.blips?.[0]?.name).toBe('Vue.js')
    expect(data?.blips?.[0]?.license?.spdx_id).toBe('MIT')
    expect(enrichment.enrichBlips).toHaveBeenCalled()
  })

  it('allows overriding data with mock params', async () => {
    const mockData = JSON.stringify({
      quadrants: ['Techniques', 'Platforms', 'Tools', 'Languages & Frameworks'],
      rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
      blips: [{
        name: 'React',
        quadrant: 'Tools',
        ring: 'Assess',
        isNew: true,
        repoUrl: 'https://github.com/facebook/react',
        guidanceLink: 'https://github.com/facebook/react',
        description: 'React'
      }]
    })

    const data = await getRadarData({ mock: true, data: mockData })

    expect(data.blips).toHaveLength(1)
    expect(data.blips?.[0]?.name).toBe('React')
  })

  it('falls back to default data if mock data is invalid JSON', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const data = await getRadarData({ mock: true, data: 'invalid-json' })

    expect(data.blips).toHaveLength(1)
    expect(data.blips?.[0]?.name).toBe('Vue.js')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('throws error if radar data fails validation', async () => {
    // Override the mock to return invalid data
    vi.mocked(enrichment.enrichBlips).mockResolvedValueOnce([])

    // We need to trigger a validation error in RadarConfigurationSchema
    const mockData = JSON.stringify({
      quadrants: ['Techniques'], // Missing 3 quadrants
      rings: ['Adopt'],
      blips: []
    })

    await expect(getRadarData({ mock: true, data: mockData })).rejects.toThrow()
  })
})
