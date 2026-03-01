import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipFeedbackDialog from './RadarBlipFeedbackDialog.vue'

describe('RadarBlipFeedbackDialog.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: {
        modelValue: true,
        blipName: 'Test Blip'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
