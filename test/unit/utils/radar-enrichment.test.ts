import { describe, it, expect, vi, beforeEach } from 'vitest'
import { enrichBlip, clearEnrichmentCache } from 'src/utils/radar-enrichment'
import { type Blip } from 'src/models/radar'
import { api } from 'src/boot/axios'

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn()
  }
}))

describe('Radar Enrichment Utility', () => {
  const mockBlip: Blip = {
    name: 'Test Blip',
    quadrant: 'Tools',
    ring: 'Assess',
    isNew: false,
    description: 'A test blip',
    repoUrl: 'https://github.com/test/repo',
    guidanceLink: 'https://test.com',
    rating: ''
  }

  const getSpy = vi.spyOn(api, 'get')

  beforeEach(() => {
    vi.clearAllMocks()
    clearEnrichmentCache()
  })

  it('should enrich a blip with license from GitHub API', async () => {
    getSpy.mockResolvedValue({
      data: {
        license: { spdx_id: 'MIT', name: 'MIT License' },
        html_url: 'https://github.com/test/repo/blob/main/LICENSE'
      }
    })

    const enriched = await enrichBlip(mockBlip)

    expect(enriched.license?.spdx_id).toBe('MIT')
    expect(enriched.rating).toBe('Gold')
    expect(enriched.license?.url).toBe('https://github.com/test/repo/blob/main/LICENSE')
  })

  it('should enrich a blip with GitLab URL from GitLab API', async () => {
    const gitlabBlip = { ...mockBlip, repoUrl: 'https://gitlab.com/test/repo' }

    getSpy.mockResolvedValue({
      data: {
        license: { key: 'mit', name: 'MIT License', nickname: 'MIT' },
        license_url: 'https://gitlab.com/test/repo/-/blob/master/LICENSE'
      }
    })

    const enriched = await enrichBlip(gitlabBlip)

    expect(enriched.license?.spdx_id).toBe('MIT')
    expect(enriched.license?.url).toBe('https://gitlab.com/test/repo/-/blob/master/LICENSE')
  })

  it('should use Blue Oak rating if provided in the list', async () => {
    getSpy.mockResolvedValue({
      data: {
        license: { spdx_id: 'MIT', name: 'MIT License' },
        html_url: 'https://github.com/test/repo/blob/main/LICENSE'
      }
    })

    const blueOak = [
      { id: 'MIT', rating: 'Lead' }
    ]
    const enriched = await enrichBlip(mockBlip, blueOak)

    expect(enriched.rating).toBe('Lead')
  })

  it('should default to Gold for MIT if blueOak list is not an array', async () => {
    getSpy.mockResolvedValue({
      data: {
        license: { spdx_id: 'MIT', name: 'MIT License' },
        html_url: 'https://github.com/test/repo/blob/main/LICENSE'
      }
    })

    // @ts-expect-error -- testing invalid input
    const enriched = await enrichBlip(mockBlip, {})

    expect(enriched.rating).toBe('Gold')
  })

  it('should use provided GitHub token in headers', async () => {
    getSpy.mockResolvedValue({
      data: {
        license: { spdx_id: 'MIT', name: 'MIT License' }
      }
    })

    await enrichBlip(mockBlip, [], 'fake-github-token')

    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining('api.github.com'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-github-token'
        })
      })
    )
  })

  it('should use provided GitLab token in headers', async () => {
    const gitlabBlip = { ...mockBlip, repoUrl: 'https://gitlab.com/test/repo' }

    getSpy.mockResolvedValue({
      data: {
        license: { key: 'mit' }
      }
    })

    await enrichBlip(gitlabBlip, [], '', 'fake-gitlab-token')

    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining('gitlab.com/api/v4'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Private-Token': 'fake-gitlab-token'
        })
      })
    )
  })

  it('should use provided base URLs', async () => {
    getSpy.mockResolvedValue({ data: {} })

    await enrichBlip(mockBlip, [], '', '', 'http://custom-github.com', 'http://custom-gitlab.com')

    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining('http://custom-github.com'),
      expect.any(Object)
    )

    const gitlabBlip = { ...mockBlip, repoUrl: 'https://gitlab.com/test/repo' }

    await enrichBlip(gitlabBlip, [], '', '', 'http://custom-github.com', 'http://custom-gitlab.com')

    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining('http://custom-gitlab.com'),
      expect.any(Object)
    )
  })

  it('should cache enrichment results and not call API twice for same repo', async () => {
    const cacheBlip = { ...mockBlip, repoUrl: 'https://github.com/cache/repo' }

    getSpy.mockResolvedValue({
      data: {
        license: { spdx_id: 'MIT', name: 'MIT License' }
      }
    })

    // First call
    await enrichBlip(cacheBlip)
    expect(getSpy).toHaveBeenCalledTimes(1)

    // Second call
    await enrichBlip(cacheBlip)
    expect(getSpy).toHaveBeenCalledTimes(1) // Should still be 1
  })
})
