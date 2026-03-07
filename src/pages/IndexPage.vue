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

      <q-tabs
        v-model="tab"
        inline-label
        :breakpoint="0"
        align="justify"
        :class="isDarkMode ? ['bg-grey-9', 'text-white'] : ['bg-grey-1', 'text-dark']"
        v-else-if="(viewMode === 'list' || $q.screen.lt.md) && radarData"
      >
        <q-tab name="Techniques" :label="$t('radar.quadrants.techniques')" class="ellipsis" />
        <q-tab name="Languages & Frameworks" :label="$t('radar.quadrants.languages')" class="ellipsis" />
        <q-tab name="Platforms" :label="$t('radar.quadrants.platforms')" class="ellipsis" />
        <q-tab name="Tools" :label="$t('radar.quadrants.tools')" class="ellipsis" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="Techniques">
          <div v-for="(blip, index) in techniqueBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-mb-sm-sm">
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" />
          </div>
        </q-tab-panel>
        <q-tab-panel name="Languages & Frameworks">
          <div v-for="(blip, index) in languageBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-mb-sm q-mb-sm-sm">
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" />
          </div>
        </q-tab-panel>
        <q-tab-panel name="Platforms">
          <div v-for="(blip, index) in platformBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-mb-sm q-mb-sm-sm">
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" />
          </div>
        </q-tab-panel>
        <q-tab-panel name="Tools">
          <div v-for="(blip, index) in toolBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-mb-sm q-mb-sm-sm">
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
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
import type { Blip, Quadrant } from 'src/models/radar'
import RadarBlipCard from 'src/components/radar/RadarBlipCard.vue'
import { useAccessibilityStore } from 'src/stores/accessibility'

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
      feedbackBlip: null as Blip | null,
      tab: 'Techniques' as Quadrant
    }
  },

  computed: {
    ...mapState(useRadarStore, ['radarData', 'loading', 'error']),
    ...mapState(useAccessibilityStore, ['isDarkMode']),
    isFeedbackEnabled (): boolean {
      return appConfig.isFeedbackEnabled
    },
    techniqueBlips () {
      return this.radarData?.blips.filter(blip => blip.quadrant === 'Techniques')
    },
    platformBlips () {
      return this.radarData?.blips.filter(blip => blip.quadrant === 'Platforms')
    },
    toolBlips () {
      return this.radarData?.blips.filter(blip => blip.quadrant === 'Tools')
    },
    languageBlips () {
      return this.radarData?.blips.filter(blip => blip.quadrant === 'Languages & Frameworks')
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
