<template>
  <div class="radar-container overflow-auto flex flex-center q-pa-lg relative-position">
    <svg
      :viewBox="`-50 -50 ${size + 100} ${size + 100}`"
      :width="size + 100"
      :height="size + 100"
      class="radar-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <RadarGrid />

      <!-- Blips / Clusters -->
      <RadarBlip
        v-for="(node, index) in displayNodes"
        :key="node.id"
        :node="node"
        :index="index"
        @click="onNodeClick"
      />
    </svg>

    <!-- Tooltips (moved outside SVG for better SSR/Portals support) -->
    <template v-if="isMounted">
      <RadarBlipTooltip
        v-for="(node, index) in displayNodes"
        :key="`tooltip-${node.id}`"
        :node="node"
        :index="index"
      />
    </template>

    <!-- Blip Details Dialog -->
    <RadarBlipDetails
      v-model="detailsDialog.show"
      :node="detailsDialog.node"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Blip, Ring } from 'src/models/radar'
import type { Point, DisplayNode } from 'src/utils/radar-visualization'
import {
  RADAR_RADIUS,
  RING_RADII,
  QUADRANT_ANGLES,
  getInitialBlipPosition,
  resolveBlipCollisions
} from 'src/utils/radar-visualization'

// Atomic & Molecular Components
import RadarGrid from './radar/RadarGrid.vue'
import RadarBlip from './radar/RadarBlip.vue'
import RadarBlipTooltip from './radar/RadarBlipTooltip.vue'
import RadarBlipDetails from './radar/RadarBlipDetails.vue'

export default defineComponent({
  name: 'RadarCanvas',

  components: {
    RadarGrid,
    RadarBlip,
    RadarBlipTooltip,
    RadarBlipDetails
  },

  props: {
    blips: {
      type: Array as PropType<Blip[]>,
      required: true
    }
  },

  data () {
    return {
      size: RADAR_RADIUS * 2,
      isMounted: false,
      detailsDialog: {
        show: false,
        node: null as unknown as DisplayNode
      }
    }
  },

  computed: {
    displayNodes (): DisplayNode[] {
      const groups: Record<string, Blip[]> = {}

      this.blips.forEach(blip => {
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
    }
  },

  mounted () {
    this.isMounted = true
  },

  methods: {
    onNodeClick (node: DisplayNode) {
      this.detailsDialog.node = node
      this.detailsDialog.show = true
    }
  }
})
</script>

<style lang="scss" scoped>
.radar-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.radar-svg {
  background: transparent;
  user-select: none;
}
</style>
