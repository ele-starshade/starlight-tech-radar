import { describe, it, expect, vi } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import SettingsPage from 'src/pages/SettingsPage.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SettingsPage.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(SettingsPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
