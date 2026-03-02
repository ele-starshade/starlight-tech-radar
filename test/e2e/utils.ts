import { test as baseTest, expect, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

export const mockRadarData = {
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

export const mockQuery = `?mock=true&clearCache=true&data=${encodeURIComponent(JSON.stringify(mockRadarData))}`

export async function hideViteOverlay (page: Page) {
  await page.addStyleTag({ content: 'vite-plugin-checker-error-overlay { display: none !important; }' })
}

export async function disableAnimations (page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
    `
  })
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await use(context)
    const pages = context.pages()

    for (const page of pages) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coverage = await page.evaluate(() => (window as any).__coverage__).catch(() => null)

      if (coverage) {
        const dir = path.join(process.cwd(), '.nyc_output')

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, `coverage-${crypto.randomUUID()}.json`), JSON.stringify(coverage))
      }
    }
  }
})

export { expect }
