import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import MainDrawer from 'src/components/MainDrawer.vue'

describe('MainDrawer.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(MainDrawer, {
      props: {
        modelValue: true,
        isDarkMode: false
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
