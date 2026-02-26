import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright';

(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    colorScheme: 'light'
  })
  const page = await context.newPage()

  await page.goto('http://localhost:9100')

  // Wait a bit for rendering
  await page.waitForTimeout(2000)

  const results = await new AxeBuilder({ page }).analyze()

  if (results.violations.length === 0) {
    console.log('No accessibility violations found.')
  } else {
    console.log(JSON.stringify(results.violations, null, 2))
  }

  await browser.close()
})().catch(err => {
  console.error(err)
  process.exit(1)
})
