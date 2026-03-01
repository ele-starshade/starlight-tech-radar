import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlip from 'src/components/radar/RadarBlip.vue'

describe('RadarBlip.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlip, {
      props: {
        blip: { name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '' },
        position: { x: 100, y: 100 },
        isActive: false,
        index: 1
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
