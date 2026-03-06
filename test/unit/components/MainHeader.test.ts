import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import MainHeader from 'src/components/MainHeader.vue'
import { defineComponent } from 'vue'

const QBtnStub = defineComponent({
  name: 'QBtn',
  template: '<button><slot /></button>'
})

describe('MainHeader.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(MainHeader, {
      props: {
        isDarkMode: false
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('matches snapshot in dark mode', () => {
    const wrapper = mountComponent(MainHeader, {
      props: {
        isDarkMode: true
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('emits toggle-drawer when menu button is clicked', () => {
    const wrapper = mountComponent(MainHeader, {
      props: {
        isDarkMode: false
      },
      global: {
        stubs: {
          'q-btn': QBtnStub
        }
      }
    })

    wrapper.findComponent(QBtnStub).vm.$emit('click')

    expect(wrapper.emitted('toggle-drawer')).toBeTruthy()
  })
})
