import { describe, it, expect } from 'vitest'
import { RadarConfigurationSchema } from 'src/models/radar'

describe('Radar Models (Zod Validation)', () => {
  it('should validate a correct radar configuration', () => {
    const validData = {
      quadrants: ['Techniques', 'Platforms', 'Tools', 'Languages & Frameworks'],
      rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
      blips: [
        {
          name: 'Vitest',
          quadrant: 'Tools',
          ring: 'Trial',
          isNew: true,
          description: 'A Vite-native unit test framework.',
          repoUrl: 'https://github.com/vitest-dev/vitest',
          guidanceLink: 'https://vitest.dev'
        }
      ]
    }

    const result = RadarConfigurationSchema.safeParse(validData)

    expect(result.success).toBe(true)
  })

  it('should fail validation if quadrants list length is incorrect', () => {
    const invalidData = {
      quadrants: ['Too Few'],
      rings: ['Adopt'],
      blips: []
    }

    const result = RadarConfigurationSchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('should fail validation if blip data is missing required fields', () => {
    const invalidData = {
      quadrants: ['A', 'B', 'C', 'D'],
      rings: ['R1', 'R2', 'R3', 'R4'],
      blips: [
        {
          name: 'Missing fields'
        }
      ]
    }

    const result = RadarConfigurationSchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })
})
