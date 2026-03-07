<template>
  <q-intersection once ssr-prerender>
    <q-card
      flat
      bordered
      :style="Math.floor(index / 2) % 2 !== 0 ? 'background-color: rgba(255, 255, 255, 0.05)' : ''"
    >
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6">{{ blip.name }}</div>
            <div class="text-subtitle2">
              {{ $t(getQuadrantTranslationKey(blip.quadrant)) }} - {{ $t(`radar.rings.${blip.ring.toLowerCase()}`) }}
            </div>
          </div>
          <div class="col-auto">
            <q-chip :color="blip.isNew ? 'positive' : 'grey-7'" :text-color="blip.isNew ? 'dark' : 'white'">
              {{ blip.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-py-none">
        <div class="row items-center">
          <q-chip outline color="white" icon="description" v-if="blip.license?.spdx_id">
            {{ blip.license.spdx_id }}
            <q-tooltip>{{ $t('radar.licenseLabel') }}</q-tooltip>
          </q-chip>
          <q-chip outline :color="getRatingColor(blip.rating)" icon="verified" v-if="blip.rating">
            {{ blip.rating }}
            <q-tooltip>{{ $t('radar.licenseRating') }}</q-tooltip>
          </q-chip>
        </div>
      </q-card-section>

      <q-card-section>
        {{ blip.description }}
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          v-if="blip.guidanceLink"
          color="primary"
          text-color="black"
          :label="$t('radar.blips.guidance')"
          :href="blip.guidanceLink"
          target="_blank"
          icon="description"
        />
        <q-btn
          v-if="blip.repoUrl"
          color="secondary"
          text-color="black"
          :label="$t('radar.blips.repository')"
          :href="blip.repoUrl"
          target="_blank"
          icon="book"
        />
        <q-btn
          v-if="isFeedbackEnabled"
          color="orange"
          text-color="black"
          :label="$t('radar.feedback.give_feedback')"
          icon="feedback"
          @click="$emit('openFeedback')"
        />
      </q-card-actions>
    </q-card>
  </q-intersection>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { appConfig } from 'src/config'

export default defineComponent({
  name: 'RadarBlipCard',

  props: {
    blip: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },

  computed: {
    isFeedbackEnabled (): boolean {
      return appConfig.isFeedbackEnabled
    }
  },

  methods: {
    getQuadrantTranslationKey (quadrant: string) {
      const mapping: Record<string, string> = {
        Techniques: 'radar.quadrants.techniques',
        Platforms: 'radar.quadrants.platforms',
        Tools: 'radar.quadrants.tools',
        'Languages & Frameworks': 'radar.quadrants.languages'
      }

      return mapping[quadrant] || quadrant
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
