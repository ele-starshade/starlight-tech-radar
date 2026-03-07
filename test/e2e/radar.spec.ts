import { test, expect, mockRadarData, mockQuery, hideViteOverlay } from './utils'

test.describe('Radar Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await hideViteOverlay(page)
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

    const tabs = page.getByRole('tab')

    await tabs.filter({ hasText: 'Languages' }).click()

    const vueCard = page.locator('.q-card').filter({ hasText: 'Vue.js' })

    await expect(vueCard.locator('.q-chip', { hasText: 'MIT' })).toBeVisible()
    await expect(vueCard.locator('.q-chip', { hasText: 'Gold' })).toBeVisible()

    await tabs.filter({ hasText: 'Tools' }).click()
    const gitlabCard = page.locator('.q-card').filter({ hasText: 'GitLab' })

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
  })

  test('should open details modal when clicking a blip', async ({ page }) => {
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

    // Check tabs
    const tabs = page.getByRole('tab')
    const allTabs = await tabs.all()

    expect(allTabs).toHaveLength(4)
    await expect(tabs.nth(0)).toHaveText('Techniques')
    await expect(tabs.nth(1)).toHaveText('Languages & Frameworks')
    await expect(tabs.nth(2)).toHaveText('Platforms')
    await expect(tabs.nth(3)).toHaveText('Tools')

    // Verify you can click the tabs
    // Languages
    await tabs.nth(1).click({ delay: 100 })
    await expect(page.locator('.q-card:visible').nth(0)).toBeVisible()
    await expect(page.locator('.q-card:visible')).toHaveCount(mockRadarData.blips.filter(blip => blip.quadrant === 'Languages & Frameworks').length)
    // Platforms
    await tabs.nth(2).click({ delay: 100 })
    await expect(page.locator('.q-card:visible').nth(0)).toBeVisible()
    await expect(page.locator('.q-card:visible')).toHaveCount(mockRadarData.blips.filter(blip => blip.quadrant === 'Platforms').length)
    // Tools
    await tabs.nth(3).click({ delay: 100 })
    await expect(page.locator('.q-card:visible').nth(0)).toBeVisible()
    await expect(page.locator('.q-card:visible')).toHaveCount(mockRadarData.blips.filter(blip => blip.quadrant === 'Tools').length)
    // Techniques
    await tabs.nth(0).click({ delay: 100 })
    await expect(page.locator('.q-card:visible').nth(0)).toBeVisible()
    await expect(page.locator('.q-card:visible')).toHaveCount(mockRadarData.blips.filter(blip => blip.quadrant === 'Techniques').length)

    // Radar not visible
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
    const tabs = page.getByRole('tab')

    await expect(tabs).toHaveCount(4)

    const cards = page.locator('.q-card:visible')

    // Check content of a card
    await expect(cards.first().locator('.text-h6')).toContainText(/TDD/)
  })
})
