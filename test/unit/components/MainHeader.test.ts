import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import MainHeader from 'src/components/MainHeader.vue'

describe('MainHeader.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(MainHeader, {
      props: {
        isDarkMode: false
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
