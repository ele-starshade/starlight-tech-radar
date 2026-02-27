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

      <!-- Blips -->
      <RadarBlip
        v-for="(blip, index) in blipsWithPositions"
        :key="blip.name"
        :blip="blip"
        :index="index"
        @click="onBlipClick"
      />
    </svg>

    <!-- Tooltips (moved outside SVG for better SSR/Portals support) -->
    <template v-if="isMounted">
      <RadarBlipTooltip
        v-for="(blip, index) in blipsWithPositions"
        :key="`tooltip-${blip.name}`"
        :blip="blip"
        :index="index"
      />
    </template>

    <!-- Blip Details Dialog -->
    <RadarBlipDetails
      v-model="detailsDialog.show"
      :blip="detailsDialog.blip"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Blip } from 'src/models/radar'
import type { Point } from 'src/utils/radar-visualization'
import {
  RADAR_RADIUS,
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
        blip: null as Blip | null
      }
    }
  },

  computed: {
    blipsWithPositions (): Array<Blip & Point> {
      const initialPositions: Record<string, Point> = {}

      this.blips.forEach(blip => {
        initialPositions[blip.name] = getInitialBlipPosition(blip)
      })

      const finalPositions = resolveBlipCollisions(this.blips, initialPositions)

      return this.blips.map(blip => ({
        ...blip,
        ...finalPositions[blip.name]!
      }))
    }
  },

  mounted () {
    this.isMounted = true
  },

  methods: {
    onBlipClick (blip: Blip) {
      this.detailsDialog.blip = blip
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
