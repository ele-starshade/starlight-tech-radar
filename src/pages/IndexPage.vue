<template>
  <q-page padding class="q-pa-md">
    <h1 class="text-h4 q-mt-none q-mb-md">{{ viewMode === 'radar' ? $t('radar.radar_view') : $t('radar.list_view') }}</h1>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="error" class="text-negative text-h6 text-center">
      Error: {{ error }}
    </div>

    <div v-else>
      <div class="row items-center q-mb-lg">
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
        <div v-for="(blip, index) in radarData.blips" :key="blip.id || blip.name" class="col-12 col-md-6">
          <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" />
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
import RadarBlipCard from 'src/components/radar/RadarBlipCard.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    RadarCanvas,
    RadarBlipFeedbackDialog,
    RadarBlipCard
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
