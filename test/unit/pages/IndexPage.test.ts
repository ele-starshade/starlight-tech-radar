/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import IndexPage from 'src/pages/IndexPage.vue'
import { createTestingPinia } from '@pinia/testing'
import { useRadarStore } from 'src/stores/radar'
import { nextTick } from 'vue'
import { setActivePinia } from 'pinia'
import type { Quadrant } from 'src/models/radar'

describe('IndexPage.vue', () => {
  let pinia: ReturnType<typeof createTestingPinia>

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true
    })
    setActivePinia(pinia)
  })

  it('matches snapshot', () => {
    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        stubs: {
          RadarCanvas: true,
          RadarBlipFeedbackDialog: true
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders loading state', () => {
    const piniaLoading = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
      initialState: {
        radar: { loading: true }
      }
    })

    setActivePinia(piniaLoading)

    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [piniaLoading] }
    })

    expect(wrapper.find('q-spinner-dots').exists()).toBe(true)
  })

  it('renders error state', () => {
    const piniaError = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
      initialState: {
        radar: { error: 'Failed to fetch', loading: false }
      }
    })

    setActivePinia(piniaError)

    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [piniaError] }
    })

    expect(wrapper.text()).toContain('Error: Failed to fetch')
  })

  it('renders radar view by default when not mobile', () => {
    const store = useRadarStore(pinia)

    store.radarData = { blips: [], quadrants: [], rings: [] } as any

    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        stubs: { RadarCanvas: true }
      }
    })

    expect(wrapper.find('radar-canvas-stub').exists()).toBe(true)
  })

  it('renders list view when viewMode is list', async () => {
    const store = useRadarStore(pinia)

    store.radarData = { blips: [], quadrants: [], rings: [] } as any

    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [pinia] }
    })

    const vm = wrapper.vm as any

    vm.viewMode = 'list'
    await nextTick()

    expect(wrapper.find('q-tabs').exists() || wrapper.findComponent({ name: 'QTabs' }).exists()).toBe(true)
  })

  it('filters blips correctly', async () => {
    const store = useRadarStore(pinia)

    store.radarData = {
      blips: [
        { name: 'Vue', quadrant: 'Techniques', ring: 'Adopt', isNew: true },
        { name: 'React', quadrant: 'Techniques', ring: 'Trial', isNew: false }
      ],
      quadrants: ['Techniques'],
      rings: ['Adopt', 'Trial']
    } as any

    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'q-tab-panels': { template: '<div><slot /></div>' },
          'q-tab-panel': { template: '<div><slot /></div>' }
        }
      }
    })

    const vm = wrapper.vm as any

    vm.viewMode = 'list'
    await nextTick()

    // Test Search
    vm.searchQuery = 'Vue'
    expect(vm.techniqueBlips.length).toBe(1)
    expect(vm.techniqueBlips[0].name).toBe('Vue')

    // Test Ring Filter
    vm.searchQuery = ''
    vm.ringFilterSelected = 'Trial'
    expect(vm.techniqueBlips.length).toBe(1)
    expect(vm.techniqueBlips[0].name).toBe('React')

    // Test New Only
    vm.ringFilterSelected = null
    vm.newOnly = true
    expect(vm.techniqueBlips.length).toBe(1)
    expect(vm.techniqueBlips[0].name).toBe('Vue')

    // Test Clear Filters
    vm.clearFilters()
    expect(vm.searchQuery).toBe('')
    expect(vm.ringFilterSelected).toBe(null)
    expect(vm.newOnly).toBe(false)
    expect(vm.techniqueBlips.length).toBe(2)
  })

  it('opens feedback dialog', async () => {
    const store = useRadarStore(pinia)
    const blip = { name: 'Vue' }

    store.radarData = { blips: [blip], quadrants: [], rings: [] } as any

    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        stubs: {
          RadarBlipFeedbackDialog: true,
          'q-tab-panels': { template: '<div><slot /></div>' },
          'q-tab-panel': { template: '<div><slot /></div>' }
        }
      }
    })

    const vm = wrapper.vm as any

    vm.viewMode = 'list'
    await nextTick()

    vm.openFeedback(blip)

    expect(vm.showFeedbackDialog).toBe(true)
    expect(vm.feedbackBlip).toEqual(blip)
  })

  it('renders blip cards in all tabs', async () => {
    const store = useRadarStore(pinia)

    store.radarData = {
      blips: [
        { name: 'Vue', quadrant: 'Languages & Frameworks', ring: 'Adopt', isNew: true },
        { name: 'Docker', quadrant: 'Platforms', ring: 'Adopt', isNew: true },
        { name: 'Git', quadrant: 'Tools', ring: 'Adopt', isNew: true },
        { name: 'TDD', quadrant: 'Techniques', ring: 'Adopt', isNew: true }
      ],
      quadrants: ['Languages & Frameworks', 'Platforms', 'Tools', 'Techniques'],
      rings: ['Adopt', 'Trial']
    } as any

    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'q-tab-panels': { template: '<div><slot /></div>' },
          'q-tab-panel': { template: '<div><slot /></div>' },
          RadarBlipCard: true,
          RadarBlipsNone: true
        }
      }
    })

    const vm = wrapper.vm as any

    vm.viewMode = 'list'
    await nextTick()

    const tabs: Quadrant[] = ['Techniques', 'Languages & Frameworks', 'Platforms', 'Tools']

    for (const t of tabs) {
      vm.tab = t
      await nextTick()
      const cards = wrapper.findAll('radar-blip-card-stub')

      expect(cards.length).toBeGreaterThan(0)
    }
  })

  it('clears search query and ring filter via UI', async () => {
    const store = useRadarStore(pinia)

    store.radarData = { blips: [], quadrants: [], rings: [] } as any

    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'q-icon': { template: '<i @click="$emit(\'click\', $event)"><slot /></i>' },
          'q-input': { template: '<div><slot name="append" /></div>' },
          'q-select': { template: '<div><slot name="append" /></div>' }
        }
      }
    })

    const vm = wrapper.vm as any

    vm.viewMode = 'list'
    vm.searchQuery = 'test'
    vm.ringFilterSelected = 'Adopt'
    await nextTick()

    // Find the cancel icons and click them
    const icons = wrapper.findAll('i')

    expect(icons.length).toBeGreaterThan(0)

    // Trigger click on the first icon (search clear)
    await icons[0]!.trigger('click')
    expect(vm.searchQuery).toBe('')

    // Trigger click on the second icon (ring filter clear)
    if (icons[1]) {
      await icons[1].trigger('click')
      expect(vm.ringFilterSelected).toBe(null)
    }
  })

  it('switches to list view on mobile', () => {
    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        mocks: {
          $q: { screen: { lt: { md: true } } }
        }
      }
    })

    expect((wrapper.vm as any).viewMode).toBe('list')
  })

  it('translates quadrants correctly', () => {
    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [pinia] }
    })
    const vm = wrapper.vm as any

    expect(vm.getQuadrantTranslationKey('Techniques')).toBe('radar.quadrants.techniques')
    expect(vm.getQuadrantTranslationKey('Unknown')).toBe('Unknown')
  })

  it('gets rating colors correctly', () => {
    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [pinia] }
    })
    const vm = wrapper.vm as any

    expect(vm.getRatingColor('Gold')).toBe('amber-9')
    expect(vm.getRatingColor('Silver')).toBe('grey-6')
    expect(vm.getRatingColor('Bronze')).toBe('deep-orange-9')
    expect(vm.getRatingColor('Approved')).toBe('positive')
    expect(vm.getRatingColor('Unknown')).toBe('grey-5')
  })

  it('watches screen size to switch view mode', () => {
    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [pinia] }
    })
    const vm = wrapper.vm as any

    vm.$options.watch['$q.screen.lt.md'].handler.call(vm, true)
    expect(vm.viewMode).toBe('list')

    vm.$options.watch['$q.screen.lt.md'].handler.call(vm, false)
    expect(vm.viewMode).toBe('radar')
  })

  it('computes blips for all quadrants', () => {
    const piniaData = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
      initialState: {
        radar: {
          radarData: {
            blips: [
              { name: 'Vue', quadrant: 'Languages & Frameworks' },
              { name: 'Docker', quadrant: 'Platforms' },
              { name: 'Git', quadrant: 'Tools' },
              { name: 'TDD', quadrant: 'Techniques' }
            ]
          }
        }
      }
    })

    setActivePinia(piniaData)

    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [piniaData] }
    })

    const vm = wrapper.vm as any

    expect(vm.languageBlips.length).toBe(1)
    expect(vm.platformBlips.length).toBe(1)
    expect(vm.toolBlips.length).toBe(1)
    expect(vm.techniqueBlips.length).toBe(1)
  })

  it('handles component v-model updates', async () => {
    const store = useRadarStore(pinia)

    store.radarData = { blips: [], quadrants: [], rings: [] } as any

    const wrapper = mountComponent(IndexPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'q-btn-toggle': true,
          'q-input': true,
          'q-select': true,
          'q-toggle': true,
          'q-tabs': true,
          'q-tab-panels': true,
          RadarBlipFeedbackDialog: true
        }
      }
    })

    const vm = wrapper.vm as any

    // View mode toggle
    const btnToggle = wrapper.findComponent({ name: 'QBtnToggle' })

    if (btnToggle.exists()) {
      await btnToggle.vm.$emit('update:model-value', 'list')
      expect(vm.viewMode).toBe('list')
    }

    await nextTick()

    // Test list view specific inputs
    const input = wrapper.findComponent({ name: 'QInput' })

    if (input.exists()) {
      await input.vm.$emit('update:model-value', 'query')
      expect(vm.searchQuery).toBe('query')
    }

    const select = wrapper.findComponent({ name: 'QSelect' })

    if (select.exists()) {
      await select.vm.$emit('update:model-value', 'Adopt')
      expect(vm.ringFilterSelected).toBe('Adopt')
    }

    const toggle = wrapper.findComponent({ name: 'QToggle' })

    if (toggle.exists()) {
      await toggle.vm.$emit('update:model-value', true)
      expect(vm.newOnly).toBe(true)
    }

    const tabs = wrapper.findComponent({ name: 'QTabs' })

    if (tabs.exists()) {
      await tabs.vm.$emit('update:model-value', 'Tools')
      expect(vm.tab).toBe('Tools')
    }

    const tabPanels = wrapper.findComponent({ name: 'QTabPanels' })

    if (tabPanels.exists()) {
      await tabPanels.vm.$emit('update:model-value', 'Platforms')
      expect(vm.tab).toBe('Platforms')
    }

    const feedbackDialog = wrapper.findComponent({ name: 'RadarBlipFeedbackDialog' })

    if (feedbackDialog.exists()) {
      await feedbackDialog.vm.$emit('update:modelValue', false)
      expect(vm.showFeedbackDialog).toBe(false)
    }
  })

  it('calls fetchRadarData in serverPrefetch', async () => {
    const store = useRadarStore(pinia)

    store.fetchRadarData = vi.fn().mockResolvedValue(true)

    const wrapper = mountComponent(IndexPage, {
      global: { plugins: [pinia] }
    })

    const vm = wrapper.vm as any

    if (typeof vm.$options.serverPrefetch === 'function') {
      await vm.$options.serverPrefetch.call(vm)
    } else if (Array.isArray(vm.$options.serverPrefetch)) {
      await vm.$options.serverPrefetch[0].call(vm)
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(store.fetchRadarData)).toHaveBeenCalled()
  })
})
