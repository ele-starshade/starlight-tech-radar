import { type Blip, type LicenseMetadata } from 'src/models/radar'

/**
 * Enriches a blip with license and rating data.
 */
export async function enrichBlip (blip: Blip, blueOak: unknown[] = []): Promise<Blip> {
  let license: LicenseMetadata = {
    spdx_id: 'MIT',
    name: 'MIT License',
    url: 'https://opensource.org/licenses/MIT'
  }

  // Placeholder: In a real implementation, we would fetch from GitHub/GitLab
  if (blip.repoUrl.includes('github.com')) {
    // console.log(`Placeholder: Fetching GitHub license for ${blip.name}`)

    license = {
      spdx_id: 'MIT',
      name: 'MIT License',
      url: `https://api.github.com/repos/${blip.name}/license` // placeholder url
    }
  } else if (blip.repoUrl.includes('gitlab.com')) {
    // console.log(`Placeholder: Fetching GitLab license for ${blip.name}`)

    license = {
      spdx_id: 'MIT',
      name: 'MIT License',
      url: `https://gitlab.com/api/v4/projects/${blip.name}/license` // placeholder url
    }
  }

  // Compare against Blue Oak list
  let rating = 'Unknown'

  interface BlueOakLicense {
    id: string
    rating?: string
  }

  if (Array.isArray(blueOak) && blueOak.length > 0) {
    const found = (blueOak as BlueOakLicense[]).find((l) => l.id === license.spdx_id)

    if (found) {
      rating = found.rating || 'Approved'
    }
  }

  // Fallback to manual check if still unknown
  if (rating === 'Unknown') {
    if (license.spdx_id === 'MIT') {
      rating = 'Gold'
    } else if (license.spdx_id === 'Apache-2.0') {
      rating = 'Gold'
    }
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
export async function enrichBlips (blips: Blip[], blueOak: unknown[] = []): Promise<Blip[]> {
  return Promise.all(blips.map((blip) => enrichBlip(blip, blueOak)))
}
