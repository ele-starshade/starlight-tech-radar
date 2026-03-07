<template>
  <div v-if="blips.length === 0" class="col-12 col-md-6 q-mx-auto">
    <q-banner :class="$q.dark.isActive ? 'bg-blue-grey-9' : 'bg-blue-grey-3'" v-if="ringFilterSelected || searchQuery || newOnly">
      <template v-slot:avatar>
        <q-icon name="filter_alt_off" color="primary" />
      </template>
      {{ $t('radar.noBlipsFilters') }}
      <template v-slot:action>
        <q-btn flat color="primary" :label="$t('radar.clearFilters')" @click="$emit('clearFilters')" />
      </template>
    </q-banner>
    <q-banner :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'" v-else>
      <template v-slot:avatar>
        <q-icon name="broken_image" color="primary" />
      </template>
      {{  $t('radar.noBlips') }}
    </q-banner>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RadarBlipsNone',

  props: {
    blips: {
      type: Array,
      required: true
    },
    ringFilterSelected: [String, null],
    searchQuery: String,
    newOnly: Boolean
  }
})
</script>
