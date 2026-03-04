<template>
  <q-page padding class="q-pa-md">
    <h1 class="text-h4 q-mt-none q-mb-md">{{ $t('radar.title') }}</h1>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="error" class="text-negative text-h6 text-center">
      Error: {{ error }}
    </div>

    <div v-else>
      <div class="row items-center q-mb-lg">
        <div class="text-body1 col">
          {{ $t('radar.welcome') }}
        </div>
        <div class="col-auto" v-if="!$q.screen.lt.md">
          <q-btn-toggle
            v-model="viewMode"
            flat
            stretch
            toggle-color="primary"
            :options="[
              { label: $t('radar.view_radar'), value: 'radar', icon: 'track_changes' },
              { label: $t('radar.view_list'), value: 'list', icon: 'list' }
            ]"
          />
        </div>
      </div>

      <div v-if="viewMode === 'radar' && radarData && !$q.screen.lt.md">
        <radar-canvas :blips="radarData.blips" />
      </div>

      <div class="row q-col-gutter-md" v-else-if="(viewMode === 'list' || $q.screen.lt.md) && radarData">
        <div v-for="blip in radarData.blips" :key="blip.name" class="col-12 col-md-6">
          <q-card flat bordered class="full-height column">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h6">{{ blip.name }}</div>
                  <div class="text-subtitle2">
                    {{ $t(getQuadrantTranslationKey(blip.quadrant)) }} - {{ $t(`radar.rings.${blip.ring.toLowerCase()}`) }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-chip :color="blip.isNew ? 'positive' : 'grey-7'" :text-color="blip.isNew ? 'dark' : 'white'" dense>
                    {{ blip.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
                  </q-chip>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-md">
                <q-chip :color="blip.isNew ? 'positive' : 'primary'" text-color="black">
                  <q-icon name="trending_up" size="xs" class="q-mr-xs" v-if="blip.isNew" />
                  <q-icon name="trending_flat" size="xs" class="q-mr-xs" v-else />
                  {{ blip.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
                </q-chip>
                <q-chip color="primary" text-color="black" v-if="blip.quadrant">
                  <q-icon name="category" size="xs" class="q-mr-xs" />
                  {{ $t(getQuadrantTranslationKey(blip.quadrant)) }}
                </q-chip>
                <q-chip color="secondary" text-color="black" v-if="blip.ring">
                  <q-icon name="layers" size="xs" class="q-mr-xs" />
                  {{ $t(`radar.rings.${blip.ring.toLowerCase()}`) }}
                </q-chip>
                <q-chip outline color="white" icon="description" v-if="blip.license?.spdx_id">
                  {{ blip.license.spdx_id }}
                </q-chip>
                <q-chip outline :color="getRatingColor(blip.rating)" icon="verified" v-if="blip.rating">
                  {{ blip.rating }}
                </q-chip>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none col">
              {{ blip.description }}
            </q-card-section>

            <q-space />
            <q-separator />

            <q-card-section class="q-pb-none">
              <q-btn-group spread>
                <q-btn v-if="blip.guidanceLink" color="primary" text-color="black" :label="$t('radar.blips.guidance')" :href="blip.guidanceLink" target="_blank" icon="description" />
                <q-btn v-if="blip.repoUrl" color="secondary" text-color="black" :label="$t('radar.blips.repository')" :href="blip.repoUrl" target="_blank" icon="book" />
                <q-btn
                  v-if="isFeedbackEnabled"
                  color="orange"
                  text-color="black"
                  :label="$t('radar.feedback.give_feedback')"
                  icon="feedback"
                  @click="openFeedback(blip)"
                />
              </q-btn-group>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <RadarBlipFeedbackDialog
        v-if="isFeedbackEnabled"
        v-model="showFeedbackDialog"
        :blip="feedbackBlip"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useRadarStore } from 'src/stores/radar'
import RadarCanvas from 'src/components/RadarCanvas.vue'
import { appConfig } from 'src/config'
import RadarBlipFeedbackDialog from 'src/components/radar/feedback/RadarBlipFeedbackDialog.vue'
import type { Blip } from 'src/models/radar'

export default defineComponent({
  name: 'IndexPage',

  components: {
    RadarCanvas,
    RadarBlipFeedbackDialog
  },

  data () {
    return {
      viewMode: 'radar',
      showFeedbackDialog: false,
      feedbackBlip: null as Blip | null
    }
  },

  computed: {
    ...mapState(useRadarStore, ['radarData', 'loading', 'error']),
    isFeedbackEnabled (): boolean {
      return appConfig.isFeedbackEnabled
    }
  },

  watch: {
    '$q.screen.lt.md': {
      handler (isMobile: boolean) {
        if (isMobile) {
          this.viewMode = 'list'
        } else {
          this.viewMode = 'radar'
        }
      },
      immediate: true
    }
  },

  serverPrefetch () {
    return useRadarStore().fetchRadarData(this.$route.query)
  },

  async mounted () {
    // On client-side, we still want to ensure data is fetched
    // if it wasn't already fetched by SSR
    await useRadarStore().fetchRadarData(this.$route.query)
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
    },

    openFeedback (blip: Blip | undefined) {
      if (!blip) return
      this.feedbackBlip = blip
      this.showFeedbackDialog = true
    }
  }
})
</script>
