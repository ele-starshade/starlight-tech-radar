import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRadarStore } from 'src/stores/radar'
import { api } from 'src/boot/axios'

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn()
  }
}))

vi.mock('src/services/radarService', () => ({
  getRadarData: vi.fn()
}))

describe('Radar Store', () => {
  const getSpy = vi.spyOn(api, 'get')

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.stubEnv('SERVER', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
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

  it('should fetch using radarService when on SERVER', async () => {
    vi.stubEnv('SERVER', 'true')
    const { getRadarData } = await import('src/services/radarService')
    const mockData = { blips: ['server'] }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getRadarData).mockResolvedValueOnce(mockData as any)

    const store = useRadarStore()

    await store.fetchRadarData({ mock: 'true' })

    expect(getRadarData).toHaveBeenCalledWith({ mock: true, data: undefined })
    expect(store.radarData).toEqual(mockData)
  })

  it('should handle fetch errors', async () => {
    const errorMsg = 'Network Error'

    getSpy.mockRejectedValueOnce(new Error(errorMsg))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const store = useRadarStore()

    await store.fetchRadarData({ mock: 'true' })

    expect(store.error).toBe(errorMsg)
    expect(store.loading).toBe(false)
  })

  it('should not fetch if already loading', async () => {
    const store = useRadarStore()

    store.loading = true

    await store.fetchRadarData({ mock: 'true' })

    expect(getSpy).not.toHaveBeenCalled()
  })

  it('should handle fetch errors with default message', async () => {
    // Throw an error that does not have a message property
    getSpy.mockRejectedValueOnce({})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const store = useRadarStore()

    await store.fetchRadarData({ mock: 'true' })

    expect(store.error).toBe('Failed to fetch radar data')
    expect(store.loading).toBe(false)
  })
})
