<template>
  <q-page padding class="q-pa-md">
    <div class="text-h4 q-mb-md">{{ $t('radar.title') }}</div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="error" class="text-negative text-h6 text-center">
      Error: {{ error }}
    </div>

    <div v-else>
      <div class="text-body1 q-mb-lg">
        {{ $t('radar.welcome') }}
      </div>

      <div class="row q-col-gutter-md" v-if="radarData">
        <div v-for="blip in radarData.blips" :key="blip.name" class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h6">{{ blip.name }}</div>
                  <div class="text-subtitle2">{{ blip.quadrant }} - {{ blip.ring }}</div>
                </div>
                <div class="col-auto">
                  <q-chip :color="blip.isNew ? 'positive' : 'grey-7'" text-color="white" dense>
                    {{ blip.isNew ? 'New' : 'Stable' }}
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
                <q-chip outline color="primary" icon="description" dense>
                  {{ blip.license?.spdx_id }}
                </q-chip>
                <q-chip outline :color="getRatingColor(blip.rating)" icon="verified" dense>
                  {{ blip.rating }}
                </q-chip>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat color="primary" label="Guidance" :href="blip.guidanceLink" target="_blank" />
              <q-btn flat color="secondary" label="Repo" :href="blip.repoUrl" target="_blank" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from 'vue'
import { useRadarStore } from 'src/stores/radar'

export default defineComponent({
  name: 'IndexPage',

  setup () {
    const store = useRadarStore()

    onMounted(async () => {
      // On client-side, we still want to ensure data is fetched
      // if it wasn't already fetched by SSR
      await store.fetchRadarData()
    })

    return {
      radarData: computed(() => store.radarData),
      loading: computed(() => store.loading),
      error: computed(() => store.error),
      fetchRadarData: () => store.fetchRadarData()
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
  },

  async serverPrefetch () {
    // This will be called on server-side
    const store = useRadarStore()

    await store.fetchRadarData()
  }
})
</script>
