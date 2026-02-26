<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { watch, onMounted } from 'vue'
import { useAccessibilityStore } from 'src/stores/accessibility'

const $q = useQuasar()
const accessibilityStore = useAccessibilityStore()

onMounted(() => {
  $q.dark.set(accessibilityStore.isDarkMode)
})

watch(() => accessibilityStore.isDarkMode, (val) => {
  $q.dark.set(val)
})
</script>
