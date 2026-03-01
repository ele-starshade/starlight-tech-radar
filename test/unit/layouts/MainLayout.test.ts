import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import MainLayout from 'src/layouts/MainLayout.vue'

describe('MainLayout.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(MainLayout)

    expect(wrapper.html()).toMatchSnapshot()
  })
})
