import { describe, it, expect } from 'vitest'
import { getRadarData } from './radarService'

describe('radarService', () => {
  it('has getRadarData function', () => {
    expect(typeof getRadarData).toBe('function')
  })
})
