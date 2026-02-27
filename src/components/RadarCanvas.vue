<template>
  <div class="radar-container overflow-auto flex flex-center q-pa-lg relative-position">
    <svg
      :viewBox="`-50 -50 ${size + 100} ${size + 100}`"
      :width="size + 100"
      :height="size + 100"
      class="radar-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
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

      <!-- Blips -->
      <g
        v-for="(blip, index) in blipsWithPositions"
        :key="blip.name"
        class="blip-node"
        @click="onBlipClick(blip)"
      >
        <circle
          :id="`blip-anchor-${index}`"
          :cx="blip.x"
          :cy="blip.y"
          r="15"
          :fill="`var(--q-${getBlipColorName(blip)})`"
          class="blip-circle cursor-pointer"
        />
        <text
          :x="blip.x"
          :y="(blip.y || 0) + 5"
          text-anchor="middle"
          :fill="getBlipTextColor(blip)"
          font-size="14"
          font-weight="bold"
          class="cursor-pointer"
          pointer-events="none"
        >
          {{ index + 1 }}
        </text>
      </g>
    </svg>

    <!-- Tooltips (moved outside SVG for better SSR/Portals support) -->
    <template v-if="isMounted">
      <q-tooltip
        v-for="(blip, index) in blipsWithPositions"
        :key="`tooltip-${blip.name}`"
        :target="`#blip-anchor-${index}`"
        anchor="top middle"
        self="bottom middle"
        :offset="[10, 10]"
        :delay="0"
        transition-show="scale"
        transition-hide="scale"
        class="bg-dark"
      >
        <div class="text-subtitle2">{{ blip.name }}</div>
        <div class="text-caption">
          {{ $t(getQuadrantTranslationKey(blip.quadrant)) }} - {{ $t(`radar.rings.${blip.ring.toLowerCase()}`) }}
        </div>
        <div v-if="blip.isNew" class="text-warning text-caption text-bold">{{ $t('radar.blips.new') }}</div>
      </q-tooltip>
    </template>

    <!-- Blip Details Dialog -->
    <q-dialog v-model="detailsDialog.show" square class="shadow-0" aria-labelledby="blip-details-title">
      <q-card style="min-width: 350px" dark class="bg-dark text-white">
        <q-card-section class="row items-center q-pb-none">
          <div id="blip-details-title" class="text-h6 text-white">{{ detailsDialog.blip?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :aria-label="$t('radar.blips.close')" />
        </q-card-section>

        <q-card-section>
          <div class="row items-center q-gutter-sm q-mb-md">
            <!-- Use solid chips with dark text for maximum contrast on bright theme colors -->
            <q-chip :color="detailsDialog.blip?.isNew ? 'positive' : 'primary'" text-color="dark">
              <q-icon name="trending_up" size="xs" class="q-mr-xs" v-if="detailsDialog.blip?.isNew" />
              <q-icon name="trending_flat" size="xs" class="q-mr-xs" v-else />
              {{ detailsDialog.blip?.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
            </q-chip>
            <q-chip color="primary" text-color="dark">
              <q-icon name="category" size="xs" class="q-mr-xs" />
              {{ detailsDialog.blip ? $t(getQuadrantTranslationKey(detailsDialog.blip.quadrant)) : '' }}
            </q-chip>
            <q-chip color="secondary" text-color="dark">
              <q-icon name="layers" size="xs" class="q-mr-xs" />
              {{ detailsDialog.blip ? $t(`radar.rings.${detailsDialog.blip.ring.toLowerCase()}`) : '' }}
            </q-chip>
          </div>

          <div class="q-mb-md text-white">
            {{ detailsDialog.blip?.description }}
          </div>

          <q-separator q-my-md dark />

          <div class="row items-center q-gutter-md q-mt-sm">
            <q-btn color="primary" text-color="dark" :label="$t('radar.blips.guidance')" :href="detailsDialog.blip?.guidanceLink" target="_blank" icon="description" />
            <q-btn color="secondary" text-color="dark" :label="$t('radar.blips.repository')" :href="detailsDialog.blip?.repoUrl" target="_blank" icon="book" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, computed, reactive, ref, onMounted } from 'vue'
import { colors } from 'quasar'
import type { Blip, Quadrant, Ring } from 'src/models/radar'
import type {
  Point
} from 'src/utils/radar-visualization'
import {
  RADAR_RADIUS,
  RING_RADII,
  QUADRANT_ANGLES,
  getInitialBlipPosition,
  resolveBlipCollisions
} from 'src/utils/radar-visualization'

const { getPaletteColor, brightness } = colors

export default defineComponent({
  name: 'RadarCanvas',

  props: {
    blips: {
      type: Array as PropType<Blip[]>,
      required: true
    }
  },

  setup (props) {
    const size = RADAR_RADIUS * 2
    const isMounted = ref(false)
    const detailsDialog = reactive({
      show: false,
      blip: null as Blip | null
    })

    onMounted(() => {
      isMounted.value = true
    })

    const rings = computed(() => {
      const names: Ring[] = ['Adopt', 'Trial', 'Assess', 'Hold']

      return names.map(name => ({
        name,
        ...RING_RADII[name]
      }))
    })

    const quadrantLabels = computed(() => {
      const labels: Quadrant[] = ['Techniques', 'Tools', 'Platforms', 'Languages & Frameworks']

      return labels.map(name => {
        const angles = QUADRANT_ANGLES[name]
        const midAngle = ((angles?.start || 0) + (angles?.end || 0)) / 2
        const rad = (midAngle * Math.PI) / 180
        const dist = RADAR_RADIUS - 20

        let x = RADAR_RADIUS + dist * Math.cos(rad)
        let y = RADAR_RADIUS - dist * Math.sin(rad)
        let anchor = 'middle'

        // Adjust positioning to stay within the square canvas
        if (x < RADAR_RADIUS) {
          x = 0
          anchor = 'start'
        } else {
          x = size
          anchor = 'end'
        }

        if (y < RADAR_RADIUS) {
          y = -10
        } else {
          y = size + 20
        }

        return { name, x, y, anchor }
      })
    })

    const blipsWithPositions = computed(() => {
      const initialPositions: Record<string, Point> = {}

      props.blips.forEach(blip => {
        initialPositions[blip.name] = getInitialBlipPosition(blip)
      })

      const finalPositions = resolveBlipCollisions(props.blips, initialPositions)

      return props.blips.map(blip => ({
        ...blip,
        ...finalPositions[blip.name]
      }))
    })

    const onBlipClick = (blip: Blip) => {
      detailsDialog.blip = blip
      detailsDialog.show = true
    }

    const getBlipColorName = (blip: Blip) => {
      if (blip.isNew) return 'positive'

      switch (blip.quadrant) {
        case 'Techniques': return 'secondary'
        case 'Platforms': return 'accent'
        case 'Tools': return 'info'
        case 'Languages & Frameworks': return 'warning'
        default: return 'secondary'
      }
    }

    const getBlipTextColor = (blip: Blip) => {
      const colorName = getBlipColorName(blip)
      const hex = getPaletteColor(colorName)

      // Dynamic contrast check: if background is dark, use white; otherwise dark navy
      if (hex && brightness(hex) < 140) {
        return '#FFFFFF'
      }

      return '#0B1121'
    }

    const getQuadrantTranslationKey = (quadrant: string) => {
      const mapping: Record<string, string> = {
        Techniques: 'radar.quadrants.techniques',
        Platforms: 'radar.quadrants.platforms',
        Tools: 'radar.quadrants.tools',
        'Languages & Frameworks': 'radar.quadrants.languages'
      }

      return mapping[quadrant] || quadrant
    }

    return {
      size,
      RADAR_RADIUS,
      isMounted,
      rings,
      quadrantLabels,
      blipsWithPositions,
      detailsDialog,
      onBlipClick,
      getBlipColorName,
      getBlipTextColor,
      getQuadrantTranslationKey
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

.ring-label {
  pointer-events: none;
}

.quadrant-label {
  pointer-events: none;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
