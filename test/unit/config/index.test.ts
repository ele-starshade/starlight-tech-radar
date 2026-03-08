import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('config/index.ts', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses default values when environment variables are not set', async () => {
    vi.stubEnv('GITHUB_TOKEN', '')
    vi.stubEnv('GITHUB_API_BASE_URL', '')
    vi.stubEnv('GITLAB_TOKEN', '')
    vi.stubEnv('GITLAB_API_BASE_URL', '')
    vi.stubEnv('TEAMS_WEBHOOK', '')
    vi.stubEnv('SLACK_WEBHOOK', '')

    const { appConfig } = await import('src/config/index')

    expect(appConfig.githubToken).toBe('')
    expect(appConfig.githubApiBaseUrl).toBe('https://api.github.com')
    expect(appConfig.gitlabToken).toBe('')
    expect(appConfig.gitlabApiBaseUrl).toBe('https://gitlab.com')
    expect(appConfig.teamsWebhook).toBe('')
    expect(appConfig.slackWebhook).toBe('')
    expect(appConfig.isFeedbackEnabled).toBe(false)
  })

  it('uses environment variables when they are set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'gh_token')
    vi.stubEnv('GITHUB_API_BASE_URL', 'https://custom-github.com')
    vi.stubEnv('GITLAB_TOKEN', 'gl_token')
    vi.stubEnv('GITLAB_API_BASE_URL', 'https://custom-gitlab.com')
    vi.stubEnv('TEAMS_WEBHOOK', 'https://teams.webhook')
    vi.stubEnv('SLACK_WEBHOOK', 'https://slack.webhook')

    const { appConfig } = await import('src/config/index')

    expect(appConfig.githubToken).toBe('gh_token')
    expect(appConfig.githubApiBaseUrl).toBe('https://custom-github.com')
    expect(appConfig.gitlabToken).toBe('gl_token')
    expect(appConfig.gitlabApiBaseUrl).toBe('https://custom-gitlab.com')
    expect(appConfig.teamsWebhook).toBe('https://teams.webhook')
    expect(appConfig.slackWebhook).toBe('https://slack.webhook')
    expect(appConfig.isFeedbackEnabled).toBe(true)
  })
})
