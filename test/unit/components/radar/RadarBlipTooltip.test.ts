import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipTooltip from 'src/components/radar/RadarBlipTooltip.vue'

describe('RadarBlipTooltip.vue', () => {
  const node = { isCluster: false, id: '1', name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '', x: 100, y: 100, blips: [{ name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '' }] }

  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipTooltip, {
      props: {
        node,
        position: { x: 100, y: 100 },
        visible: true,
        index: 1
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders cluster information', () => {
    const clusterNode = { ...node, isCluster: true, blips: [{}, {}] }
    const wrapper = mountComponent(RadarBlipTooltip, {
      props: {
        node: clusterNode,
        position: { x: 100, y: 100 },
        visible: true,
        index: 1
      }
    })

    expect(wrapper.text()).toContain('2 blips grouped')
  })

  it('renders new blip badge', () => {
    const newNode = { ...node, isNew: true }
    const wrapper = mountComponent(RadarBlipTooltip, {
      props: {
        node: newNode,
        position: { x: 100, y: 100 },
        visible: true,
        index: 1
      }
    })

    expect(wrapper.text()).toContain('radar.blips.new')
  })
})
