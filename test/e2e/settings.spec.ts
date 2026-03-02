import { test, expect, hideViteOverlay } from './utils'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await hideViteOverlay(page)
    await page.goto('/settings')
    // Wait for hydration to complete in SSR mode
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Settings')
  })

  test('should display accessibility settings', async ({ page }) => {
    await expect(page.locator('.text-h6', { hasText: 'Accessibility' })).toBeVisible()
  })

  test('should toggle dark mode', async ({ page }) => {
    const darkModeToggle = page.getByRole('switch', { name: 'Dark Mode' })

    // Initially dark mode is on (default)
    await expect(page.locator('body')).toHaveClass(/body--dark/)

    await darkModeToggle.click()
    await expect(page.locator('body')).not.toHaveClass(/body--dark/)

    await darkModeToggle.click()
    await expect(page.locator('body')).toHaveClass(/body--dark/)
  })

  test('should toggle dyslexic font', async ({ page }) => {
    const dyslexicToggle = page.getByRole('switch', { name: 'Open Dyslexic' })

    await expect(page.locator('body')).not.toHaveClass(/open-dyslexic/)

    await dyslexicToggle.click()
    await expect(page.locator('body')).toHaveClass(/open-dyslexic/)

    await dyslexicToggle.click()
    await expect(page.locator('body')).not.toHaveClass(/open-dyslexic/)
  })

  test('should change font size', async ({ page }) => {
    const increaseButton = page.locator('button').filter({ hasText: 'add' })
    const decreaseButton = page.locator('button').filter({ hasText: 'remove' })

    // Check initial font size (step 1 = 16px)
    const body = page.locator('body')

    await expect(body).toHaveCSS('font-size', '16px')

    await increaseButton.click()
    await expect(body).toHaveCSS('font-size', '18px')

    await decreaseButton.click()
    await expect(body).toHaveCSS('font-size', '16px')

    await decreaseButton.click()
    await expect(body).toHaveCSS('font-size', '14px')
  })

  test('should persist settings after reload', async ({ page }) => {
    // 1. Change some settings
    await page.getByRole('switch', { name: 'Open Dyslexic' }).click()
    await page.locator('button').filter({ hasText: 'add' }).click() // Step 2 (18px)

    // With Dyslexic enabled, 18px * 0.9 = 16.2px
    await expect(page.locator('body')).toHaveClass(/open-dyslexic/)
    await expect(page.locator('body')).toHaveCSS('font-size', /16\.2/)

    // 2. Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 3. Verify settings are still applied (covers src/boot/accessibility.ts)
    await expect(page.locator('body')).toHaveClass(/open-dyslexic/)
    await expect(page.locator('body')).toHaveCSS('font-size', /16\.2/)
  })
})
