/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipDetail from 'src/components/radar/RadarBlipDetail.vue'
import { defineComponent } from 'vue'

const QBtnStub = defineComponent({
  name: 'QBtn',
  props: ['label'],
  template: '<button>{{ label }}<slot /></button>'
})

describe('RadarBlipDetail.vue', () => {
  const props = {
    subtitle: 'Test Blip',
    ring: 'Adopt',
    quadrant: 'Tools',
    isNew: false,
    description: 'Test',
    licenseId: 'Apache2.0',
    licenseRating: 'Gold',
    repoUrl: 'https://repo.com',
    guidanceLink: 'https://guidance.com',
    isFeedbackEnabled: true
  }

  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipDetail, {
      props
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders correctly when optional properties are missing', () => {
    const minimalProps = {
      subtitle: 'Test Blip',
      ring: 'Adopt',
      quadrant: 'Tools',
      isNew: false,
      description: 'Test',
      isFeedbackEnabled: false
    }
    const wrapper = mountComponent(RadarBlipDetail, {
      props: minimalProps,
      global: { stubs: { 'q-btn': QBtnStub } }
    })

    expect(wrapper.text()).not.toContain('radar.blips.guidance')
    expect(wrapper.text()).not.toContain('radar.blips.repository')
  })

  it('renders stable chip when isNew is false', () => {
    const wrapper = mountComponent(RadarBlipDetail, {
      props
    })

    expect(wrapper.text()).toContain('radar.blips.stable')
  })

  it('renders new chip when isNew is true', () => {
    const wrapper = mountComponent(RadarBlipDetail, {
      props: { ...props, isNew: true }
    })

    expect(wrapper.text()).toContain('radar.blips.new')
  })

  it('renders without subtitle when not provided', () => {
    const wrapper = mountComponent(RadarBlipDetail, {
      props: { ...props, subtitle: undefined }
    })

    expect(wrapper.text()).not.toContain('Test Blip')
  })

  it('emits openFeedback when feedback button is clicked', async () => {
    const wrapper = mountComponent(RadarBlipDetail, {
      props,
      global: { stubs: { 'q-btn': QBtnStub } }
    })

    const feedbackBtn = wrapper.findAllComponents(QBtnStub).find(b => b.text().includes('radar.feedback.give_feedback'))

    await feedbackBtn?.trigger('click')
    expect(wrapper.emitted('openFeedback')).toBeTruthy()
  })

  it('returns correct rating color', () => {
    const wrapper = mountComponent(RadarBlipDetail, {
      props
    })
    const vm = wrapper.vm as any

    expect(vm.getRatingColor('Gold')).toBe('amber-9')
    expect(vm.getRatingColor('Silver')).toBe('grey-6')
    expect(vm.getRatingColor('Bronze')).toBe('deep-orange-9')
    expect(vm.getRatingColor('Approved')).toBe('positive')
    expect(vm.getRatingColor('Unknown')).toBe('grey-5')
    expect(vm.getRatingColor(undefined)).toBe('grey-5')
  })
})
