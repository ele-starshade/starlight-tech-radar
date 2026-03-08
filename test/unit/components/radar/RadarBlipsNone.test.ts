import { describe, it, expect } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipsNone from 'src/components/radar/RadarBlipsNone.vue'
import { defineComponent } from 'vue'

const QBtnStub = defineComponent({
  name: 'QBtn',
  template: '<button><slot /></button>'
})

const QBannerStub = defineComponent({
  name: 'QBanner',
  props: ['class'],
  template: '<div :class="$props.class"><slot /><slot name="avatar" /><slot name="action" /></div>'
})

describe('RadarBlipsNone.vue', () => {
  it('renders nothing when blips are present', () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [{ id: '1', name: 'Test' }]
      }
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders "no blips" banner when no filters are applied', () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [],
        ringFilterSelected: null,
        searchQuery: '',
        newOnly: false
      }
    })

    expect(wrapper.text()).toContain('radar.noBlips')
  })

  it('renders "no blips filters" banner when ring filter is applied', () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [],
        ringFilterSelected: 'Adopt',
        searchQuery: '',
        newOnly: false
      }
    })

    expect(wrapper.text()).toContain('radar.noBlipsFilters')
  })

  it('renders "no blips filters" banner when search query is applied', () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [],
        ringFilterSelected: null,
        searchQuery: 'test',
        newOnly: false
      }
    })

    expect(wrapper.text()).toContain('radar.noBlipsFilters')
  })

  it('renders "no blips filters" banner when newOnly is true', () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [],
        ringFilterSelected: null,
        searchQuery: '',
        newOnly: true
      }
    })

    expect(wrapper.text()).toContain('radar.noBlipsFilters')
  })

  it('emits clearFilters when clear filters button is clicked', async () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [],
        ringFilterSelected: 'Adopt',
        searchQuery: '',
        newOnly: false
      },
      global: {
        stubs: {
          'q-btn': QBtnStub,
          'q-banner': QBannerStub
        }
      }
    })

    const btn = wrapper.findComponent(QBtnStub)

    await btn.trigger('click')

    expect(wrapper.emitted('clearFilters')).toBeTruthy()
  })

  it('applies dark mode classes when $q.dark.isActive is true', () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [],
        ringFilterSelected: 'Adopt',
        searchQuery: '',
        newOnly: false
      },
      global: {
        stubs: {
          'q-banner': QBannerStub
        },
        mocks: {
          $q: { dark: { isActive: true } }
        }
      }
    })

    expect(wrapper.findComponent(QBannerStub).classes()).toContain('bg-blue-grey-9')
  })

  it('applies dark mode classes to no-filters banner when $q.dark.isActive is true', () => {
    const wrapper = mountComponent(RadarBlipsNone, {
      props: {
        blips: [],
        ringFilterSelected: null,
        searchQuery: '',
        newOnly: false
      },
      global: {
        stubs: {
          'q-banner': QBannerStub
        },
        mocks: {
          $q: { dark: { isActive: true } }
        }
      }
    })

    expect(wrapper.findComponent(QBannerStub).classes()).toContain('bg-grey-9')
  })
})
