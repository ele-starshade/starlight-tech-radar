import { test, expect, mockQuery, hideViteOverlay } from './utils'

test.describe('Feedback Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await hideViteOverlay(page)
  })

  test('should submit feedback successfully', async ({ page }) => {
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
