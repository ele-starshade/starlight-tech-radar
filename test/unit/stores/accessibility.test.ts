import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAccessibilityStore } from 'src/stores/accessibility'

import { LocalStorage, Cookies } from 'quasar'

// Mock Quasar's LocalStorage and Cookies
vi.mock('quasar', () => ({
  LocalStorage: {
    set: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    remove: vi.fn()
  },
  Cookies: {
    set: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    remove: vi.fn()
  },
  acceptHMRUpdate: vi.fn()
}))

describe('Accessibility Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const store = useAccessibilityStore()

    expect(store.isDyslexicEnabled).toBe(false)
    expect(store.isDarkMode).toBe(true)
    expect(store.fontSizeStep).toBe(1)
  })

  it('updates fontSizeStep and persists it', () => {
    const store = useAccessibilityStore()

    store.setFontSizeStep(2)

    expect(store.fontSizeStep).toBe(2)
    expect(LocalStorage.set).toHaveBeenCalledWith('fontSizeStep', 2)
    expect(Cookies.set).toHaveBeenCalledWith('fontSizeStep', '2', { path: '/' })
  })

  it('updates isDyslexicEnabled and persists it', () => {
    const store = useAccessibilityStore()

    store.setDyslexicEnabled(true)

    expect(store.isDyslexicEnabled).toBe(true)
    expect(LocalStorage.set).toHaveBeenCalledWith('isDyslexicEnabled', true)
    expect(Cookies.set).toHaveBeenCalledWith('isDyslexicEnabled', 'true', { path: '/' })
  })

  it('updates isDarkMode and persists it', () => {
    const store = useAccessibilityStore()

    store.setDarkMode(false)

    expect(store.isDarkMode).toBe(false)
    expect(LocalStorage.set).toHaveBeenCalledWith('isDarkMode', false)
    expect(Cookies.set).toHaveBeenCalledWith('isDarkMode', 'false', { path: '/' })
  })
})
