import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarCanvas from 'src/components/RadarCanvas.vue'

describe('RadarCanvas.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarCanvas, {
      props: {
        blips: []
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
