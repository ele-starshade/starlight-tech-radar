import { describe, it, expect } from 'vitest'
import { enrichBlip } from './radar-enrichment'
import { type Blip } from 'src/models/radar'

describe('Radar Enrichment Utility', () => {
  const mockBlip: Blip = {
    name: 'Test Blip',
    quadrant: 'Tools',
    ring: 'Assess',
    isNew: false,
    description: 'A test blip',
    repoUrl: 'https://github.com/test/repo',
    guidanceLink: 'https://test.com'
  }

  it('should enrich a blip with MIT license if it is a GitHub repo', async () => {
    const enriched = await enrichBlip(mockBlip)

    expect(enriched.license?.spdx_id).toBe('MIT')
    expect(enriched.rating).toBe('Gold') // Mock logic for MIT
    expect(enriched.license?.url).toContain('api.github.com')
  })

  it('should enrich a blip with GitLab URL if it is a GitLab repo', async () => {
    const gitlabBlip = { ...mockBlip, repoUrl: 'https://gitlab.com/test/repo' }
    const enriched = await enrichBlip(gitlabBlip)

    expect(enriched.license?.url).toContain('gitlab.com')
  })

  it('should use Blue Oak rating if provided in the list', async () => {
    const blueOak = [
      { id: 'MIT', rating: 'Lead' }
    ]
    const enriched = await enrichBlip(mockBlip, blueOak)

    expect(enriched.rating).toBe('Lead')
  })

  it('should default to Gold for MIT if blueOak list is not an array', async () => {
    // @ts-expect-error -- testing invalid input
    const enriched = await enrichBlip(mockBlip, {})

    expect(enriched.rating).toBe('Gold')
  })
})
