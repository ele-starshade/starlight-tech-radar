import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'

describe('ErrorNotFound.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(ErrorNotFound)

    expect(wrapper.html()).toMatchSnapshot()
  })
})
