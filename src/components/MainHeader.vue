<template>
  <q-header bordered :class="isDarkMode ? 'bg-primary text-grey-10' : 'bg-black text-white'">
    <q-toolbar>
      <q-btn
        flat
        @click="$emit('toggle-drawer')"
        round
        dense
        icon="menu"
        :aria-label="$t('app.toggle_menu')"
      />

      <q-toolbar-title class="text-weight-bold">
        <q-avatar role="img" :aria-label="$t('app.logo_alt')" size="40px">
          <img :src="appConfig?.logo" alt="" width="40" height="40" fetchpriority="high">
        </q-avatar>
        {{ appConfig?.title }}
      </q-toolbar-title>

      <q-space />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { AppConfig } from 'src/config'

defineProps<{
  isDarkMode: boolean
}>()

defineEmits<{
  (e: 'toggle-drawer'): void
}>()

const appConfig = inject<AppConfig>('appConfig')
</script>
