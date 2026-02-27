import { type Blip, type Quadrant, type Ring } from 'src/models/radar'

export interface Point {
  x: number
  y: number
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
    seed += blip.name.charCodeAt(i)
  }

  // Linear congruential generator for pseudo-randomness
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000

    return x - Math.floor(x)
  }

  // Avoid placing blips too close to the edges of the ring/quadrant
  const margin = 15
  const radius = ring.inner + margin + pseudoRandom(1) * (ring.outer - ring.inner - 2 * margin)
  const angle = quadrant.start + margin / 5 + pseudoRandom(2) * (quadrant.end - quadrant.start - 2 * margin / 5)

  return polarToCartesian(radius, angle)
}

/**
 * Simple collision detection and resolution for blips.
 * This is a basic force-directed approach to push blips apart.
 */
export function resolveBlipCollisions (blips: Blip[], blipPositions: Record<string, Point>): Record<string, Point> {
  const positions = { ...blipPositions }
  const BLIP_RADIUS = 18
  const MIN_DISTANCE = BLIP_RADIUS * 2.5
  const ITERATIONS = 30

  for (let i = 0; i < ITERATIONS; i++) {
    let moved = false

    for (let j = 0; j < blips.length; j++) {
      const blipA = blips[j]

      if (!blipA) continue
      const posA = positions[blipA.name]

      if (!posA) continue

      for (let k = j + 1; k < blips.length; k++) {
        const blipB = blips[k]

        if (!blipB) continue
        const posB = positions[blipB.name]

        if (!posB) continue

        const dx = posB.x - posA.x
        const dy = posB.y - posA.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < MIN_DISTANCE) {
          moved = true
          const force = (MIN_DISTANCE - (distance || 0.1)) / 2
          const ux = dx / (distance || 0.1)
          const uy = dy / (distance || 0.1)

          // Push them apart
          posA.x -= ux * force
          posA.y -= uy * force
          posB.x += ux * force
          posB.y += uy * force

          // Keep them within their quadrant and ring boundaries (optional, but good for aesthetics)
          // For now, just keep them within the overall radar circle
          const distA = Math.sqrt(Math.pow(posA.x - RADAR_RADIUS, 2) + Math.pow(posA.y - RADAR_RADIUS, 2))

          if (distA > RADAR_RADIUS - BLIP_RADIUS) {
            const ratio = (RADAR_RADIUS - BLIP_RADIUS) / distA

            posA.x = RADAR_RADIUS + (posA.x - RADAR_RADIUS) * ratio
            posA.y = RADAR_RADIUS + (posA.y - RADAR_RADIUS) * ratio
          }
        }
      }
    }

    if (!moved) break
  }

  return positions
}
