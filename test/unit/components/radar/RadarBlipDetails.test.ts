/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipDetails from 'src/components/radar/RadarBlipDetails.vue'
import RadarBlipDetail from 'src/components/radar/RadarBlipDetail.vue'

describe('RadarBlipDetails.vue', () => {
  const blip = { name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '' }
  const node = { isCluster: false, id: '1', name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '', x: 100, y: 100, blips: [blip] }

  const defaultProvide = {
    appConfig: {
      isFeedbackEnabled: true
    }
  }

  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipDetails, {
      props: {
        modelValue: true,
        node
      },
      global: { provide: defaultProvide }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders cluster title correctly', () => {
    const clusterNode = { ...node, isCluster: true, blips: [blip, { ...blip, name: 'Blip 2' }] }
    const wrapper = mountComponent(RadarBlipDetails, {
      props: {
        modelValue: true,
        node: clusterNode
      },
      global: { provide: defaultProvide }
    })

    expect(wrapper.text()).toContain('2 items in radar.quadrants.tools - radar.rings.adopt')
  })

  it('emits update:modelValue when show is set', () => {
    const wrapper = mountComponent(RadarBlipDetails, {
      props: {
        modelValue: true,
        node
      },
      global: { provide: defaultProvide }
    })

    const vm = wrapper.vm as any

    vm.show = false
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('opens feedback dialog when RadarBlipDetail emits open-feedback', () => {
    const wrapper = mountComponent(RadarBlipDetails, {
      props: {
        modelValue: true,
        node
      },
      global: { provide: defaultProvide }
    })

    const detail = wrapper.findComponent(RadarBlipDetail)

    detail.vm.$emit('open-feedback', blip)

    const vm = wrapper.vm as any

    expect(vm.showFeedbackDialog).toBe(true)
    expect(vm.feedbackBlip).toEqual(blip)
  })

  it('does not open feedback if blip is undefined', () => {
    const wrapper = mountComponent(RadarBlipDetails, {
      props: {
        modelValue: true,
        node
      },
      global: { provide: defaultProvide }
    })

    const vm = wrapper.vm as any

    vm.openFeedback(undefined)
    expect(vm.showFeedbackDialog).toBe(false)
  })

  it('handles dialog v-model updates', async () => {
    const wrapper = mountComponent(RadarBlipDetails, {
      props: { modelValue: true, node },
      global: { stubs: { 'q-dialog': true, RadarBlipFeedbackDialog: true }, provide: defaultProvide }
    })

    const dialog = wrapper.findComponent({ name: 'QDialog' })

    await dialog.vm.$emit('update:model-value', false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])

    const vm = wrapper.vm as any

    vm.showFeedbackDialog = true
    const feedbackDialog = wrapper.findComponent({ name: 'RadarBlipFeedbackDialog' })

    await feedbackDialog.vm.$emit('update:modelValue', false)
    expect(vm.showFeedbackDialog).toBe(false)
  })
})
