import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarCanvas from 'src/components/RadarCanvas.vue'
import RadarBlipDetails from 'src/components/radar/RadarBlipDetails.vue'
import type { Blip } from 'src/models/radar'
import type { DisplayNode } from 'src/utils/radar-visualization'

describe('RadarCanvas.vue', () => {
  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarCanvas, {
      props: {
        blips: []
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders blips without clustering when under threshold', () => {
    const blips: Blip[] = [
      {
        id: '1',
        name: 'Test 1',
        quadrant: 'Techniques',
        ring: 'Adopt',
        isNew: true,
        description: '',
        repoUrl: '',
        guidanceLink: '',
        rating: ''
      },
      {
        name: 'Test 2 No ID',
        quadrant: 'Techniques',
        ring: 'Adopt',
        isNew: false,
        description: '',
        repoUrl: '',
        guidanceLink: '',
        rating: ''
      }
    ]

    const wrapper = mountComponent(RadarCanvas, {
      props: { blips }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayNodes = (wrapper.vm as any).displayNodes

    expect(displayNodes.length).toBe(2)
    expect(displayNodes[0].isCluster).toBe(false)
    expect(displayNodes[1].isCluster).toBe(false)
    expect(displayNodes[1].id).toBe('Test 2 No ID')
  })

  it('renders a cluster when blips exceed threshold for ring', () => {
    const blips: Blip[] = Array.from({ length: 11 }, (_, i) => ({
      id: `adopt-${i}`,
      name: `Test ${i}`,
      quadrant: 'Techniques',
      ring: 'Adopt',
      isNew: i === 0,
      description: '',
      repoUrl: '',
      guidanceLink: '',
      rating: ''
    }))

    const wrapper = mountComponent(RadarCanvas, {
      props: { blips }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayNodes = (wrapper.vm as any).displayNodes

    expect(displayNodes.length).toBe(1)
    expect(displayNodes[0].isCluster).toBe(true)
    expect(displayNodes[0].isNew).toBe(true)
    expect(displayNodes[0].blips.length).toBe(11)
  })

  it('handles empty groups correctly in displayNodes', () => {
    const wrapper = mountComponent(RadarCanvas, {
      props: { blips: [] }
    })

    // Test the displayNodes when there are no blips
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayNodes = (wrapper.vm as any).displayNodes

    expect(displayNodes.length).toBe(0)
  })

  it('sets isMounted to true after mount', () => {
    const wrapper = mountComponent(RadarCanvas, {
      props: { blips: [] }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).isMounted).toBe(true)
  })

  it('handles onNodeClick correctly', () => {
    const wrapper = mountComponent(RadarCanvas, {
      props: { blips: [] }
    })

    const mockNode = {
      id: 'test-node',
      name: 'Test Node',
      isCluster: false,
      quadrant: 'Techniques',
      ring: 'Adopt',
      blips: [],
      x: 0,
      y: 0,
      isNew: false
    } as DisplayNode

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(wrapper.vm as any).onNodeClick(mockNode)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).detailsDialog.show).toBe(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).detailsDialog.node).toEqual(mockNode)
  })

  it('updates detailsDialog.show when RadarBlipDetails emits update:modelValue', () => {
    const wrapper = mountComponent(RadarCanvas, {
      props: { blips: [] }
    })

    // First set it to true so we can test setting it to false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(wrapper.vm as any).detailsDialog.show = true

    const dialog = wrapper.findComponent(RadarBlipDetails)

    dialog.vm.$emit('update:modelValue', false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).detailsDialog.show).toBe(false)
  })
})
