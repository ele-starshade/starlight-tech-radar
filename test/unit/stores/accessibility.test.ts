import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAccessibilityStore } from 'src/stores/accessibility'

describe('Accessibility Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useAccessibilityStore()

    expect(store.isDyslexicEnabled).toBe(false)
    expect(store.isDarkMode).toBe(true)
  })
})
