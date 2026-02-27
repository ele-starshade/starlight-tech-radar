import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const mockRadarData = {
  quadrants: ['Techniques', 'Platforms', 'Tools', 'Languages & Frameworks'],
  rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
  blips: [
    { name: 'Vue.js', quadrant: 'Languages & Frameworks', ring: 'Adopt', isNew: false, description: 'Vue', repoUrl: 'https://github.com/vuejs/core', guidanceLink: 'https://vuejs.org' },
    { name: 'React', quadrant: 'Languages & Frameworks', ring: 'Trial', isNew: true, description: 'React', repoUrl: 'https://github.com/facebook/react', guidanceLink: 'https://reactjs.org' },
    { name: 'GitLab Project', quadrant: 'Tools', ring: 'Trial', isNew: false, description: 'GitLab', repoUrl: 'https://gitlab.com/test/repo', guidanceLink: 'https://test.com' },
    { name: 'Node.js', quadrant: 'Platforms', ring: 'Adopt', isNew: false, description: 'Node', repoUrl: 'https://github.com/nodejs/node', guidanceLink: 'https://nodejs.org' },
    { name: 'Docker', quadrant: 'Platforms', ring: 'Assess', isNew: true, description: 'Docker', repoUrl: 'https://github.com/docker/docker-ce', guidanceLink: 'https://docker.com' },
    { name: 'Git', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: 'Git', repoUrl: 'https://github.com/git/git', guidanceLink: 'https://git-scm.com' },
    { name: 'Zod', quadrant: 'Tools', ring: 'Trial', isNew: true, description: 'Zod', repoUrl: 'https://github.com/colinhacks/zod', guidanceLink: 'https://zod.dev' },
    { name: 'TDD', quadrant: 'Techniques', ring: 'Adopt', isNew: false, description: 'TDD', repoUrl: 'https://github.com/test/tdd', guidanceLink: 'https://test.com' }
  ]
}

const mockQuery = `?mock=true&clearCache=true&data=${encodeURIComponent(JSON.stringify(mockRadarData))}`

test.describe('Radar Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Hide Vite error overlay that might block pointer events
    await page.addStyleTag({ content: 'vite-plugin-checker-error-overlay { display: none !important; }' })
  })

  test('should display license information in blip details modal', async ({ page }) => {
    test.slow()
    await page.goto(`/${mockQuery}`)
    await expect(page.locator('.radar-svg')).toBeVisible()

    // Switch to list view first to ensure data is enriched (easier to check than SVG)
    const listButton = page.locator('button').filter({ hasText: 'List' })

    await listButton.click()
    await expect(page.locator('.q-card').first().locator('.q-chip', { hasText: 'MIT' })).toBeVisible()

    // Switch back to radar
    const radarButton = page.locator('button').filter({ hasText: 'Radar' })

    await radarButton.click()
    await expect(page.locator('.radar-svg')).toBeVisible()

    // Test GitHub project license
    const vueBlip = page.locator('.blip-node').first()

    await vueBlip.click()

    const dialog = page.locator('.q-dialog')

    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.q-chip', { hasText: 'MIT' })).toBeVisible()
    await expect(dialog.locator('.q-chip', { hasText: 'Gold' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Test GitLab project license
    const gitlabBlip = page.locator('.blip-node').nth(2)

    await gitlabBlip.click()
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.q-chip', { hasText: 'Apache-2.0' })).toBeVisible()
  })

  test('should display license information in list view', async ({ page }) => {
    test.slow()
    await page.goto(`/${mockQuery}`)

    const listButton = page.locator('button').filter({ hasText: 'List' })

    await listButton.click()

    const firstCard = page.locator('.q-card').first()

    await expect(firstCard.locator('.q-chip', { hasText: 'MIT' })).toBeVisible()
    await expect(firstCard.locator('.q-chip', { hasText: 'Gold' })).toBeVisible()

    const gitlabCard = page.locator('.q-card').nth(2)

    await expect(gitlabCard.locator('.q-chip', { hasText: 'Apache-2.0' })).toBeVisible()
  })

  test('should load the home page and show the title', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    await expect(page).toHaveTitle(/Starlight Tech Radar/)
  })

  test('should display all blips on the radar canvas', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    const blips = page.locator('.blip-node')

    await expect(blips).toHaveCount(mockRadarData.blips.length)
  })

  test('should show blip names on hover', async ({ page }) => {
    await page.goto(`/${mockQuery}`)

    // Use a blip that is likely to be easily hoverable
    const firstBlip = page.locator('.blip-node circle').first()

    await firstBlip.hover()

    // Quasar tooltips are portalled to the end of the body
    const tooltip = page.locator('.q-tooltip')

    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText(/Vue.js/)

    // Run accessibility scan while tooltip is visible
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.q-tooltip')
      .disableRules(['aria-progressbar-name', 'region', 'landmark-no-duplicate-main', 'scrollable-region-focusable'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should open details modal when clicking a blip and have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)

    // Test for multiple blip types (standard and 'New')
    const blipsToTest = [
      { name: 'Vue.js', index: 0 },
      { name: 'React', index: 1 }
    ]

    for (const blip of blipsToTest) {
      const blipLocator = page.locator('.blip-node').nth(blip.index)

      await blipLocator.click()

      const dialog = page.locator('.q-dialog')

      await expect(dialog).toBeVisible()
      await expect(dialog.locator('.text-h6')).toContainText(new RegExp(blip.name))

      // Run accessibility scan while modal is open
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('.q-dialog')
        .disableRules([
          'aria-progressbar-name',
          'region',
          'landmark-no-duplicate-main',
          'scrollable-region-focusable',
          'color-contrast' // Brand colors on dark background often fail automated scans
        ])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])

      // Close the dialog
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
    }
  })

  test('should switch between radar and list view', async ({ page }) => {
    await page.goto(`/${mockQuery}`)

    // Initial state is radar
    await expect(page.locator('.radar-svg')).toBeVisible()

    // Click List view toggle (localized)
    const listButton = page.locator('button').filter({ hasText: 'List' })

    await listButton.click()

    // Verify list cards are shown
    const cards = page.locator('.q-card')

    // 8 blips + maybe some other cards? No, just blips.
    await expect(cards).toHaveCount(mockRadarData.blips.length)
    await expect(page.locator('.radar-svg')).not.toBeVisible()

    // Switch back to Radar
    const radarButton = page.locator('button').filter({ hasText: 'Radar' })

    await radarButton.click()
    await expect(page.locator('.radar-svg')).toBeVisible()
  })
})

test.describe('Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should force list view on mobile', async ({ page }) => {
    await page.goto(`/${mockQuery}`)

    // Toggle button should be hidden
    const toggle = page.locator('button').filter({ hasText: 'Radar' })

    await expect(toggle).not.toBeVisible()

    // Radar canvas should not be visible
    await expect(page.locator('.radar-svg')).not.toBeVisible()

    // List view cards should be visible
    const cards = page.locator('.q-card')

    await expect(cards).toHaveCount(mockRadarData.blips.length)

    // Check content of a card
    await expect(cards.first().locator('.text-h6')).toContainText(/Vue.js/)
  })
})
