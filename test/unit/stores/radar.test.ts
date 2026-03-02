import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRadarStore } from 'src/stores/radar'
import { api } from 'src/boot/axios'

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn()
  }
}))

describe('Radar Store', () => {
  const getSpy = vi.spyOn(api, 'get')

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const store = useRadarStore()

    expect(store.radarData).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should not fetch if radarData exists and no params are provided', async () => {
    const store = useRadarStore()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.radarData = { blips: [] } as any
    store.error = null

    await store.fetchRadarData({})

    expect(getSpy).not.toHaveBeenCalled()
  })

  it('should fetch if radarData exists but params are provided', async () => {
    const store = useRadarStore()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.radarData = { blips: [] } as any
    store.error = null

    getSpy.mockResolvedValueOnce({ data: { blips: ['new'] } })

    await store.fetchRadarData({ mock: 'true' })

    expect(getSpy).toHaveBeenCalledWith('/api/radar', { params: { mock: 'true' } })
    expect(store.radarData?.blips).toEqual(['new'])
  })

  it('should fetch if radarData exists but there was an error previously', async () => {
    const store = useRadarStore()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.radarData = { blips: [] } as any
    store.error = 'previous error'

    getSpy.mockResolvedValueOnce({ data: { blips: ['retry'] } })

    await store.fetchRadarData({})

    expect(getSpy).toHaveBeenCalled()
    expect(store.radarData?.blips).toEqual(['retry'])
    expect(store.error).toBeNull()
  })
})
