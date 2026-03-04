import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipDetail from 'src/components/radar/RadarBlipDetail.vue'

describe('RadarBlipDetails.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipDetail, {
      props: {
        modelValue: true,
        isCluster: false,
        name: 'Test Blip',
        ring: 'Adopt',
        quadrant: 'Tools',
        isNew: false,
        description: 'Test',
        repoUrl: '',
        guidanceLink: ''
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
