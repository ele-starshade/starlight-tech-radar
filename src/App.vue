<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { watch, onMounted } from 'vue'
import { useAccessibilityStore } from 'src/stores/accessibility'

const $q = useQuasar()
const accessibilityStore = useAccessibilityStore()

// Execute on both server and client to sync the HTML body classes
// with the user preferences determined by the boot file!
$q.dark.set(accessibilityStore.isDarkMode)

function applyFontSize () {
  // Assuming a base of 14px for Quasar, adjust by 2px per step
  const baseSize = 14
  const stepSize = 2
  let newSize = baseSize + (accessibilityStore.fontSizeStep * stepSize)

  // Scale down if OpenDyslexic is enabled because it tends to be larger
  if (accessibilityStore.isDyslexicEnabled) {
    newSize *= 0.9
  }

  document.body.style.fontSize = `${newSize}px`
  // Also update html to scale rem correctly in some contexts
  document.documentElement.style.fontSize = `${newSize}px`
}

watch(() => accessibilityStore.isDarkMode, (val) => {
  $q.dark.set(val)
})

watch(() => accessibilityStore.isDyslexicEnabled, (val) => {
  document.body.classList.toggle('open-dyslexic', val)
  applyFontSize()
})

watch(() => accessibilityStore.fontSizeStep, () => {
  applyFontSize()
})

onMounted(() => {
  document.body.classList.toggle('open-dyslexic', accessibilityStore.isDyslexicEnabled)
  applyFontSize()
})
</script>
