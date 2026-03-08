import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import SettingsPage from 'src/pages/SettingsPage.vue'
import { createTestingPinia } from '@pinia/testing'
import { useAccessibilityStore } from 'src/stores/accessibility'
import { nextTick } from 'vue'
import { setActivePinia } from 'pinia'
import { useQuasar } from 'quasar'

vi.mock('quasar', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('quasar')>()

  return {
    ...actual,
    useQuasar: vi.fn(() => ({
      dark: { set: vi.fn(), isActive: false },
      screen: { lt: { md: false } },
      platform: { has: { webStorage: false } },
      localStorage: { getItem: vi.fn(), set: vi.fn() }
    })),
    Cookies: {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      remove: vi.fn()
    },
    LocalStorage: {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      remove: vi.fn()
    }
  }
})

describe('SettingsPage.vue', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pinia: any

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
    setActivePinia(pinia)
    vi.clearAllMocks()
    vi.mocked(useQuasar).mockReturnValue({
      dark: { set: vi.fn(), isActive: false },
      screen: { lt: { md: false } },
      platform: { has: { webStorage: false } },
      localStorage: { getItem: vi.fn(), set: vi.fn() }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it('matches snapshot', () => {
    const wrapper = mountComponent(SettingsPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'q-select': { template: '<div class="q-select-stub"><slot name="prepend" /></div>' }
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('increases font size', async () => {
    const store = useAccessibilityStore(pinia)

    store.fontSizeStep = 1

    const wrapper = mountComponent(SettingsPage, {
      global: { plugins: [pinia] }
    })

    await nextTick()

    const addBtn = wrapper.find('[data-testid="increase-font-size"]')

    await addBtn.trigger('click')
    await nextTick()

    expect(store.fontSizeStep).toBe(2)
  })

  it('decreases font size', async () => {
    const store = useAccessibilityStore(pinia)

    store.fontSizeStep = 1

    const wrapper = mountComponent(SettingsPage, {
      global: { plugins: [pinia] }
    })

    await nextTick()

    const removeBtn = wrapper.find('[data-testid="decrease-font-size"]')

    await removeBtn.trigger('click')
    await nextTick()

    expect(store.fontSizeStep).toBe(0)
  })

  it('binds dyslexic mode to store correctly', async () => {
    const store = useAccessibilityStore(pinia)

    store.isDyslexicEnabled = true

    const wrapper = mountComponent(SettingsPage, {
      global: { plugins: [pinia] }
    })

    await nextTick()

    const toggle = wrapper.find('[data-testid="toggle-dyslexic"]')

    expect(toggle.attributes('model-value')).toBe('true')
  })

  it('binds dark mode to store correctly', async () => {
    const store = useAccessibilityStore(pinia)

    store.isDarkMode = false

    const wrapper = mountComponent(SettingsPage, {
      global: { plugins: [pinia] }
    })

    await nextTick()

    const toggle = wrapper.find('[data-testid="toggle-dark-mode"]')

    expect(toggle.attributes('model-value')).toBe('false')
  })

  it('persists locale choice to local storage', async () => {
    const setItemSpy = vi.fn()

    vi.mocked(useQuasar).mockReturnValue({
      dark: { set: vi.fn(), isActive: false },
      screen: { lt: { md: false } },
      platform: { has: { webStorage: true } },
      localStorage: { getItem: vi.fn(), set: setItemSpy }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const wrapper = mountComponent(SettingsPage, {
      global: { plugins: [pinia] }
    })

    // Modify locale and test if watcher acts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as any

    vm.locale = 'fr'
    await nextTick()

    expect(setItemSpy).toHaveBeenCalledWith('locale', 'fr')
  })

  it('loads locale from local storage on mount', async () => {
    const getItemSpy = vi.fn().mockReturnValue('fr')

    vi.mocked(useQuasar).mockReturnValue({
      dark: { set: vi.fn(), isActive: false },
      screen: { lt: { md: false } },
      platform: { has: { webStorage: true } },
      localStorage: { getItem: getItemSpy, set: vi.fn() }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const wrapper = mountComponent(SettingsPage, {
      global: { plugins: [pinia] }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as any

    await nextTick()
    expect(vm.locale).toBe('fr')
  })
})
