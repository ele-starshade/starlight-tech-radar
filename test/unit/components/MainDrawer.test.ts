import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import MainDrawer from 'src/components/MainDrawer.vue'
import { defineComponent } from 'vue'

const QDrawerStub = defineComponent({
  name: 'QDrawer',
  template: '<div><slot /></div>'
})

const QBtnStub = defineComponent({
  name: 'QBtn',
  template: '<button><slot /></button>'
})

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

  it('matches snapshot in dark mode', () => {
    const wrapper = mountComponent(MainDrawer, {
      props: {
        modelValue: true,
        isDarkMode: true
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('emits update:modelValue when q-drawer emits update:model-value', () => {
    const wrapper = mountComponent(MainDrawer, {
      props: {
        modelValue: true,
        isDarkMode: false
      },
      global: {
        stubs: {
          'q-drawer': QDrawerStub
        }
      }
    })

    wrapper.findComponent(QDrawerStub).vm.$emit('update:model-value', false)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('emits toggle-drawer when close button is clicked', () => {
    const wrapper = mountComponent(MainDrawer, {
      props: {
        modelValue: true,
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
