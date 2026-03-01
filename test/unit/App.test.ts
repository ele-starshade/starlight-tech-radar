import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import App from 'src/App.vue'

describe('App.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(App)

    expect(wrapper.html()).toMatchSnapshot()
  })
})
