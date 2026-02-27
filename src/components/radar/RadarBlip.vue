<template>
  <g
    class="blip-node"
    @click="$emit('click', blip)"
  >
    <circle
      :id="anchorId"
      :cx="blip.x"
      :cy="blip.y"
      r="15"
      :fill="`var(--q-${colorName})`"
      class="blip-circle cursor-pointer"
    />
    <text
      :x="blip.x"
      :y="(blip.y || 0) + 5"
      text-anchor="middle"
      :fill="textColor"
      font-size="14"
      font-weight="bold"
      class="cursor-pointer"
      pointer-events="none"
    >
      {{ index + 1 }}
    </text>
  </g>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { colors } from 'quasar'
import type { Blip } from 'src/models/radar'

export default defineComponent({
  name: 'RadarBlip',

  props: {
    blip: {
      type: Object as PropType<Blip & { x: number; y: number }>,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },

  emits: ['click'],

  computed: {
    anchorId (): string {
      return `blip-anchor-${this.index}`
    },

    colorName (): string {
      if (this.blip.isNew) return 'positive'

      switch (this.blip.quadrant) {
        case 'Techniques': return 'secondary'
        case 'Platforms': return 'accent'
        case 'Tools': return 'info'
        case 'Languages & Frameworks': return 'warning'
        default: return 'secondary'
      }
    },

    textColor (): string {
      const hex = colors.getPaletteColor(this.colorName)

      // Dynamic contrast check: if background is dark, use white; otherwise dark navy
      if (hex && colors.brightness(hex) < 140) {
        return '#FFFFFF'
      }

      return '#0B1121'
    }
  }
})
</script>

<style lang="scss" scoped>
.blip-circle {
  transition: r 0.2s ease, filter 0.2s ease;

  &:hover {
    r: 18;
    filter: brightness(1.2);
  }
}

.blip-node {
  cursor: pointer;
}
</style>
