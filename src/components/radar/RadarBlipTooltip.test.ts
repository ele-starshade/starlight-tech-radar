import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipTooltip from './RadarBlipTooltip.vue'

describe('RadarBlipTooltip.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipTooltip, {
      props: {
        blip: { name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '' },
        position: { x: 100, y: 100 },
        visible: true,
        index: 1
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
