import { computed, type Ref } from 'vue'
import type { Blip, Ring } from 'src/models/radar'
import type { Point, DisplayNode } from 'src/utils/radar-visualization'
import {
  RADAR_RADIUS,
  RING_RADII,
  QUADRANT_ANGLES,
  getInitialBlipPosition,
  resolveBlipCollisions
} from 'src/utils/radar-visualization'

export function useRadarLayout (blipsRef: Ref<Blip[]>) {
  const displayNodes = computed(() => {
    const blips = blipsRef.value
    const groups: Record<string, Blip[]> = {}

    blips.forEach(blip => {
      const key = `${blip.quadrant}-${blip.ring}`

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(blip)
    })

    const nodes: DisplayNode[] = []
    const CLUSTER_THRESHOLDS: Record<Ring, number> = {
      Adopt: 10,
      Trial: 15,
      Assess: 20,
      Hold: 25
    }

    for (const [key, groupBlips] of Object.entries(groups)) {
      const firstBlip = groupBlips[0] as Blip
      const threshold = CLUSTER_THRESHOLDS[firstBlip.ring]

      if (groupBlips.length > threshold) {
        nodes.push({
          isCluster: true,
          id: `cluster-${key}`,
          name: `${groupBlips.length} items`,
          blips: groupBlips,
          quadrant: firstBlip.quadrant,
          ring: firstBlip.ring,
          x: 0,
          y: 0,
          isNew: groupBlips.some(b => b.isNew)
        })
      } else {
        groupBlips.forEach(blip => {
          nodes.push({
            isCluster: false,
            id: blip.id || blip.name,
            name: blip.name,
            blips: [blip],
            quadrant: blip.quadrant,
            ring: blip.ring,
            x: 0,
            y: 0,
            isNew: blip.isNew
          })
        })
      }
    }

    const initialPositions: Record<string, Point> = {}

    nodes.forEach(node => {
      // Mock a blip to use the existing positioning logic based on quadrant/ring
      const mockBlip = {
        name: node.id,
        quadrant: node.quadrant,
        ring: node.ring
      } as Blip

      if (node.isCluster) {
        const ringProps = RING_RADII[node.ring]
        const quadProps = QUADRANT_ANGLES[node.quadrant]
        const radius = (ringProps.inner + ringProps.outer) / 2
        const angle = (quadProps.start + quadProps.end) / 2

        const angleRadians = (angle * Math.PI) / 180

        initialPositions[node.id] = {
          x: RADAR_RADIUS + radius * Math.cos(angleRadians),
          y: RADAR_RADIUS - radius * Math.sin(angleRadians)
        }
      } else {
        initialPositions[node.id] = getInitialBlipPosition(mockBlip)
      }
    })

    const finalPositions = resolveBlipCollisions(nodes, initialPositions)

    return nodes.map(node => ({
      ...node,
      ...finalPositions[node.id]!
    }))
  })

  return { displayNodes }
}
