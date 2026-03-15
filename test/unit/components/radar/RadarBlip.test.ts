/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlip from 'src/components/radar/RadarBlip.vue'
import { colors } from 'quasar'

vi.mock('quasar', () => ({
  colors: {
    getPaletteColor: vi.fn((name) => {
      if (name === 'positive') return '#21BA45'
      if (name === 'secondary') return '#26A69A'
      if (name === 'accent') return '#9C27B0'
      if (name === 'info') return '#31CCEC'
      if (name === 'warning') return '#F2C037'

      return '#000000'
    }),
    lighten: vi.fn((hex) => hex),
    brightness: vi.fn((hex) => (hex === '#FFFFFF' ? 255 : 50))
  }
}))

describe('RadarBlip.vue', () => {
  const node = { isCluster: false, id: '1', name: 'Test Blip', ring: 'Adopt', quadrant: 'Tools', isNew: false, description: 'Test', repoUrl: '', guidanceLink: '', x: 100, y: 100, blips: [] }

  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlip, {
      props: {
        node,
        index: 1
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('uses positive color for new blips', () => {
    const wrapper = mountComponent(RadarBlip, {
      props: { node: { ...node, isNew: true }, index: 0 }
    })

    expect((wrapper.vm as any).baseColorHex).toBe('#21BA45')
  })

  it('uses dark text color for bright backgrounds', () => {
    vi.mocked(colors.brightness).mockReturnValue(200)
    const wrapper = mountComponent(RadarBlip, {
      props: { node, index: 0 }
    })

    expect((wrapper.vm as any).textColor).toBe('#0B1121')
  })

  it('renders a rect for clusters', () => {
    const clusterNode = { ...node, isCluster: true, blips: [{}, {}] }
    const wrapper = mountComponent(RadarBlip, {
      props: { node: clusterNode, index: 0 }
    })

    expect(wrapper.find('rect').exists()).toBe(true)
    expect(wrapper.text()).toContain('2 blips')
  })

  it('emits click when clicked', async () => {
    const wrapper = mountComponent(RadarBlip, {
      props: { node, index: 0 }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([node])
  })

  it('emits click on Enter keydown', async () => {
    const wrapper = mountComponent(RadarBlip, {
      props: { node, index: 0 }
    })

    await wrapper.trigger('keyup', { key: 'Enter' })
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emits click and prevents default on Space keydown', async () => {
    const wrapper = mountComponent(RadarBlip, {
      props: { node, index: 0 }
    })

    const event = { key: ' ', preventDefault: vi.fn() }

    await wrapper.trigger('keyup', event)

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('does not emit click on other keydown', async () => {
    const wrapper = mountComponent(RadarBlip, {
      props: { node, index: 0 }
    })

    await wrapper.trigger('keydown', { key: 'a' })
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('handles missing y coordinate gracefully', () => {
    const nodeWithoutY = { ...node, y: undefined }
    const wrapper = mountComponent(RadarBlip, {
      props: { node: nodeWithoutY, index: 0 }
    })

    // It should render without crashing and default to 0
    expect(wrapper.find('text').attributes('y')).toBe('4')
  })

  it('calculates colors for different quadrants', () => {
    const quadrants = ['Techniques', 'Platforms', 'Tools', 'Languages & Frameworks', 'Unknown']

    quadrants.forEach(q => {
      const wrapper = mountComponent(RadarBlip, {
        props: { node: { ...node, quadrant: q }, index: 0 }
      })

      expect((wrapper.vm as any).baseColorHex).toBeDefined()
    })
  })

  it('calculates darkenPercent for different rings', () => {
    const rings = ['Hold', 'Assess', 'Trial', 'Adopt']

    rings.forEach(r => {
      const wrapper = mountComponent(RadarBlip, {
        props: { node: { ...node, ring: r }, index: 0 }
      })

      expect((wrapper.vm as any).blipColor).toBeDefined()
    })
  })
})
