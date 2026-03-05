<template>
  <q-dialog
    v-model="show"
    square
    class="shadow-0"
    aria-labelledby="blip-details-title"
    :full-height="node?.isCluster"
  >
    <q-card style="min-width: 50%;" dark class="bg-dark text-white scroll" :class="{ 'full-height': node?.isCluster }">
      <template v-if="node">
        <q-card-section class="row items-center q-pb-none sticky-top bg-dark" style="z-index: 10; position: sticky; top: 0;">
          <div id="blip-details-title" class="text-h6 text-white">
            {{ node.isCluster ? `${node.blips.length} items in ${$t(getQuadrantTranslationKey(node.quadrant))} - ${$t('radar.rings.' + node.ring.toLowerCase())}` : node.name }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :aria-label="$t('radar.blips.close')" />
        </q-card-section>
        <template v-for="(blip, index) in node.blips" :key="blip.id || blip.name">
          <div :style="index % 2 === 0 ? 'background-color: rgba(255, 255, 255, 0.05)' : ''">
            <radar-blip-detail
              :subtitle="node.isCluster ? blip.name : ''"
              :is-new="blip.isNew"
              :license-id="blip.license?.spdx_id ?? ''"
              :license-rating="blip.rating"
              :description="blip.description"
              :guidance-link="blip.guidanceLink"
              :repo-url="blip.repoUrl"
              :is-feedback-enabled="isFeedbackEnabled"
              :quadrant="blip.quadrant"
              :ring="blip.ring"
              @feedback-clicked="openFeedback(blip)"
            />
          </div>
          <q-separator v-if="index !== node.blips.length - 1" />
        </template>
      </template>
    </q-card>
  </q-dialog>

  <RadarBlipFeedbackDialog
    v-if="isFeedbackEnabled"
    v-model="showFeedbackDialog"
    :blip="feedbackBlip"
  />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Blip } from 'src/models/radar'
import type { DisplayNode } from 'src/utils/radar-visualization'
import { getQuadrantTranslationKey } from 'src/models/radar'
import { appConfig } from 'src/config'
import RadarBlipFeedbackDialog from './feedback/RadarBlipFeedbackDialog.vue'
import RadarBlipDetail from './RadarBlipDetail.vue'

export default defineComponent({
  name: 'RadarBlipDetails',

  components: {
    RadarBlipFeedbackDialog,
    RadarBlipDetail
  },

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    node: {
      type: Object as unknown as PropType<DisplayNode>,
      default: null
    }
  },

  emits: ['update:modelValue'],

  data () {
    return {
      showFeedbackDialog: false,
      feedbackBlip: null as Blip | null
    }
  },

  computed: {
    show: {
      get (): boolean {
        return this.modelValue
      },
      set (value: boolean) {
        this.$emit('update:modelValue', value)
      }
    },
    isFeedbackEnabled (): boolean {
      return appConfig.isFeedbackEnabled
    }
  },

  methods: {
    getQuadrantTranslationKey,
    openFeedback (blip: Blip | undefined) {
      if (!blip) return
      this.feedbackBlip = blip
      this.showFeedbackDialog = true
    }
  }
})
</script>
