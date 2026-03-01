import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { vi } from 'vitest'

const originalWarn = console.warn

console.warn = (...args) => {
  const msg = args[0]

  if (typeof msg === 'string') {
    if (msg.includes('Failed to resolve component: q-')) return
    if (msg.includes('Failed to resolve directive: ripple')) return
    if (msg.includes('Failed to resolve directive: close-popup')) return
    if (msg.includes('App already provides property with key "Symbol(pinia)"')) return
  }

  originalWarn(...args)
}

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() }))
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: { 'en-US': {} }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mountComponent (component: any, options: any = {}) {
  return shallowMount(component, {
    ...options,
    global: {
      plugins: [createPinia(), i18n, ...(options.global?.plugins || [])],
      directives: {
        ripple: {},
        'close-popup': {},
        ...(options.global?.directives || {})
      },
      mocks: {
        $t: (msg: string) => msg,
        $q: {
          screen: { lt: { md: false } },
          dark: { isActive: false, set: vi.fn() },
          platform: { has: { webStorage: false } },
          localStorage: { getItem: vi.fn(), setItem: vi.fn() },
        },
        $route: { query: {} },
        $router: { push: vi.fn(), replace: vi.fn() },
        ...(options.global?.mocks || {})
      },
      provide: {
        _q_: {
          screen: { lt: { md: false } },
          dark: { isActive: false, set: vi.fn() },
          platform: { has: { webStorage: false } },
          localStorage: { getItem: vi.fn(), setItem: vi.fn() },
        },
        ...(options.global?.provide || {})
      },
      stubs: {
        'router-link': true,
        'router-view': true,
        ...(options.global?.stubs || {})
      }
    }
  })
}
