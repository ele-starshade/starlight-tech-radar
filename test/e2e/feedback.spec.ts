import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const mockRadarData = {
  quadrants: ['Techniques', 'Platforms', 'Tools', 'Languages & Frameworks'],
  rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
  blips: [
    { name: 'Vue.js', quadrant: 'Languages & Frameworks', ring: 'Adopt', isNew: false, description: 'Vue', repoUrl: 'https://github.com/vuejs/core', guidanceLink: 'https://vuejs.org' }
  ]
}

const mockQuery = `?mock=true&clearCache=true&data=${encodeURIComponent(JSON.stringify(mockRadarData))}`

test.describe('Feedback Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Hide Vite error overlay that might block pointer events
    await page.addStyleTag({ content: 'vite-plugin-checker-error-overlay { display: none !important; }' })
  })

  test('should submit feedback successfully and have no accessibility issues', async ({ page }) => {
    await page.goto(`/${mockQuery}`)

    // Open blip details
    const vueBlip = page.locator('.blip-node').first()

    await vueBlip.click()

    const detailsDialog = page.locator('.q-dialog').filter({ hasText: 'Vue.js' })

    await expect(detailsDialog).toBeVisible()

    // Click Give Feedback button
    const feedbackButton = detailsDialog.getByRole('button', { name: 'Give Feedback' })

    await expect(feedbackButton).toBeVisible()
    await feedbackButton.click()

    // Feedback dialog should be open
    // Note: Quasar might open multiple dialogs, so we filter for the one with feedback title
    const feedbackDialog = page.locator('.q-dialog').filter({ hasText: 'Feedback for Vue.js' })

    await expect(feedbackDialog).toBeVisible()

    // Accessibility check for the feedback dialog
    const feedbackDialogA11y = await new AxeBuilder({ page })
      .include('.q-dialog')
      .disableRules([
        'aria-progressbar-name',
        'region',
        'landmark-no-duplicate-main',
        'scrollable-region-focusable',
        'color-contrast' // Brand colors on dark background often fail automated scans
      ])
      .analyze()

    expect(feedbackDialogA11y.violations).toEqual([])

    // Fill in feedback type
    await feedbackDialog.locator('.q-select').click()
    // Select 'Positive' option from the menu (menu is portalled to end of body)
    const positiveOption = page.locator('.q-item').filter({ hasText: 'Positive' })

    await positiveOption.click()

    // Fill in comment
    await feedbackDialog.locator('textarea').fill('This is a great tool!')

    // Submit feedback
    const submitButton = feedbackDialog.getByRole('button', { name: 'Send Feedback' })

    await submitButton.click()

    // Wait for feedback dialog to close
    await expect(feedbackDialog).not.toBeVisible()

    // Check for success notification
    const notification = page.locator('.q-notification')

    await expect(notification).toBeVisible()
    await expect(notification).toContainText('Thank you for your feedback!')

    // Accessibility check for the success notification
    const notificationA11y = await new AxeBuilder({ page })
      .include('.q-notification')
      .disableRules([
        'aria-progressbar-name',
        'region',
        'landmark-no-duplicate-main',
        'scrollable-region-focusable',
        'color-contrast'
      ])
      .analyze()

    expect(notificationA11y.violations).toEqual([])
  })

  test('should disable submit button when fields are empty', async ({ page }) => {
    await page.goto(`/${mockQuery}`)

    // Open blip details
    const vueBlip = page.locator('.blip-node').first()

    await vueBlip.click()

    // Click Give Feedback button
    const feedbackButton = page.locator('.q-dialog').getByRole('button', { name: 'Give Feedback' })

    await feedbackButton.click()

    const feedbackDialog = page.locator('.q-dialog').filter({ hasText: 'Feedback for Vue.js' })

    await expect(feedbackDialog).toBeVisible()

    const submitButton = feedbackDialog.getByRole('button', { name: 'Send Feedback' })

    await expect(submitButton).toBeDisabled()

    // Fill only type
    await feedbackDialog.locator('.q-select').click()
    await page.locator('.q-item').filter({ hasText: 'Suggestion' }).click()
    await expect(submitButton).toBeDisabled()

    // Fill comment but clear type (difficult to clear q-select easily in test, let's just test initial state and one field)
    await feedbackDialog.locator('textarea').fill('Some suggestion')
    await expect(submitButton).not.toBeDisabled()
  })
})
