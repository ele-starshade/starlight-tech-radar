/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Cookies } from 'quasar'
import { useAccessibilityStore } from 'src/stores/accessibility'
import { createPinia, setActivePinia, getActivePinia } from 'pinia'

vi.mock('quasar', () => ({
  boot: vi.fn((fn) => fn),
  Cookies: {
    get: vi.fn(),
    has: vi.fn(),
    parseSSR: vi.fn()
  }
}))

describe('boot: accessibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.stubEnv('SERVER', '')
  })

  it('should initialize store from cookies on client side', async () => {
    vi.mocked(Cookies.has).mockImplementation((name) => {
      if (name === 'isDarkMode') return true
      if (name === 'fontSizeStep') return true
      if (name === 'isDyslexicEnabled') return true

      return false
    })

    vi.mocked(Cookies.get).mockImplementation((name) => {
      if (name === 'isDarkMode') return 'false'
      if (name === 'fontSizeStep') return '2'
      if (name === 'isDyslexicEnabled') return 'true'

      return null
    })

    const { default: bootFn } = await import('src/boot/accessibility')
    const pinia = getActivePinia()!
    const store = useAccessibilityStore(pinia)

    await (bootFn as any)({ store: pinia })

    expect(store.isDarkMode).toBe(false)
    expect(store.fontSizeStep).toBe(2)
    expect(store.isDyslexicEnabled).toBe(true)
  })

  it('should initialize store from cookies on server side', async () => {
    vi.stubEnv('SERVER', 'true')
    const mockSsrContext = {}
    const mockCookies = {
      has: vi.fn().mockReturnValue(true),
      get: vi.fn().mockImplementation((name) => {
        if (name === 'isDarkMode') return 'false'
        if (name === 'fontSizeStep') return '3'
        if (name === 'isDyslexicEnabled') return 'false'

        return null
      })
    }

    vi.mocked(Cookies.parseSSR).mockReturnValue(mockCookies as any)

    const { default: bootFn } = await import('src/boot/accessibility')
    const pinia = getActivePinia()!
    const store = useAccessibilityStore(pinia)

    await (bootFn as any)({ ssrContext: mockSsrContext, store: pinia })

    expect(store.isDarkMode).toBe(false)
    expect(store.fontSizeStep).toBe(3)
    expect(store.isDyslexicEnabled).toBe(false)
    expect(Cookies.parseSSR).toHaveBeenCalledWith(mockSsrContext)
  })

  it('should not update store if cookies are missing', async () => {
    vi.mocked(Cookies.has).mockReturnValue(false)

    const { default: bootFn } = await import('src/boot/accessibility')
    const pinia = getActivePinia()!
    const store = useAccessibilityStore(pinia)

    // Set initial values
    store.isDarkMode = true
    store.fontSizeStep = 1
    store.isDyslexicEnabled = false

    await (bootFn as any)({ store: pinia })

    expect(store.isDarkMode).toBe(true)
    expect(store.fontSizeStep).toBe(1)
    expect(store.isDyslexicEnabled).toBe(false)
  })
})
