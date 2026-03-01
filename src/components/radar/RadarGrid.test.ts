import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarGrid from './RadarGrid.vue'

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
})
