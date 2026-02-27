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
        <div v-for="blip in radarData.blips" :key="blip.name" class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h6">{{ blip.name }}</div>
                  <div class="text-subtitle2">
                    {{ $t(getQuadrantTranslationKey(blip.quadrant)) }} - {{ $t(`radar.rings.${blip.ring.toLowerCase()}`) }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-chip :color="blip.isNew ? 'positive' : 'grey-7'" text-color="white" dense>
                    {{ blip.isNew ? $t('radar.blips.new') : $t('radar.blips.stable') }}
                  </q-chip>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              {{ blip.description }}
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="row items-center q-gutter-sm">
                <q-chip
                  outline
                  color="primary"
                  icon="description"
                  dense
                  clickable
                  tag="a"
                  :href="blip.license?.url"
                  target="_blank"
                >
                  {{ blip.license?.spdx_id }}
                </q-chip>
                <q-chip outline :color="getRatingColor(blip.rating)" icon="verified" dense>
                  {{ blip.rating }}
                </q-chip>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat color="primary" :label="$t('radar.blips.guidance')" :href="blip.guidanceLink" target="_blank" />
              <q-btn flat color="secondary" :label="$t('radar.blips.repository')" :href="blip.repoUrl" target="_blank" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref, watch, onServerPrefetch } from 'vue'
import { useRadarStore } from 'src/stores/radar'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import RadarCanvas from 'src/components/RadarCanvas.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    RadarCanvas
  },

  setup () {
    const store = useRadarStore()
    const $q = useQuasar()
    const route = useRoute()
    const viewMode = ref('radar')

    // On mobile/small screens, force list view; on larger screens, default back to radar
    watch(() => $q.screen.lt.md, (isMobile) => {
      if (isMobile) {
        viewMode.value = 'list'
      } else {
        viewMode.value = 'radar'
      }
    }, { immediate: true })

    onServerPrefetch(async () => {
      await store.fetchRadarData(route.query)
    })

    onMounted(async () => {
      // On client-side, we still want to ensure data is fetched
      // if it wasn't already fetched by SSR
      await store.fetchRadarData(route.query)
    })

    const getQuadrantTranslationKey = (quadrant: string) => {
      const mapping: Record<string, string> = {
        Techniques: 'radar.quadrants.techniques',
        Platforms: 'radar.quadrants.platforms',
        Tools: 'radar.quadrants.tools',
        'Languages & Frameworks': 'radar.quadrants.languages'
      }

      return mapping[quadrant] || quadrant
    }

    return {
      radarData: computed(() => store.radarData),
      loading: computed(() => store.loading),
      error: computed(() => store.error),
      viewMode,
      fetchRadarData: () => store.fetchRadarData(route.query),
      getQuadrantTranslationKey
    }
  },

  methods: {
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
