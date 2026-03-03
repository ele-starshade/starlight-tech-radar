import { type Blip, type Quadrant, type Ring } from 'src/models/radar'

export interface Point {
  x: number
  y: number
}

export interface DisplayNode extends Point {
  isCluster: boolean
  id: string
  name: string
  blips: Blip[]
  quadrant: Quadrant
  ring: Ring
  isNew?: boolean
}

export const RADAR_RADIUS = 500
export const RING_RADII: Record<Ring, { inner: number; outer: number }> = {
  Adopt: { inner: 0, outer: 160 },
  Trial: { inner: 160, outer: 270 },
  Assess: { inner: 270, outer: 370 },
  Hold: { inner: 370, outer: 470 }
}

export const QUADRANT_ANGLES: Record<Quadrant, { start: number; end: number }> = {
  Techniques: { start: 180, end: 270 },
  Tools: { start: 270, end: 360 },
  Platforms: { start: 90, end: 180 },
  'Languages & Frameworks': { start: 0, end: 90 }
}

/**
 * Translates polar coordinates to Cartesian coordinates.
 * Center is at (RADAR_RADIUS, RADAR_RADIUS).
 */
export function polarToCartesian (radius: number, angleDegrees: number): Point {
  const angleRadians = (angleDegrees * Math.PI) / 180

  return {
    x: RADAR_RADIUS + radius * Math.cos(angleRadians),
    y: RADAR_RADIUS - radius * Math.sin(angleRadians)
  }
}

/**
 * Deterministically generates a random-ish point for a blip within its quadrant and ring.
 */
export function getInitialBlipPosition (blip: Blip): Point {
  const ring = RING_RADII[blip.ring]
  const quadrant = QUADRANT_ANGLES[blip.quadrant]

  // Use blip name as seed for deterministic "randomness"
  let seed = 0

  for (let i = 0; i < blip.name.length; i++) {
    seed = (Math.imul(31, seed) + blip.name.charCodeAt(i)) | 0
  }

  // Mulberry32 PRNG for better uniform distribution
  const pseudoRandom = (offset: number) => {
    let t = (seed + Math.imul(offset, 0x6D2B79F5)) | 0

    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Avoid placing blips too close to the edges of the ring/quadrant
  const margin = 20

  // Use area-uniform distribution for radius
  // Area of circle is pi*r^2, so we need to distribute by square root of random value
  const rMin = ring.inner === 0 ? 30 : ring.inner + margin
  const rMax = ring.outer - margin

  const rMinSq = rMin * rMin
  const rMaxSq = rMax * rMax

  const radius = Math.sqrt(pseudoRandom(1) * (rMaxSq - rMinSq) + rMinSq)

  // Angle distribution
  const angleMargin = 12 // Give a little buffer from the quadrant axes
  const angle = quadrant.start + angleMargin + pseudoRandom(2) * (quadrant.end - quadrant.start - 2 * angleMargin)

  return polarToCartesian(radius, angle)
}

/**
 * Simple collision detection and resolution for blips.
 * This is a basic force-directed approach to push blips apart.
 */
export function resolveBlipCollisions (items: { id?: string | undefined; name: string; quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }[], itemPositions: Record<string, Point>): Record<string, Point> {
  const positions = { ...itemPositions }
  const ITERATIONS = 80 // Increased for better settling and weak repulsion

  const getRadius = (item: { isCluster?: boolean }) => item.isCluster ? 26 : 18

  const clampToBoundaries = (pos: Point, item: { quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }) => {
    const itemRadius = getRadius(item)

    if (item.quadrant && item.ring) {
      const ring = RING_RADII[item.ring]
      const quadrant = QUADRANT_ANGLES[item.quadrant]

      const dx = pos.x - RADAR_RADIUS
      const dy = RADAR_RADIUS - pos.y
      let distance = Math.sqrt(dx * dx + dy * dy)
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI

      if (angle < 0) angle += 360

      let changed = false

      // 1. Clamp distance (radius)
      // Enforce a strict margin from the edges
      const edgeMargin = 14
      const minDistance = ring.inner === 0 ? 30 : ring.inner + itemRadius / 2 + edgeMargin
      const maxDistance = ring.outer - itemRadius / 2 - edgeMargin

      if (distance < minDistance) {
        distance = minDistance
        changed = true
      } else if (distance > maxDistance) {
        distance = maxDistance
        changed = true
      }

      // 2. Clamp angle
      // Keep a larger margin from axes equivalent to the blip's radius plus padding
      const arcLengthMargin = itemRadius + edgeMargin
      const dynamicAngleMargin = Math.min(44, (arcLengthMargin / Math.max(distance, 1)) * (180 / Math.PI))

      let minAngle = quadrant.start + dynamicAngleMargin
      let maxAngle = quadrant.end - dynamicAngleMargin

      if (minAngle > maxAngle) {
        const mid = (quadrant.start + quadrant.end) / 2

        minAngle = mid
        maxAngle = mid
      }

      if (angle < minAngle || angle > maxAngle) {
        const normalize = (a: number) => (a % 360 + 360) % 360
        const getDist = (a: number, b: number) => {
          const d = Math.abs(normalize(a) - normalize(b))

          return Math.min(d, 360 - d)
        }

        if (getDist(angle, minAngle) < getDist(angle, maxAngle)) {
          angle = minAngle
        } else {
          angle = maxAngle
        }

        changed = true
      }

      if (changed) {
        const angleRadians = (angle * Math.PI) / 180

        pos.x = RADAR_RADIUS + distance * Math.cos(angleRadians)
        pos.y = RADAR_RADIUS - distance * Math.sin(angleRadians)
      }
    } else {
      const distA = Math.sqrt(Math.pow(pos.x - RADAR_RADIUS, 2) + Math.pow(pos.y - RADAR_RADIUS, 2))

      if (distA > RADAR_RADIUS - itemRadius) {
        const ratio = (RADAR_RADIUS - itemRadius) / Math.max(distA, 1)

        pos.x = RADAR_RADIUS + (pos.x - RADAR_RADIUS) * ratio
        pos.y = RADAR_RADIUS + (pos.y - RADAR_RADIUS) * ratio
      }
    }
  }

  const clampToLabels = (pos: Point, item: { quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }) => {
    if (item.quadrant !== 'Languages & Frameworks') return

    const itemRadius = getRadius(item)

    // Check against each label's approximate bounding box
    Object.values(RING_RADII).forEach(ring => {
      const labelX = RADAR_RADIUS + 10
      const labelY = RADAR_RADIUS - ring.inner - 10

      // Label rectangle roughly [510, 570] x [labelY - 15, labelY + 5]
      const rect = { x: labelX, y: labelY - 15, w: 60, h: 20 }

      // Add a small extra margin around the text
      const padding = 5
      const padRect = {
        x: rect.x - padding,
        y: rect.y - padding,
        w: rect.w + padding * 2,
        h: rect.h + padding * 2
      }

      // Find the closest point to the circle within the rectangle
      const closestX = Math.max(padRect.x, Math.min(pos.x, padRect.x + padRect.w))
      const closestY = Math.max(padRect.y, Math.min(pos.y, padRect.y + padRect.h))

      const distanceX = pos.x - closestX
      const distanceY = pos.y - closestY

      const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY)

      if (distanceSquared < (itemRadius * itemRadius)) {
        // Collision! Push the blip out
        let distance = Math.sqrt(distanceSquared)
        let pushX = distanceX
        let pushY = distanceY

        if (distance === 0) {
          // If exactly inside, push it arbitrarily to the right
          pushX = 1
          pushY = 0
          distance = 1
        }

        const overlap = itemRadius - distance

        pos.x += (pushX / distance) * overlap
        pos.y += (pushY / distance) * overlap
      }
    })
  }

  for (let i = 0; i < ITERATIONS; i++) {
    let moved = false

    for (let j = 0; j < items.length; j++) {
      const itemA = items[j]

      if (!itemA) continue
      const keyA = itemA.id || itemA.name
      const posA = positions[keyA]

      if (!posA) continue

      for (let k = j + 1; k < items.length; k++) {
        const itemB = items[k]

        if (!itemB) continue
        const keyB = itemB.id || itemB.name
        const posB = positions[keyB]

        if (!posB) continue

        let dx = posB.x - posA.x
        let dy = posB.y - posA.y
        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance === 0) {
          dx = 0.1
          dy = 0.1
          distance = 0.1414
        }

        const rA = getRadius(itemA)
        const rB = getRadius(itemB)
        const minDistance = rA + rB + 2 // 2px extra spacing

        if (distance < minDistance) {
          moved = true
          const totalForce = minDistance - distance
          const ux = dx / distance
          const uy = dy / distance

          // Push them apart, but clusters are immovable
          if (!itemA.isCluster && !itemB.isCluster) {
            posA.x -= ux * totalForce * 0.5
            posA.y -= uy * totalForce * 0.5
            posB.x += ux * totalForce * 0.5
            posB.y += uy * totalForce * 0.5
          } else if (!itemA.isCluster) {
            posA.x -= ux * totalForce
            posA.y -= uy * totalForce
          } else if (!itemB.isCluster) {
            posB.x += ux * totalForce
            posB.y += uy * totalForce
          }

          if (!itemA.isCluster) {
            clampToLabels(posA, itemA)
            clampToBoundaries(posA, itemA)
          }

          if (!itemB.isCluster) {
            clampToLabels(posB, itemB)
            clampToBoundaries(posB, itemB)
          }
        } else if (itemA.quadrant === itemB.quadrant && itemA.ring === itemB.ring) {
          // Weak repulsive force to distribute evenly
          const force = 300 / (distance * distance)

          if (force > 0.05) {
            moved = true
            const ux = dx / distance
            const uy = dy / distance

            if (!itemA.isCluster && !itemB.isCluster) {
              posA.x -= ux * force
              posA.y -= uy * force
              posB.x += ux * force
              posB.y += uy * force
            } else if (!itemA.isCluster) {
              posA.x -= ux * force * 2
              posA.y -= uy * force * 2
            } else if (!itemB.isCluster) {
              posB.x += ux * force * 2
              posB.y += uy * force * 2
            }

            if (!itemA.isCluster) {
              clampToLabels(posA, itemA)
              clampToBoundaries(posA, itemA)
            }

            if (!itemB.isCluster) {
              clampToLabels(posB, itemB)
              clampToBoundaries(posB, itemB)
            }
          }
        }
      }
    }

    if (!moved) break
  }

  return positions
}
