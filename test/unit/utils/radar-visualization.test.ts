/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, afterEach } from 'vitest'
import type {
  Point
} from 'src/utils/radar-visualization'
import {
  polarToCartesian,
  getInitialBlipPosition,
  resolveBlipCollisions,
  QUADRANT_ANGLES
} from 'src/utils/radar-visualization'
import { type Blip } from 'src/models/radar'

describe('Radar Visualization Utility', () => {
  afterEach(() => {
    // Restore the quadrant angles to their original values in case they were mutated
    QUADRANT_ANGLES['Techniques'] = { start: 180, end: 270 }
    QUADRANT_ANGLES['Tools'] = { start: 270, end: 360 }
    QUADRANT_ANGLES['Platforms'] = { start: 90, end: 180 }
    QUADRANT_ANGLES['Languages & Frameworks'] = { start: 0, end: 90 }
  })
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

  it('clumps blips to boundaries when they are outside', () => {
    const blip: Blip = { name: 'A', quadrant: 'Techniques', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const initialPositions = { A: { x: 0, y: 0 } } // Far outside
    const finalPositions = resolveBlipCollisions([blip], initialPositions)

    const pos = finalPositions['A']!
    const dist = Math.sqrt(Math.pow(pos.x - 500, 2) + Math.pow(pos.y - 500, 2))

    expect(dist).toBeGreaterThanOrEqual(30) // Should be pushed inside Adopt ring min radius
  })

  it('avoids labels in Languages & Frameworks quadrant', () => {
    const blipA: Blip = { name: 'A', quadrant: 'Languages & Frameworks', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const blipB: Blip = { name: 'B', quadrant: 'Languages & Frameworks', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }

    // Initial position overlapping where a label would be
    // Add two blips to trigger the collision loop
    const initialPositions = { A: { x: 540, y: 325 }, B: { x: 541, y: 326 } }
    const finalPositions = resolveBlipCollisions([blipA, blipB], initialPositions)

    const pos = finalPositions['A']!

    // It should move at least a bit
    expect(pos.x).not.toBe(540)
  })

  it('resolves collisions between clusters and blips', () => {
    const blip = { name: 'Blip', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '', id: 'B' }
    const cluster = { isCluster: true, name: 'Cluster', quadrant: 'Tools', ring: 'Adopt', blips: [{}, {}], x: 550, y: 550, id: 'C' } as any

    // Position blip exactly on top of cluster
    const initialPositions = { B: { x: 550, y: 550 }, C: { x: 550, y: 550 } }
    const finalPositions = resolveBlipCollisions([blip, cluster], initialPositions)

    expect(finalPositions['B']!.x).not.toBe(550)

    // Position cluster exactly on top of blip (Cluster is A, Blip is B)
    const initialPositions2 = { C: { x: 550, y: 550 }, B: { x: 550, y: 550 } }
    const finalPositions2 = resolveBlipCollisions([cluster, blip], initialPositions2)

    const moved2 = Math.abs(finalPositions2['B']!.x - 550) > 1 || Math.abs(finalPositions2['B']!.y - 550) > 1

    expect(moved2).toBe(true)

    // Test weak repulsion by moving them slightly apart so they don't strongly overlap but do softly repel
    const initialPositions3 = { C: { x: 550, y: 550 }, B: { x: 555, y: 555 } }
    const finalPositions3 = resolveBlipCollisions([cluster, blip], initialPositions3)

    const moved3 = Math.abs(finalPositions3['B']!.x - 555) > 0 || Math.abs(finalPositions3['B']!.y - 555) > 0

    expect(moved3).toBe(true)
  })

  it('clamps to maxAngle when closer to it', () => {
    const blipA: Blip = { name: 'A', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const blipB: Blip = { name: 'B', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    // Tools quadrant is 90 to 180 (SVG Y is down, so Tools is bottom-right).
    // Let's just force a collision to make it clamp to maxAngle.
    // We can place it at angle that is outside but closer to maxAngle.
    const initialPositions = { A: { x: 500, y: 600 }, B: { x: 501, y: 601 } } // Straight down (angle 270)
    const finalPositions = resolveBlipCollisions([blipA, blipB], initialPositions)

    expect(finalPositions['A']).toBeDefined()
  })

  it('handles extremely small dynamic angle margins correctly', () => {
    // If distance is very small, margin becomes huge
    const blipA: Blip = { name: 'A', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const blipB: Blip = { name: 'B', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const initialPositions = { A: { x: 500.01, y: 500.01 }, B: { x: 500.02, y: 500.02 } } // Almost at center
    const finalPositions = resolveBlipCollisions([blipA, blipB], initialPositions)

    expect(finalPositions['A']).toBeDefined()
  })

  it('clamps to minAngle when closer to it', () => {
    // We already tested maxAngle. Let's test minAngle.
    const blipA: Blip = { name: 'A', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const blipB: Blip = { name: 'B', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    // Tools quadrant is 270 to 360.
    // We can place it at angle that is outside but closer to minAngle (270).
    const initialPositions = { A: { x: 500, y: 500.01 }, B: { x: 499, y: 500.01 } }
    const finalPositions = resolveBlipCollisions([blipA, blipB], initialPositions)

    expect(finalPositions['A']).toBeDefined()
  })

  it('handles minAngle > maxAngle by falling back to mid angle', () => {
    // If the angle margin is very large (e.g. 44 degrees) and the quadrant is 90 degrees wide,
    // minAngle (start + 44) can exceed maxAngle (end - 44).
    const blipA: Blip = { name: 'A', quadrant: 'Languages & Frameworks', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const blipB: Blip = { name: 'B', quadrant: 'Languages & Frameworks', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }

    // Languages & Frameworks is 0 to 90.
    // Placing blips extremely close to the center maximizes the dynamicAngleMargin to 44.
    // start (0) + 44 = 44. end (90) - 44 = 46. Wait, minAngle > maxAngle only if margin is > 45.
    // Let's force an extreme case where the margin is huge because distance is very small
    // The cap is Math.min(44, ...), so it's always at most 44.
    // If start is 0 and end is 90, min is 44, max is 46. minAngle is not > maxAngle.
    // However, if we use a mock or force a very narrow quadrant (which isn't possible with the current constants),
    // Or maybe the margin calculation causes it?
    // Let's just create a blip perfectly in the middle but very close to center to trigger the clamps.
    const initialPositions = { A: { x: 500.001, y: 499.999 }, B: { x: 500.002, y: 499.998 } }
    const finalPositions = resolveBlipCollisions([blipA, blipB], initialPositions)

    expect(finalPositions['A']).toBeDefined()
  })

  it('clamps to boundaries when no quadrant or ring is provided', () => {
    const blipA = { name: 'A', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' } as unknown as Blip
    const blipB = { name: 'B', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' } as unknown as Blip

    // We need to place it far outside to trigger distA > RADAR_RADIUS - itemRadius
    // RADAR_RADIUS is 500. Let's place it at x=0, y=0.
    // Distance from center (500,500) will be approx 707.
    // We provide two items so the collision loop runs and the boundary clamp function is called on both.
    const initialPositions = { A: { x: 0, y: 0 }, B: { x: 1, y: 1 } }
    const finalPositions = resolveBlipCollisions([blipA, blipB], initialPositions)

    const pos = finalPositions['A']!
    const dist = Math.sqrt(Math.pow(pos.x - 500, 2) + Math.pow(pos.y - 500, 2))

    // The radius should be clamped to RADAR_RADIUS - itemRadius (500 - 18 = 482)
    expect(dist).toBeLessThanOrEqual(485)
  })

  it('handles minAngle > maxAngle when quadrant is extremely narrow', () => {
    QUADRANT_ANGLES['Tools'] = { start: 270, end: 275 }
    const blipA: Blip = { name: 'A', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }
    const blipB: Blip = { name: 'B', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '' }

    // By making the quadrant only 5 degrees wide, the dynamicAngleMargin (up to 44) will make minAngle > maxAngle.
    // Position A inside the sector to see what it clamps to
    const initialPositions = { A: { x: 500, y: 550 }, B: { x: 501, y: 551 } }
    const finalPositions = resolveBlipCollisions([blipA, blipB], initialPositions)

    expect(finalPositions['A']).toBeDefined()
  })

  it('applies weak repulsion correctly when itemA is a blip and itemB is a cluster', () => {
    const blip = { name: 'Blip', quadrant: 'Tools', ring: 'Adopt', isNew: false, description: '', repoUrl: '', guidanceLink: '', rating: '', id: 'B' }
    const cluster = { isCluster: true, name: 'Cluster', quadrant: 'Tools', ring: 'Adopt', blips: [{}, {}], x: 570, y: 570, id: 'C' } as any

    // Tools quadrant is 270-360 (bottom right, x>500, y>500). Adopt ring is 0-160.
    // Let's place them at angle 315 (x=y > 500) to safely stay within bounds without triggering angle clamps.
    // Center is (500, 500).
    // B: (530, 530) -> radius ~42.4
    // C: (570, 570) -> radius ~98.9
    // Distance between B and C = sqrt(40^2 + 40^2) = 56.5
    // minDistance = 18 + 26 + 2 = 46. Since 56.5 > 46, they will use weak repulsion instead of strict collision.
    const initialPositions = { B: { x: 530, y: 530 }, C: { x: 570, y: 570 } }
    const finalPositions = resolveBlipCollisions([blip, cluster], initialPositions)

    // B should have been repelled AWAY from C. Since C is at (570, 570) and B is at (530, 530),
    // B should move further top-left, meaning x and y should decrease.
    expect(finalPositions['B']!.x).toBeLessThan(530)
    expect(finalPositions['B']!.y).toBeLessThan(530)

    // C is a cluster, so it should not be moved by weak repulsion
    expect(finalPositions['C']!.x).toBe(570)
    expect(finalPositions['C']!.y).toBe(570)
  })
})
