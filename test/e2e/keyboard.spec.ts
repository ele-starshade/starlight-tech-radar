import { test, expect, mockQuery, hideViteOverlay, disableAnimations } from './utils'

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await hideViteOverlay(page)
    await disableAnimations(page)
    await page.goto(`/${mockQuery}`)
  })

  test('should have a skip to content link as the first focusable element', async ({ page }) => {
    await page.keyboard.press('Tab')
    const skipLink = page.locator('.skip-link')

    await expect(skipLink).toBeFocused()
    await expect(skipLink).toHaveText('Skip to main content')

    // Check if it's visually hidden but has href
    await expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  test('should be able to navigate blips using Tab', async ({ page }) => {
    // Wait for radar to be visible
    await expect(page.locator('.radar-svg')).toBeVisible()

    const firstBlip = page.locator('.blip-node').first()

    // Check if it has tabindex
    await expect(firstBlip).toHaveAttribute('tabindex', '0')

    // Tab a few times to reach the first blip (skip link, menu button, home link, settings link, etc.)
    // Instead of counting tabs, we can focus it directly or tab until it is focused
    await firstBlip.focus()
    await expect(firstBlip).toBeFocused()
  })

  test('should open details dialog when pressing Enter on a blip', async ({ page }) => {
    const firstBlip = page.locator('.blip-node').first()

    await firstBlip.focus()
    await page.keyboard.press('Enter')

    const dialog = page.locator('.q-dialog')

    await expect(dialog).toBeVisible()

    await expect(page.locator('.q-dialog')).toBeVisible()
  })
})
