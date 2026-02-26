import { test, expect } from '@playwright/test'

test.describe('Radar Home Page', () => {
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
