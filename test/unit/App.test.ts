import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import App from 'src/App.vue'
import { useAccessibilityStore } from 'src/stores/accessibility'
import { nextTick } from 'vue'

const mockSetDark = vi.fn()

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: { set: mockSetDark }
  })
}))

describe('App.vue', () => {
  beforeEach(() => {
    mockSetDark.mockClear()
    document.body.style.fontSize = ''
    document.documentElement.style.fontSize = ''
    document.body.className = ''
  })

  it('matches snapshot', () => {
    const wrapper = mountComponent(App)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('updates dark mode when isDarkMode changes', async () => {
    mountComponent(App)
    const store = useAccessibilityStore()

    // Default is true, so change to false to trigger watcher
    store.isDarkMode = false
    await nextTick()

    expect(mockSetDark).toHaveBeenCalledWith(false)
  })

  it('applies dyslexic class and scales font down when isDyslexicEnabled is true', async () => {
    mountComponent(App)
    const store = useAccessibilityStore()

    store.isDyslexicEnabled = true
    await nextTick()

    expect(document.body.classList.contains('open-dyslexic')).toBe(true)
    // base 14px + (1 * 2) = 16px * 0.9 = 14.4px
    expect(document.body.style.fontSize).toBe('14.4px')
    expect(document.documentElement.style.fontSize).toBe('14.4px')
  })

  it('applies font size step correctly', async () => {
    mountComponent(App)
    const store = useAccessibilityStore()

    // Assuming a step size of 2
    store.fontSizeStep = 2
    await nextTick()

    // 14 + (2 * 2) = 18px
    expect(document.body.style.fontSize).toBe('18px')
    expect(document.documentElement.style.fontSize).toBe('18px')
  })
})
