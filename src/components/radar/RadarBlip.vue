<template>
  <g
    class="blip-node focusable"
    tabindex="0"
    role="button"
    :aria-label="node.isCluster ? `Cluster: ${node.name}` : `Blip ${index + 1}: ${node.name}`"
    :aria-describedby="`tooltip-${index}`"
    @click="$emit('click', node)"
    @keyup.enter="$emit('click', node)"
    @keyup.space.prevent="$emit('click', node)"
    :style="{ '--node-x': `${node.x}px`, '--node-y': `${node.y}px` }"
  >
    <template v-if="node.isCluster">
      <rect
        :id="anchorId"
        :x="node.x - 35"
        :y="node.y - 15"
        width="70"
        height="30"
        rx="15"
        ry="15"
        :fill="blipColor"
        class="blip-shape cursor-pointer"
      />
    </template>
    <template v-else>
      <circle
        :id="anchorId"
        :cx="node.x"
        :cy="node.y"
        r="15"
        :fill="blipColor"
        class="blip-shape cursor-pointer"
      />
    </template>

    <text
      :x="node.x"
      :y="(node.y || 0) + 4"
      text-anchor="middle"
      :fill="textColor"
      :font-size="node.isCluster ? 12 : 14"
      font-weight="bold"
      class="cursor-pointer"
      pointer-events="none"
    >
      {{ node.isCluster ? `${node.blips.length} blips` : index + 1 }}
    </text>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors } from 'quasar'
import type { DisplayNode } from 'src/utils/radar-visualization'

const props = defineProps<{
  node: DisplayNode
  index: number
}>()

defineEmits<{
  (e: 'click', node: DisplayNode): void
}>()

const anchorId = computed(() => `blip-anchor-${props.index}`)

const baseColorHex = computed(() => {
  let colorName: string

  if (props.node.isNew) {
    colorName = 'positive'
  } else {
    switch (props.node.quadrant) {
      case 'Techniques': colorName = 'secondary'; break
      case 'Platforms': colorName = 'accent'; break
      case 'Tools': colorName = 'info'; break
      case 'Languages & Frameworks': colorName = 'warning'; break
      default: colorName = 'secondary'; break
    }
  }

  return colors.getPaletteColor(colorName)
})

const blipColor = computed(() => {
  const hex = baseColorHex.value

  if (props.node.isNew) return hex

  let darkenPercent = 0

  switch (props.node.ring) {
    case 'Hold': return hex
    case 'Assess': darkenPercent = -12; break
    case 'Trial': darkenPercent = -24; break
    case 'Adopt': darkenPercent = -36; break
  }

  return colors.lighten(hex, darkenPercent)
})

const textColor = computed(() => {
  const hex = blipColor.value

  if (hex && colors.brightness(hex) < 140) {
    return '#FFFFFF'
  }

  return '#0B1121'
})
</script>

<style lang="scss" scoped>
.blip-shape {
  transition: transform 0.2s ease, filter 0.2s ease;
  transform-origin: var(--node-x) var(--node-y);

  // Make the hit area stable by using pointer-events correctly on the group
  pointer-events: visiblePainted;
}

.blip-node {
  cursor: pointer;
  outline: none;
  // Increase hit area slightly
  pointer-events: bounding-box;

  &:hover {
    .blip-shape {
      filter: brightness(1.2);
      transform: scale(1.15);
    }
  }

  &.focusable:focus-visible {
    .blip-shape {
      stroke: var(--q-primary);
      stroke-width: 3px;
      filter: brightness(1.2);
      transform: scale(1.15);
    }
  }
}
</style>
