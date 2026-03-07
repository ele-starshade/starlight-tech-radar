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
        <q-space />
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

      <template v-else-if="(viewMode === 'list' || $q.screen.lt.md) && radarData">
        <div class="row items-center q-mb-lg">
          <q-space />
          <div class="col-6 col-md-3 col-lg-2">
            <q-input
              filled
              color="orange"
              v-model="searchQuery"
              :label="$t('radar.searchBlips')"
              class="q-mr-md"
            >
              <template v-if="searchQuery" v-slot:append>
                <q-icon name="cancel" @click.stop.prevent="searchQuery = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <q-select
              color="orange"
              filled
              v-model="ringFilterSelected"
              :options="radarData.rings"
              :label="$t('radar.filterRings')"
              class="q-mr-md"
            >
              <template v-if="ringFilterSelected" v-slot:append>
                <q-icon name="cancel" @click.stop.prevent="ringFilterSelected = null" class="cursor-pointer" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-2 col-lg-1">
            <q-toggle size="md" v-model="newOnly" :label="$t('radar.newOnly')" />
          </div>
        </div>
        <q-separator />
        <q-tabs
          v-model="tab"
          inline-label
          :breakpoint="0"
          align="center"
          :class="isDarkMode ? ['bg-grey-9', 'text-white'] : ['bg-grey-1', 'text-dark']"
          :vertical="!$q.screen.lg || $q.screen.xl"
        >
          <q-tab name="Techniques" :label="$t('radar.quadrants.techniques')" class="ellipsis" />
          <q-tab name="Languages & Frameworks" :label="$t('radar.quadrants.languages')" class="ellipsis" />
          <q-tab name="Platforms" :label="$t('radar.quadrants.platforms')" class="ellipsis" />
          <q-tab name="Tools" :label="$t('radar.quadrants.tools')" class="ellipsis" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab">
          <q-tab-panel name="Techniques" class="row">
            <radar-blips-none :blips="techniqueBlips" :ring-filter-selected="ringFilterSelected" :search-query="searchQuery" :new-only="newOnly" @clear-filters="clearFilters" />
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" v-for="(blip, index) in techniqueBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-pa-xs" />
          </q-tab-panel>
          <q-tab-panel name="Languages & Frameworks" class="row">
            <radar-blips-none :blips="languageBlips" :ring-filter-selected="ringFilterSelected" :search-query="searchQuery" :new-only="newOnly" @clear-filters="clearFilters" />
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" v-for="(blip, index) in languageBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-pa-xs" />
          </q-tab-panel>
          <q-tab-panel name="Platforms" class="row">
            <radar-blips-none :blips="platformBlips" :ring-filter-selected="ringFilterSelected" :search-query="searchQuery" :new-only="newOnly" @clear-filters="clearFilters" />
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" v-for="(blip, index) in platformBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-pa-xs" />
          </q-tab-panel>
          <q-tab-panel name="Tools" class="row">
            <radar-blips-none :blips="toolBlips" :ring-filter-selected="ringFilterSelected" :search-query="searchQuery" :new-only="newOnly" @clear-filters="clearFilters" />
            <radar-blip-card :blip="blip" :index="index" @open-feedback="openFeedback(blip)" v-for="(blip, index) in toolBlips" :key="blip.id || blip.name" class="col-12 col-md-6 q-pa-xs" />
          </q-tab-panel>
        </q-tab-panels>
      </template>
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
import { type Blip, type Quadrant } from 'src/models/radar'
import RadarBlipCard from 'src/components/radar/RadarBlipCard.vue'
import { useAccessibilityStore } from 'src/stores/accessibility'
import RadarBlipsNone from 'src/components/radar/RadarBlipsNone.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    RadarCanvas,
    RadarBlipFeedbackDialog,
    RadarBlipCard,
    RadarBlipsNone
  },

  data () {
    return {
      viewMode: 'radar',
      showFeedbackDialog: false,
      feedbackBlip: null as Blip | null,
      tab: 'Techniques' as Quadrant,
      ringFilterSelected: null,
      searchQuery: '',
      newOnly: false
    }
  },

  computed: {
    ...mapState(useRadarStore, ['radarData', 'loading', 'error']),
    ...mapState(useAccessibilityStore, ['isDarkMode']),
    isFeedbackEnabled (): boolean {
      return appConfig.isFeedbackEnabled
    },
    techniqueBlips () {
      const blips = this.radarData?.blips.filter(blip => blip.quadrant === 'Techniques')

      return this.applyFiltersToBlips(blips || [])
    },
    platformBlips () {
      const blips = this.radarData?.blips.filter(blip => blip.quadrant === 'Platforms')

      return this.applyFiltersToBlips(blips || [])
    },
    toolBlips () {
      const blips = this.radarData?.blips.filter(blip => blip.quadrant === 'Tools')

      return this.applyFiltersToBlips(blips || [])
    },
    languageBlips () {
      const blips = this.radarData?.blips.filter(blip => blip.quadrant === 'Languages & Frameworks')

      return this.applyFiltersToBlips(blips || [])
    },
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
    },

    applyFiltersToBlips (blips: Blip[]) {
      let filteredBlips = [...blips]

      if (this.searchQuery) {
        filteredBlips = filteredBlips.filter(blip => blip.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      }

      if (this.ringFilterSelected) {
        filteredBlips = filteredBlips.filter(blip => blip.ring === this.ringFilterSelected)
      }

      if (this.newOnly) {
        filteredBlips = filteredBlips.filter(blip => blip.isNew)
      }

      return filteredBlips
    },

    clearFilters () {
      this.searchQuery = ''
      this.ringFilterSelected = null
      this.newOnly = false
    }
  }
})
</script>
