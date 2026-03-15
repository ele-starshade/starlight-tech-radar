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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Blip } from 'src/models/radar'
import type { DisplayNode } from 'src/utils/radar-visualization'
import { RADAR_RADIUS } from 'src/utils/radar-visualization'
import { useRadarLayout } from 'src/composables/useRadarLayout'

// Atomic & Molecular Components
import RadarGrid from './radar/RadarGrid.vue'
import RadarBlip from './radar/RadarBlip.vue'
import RadarBlipTooltip from './radar/RadarBlipTooltip.vue'
import RadarBlipDetails from './radar/RadarBlipDetails.vue'

const props = defineProps<{
  blips: Blip[]
}>()

const size = ref(RADAR_RADIUS * 2)
const isMounted = ref(false)
const detailsDialog = ref<{ show: boolean, node: DisplayNode | null }>({
  show: false,
  node: null
})

const blipsRef = computed(() => props.blips)
const { displayNodes } = useRadarLayout(blipsRef)

onMounted(() => {
  isMounted.value = true
})

const onNodeClick = (node: DisplayNode) => {
  detailsDialog.value.node = node
  detailsDialog.value.show = true
}
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
