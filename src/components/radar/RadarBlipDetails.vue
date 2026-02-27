<template>
  <q-dialog
    v-model="show"
    square
    class="shadow-0"
    aria-labelledby="blip-details-title"
  >
    <q-card style="min-width: 350px" dark class="bg-dark text-white">
      <q-card-section class="row items-center q-pb-none">
        <div id="blip-details-title" class="text-h6 text-white">{{ blip?.name }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup :aria-label="$t('radar.blips.close')" />
      </q-card-section>

      <q-card-section>
        <div class="row items-center q-gutter-sm q-mb-md">
          <!-- Use solid chips with dark text for maximum contrast on bright theme colors -->
          <q-chip :color="blip?.isNew ? 'positive' : 'primary'" text-color="dark">
            <q-icon name="trending_up" size="xs" class="q-mr-xs" v-if="blip?.isNew" />
            <q-icon name="trending_flat" size="xs" class="q-mr-xs" v-else />
            {{ blip?.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
          </q-chip>
          <q-chip color="primary" text-color="dark">
            <q-icon name="category" size="xs" class="q-mr-xs" />
            {{ blip ? $t(getQuadrantTranslationKey(blip.quadrant)) : '' }}
          </q-chip>
          <q-chip color="secondary" text-color="dark">
            <q-icon name="layers" size="xs" class="q-mr-xs" />
            {{ blip ? $t(`radar.rings.${blip.ring.toLowerCase()}`) : '' }}
          </q-chip>
          <q-chip outline color="white" icon="description" v-if="blip?.license">
            {{ blip.license.spdx_id }}
          </q-chip>
          <q-chip outline :color="getRatingColor(blip?.rating)" icon="verified" v-if="blip?.rating">
            {{ blip.rating }}
          </q-chip>
        </div>

        <div class="q-mb-md text-white">
          {{ blip?.description }}
        </div>

        <q-separator q-my-md dark />

        <div class="row items-center q-gutter-md q-mt-sm">
          <q-btn color="primary" text-color="dark" :label="$t('radar.blips.guidance')" :href="blip?.guidanceLink" target="_blank" icon="description" />
          <q-btn color="secondary" text-color="dark" :label="$t('radar.blips.repository')" :href="blip?.repoUrl" target="_blank" icon="book" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Blip } from 'src/models/radar'
import { getQuadrantTranslationKey } from 'src/models/radar'

export default defineComponent({
  name: 'RadarBlipDetails',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    blip: {
      type: Object as PropType<Blip | null>,
      default: null
    }
  },

  emits: ['update:modelValue'],

  computed: {
    show: {
      get (): boolean {
        return this.modelValue
      },
      set (value: boolean) {
        this.$emit('update:modelValue', value)
      }
    }
  },

  methods: {
    getQuadrantTranslationKey (quadrant: string) {
      return getQuadrantTranslationKey(quadrant)
    },
    getRatingColor (rating: string | undefined) {
      if (rating === 'Gold') return 'amber-9'
      if (rating === 'Silver') return 'grey-6'
      if (rating === 'Bronze') return 'deep-orange-9'
      if (rating === 'Approved') return 'positive'

      return 'grey-5'
    }
  }
})
</script>
