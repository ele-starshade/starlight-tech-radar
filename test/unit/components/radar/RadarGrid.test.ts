import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarGrid from 'src/components/radar/RadarGrid.vue'

describe('RadarGrid.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarGrid, {
      props: {
        quadrants: ['Q1', 'Q2', 'Q3', 'Q4'],
        rings: ['R1', 'R2']
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders quadrant labels', () => {
    const wrapper = mountComponent(RadarGrid, {
      props: {
        quadrants: ['Techniques', 'Tools', 'Platforms', 'Languages & Frameworks'],
        rings: ['Adopt', 'Trial', 'Assess', 'Hold']
      }
    })

    const labels = wrapper.findAll('.quadrant-label')

    expect(labels.length).toBe(4)
    expect(labels[0]!.text()).toBe('radar.quadrants.techniques')
  })
})
