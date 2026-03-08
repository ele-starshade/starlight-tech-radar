/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipCard from 'src/components/radar/RadarBlipCard.vue'
import { defineComponent } from 'vue'

const QBtnStub = defineComponent({
  name: 'QBtn',
  props: ['label'],
  template: '<button><slot />{{ label }}</button>'
})

vi.mock('src/config', () => ({
  appConfig: {
    isFeedbackEnabled: true
  }
}))

describe('RadarBlipCard.vue', () => {
  const blip = {
    name: 'Test Blip',
    quadrant: 'Tools',
    ring: 'Adopt',
    isNew: true,
    description: 'Test description',
    license: { spdx_id: 'MIT' },
    rating: 'Gold',
    guidanceLink: 'https://guidance.com',
    repoUrl: 'https://repo.com'
  }

  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipCard, {
      props: { blip, index: 0 }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders correctly when optional properties are missing', () => {
    const minimalBlip = {
      name: 'Minimal Blip',
      quadrant: 'Tools',
      ring: 'Adopt',
      isNew: false,
      description: 'Minimal'
    }
    const wrapper = mountComponent(RadarBlipCard, {
      props: { blip: minimalBlip, index: 0 },
      global: { stubs: { 'q-btn': QBtnStub } }
    })

    // Ensure the optional buttons/chips are not rendered
    expect(wrapper.text()).not.toContain('radar.blips.guidance')
    expect(wrapper.text()).not.toContain('radar.blips.repository')
  })

  it('renders stable chip when isNew is false', () => {
    const wrapper = mountComponent(RadarBlipCard, {
      props: { blip: { ...blip, isNew: false }, index: 0 }
    })

    expect(wrapper.text()).toContain('radar.blips.stable')
  })

  it('renders different background color based on index', () => {
    const wrapper1 = mountComponent(RadarBlipCard, {
      props: { blip, index: 0 }
    })
    const wrapper2 = mountComponent(RadarBlipCard, {
      props: { blip, index: 2 } // Math.floor(2/2) % 2 !== 0 is true (1%2=1)
    })

    expect(wrapper1.attributes('style')).not.toContain('background-color')
    expect(wrapper2.attributes('style')).toContain('background-color: rgba(255, 255, 255, 0.05)')
  })

  it('emits openFeedback when feedback button is clicked', async () => {
    const wrapper = mountComponent(RadarBlipCard, {
      props: { blip, index: 0 },
      global: {
        stubs: { 'q-btn': QBtnStub }
      }
    })

    const feedbackBtn = wrapper.findAllComponents(QBtnStub).find(b => b.text().includes('radar.feedback.give_feedback'))

    await feedbackBtn?.trigger('click')
    expect(wrapper.emitted('openFeedback')).toBeTruthy()
  })

  it('returns correct translation key for quadrants', () => {
    const wrapper = mountComponent(RadarBlipCard, {
      props: { blip, index: 0 }
    })
    const vm = wrapper.vm as any

    expect(vm.getQuadrantTranslationKey('Techniques')).toBe('radar.quadrants.techniques')
    expect(vm.getQuadrantTranslationKey('Platforms')).toBe('radar.quadrants.platforms')
    expect(vm.getQuadrantTranslationKey('Tools')).toBe('radar.quadrants.tools')
    expect(vm.getQuadrantTranslationKey('Languages & Frameworks')).toBe('radar.quadrants.languages')
    expect(vm.getQuadrantTranslationKey('Unknown')).toBe('Unknown')
  })

  it('returns correct rating color', () => {
    const wrapper = mountComponent(RadarBlipCard, {
      props: { blip, index: 0 }
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
