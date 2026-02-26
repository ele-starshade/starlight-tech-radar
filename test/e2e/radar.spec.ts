import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Radar Home Page', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should load the home page and show the title', async ({ page }) => {
    await page.goto('/')

    // Expect the title to contain "Starlight Tech Radar"
    await expect(page).toHaveTitle(/Starlight Tech Radar/)
  })

  test('should display the radar quadrants', async ({ page }) => {
    await page.goto('/')

    // Check if the quadrants are visible (assuming they are in the sidebar or main view)
    // Adjust selector based on actual implementation
    const quadrants = page.locator('.q-item-label:has-text("Techniques")')

    await expect(quadrants).toBeVisible()
  })
})
