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
        <q-card-section class="row items-center sticky-top bg-dark" style="z-index: 10; position: sticky; top: 0;">
          <div id="blip-details-title" class="text-h6 text-white">
            {{ node.isCluster ? `${node.blips.length} items in ${$t(getQuadrantTranslationKey(node.quadrant))} - ${$t('radar.rings.' + node.ring.toLowerCase())}` : node.name }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :aria-label="$t('radar.blips.close')" />
        </q-card-section>
        <template v-for="(blip, index) in node.blips" :key="blip.id || blip.name">
          <div :style="index % 2 === 0 ? 'background-color: rgba(255, 255, 255, 0.05)' : ''" data-testid="radar-blip-detail-wrapper">
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
              @open-feedback="openFeedback(blip)"
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

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { Blip } from 'src/models/radar'
import type { DisplayNode } from 'src/utils/radar-visualization'
import { getQuadrantTranslationKey } from 'src/utils/radar-helpers'
import type { AppConfig } from 'src/config'
import RadarBlipFeedbackDialog from './feedback/RadarBlipFeedbackDialog.vue'
import RadarBlipDetail from './RadarBlipDetail.vue'

const props = defineProps<{
  modelValue: boolean
  node: DisplayNode | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const showFeedbackDialog = ref(false)
const feedbackBlip = ref<Blip | null>(null)

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const appConfig = inject<AppConfig>('appConfig')
const isFeedbackEnabled = computed(() => appConfig?.isFeedbackEnabled ?? false)

const openFeedback = (blip: Blip | undefined) => {
  if (!blip) return
  feedbackBlip.value = blip
  showFeedbackDialog.value = true
}
</script>
