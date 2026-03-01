import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipDetails from 'src/components/radar/RadarBlipDetails.vue'

describe('RadarBlipDetails.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipDetails, {
      props: {
        modelValue: true,
        blip: { name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '' }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
