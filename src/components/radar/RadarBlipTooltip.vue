<template>
  <q-tooltip
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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Blip } from 'src/models/radar'
import { getQuadrantTranslationKey } from 'src/models/radar'

export default defineComponent({
  name: 'RadarBlipTooltip',

  props: {
    blip: {
      type: Object as PropType<Blip>,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },

  methods: {
    getQuadrantTranslationKey (quadrant: string) {
      return getQuadrantTranslationKey(quadrant)
    }
  }
})
</script>
