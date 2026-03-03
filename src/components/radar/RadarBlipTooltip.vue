<template>
  <q-tooltip
    :id="`tooltip-${index}`"
    role="tooltip"
    :target="`#blip-anchor-${index}`"
    anchor="top middle"
    self="bottom middle"
    :offset="[10, 10]"
    :delay="0"
    transition-show="scale"
    transition-hide="scale"
    class="bg-dark"
  >
    <template v-if="node.isCluster">
      <div class="text-subtitle2">{{ node.blips.length }} blips grouped</div>
      <div class="text-caption">
        {{ $t(getQuadrantTranslationKey(node.quadrant)) }} - {{ $t(`radar.rings.${node.ring.toLowerCase()}`) }}
      </div>
    </template>
    <template v-else>
      <div class="text-subtitle2">{{ node.name }}</div>
      <div class="text-caption">
        {{ $t(getQuadrantTranslationKey(node.quadrant)) }} - {{ $t(`radar.rings.${node.ring.toLowerCase()}`) }}
      </div>
      <div v-if="node.isNew" class="text-warning text-caption text-bold">{{ $t('radar.blips.new') }}</div>
    </template>
  </q-tooltip>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { DisplayNode } from 'src/utils/radar-visualization'
import { getQuadrantTranslationKey } from 'src/models/radar'

export default defineComponent({
  name: 'RadarBlipTooltip',

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

  methods: {
    getQuadrantTranslationKey (quadrant: string) {
      return getQuadrantTranslationKey(quadrant)
    }
  }
})
</script>
