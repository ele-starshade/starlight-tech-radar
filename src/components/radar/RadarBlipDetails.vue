<template>
  <q-dialog
    v-model="show"
    square
    class="shadow-0"
    aria-labelledby="blip-details-title"
    full-height
  >
    <q-card style="min-width: 350px; max-width: 800px; width: 100%" dark class="bg-dark text-white scroll full-height">
      <template v-if="node">
        <q-card-section class="row items-center q-pb-none sticky-top bg-dark" style="z-index: 10; position: sticky; top: 0;">
          <div id="blip-details-title" class="text-h6 text-white">
            {{ node.isCluster ? `${node.blips.length} items in ${$t(getQuadrantTranslationKey(node.quadrant))} - ${$t('radar.rings.' + node.ring.toLowerCase())}` : node.name }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :aria-label="$t('radar.blips.close')" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div v-if="node.isCluster" class="q-gutter-y-md">
            <div v-for="blip in node.blips" :key="blip.id || blip.name" class="q-pa-md bg-grey-9 rounded-borders">
              <div class="text-subtitle1 text-bold q-mb-sm">{{ blip.name }}</div>

              <div class="row items-center q-gutter-sm q-mb-md">
                <q-chip :color="blip.isNew ? 'positive' : 'primary'" text-color="black" dense>
                  <q-icon name="trending_up" size="xs" class="q-mr-xs" v-if="blip.isNew" />
                  <q-icon name="trending_flat" size="xs" class="q-mr-xs" v-else />
                  {{ blip.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
                </q-chip>
                <q-chip outline color="white" icon="description" dense v-if="blip.license">
                  {{ blip.license.spdx_id }}
                </q-chip>
                <q-chip outline :color="getRatingColor(blip.rating)" icon="verified" dense v-if="blip.rating">
                  {{ blip.rating }}
                </q-chip>
              </div>

              <div class="q-mb-md text-white text-body2">
                {{ blip.description }}
              </div>

              <q-separator q-my-sm dark />

              <div class="row items-center q-gutter-sm q-mt-sm">
                <q-btn v-if="blip.guidanceLink" color="primary" text-color="black" :label="$t('radar.blips.guidance')" :href="blip.guidanceLink" target="_blank" icon="description" size="sm" />
                <q-btn v-if="blip.repoUrl" color="secondary" text-color="black" :label="$t('radar.blips.repository')" :href="blip.repoUrl" target="_blank" icon="book" size="sm" />
                <q-btn
                  v-if="isFeedbackEnabled"
                  color="deep-orange"
                  text-color="white"
                  :label="$t('radar.feedback.give_feedback')"
                  icon="feedback"
                  size="sm"
                  @click="openFeedback(blip)"
                />
              </div>
            </div>
          </div>

          <div v-else>
            <div class="row items-center q-gutter-sm q-mb-md">
              <q-chip :color="node.blips[0]?.isNew ? 'positive' : 'primary'" text-color="black">
                <q-icon name="trending_up" size="xs" class="q-mr-xs" v-if="node.blips[0]?.isNew" />
                <q-icon name="trending_flat" size="xs" class="q-mr-xs" v-else />
                {{ node.blips[0]?.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
              </q-chip>
              <q-chip color="primary" text-color="black">
                <q-icon name="category" size="xs" class="q-mr-xs" />
                {{ $t(getQuadrantTranslationKey(node.quadrant)) }}
              </q-chip>
              <q-chip color="secondary" text-color="black">
                <q-icon name="layers" size="xs" class="q-mr-xs" />
                {{ $t(`radar.rings.${node.ring.toLowerCase()}`) }}
              </q-chip>
              <q-chip outline color="white" icon="description" v-if="node.blips[0]?.license">
                {{ node.blips[0]?.license?.spdx_id }}
              </q-chip>
              <q-chip outline :color="getRatingColor(node.blips[0]?.rating)" icon="verified" v-if="node.blips[0]?.rating">
                {{ node.blips[0]?.rating }}
              </q-chip>
            </div>

            <div class="q-mb-md text-white">
              {{ node.blips[0]?.description }}
            </div>

            <q-separator q-my-md dark />

            <div class="row items-center q-gutter-md q-mt-sm">
              <q-btn v-if="node.blips[0]?.guidanceLink" color="primary" text-color="black" :label="$t('radar.blips.guidance')" :href="node.blips[0]?.guidanceLink" target="_blank" icon="description" />
              <q-btn v-if="node.blips[0]?.repoUrl" color="secondary" text-color="black" :label="$t('radar.blips.repository')" :href="node.blips[0]?.repoUrl" target="_blank" icon="book" />
              <q-btn
                v-if="isFeedbackEnabled"
                color="deep-orange"
                text-color="white"
                :label="$t('radar.feedback.give_feedback')"
                icon="feedback"
                @click="openFeedback(node.blips[0])"
              />
            </div>
          </div>
        </q-card-section>
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

export default defineComponent({
  name: 'RadarBlipDetails',

  components: {
    RadarBlipFeedbackDialog
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
    getQuadrantTranslationKey (quadrant: string) {
      return getQuadrantTranslationKey(quadrant)
    },
    getRatingColor (rating: string | undefined) {
      if (rating === 'Gold') return 'amber-9'
      if (rating === 'Silver') return 'grey-6'
      if (rating === 'Bronze') return 'deep-orange-9'
      if (rating === 'Approved') return 'positive'

      return 'grey-5'
    },
    openFeedback (blip: Blip | undefined) {
      if (!blip) return
      this.feedbackBlip = blip
      this.showFeedbackDialog = true
    }
  }
})
</script>
