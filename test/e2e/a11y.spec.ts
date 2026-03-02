import { test, expect, mockQuery, hideViteOverlay, disableAnimations } from './utils'
import AxeBuilder from '@axe-core/playwright'

const disabledRules: string[] = []

test.describe('Accessibility Checks', () => {
  test.beforeEach(async ({ page }) => {
    await hideViteOverlay(page)
    await disableAnimations(page)
  })

  test('home page (radar view) should have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    await expect(page.locator('.radar-svg')).toBeVisible()

    const a11yScan = await new AxeBuilder({ page })
      .exclude('#q-loading-bar')
      .disableRules(disabledRules)
      .analyze()

    expect(a11yScan.violations).toEqual([])
  })

  test('list view should have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    const listButton = page.locator('button').filter({ hasText: 'List' })

    await listButton.click()
    await expect(page.locator('.q-card').first()).toBeVisible()

    const a11yScan = await new AxeBuilder({ page })
      .exclude('#q-loading-bar')
      .disableRules(disabledRules)
      .analyze()

    expect(a11yScan.violations).toEqual([])
  })

  test('blip hover tooltip should have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    const firstBlip = page.locator('.blip-node circle').first()

    await firstBlip.hover()
    const tooltip = page.locator('.q-tooltip')

    await expect(tooltip).toBeVisible()

    const a11yScan = await new AxeBuilder({ page })
      .include('.q-tooltip')
      .exclude('#q-loading-bar')
      .disableRules(disabledRules)
      .analyze()

    expect(a11yScan.violations).toEqual([])
  })

  test('blip details dialog should have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    const firstBlip = page.locator('.blip-node').first()

    await firstBlip.click()
    const dialog = page.locator('.q-dialog')

    await expect(dialog).toBeVisible()

    // Wait for any Quasar dialog animations to finish
    await expect(page.locator('.q-dialog__inner--animating')).toHaveCount(0)

    const a11yScan = await new AxeBuilder({ page })
      .include('.q-dialog')
      .exclude('#q-loading-bar')
      .disableRules(disabledRules)
      .analyze()

    expect(a11yScan.violations).toEqual([])
  })

  test('feedback dialog should have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    const firstBlip = page.locator('.blip-node').first()

    await firstBlip.click()

    const detailsDialog = page.locator('.q-dialog').filter({ hasText: 'Vue.js' })

    await expect(detailsDialog).toBeVisible()

    const feedbackButton = detailsDialog.getByRole('button', { name: 'Give Feedback' })

    await feedbackButton.click()

    const feedbackDialog = page.locator('.q-dialog').filter({ hasText: 'Feedback for Vue.js' })

    await expect(feedbackDialog).toBeVisible()

    // Wait for any Quasar dialog animations to finish
    await expect(page.locator('.q-dialog__inner--animating')).toHaveCount(0)

    const a11yScan = await new AxeBuilder({ page })
      .include('.q-dialog')
      .exclude('#q-loading-bar')
      .disableRules(disabledRules)
      .analyze()

    expect(a11yScan.violations).toEqual([])
  })

  test('feedback success notification should have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)
    const firstBlip = page.locator('.blip-node').first()

    await firstBlip.click()

    const detailsDialog = page.locator('.q-dialog').filter({ hasText: 'Vue.js' })

    await expect(detailsDialog).toBeVisible()

    const feedbackButton = detailsDialog.getByRole('button', { name: 'Give Feedback' })

    await feedbackButton.click()

    const feedbackDialog = page.locator('.q-dialog').filter({ hasText: 'Feedback for Vue.js' })

    await expect(feedbackDialog).toBeVisible()

    await feedbackDialog.locator('.q-select').click()
    await page.locator('.q-item').filter({ hasText: 'Positive' }).click()
    await feedbackDialog.locator('textarea').fill('Great tool!')
    await feedbackDialog.getByRole('button', { name: 'Send Feedback' }).click()

    const notification = page.locator('.q-notification')

    await expect(notification).toBeVisible()

    // Wait for any Quasar dialog animations to finish
    await expect(page.locator('.q-dialog__inner--animating')).toHaveCount(0)

    const a11yScan = await new AxeBuilder({ page })
      .include('.q-notification')
      .exclude('#q-loading-bar')
      .disableRules(disabledRules)
      .analyze()

    expect(a11yScan.violations).toEqual([])
  })
})
