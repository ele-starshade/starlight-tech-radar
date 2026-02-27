<template>
  <q-layout view="hHh Lpr lff" class="shadow-2 rounded-borders">
    <!-- Top Bar -->
    <MainHeader :is-dark-mode="isDarkMode" @toggle-drawer="toggleLeftDrawer" />

    <!-- Left Navigation Drawer -->
    <MainDrawer
      v-model="leftDrawerOpen"
      :is-dark-mode="isDarkMode"
      @toggle-drawer="toggleLeftDrawer"
    />

    <!-- Main Screen -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAccessibilityStore } from 'src/stores/accessibility'
import { mapState } from 'pinia'
import MainHeader from 'src/components/MainHeader.vue'
import MainDrawer from 'src/components/MainDrawer.vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
    MainHeader,
    MainDrawer
  },

  data () {
    return {
      leftDrawerOpen: false
    }
  },

  computed: {
    ...mapState(useAccessibilityStore, ['fontSizeStep', 'isDyslexicEnabled', 'isDarkMode'])
  },

  watch: {
    fontSizeStep () {
      this.applyFontSize()
    },
    isDyslexicEnabled (val) {
      document.body.classList.toggle('open-dyslexic', val)
      this.applyFontSize()
    }
  },

  methods: {
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    applyFontSize () {
      // Assuming a base of 14px for Quasar, adjust by 2px per step
      const baseSize = 14
      const stepSize = 2
      let newSize = baseSize + (this.fontSizeStep * stepSize)

      // Scale down if OpenDyslexic is enabled because it tends to be larger
      if (this.isDyslexicEnabled) {
        newSize *= 0.9
      }

      document.body.style.fontSize = `${newSize}px`
      // Also update html to scale rem correctly in some contexts
      document.documentElement.style.fontSize = `${newSize}px`
    }
  },

  mounted () {
    if (this.isDyslexicEnabled) {
      document.body.classList.add('open-dyslexic')
    }

    this.applyFontSize()
  }
})
</script>
