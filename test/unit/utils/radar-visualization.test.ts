import { describe, it, expect } from 'vitest'
import type {
  Point
} from 'src/utils/radar-visualization'
import {
  polarToCartesian,
  getInitialBlipPosition,
  resolveBlipCollisions
} from 'src/utils/radar-visualization'
import { type Blip } from 'src/models/radar'

describe('Radar Visualization Utility', () => {
  it('should correctly translate polar to cartesian coordinates', () => {
    // Center: (500, 500)
    // Radius 100, Angle 0 (Right)
    const p1 = polarToCartesian(100, 0)

    expect(p1.x).toBeCloseTo(600)
    expect(p1.y).toBeCloseTo(500)

    // Radius 100, Angle 90 (Top)
    const p2 = polarToCartesian(100, 90)

    expect(p2.x).toBeCloseTo(500)
    expect(p2.y).toBeCloseTo(400) // SVG Y is down

    // Radius 100, Angle 180 (Left)
    const p3 = polarToCartesian(100, 180)

    expect(p3.x).toBeCloseTo(400)
    expect(p3.y).toBeCloseTo(500)

    // Radius 100, Angle 270 (Bottom)
    const p4 = polarToCartesian(100, 270)

    expect(p4.x).toBeCloseTo(500)
    expect(p4.y).toBeCloseTo(600)
  })

  it('should deterministically generate initial blip positions', () => {
    const blip: Blip = {
      name: 'Vue.js',
      quadrant: 'Languages & Frameworks',
      ring: 'Adopt',
      isNew: false,
      description: 'Test',
      repoUrl: 'https://test.com',
      guidanceLink: 'https://test.com',
      rating: ''
    }

    const pos1 = getInitialBlipPosition(blip)
    const pos2 = getInitialBlipPosition(blip)

    expect(pos1.x).toEqual(pos2.x)
    expect(pos1.y).toEqual(pos2.y)
  })

  it('should resolve collisions between blips', () => {
    const blips: Blip[] = [
      {
        name: 'Blip A',
        quadrant: 'Tools',
        ring: 'Adopt',
        isNew: false,
        description: 'A',
        repoUrl: 'https://a.com',
        guidanceLink: 'https://a.com',
        rating: ''
      },
      {
        name: 'Blip B',
        quadrant: 'Tools',
        ring: 'Adopt',
        isNew: false,
        description: 'B',
        repoUrl: 'https://b.com',
        guidanceLink: 'https://b.com',
        rating: ''
      }
    ]

    // Place them at the exact same position
    const initialPositions: Record<string, Point> = {
      'Blip A': { x: 550, y: 550 },
      'Blip B': { x: 550.1, y: 550.1 } // Small offset to give direction to collision resolution
    }

    const finalPositions = resolveBlipCollisions(blips, initialPositions)
    const posA = finalPositions['Blip A']!
    const posB = finalPositions['Blip B']!
    const dist = Math.sqrt(
      Math.pow(posB.x - posA.x, 2) +
      Math.pow(posB.y - posA.y, 2)
    )

    // BLIP_RADIUS is 18, MIN_DISTANCE is BLIP_RADIUS * 2.5 = 45
    expect(dist).toBeGreaterThanOrEqual(40) // Allow some margin
  })

  it('should place blips within the correct coordinate ranges', () => {
    const blip: Blip = {
      name: 'Test',
      quadrant: 'Languages & Frameworks', // 0-90 degrees (Top Right)
      ring: 'Adopt', // 0-160 radius
      isNew: false,
      description: 'Test',
      repoUrl: 'https://test.com',
      guidanceLink: 'https://test.com',
      rating: ''
    }

    const pos = getInitialBlipPosition(blip)

    // Center is (500, 500)
    // Top Right quadrant means x >= 500 and y <= 500
    expect(pos.x).toBeGreaterThanOrEqual(500)
    expect(pos.y).toBeLessThanOrEqual(500)

    const distFromCenter = Math.sqrt(Math.pow(pos.x - 500, 2) + Math.pow(pos.y - 500, 2))

    expect(distFromCenter).toBeLessThanOrEqual(160)
  })
})
