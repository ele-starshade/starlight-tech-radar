<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { watch } from 'vue'
import { useAccessibilityStore } from 'src/stores/accessibility'

const $q = useQuasar()
const accessibilityStore = useAccessibilityStore()

// Execute on both server and client to sync the HTML body classes
// with the user preferences determined by the boot file!
$q.dark.set(accessibilityStore.isDarkMode)

watch(() => accessibilityStore.isDarkMode, (val) => {
  $q.dark.set(val)
})
</script>
