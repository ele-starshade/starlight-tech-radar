<template>
  <g
    class="blip-node focusable"
    tabindex="0"
    role="button"
    :aria-label="node.isCluster ? `Cluster: ${node.name}` : `Blip ${index + 1}: ${node.name}`"
    :aria-describedby="`tooltip-${index}`"
    @click="$emit('click', node)"
    @keydown="onKeydown"
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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { colors } from 'quasar'
import type { DisplayNode } from 'src/utils/radar-visualization'

export default defineComponent({
  name: 'RadarBlip',

  props: {
    node: {
      type: Object as PropType<DisplayNode>,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },

  emits: ['click'],

  methods: {
    onKeydown (event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
        if (event.key === ' ') event.preventDefault()
        this.$emit('click', this.node)
      }
    }
  },

  computed: {
    anchorId (): string {
      return `blip-anchor-${this.index}`
    },

    baseColorHex (): string {
      let colorName = 'secondary'

      if (this.node.isNew) {
        colorName = 'positive'
      } else {
        switch (this.node.quadrant) {
          case 'Techniques': colorName = 'secondary'; break
          case 'Platforms': colorName = 'accent'; break
          case 'Tools': colorName = 'info'; break
          case 'Languages & Frameworks': colorName = 'warning'; break
        }
      }

      return colors.getPaletteColor(colorName)
    },

    blipColor (): string {
      const hex = this.baseColorHex

      if (this.node.isNew) return hex

      // Start normal on outside, get darker towards the center.
      // Negative percent darkens the color in Quasar's colors.lighten
      let darkenPercent = 0

      switch (this.node.ring) {
        case 'Hold': darkenPercent = 0; break
        case 'Assess': darkenPercent = -12; break
        case 'Trial': darkenPercent = -24; break
        case 'Adopt': darkenPercent = -36; break
      }

      if (darkenPercent === 0) return hex

      return colors.lighten(hex, darkenPercent)
    },

    textColor (): string {
      const hex = this.blipColor

      // Dynamic contrast check: if background is dark, use white; otherwise dark navy
      // Using 140 as a threshold for brightness (0-255) ensures good WCAG contrast
      if (hex && colors.brightness(hex) < 140) {
        return '#FFFFFF'
      }

      return '#0B1121'
    }
  }
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
