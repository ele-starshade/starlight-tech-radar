import { test, expect, hideViteOverlay } from './utils'
import { type Blip } from 'src/models/radar'

// Generate enough blips to trigger clustering in the "Adopt" ring (threshold > 10)
const generateClusteredData = () => {
  const blips: Blip[] = []

  // 11 blips in Adopt (Threshold is 10, so it should cluster)
  for (let i = 1; i <= 11; i++) {
    blips.push({
      name: `Adopt Tool ${i}`,
      quadrant: 'Tools',
      ring: 'Adopt',
      isNew: false,
      description: `Description ${i}`,
      repoUrl: `https://github.com/test/tool${i}`,
      guidanceLink: `https://test.com/tool${i}`
    })
  }

  // 14 blips in Trial (Threshold is 15, so it should NOT cluster)
  for (let i = 1; i <= 14; i++) {
    blips.push({
      name: `Trial Tool ${i}`,
      quadrant: 'Tools',
      ring: 'Trial',
      isNew: false,
      description: `Description ${i}`,
      repoUrl: `https://github.com/test/trial${i}`,
      guidanceLink: `https://test.com/trial${i}`
    })
  }

  return {
    quadrants: ['Techniques', 'Platforms', 'Tools', 'Languages & Frameworks'],
    rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
    blips
  }
}

const clusteredData = generateClusteredData()
const clusterQuery = `?mock=true&clearCache=true&data=${encodeURIComponent(JSON.stringify(clusteredData))}`

test.describe('Radar Clustering', () => {
  test.use({ viewport: { width: 1280, height: 1024 } })

  test.beforeEach(async ({ page }) => {
    await hideViteOverlay(page)
  })

  test('should cluster blips when threshold is exceeded', async ({ page }) => {
    await page.goto(`/${clusterQuery}`)

    // We generated 11 Adopt blips (which should become 1 cluster node)
    // and 14 Trial blips (which should remain 14 distinct nodes)
    // Total nodes rendered = 1 (cluster) + 14 (individuals) = 15
    const blips = page.locator('.blip-node')

    await expect(blips).toHaveCount(15)

    // The cluster node should render a larger rect with the number 11 inside
    const clusterNode = page.locator('.blip-node[aria-label="Cluster: 11 items"]')

    await expect(clusterNode).toBeVisible()

    // Check tooltip mentions grouping. We target the inner rect as SVG nodes
    // themselves can be flaky in some playwright browsers regarding mouse events.
    const clusterShape = clusterNode.locator('.blip-shape')

    await clusterShape.hover()

    // Fallback to class selector
    const tooltip = page.locator('.q-tooltip')

    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('11 blips grouped')
  })

  test('should render clustered blips correctly in the details modal', async ({ page }) => {
    await page.goto(`/${clusterQuery}`)

    const clusterNode = page.locator('.blip-node[aria-label="Cluster: 11 items"]')

    await clusterNode.locator('.blip-shape').click()

    const dialog = page.locator('.q-dialog')

    await expect(dialog).toBeVisible()

    // Title should indicate number of items (Mock ignores i18n, outputting English text)
    await expect(dialog.locator('#blip-details-title')).toContainText('11 items in Tools - Adopt')

    // Should render a card for each of the 11 blips inside
    const blipCards = dialog.locator('.q-pa-md.bg-grey-9')

    await expect(blipCards).toHaveCount(11)

    // Check first item content
    await expect(blipCards.first().locator('.text-subtitle1')).toContainText('Adopt Tool 1')
  })
})
