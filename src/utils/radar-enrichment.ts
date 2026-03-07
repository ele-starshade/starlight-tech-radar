import { api } from 'src/boot/axios'
import { type Blip, type LicenseMetadata } from 'src/models/radar'

// Simple in-memory cache
let enrichmentCache: Record<string, { license?: LicenseMetadata; rating?: string; timestamp: number }> = {}
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

/**
 * Clears the enrichment cache. Mainly used for testing.
 */
export function clearEnrichmentCache () {
  enrichmentCache = {}
}

/**
 * Parses owner and repo from a GitHub URL.
 */
function parseGithubUrl (url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url)

    if (parsed.hostname !== 'github.com') return null

    const parts = parsed.pathname.split('/').filter(Boolean)

    if (parts.length < 2) return null

    const owner = parts[0]
    const repo = parts[1]

    if (!owner || !repo) return null

    return {
      owner,
      repo: repo.replace(/\.git$/, '')
    }
  } catch {
    return null
  }
}

/**
 * Parses project path from a GitLab URL.
 */
function parseGitlabUrl (url: string): string | null {
  try {
    const parsed = new URL(url)

    if (parsed.hostname !== 'gitlab.com') return null

    const projectPath = parsed.pathname.split('/').filter(Boolean).join('/')

    return projectPath || null
  } catch {
    return null
  }
}

/**
 * Enriches a blip with license and rating data.
 */
export async function enrichBlip (
  blip: Blip,
  blueOak: unknown[] = [],
  githubToken?: string,
  gitlabToken?: string,
  githubApiBaseUrl: string = 'https://api.github.com',
  gitlabApiBaseUrl: string = 'https://gitlab.com'
): Promise<Blip> {
  // If there's no repoUrl, there's no license or rating to fetch.
  if (!blip.repoUrl) {
    return {
      ...blip,
      rating: 'Unknown',
      license: {
        spdx_id: 'Unknown',
        name: 'Unknown License',
        url: ''
      }
    }
  }

  const cacheKey = blip.repoUrl
  const now = Date.now()

  if (enrichmentCache[cacheKey] && (now - enrichmentCache[cacheKey].timestamp) < CACHE_TTL) {
    return {
      ...blip,
      license: enrichmentCache[cacheKey].license,
      rating: enrichmentCache[cacheKey].rating ?? ''
    }
  }

  let license: LicenseMetadata | undefined = blip.license || {
    spdx_id: 'Unknown',
    name: 'Unknown License',
    url: blip.repoUrl
  }

  // Fetch from GitHub
  if (blip.repoUrl.includes('github.com')) {
    const githubInfo = parseGithubUrl(blip.repoUrl)

    if (githubInfo) {
      try {
        const headers: Record<string, string> = {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }

        if (githubToken) {
          headers.Authorization = `Bearer ${githubToken}`
        }

        const url = `${githubApiBaseUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/license`

        const response = await api.get(
          url,
          { headers, timeout: 5000 }
        )

        if (response.data && response.data.license) {
          license = {
            spdx_id: response.data.license.spdx_id || 'Unknown',
            name: response.data.license.name || 'Unknown License',
            url: response.data.html_url || blip.repoUrl
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch GitHub license for ${blip.name}:`, (error as Error).message)
      }
    }
  } else if (blip.repoUrl.includes('gitlab.com')) {
    const projectPath = parseGitlabUrl(blip.repoUrl)

    if (projectPath) {
      try {
        const encodedPath = encodeURIComponent(projectPath)
        const headers: Record<string, string> = {}

        if (gitlabToken) {
          headers['Private-Token'] = gitlabToken
        }

        const url = `${gitlabApiBaseUrl}/api/v4/projects/${encodedPath}`

        const response = await api.get(
          url,
          { headers, timeout: 5000 }
        )

        if (response.data && response.data.license) {
          license = {
            spdx_id: response.data.license.nickname || response.data.license.key || 'Unknown',
            name: response.data.license.name || 'Unknown License',
            url: response.data.license_url || `${blip.repoUrl}/-/blob/master/LICENSE`
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch GitLab license for ${blip.name}:`, (error as Error).message)
      }
    }
  }

  // Compare against Blue Oak list
  let rating = 'Unknown'

  interface BlueOakLicense {
    id: string
    rating?: string
  }

  if (license && Array.isArray(blueOak) && blueOak.length > 0) {
    const found = (blueOak as BlueOakLicense[]).find((l) => l.id === license?.spdx_id)

    if (found) {
      rating = found.rating || 'Approved'
    }
  }

  // Fallback to manual check if still unknown
  if (rating === 'Unknown' && license) {
    if (license.spdx_id === 'MIT') {
      rating = 'Gold'
    } else if (license.spdx_id === 'Apache-2.0') {
      rating = 'Gold'
    }
  }

  // Update cache
  enrichmentCache[cacheKey] = {
    license,
    rating,
    timestamp: now
  }

  return {
    ...blip,
    license,
    rating
  }
}

/**
 * Enriches all blips in a radar configuration.
 */
export async function enrichBlips (
  blips: Blip[],
  blueOak: unknown[] = [],
  githubToken?: string,
  gitlabToken?: string,
  githubApiBaseUrl?: string,
  gitlabApiBaseUrl?: string
): Promise<Blip[]> {
  return Promise.all(blips.map((blip) => enrichBlip(blip, blueOak, githubToken, gitlabToken, githubApiBaseUrl, gitlabApiBaseUrl)))
}
