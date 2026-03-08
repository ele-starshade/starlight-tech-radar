/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import MainLayout from 'src/layouts/MainLayout.vue'
import MainHeader from 'src/components/MainHeader.vue'

describe('MainLayout.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(MainLayout)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('toggles left drawer when toggle-drawer is emitted from header', () => {
    const wrapper = mountComponent(MainLayout)
    const header = wrapper.findComponent(MainHeader)

    expect((wrapper.vm as any).leftDrawerOpen).toBe(false)

    header.vm.$emit('toggle-drawer')
    expect((wrapper.vm as any).leftDrawerOpen).toBe(true)

    header.vm.$emit('toggle-drawer')
    expect((wrapper.vm as any).leftDrawerOpen).toBe(false)
  })
})
