import { describe, it, expect, vi } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import IndexPage from './IndexPage.vue'
import { createTestingPinia } from '@pinia/testing'

describe('IndexPage.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          RadarCanvas: true
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
