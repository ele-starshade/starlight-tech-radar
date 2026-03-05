<template>
  <q-card-section class="q-pt-md">
    <div class="text-h6 q-mb-sm" v-if="subtitle">{{ subtitle }}</div>
    <div class="row items-center q-gutter-sm">
      <q-chip :color="isNew ? 'positive' : 'primary'" text-color="black">
        <q-icon name="trending_up" size="xs" class="q-mr-xs" v-if="isNew" />
        <q-icon name="trending_flat" size="xs" class="q-mr-xs" v-else />
        {{ isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
      </q-chip>
      <q-chip color="primary" text-color="black" v-if="quadrant">
        <q-icon name="category" size="xs" class="q-mr-xs" />
        {{ $t(getQuadrantTranslationKey(quadrant)) }}
      </q-chip>
      <q-chip color="secondary" text-color="black" v-if="ring">
        <q-icon name="layers" size="xs" class="q-mr-xs" />
        {{ $t(`radar.rings.${ring.toLowerCase()}`) }}
      </q-chip>
      <q-chip outline color="white" icon="description" v-if="licenseId">
        {{ licenseId }}
      </q-chip>
      <q-chip outline :color="getRatingColor(licenseRating)" icon="verified" v-if="licenseRating">
        {{ licenseRating }}
      </q-chip>
    </div>
  </q-card-section>
  <q-card-section class="q-pt-none">
    {{ description }}
  </q-card-section>
  <q-separator />
  <q-card-section class="q-mt-xs">
    <q-btn-group spread>
      <q-btn v-if="guidanceLink" color="primary" text-color="black" :label="$t('radar.blips.guidance')" :href="guidanceLink" target="_blank" icon="description" />
      <q-btn v-if="repoUrl" color="secondary" text-color="black" :label="$t('radar.blips.repository')" :href="repoUrl" target="_blank" icon="book" />
      <q-btn
        v-if="isFeedbackEnabled"
        color="orange"
        text-color="black"
        :label="$t('radar.feedback.give_feedback')"
        icon="feedback"
        @click="$emit('feedbackClicked')"
      />
    </q-btn-group>
  </q-card-section>
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
