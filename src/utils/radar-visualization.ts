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
 * Normalizes an angle to be within [0, 360).
 */
function normalizeAngle (angle: number): number {
  return ((angle % 360) + 360) % 360
}

/**
 * Calculates the shortest distance between two angles in degrees.
 */
function getAngleDistance (a: number, b: number): number {
  const d = Math.abs(normalizeAngle(a) - normalizeAngle(b))

  return Math.min(d, 360 - d)
}

/**
 * Clamps a point to be within the main radar circle.
 */
function clampToRadarCircle (pos: Point, itemRadius: number) {
  const dx = pos.x - RADAR_RADIUS
  const dy = pos.y - RADAR_RADIUS
  const distance = Math.hypot(dx, dy)
  const maxDistance = RADAR_RADIUS - itemRadius

  if (distance > maxDistance) {
    const ratio = maxDistance / Math.max(distance, 1)

    pos.x = RADAR_RADIUS + dx * ratio
    pos.y = RADAR_RADIUS + dy * ratio
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

  for (const char of blip.name) {
    seed = Math.trunc(Math.imul(31, seed) + (char.codePointAt(0) || 0))
  }

  // Mulberry32 PRNG for better uniform distribution
  const pseudoRandom = (offset: number) => {
    let t = Math.trunc(seed + Math.imul(offset, 0x6D2B79F5))

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

export function getRadius (item: { isCluster?: boolean }) {
  return item.isCluster ? 26 : 18
}

export function clampToBoundaries (pos: Point, item: { quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }) {
  const itemRadius = getRadius(item)

  if (!item.quadrant || !item.ring) {
    clampToRadarCircle(pos, itemRadius)

    return
  }

  const ring = RING_RADII[item.ring]
  const quadrant = QUADRANT_ANGLES[item.quadrant]

  const dx = pos.x - RADAR_RADIUS
  const dy = RADAR_RADIUS - pos.y
  const distance = Math.hypot(dx, dy)
  const angle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI)

  // 1. Clamp distance (radius)
  const edgeMargin = 14
  const minDistance = ring.inner === 0 ? 30 : ring.inner + itemRadius / 2 + edgeMargin
  const maxDistance = ring.outer - itemRadius / 2 - edgeMargin
  const clampedDistance = Math.max(minDistance, Math.min(maxDistance, distance))

  // 2. Clamp angle
  const arcLengthMargin = itemRadius + edgeMargin
  const dynamicAngleMargin = Math.min(44, (arcLengthMargin / Math.max(clampedDistance, 1)) * (180 / Math.PI))

  let minAngle = quadrant.start + dynamicAngleMargin
  let maxAngle = quadrant.end - dynamicAngleMargin

  if (minAngle > maxAngle) {
    minAngle = maxAngle = (quadrant.start + quadrant.end) / 2
  }

  let clampedAngle = angle

  if (angle < minAngle || angle > maxAngle) {
    clampedAngle = getAngleDistance(angle, minAngle) < getAngleDistance(angle, maxAngle)
      ? minAngle
      : maxAngle
  }

  if (clampedDistance !== distance || clampedAngle !== angle) {
    const angleRadians = (clampedAngle * Math.PI) / 180

    pos.x = RADAR_RADIUS + clampedDistance * Math.cos(angleRadians)
    pos.y = RADAR_RADIUS - clampedDistance * Math.sin(angleRadians)
  }
}

export function clampToLabels (pos: Point, item: { quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }) {
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

function applyForce (
  posA: Point,
  posB: Point,
  itemA: { isCluster?: boolean },
  itemB: { isCluster?: boolean },
  ux: number,
  uy: number,
  force: number
) {
  if (!itemA.isCluster && !itemB.isCluster) {
    posA.x -= ux * force * 0.5
    posA.y -= uy * force * 0.5
    posB.x += ux * force * 0.5
    posB.y += uy * force * 0.5
  } else if (!itemA.isCluster) {
    posA.x -= ux * force
    posA.y -= uy * force
  } else if (!itemB.isCluster) {
    posB.x += ux * force
    posB.y += uy * force
  }
}

function enforceConstraints (pos: Point, item: { quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }) {
  if (!item.isCluster) {
    clampToLabels(pos, item)
    clampToBoundaries(pos, item)
  }
}

function handlePairwiseInteraction (
  posA: Point,
  posB: Point,
  itemA: { quadrant?: Quadrant; ring?: Ring; isCluster?: boolean },
  itemB: { quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }
): boolean {
  let dx = posB.x - posA.x
  let dy = posB.y - posA.y
  let distance = Math.hypot(dx, dy)

  if (distance === 0) {
    dx = 0.1
    dy = 0.1
    distance = 0.1414
  }

  const rA = getRadius(itemA)
  const rB = getRadius(itemB)
  const minDistance = rA + rB + 2 // 2px extra spacing

  let force = 0

  if (distance < minDistance) {
    force = minDistance - distance
  } else if (itemA.quadrant === itemB.quadrant && itemA.ring === itemB.ring) {
    // Weak repulsive force to distribute evenly
    const weakForce = 300 / (distance * distance)

    if (weakForce > 0.05) {
      force = weakForce * 2
    }
  }

  if (force > 0) {
    const ux = dx / distance
    const uy = dy / distance

    applyForce(posA, posB, itemA, itemB, ux, uy, force)
    enforceConstraints(posA, itemA)
    enforceConstraints(posB, itemB)

    return true
  }

  return false
}

type CollisionItem = { id?: string | undefined; name: string; quadrant?: Quadrant; ring?: Ring; isCluster?: boolean }

function runCollisionPass (items: CollisionItem[], positions: Record<string, Point>): boolean {
  let moved = false

  for (let j = 0; j < items.length; j++) {
    const itemA = items[j]!
    const posA = positions[itemA.id || itemA.name]!

    for (let k = j + 1; k < items.length; k++) {
      const itemB = items[k]!
      const posB = positions[itemB.id || itemB.name]!

      if (handlePairwiseInteraction(posA, posB, itemA, itemB)) {
        moved = true
      }
    }
  }

  return moved
}

/**
 * Simple collision detection and resolution for blips.
 * This is a basic force-directed approach to push blips apart.
 */
export function resolveBlipCollisions (items: CollisionItem[], itemPositions: Record<string, Point>): Record<string, Point> {
  const positions = { ...itemPositions }
  const ITERATIONS = 80 // Increased for better settling and weak repulsion

  // Pre-filter items to those that have a defined position
  const activeItems = items.filter(item => item && (item.id || item.name) in positions)

  for (let i = 0; i < ITERATIONS; i++) {
    if (!runCollisionPass(activeItems, positions)) {
      break
    }
  }

  return positions
}
