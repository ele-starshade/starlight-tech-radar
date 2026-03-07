<template>
  <q-card-section>
    <div class="row items-center no-wrap">
      <div class="col">
        <div class="text-h6">{{ subtitle }}</div>
        <div class="text-subtitle2">
          {{ $t(getQuadrantTranslationKey(quadrant)) }} - {{ $t(`radar.rings.${ring.toLowerCase()}`) }}
        </div>
      </div>
      <div class="col-auto">
        <q-chip :color="isNew ? 'positive' : 'grey-7'" :text-color="isNew ? 'dark' : 'white'">
          {{ isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
        </q-chip>
      </div>
    </div>
  </q-card-section>

  <q-card-section class="q-py-none">
    <div class="row items-center">
      <q-chip outline color="white" icon="description" v-if="licenseId">
        {{ licenseId }}
        <q-tooltip>{{ $t('radar.licenseLabel') }}</q-tooltip>
      </q-chip>
      <q-chip outline :color="getRatingColor(licenseRating)" icon="verified" v-if="licenseRating">
        {{ licenseRating }}
        <q-tooltip>{{ $t('radar.licenseRating') }}</q-tooltip>
      </q-chip>
    </div>
  </q-card-section>

  <q-card-section>
    {{ description }}
  </q-card-section>

  <q-separator />

  <q-card-actions align="right">
    <q-btn
      v-if="guidanceLink"
      color="primary"
      text-color="black"
      :label="$t('radar.blips.guidance')"
      :href="guidanceLink"
      target="_blank"
      icon="description"
    />
    <q-btn
      v-if="repoUrl"
      color="secondary"
      text-color="black"
      :label="$t('radar.blips.repository')"
      :href="repoUrl"
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
</template>

<script lang="ts">
import { getQuadrantTranslationKey } from 'src/models/radar'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RadarBlipDetail',

  props: {
    subtitle: {
      type: String,
      default: ''
    },
    isNew: {
      type: Boolean,
      required: true
    },
    licenseId: {
      type: String,
      default: ''
    },
    licenseRating: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    quadrant: {
      type: String,
      default: '',
    },
    ring: {
      type: String,
      default: ''
    },
    guidanceLink: {
      type: String,
      default: ''
    },
    repoUrl: {
      type: String,
      default: ''
    },
    isFeedbackEnabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    getQuadrantTranslationKey,
    getRatingColor (rating: string | undefined) {
      if (rating === 'Gold') return 'amber-9'
      if (rating === 'Silver') return 'grey-6'
      if (rating === 'Bronze') return 'deep-orange-9'
      if (rating === 'Approved') return 'positive'

      return 'grey-5'
    },
  }
})
</script>
