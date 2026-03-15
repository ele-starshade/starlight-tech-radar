<template>
  <g class="radar-grid">
    <!-- Background / Radar Rings -->
    <circle
      v-for="ring in rings"
      :key="ring.name"
      :cx="RADAR_RADIUS"
      :cy="RADAR_RADIUS"
      :r="ring.outer"
      class="radar-ring"
      fill="transparent"
      stroke="var(--q-primary)"
      stroke-width="1"
      opacity="0.2"
    />

    <!-- Quadrant Dividers -->
    <line
      :x1="RADAR_RADIUS - 470"
      :y1="RADAR_RADIUS"
      :x2="RADAR_RADIUS + 470"
      :y2="RADAR_RADIUS"
      stroke="var(--q-primary)"
      stroke-width="1"
      opacity="0.3"
    />
    <line
      :x1="RADAR_RADIUS"
      :y1="RADAR_RADIUS - 470"
      :x2="RADAR_RADIUS"
      :y2="RADAR_RADIUS + 470"
      stroke="var(--q-primary)"
      stroke-width="1"
      opacity="0.3"
    />

    <!-- Ring Labels -->
    <g v-for="(ring) in rings" :key="`label-${ring.name}`">
      <text
        :x="RADAR_RADIUS + 10"
        :y="RADAR_RADIUS - ring.inner - 10"
        class="ring-label"
        fill="var(--q-primary)"
        opacity="0.5"
        font-size="14"
      >
        {{ $t(`radar.rings.${ring.name.toLowerCase()}`) }}
      </text>
    </g>

    <!-- Quadrant Labels -->
    <g v-for="q in quadrantLabels" :key="q.name">
      <text
        :x="q.x"
        :y="q.y"
        class="quadrant-label"
        fill="var(--q-primary)"
        opacity="0.8"
        font-size="20"
        font-weight="bold"
        :text-anchor="q.anchor"
      >
        {{ $t(getQuadrantTranslationKey(q.name)) }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Quadrant, Ring } from 'src/models/radar'
import { getQuadrantTranslationKey } from 'src/utils/radar-helpers'
import { RADAR_RADIUS as RADAR_RADIUS_CONST, RING_RADII, QUADRANT_ANGLES } from 'src/utils/radar-visualization'

const RADAR_RADIUS = computed(() => RADAR_RADIUS_CONST)

const rings = computed(() => {
  const names: Ring[] = ['Adopt', 'Trial', 'Assess', 'Hold']

  return names.map(name => ({
    name,
    ...RING_RADII[name]
  }))
})

const quadrantLabels = computed(() => {
  const labels: Quadrant[] = ['Techniques', 'Tools', 'Platforms', 'Languages & Frameworks']
  const size = RADAR_RADIUS_CONST * 2

  return labels.map(name => {
    const angles = QUADRANT_ANGLES[name]
    const midAngle = ((angles?.start || 0) + (angles?.end || 0)) / 2
    const rad = (midAngle * Math.PI) / 180
    const dist = RADAR_RADIUS_CONST - 20

    let x = RADAR_RADIUS_CONST + dist * Math.cos(rad)
    let y = RADAR_RADIUS_CONST - dist * Math.sin(rad)
    let anchor: string

    if (x < RADAR_RADIUS_CONST) {
      x = 0
      anchor = 'start'
    } else {
      x = size
      anchor = 'end'
    }

    if (y < RADAR_RADIUS_CONST) {
      y = -10
    } else {
      y = size + 20
    }

    return { name, x, y, anchor }
  })
})
</script>

<style lang="scss" scoped>
.ring-label {
  pointer-events: none;
}

.quadrant-label {
  pointer-events: none;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
