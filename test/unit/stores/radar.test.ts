import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRadarStore } from 'src/stores/radar'

describe('Radar Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useRadarStore()

    expect(store.radarData).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })
})
