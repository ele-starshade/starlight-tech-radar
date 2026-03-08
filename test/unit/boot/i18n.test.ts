import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createI18n } from 'vue-i18n'
import type { App } from 'vue'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(() => ({
    install: vi.fn()
  }))
}))

vi.mock('quasar/wrappers', () => ({
  boot: vi.fn((fn) => fn)
}))

// Mock messages to avoid loading the real ones
vi.mock('src/i18n', () => ({
  default: {
    'en-US': { test: 'test' }
  }
}))

describe('boot: i18n', () => {
  let app: App

  beforeEach(() => {
    app = {
      use: vi.fn()
    } as unknown as App
    vi.clearAllMocks()
  })

  it('should create i18n instance and use it in app', async () => {
    const { default: bootFn } = await import('src/boot/i18n')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (bootFn as any)({ app })

    expect(createI18n).toHaveBeenCalledWith(expect.objectContaining({
      locale: 'en-US',
      fallbackLocale: 'en-US',
      messages: expect.any(Object)
    }))
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(app.use)).toHaveBeenCalled()
  })
})
