<template>
  <q-layout view="hHh Lpr lff" class="shadow-2 rounded-borders">
    <a href="#main-content" class="skip-link">{{ $t('app.skip_to_content') }}</a>

    <!-- Top Bar -->
    <MainHeader :is-dark-mode="isDarkMode" @toggle-drawer="toggleLeftDrawer" />

    <!-- Left Navigation Drawer -->
    <MainDrawer
      v-model="leftDrawerOpen"
      :is-dark-mode="isDarkMode"
      @toggle-drawer="toggleLeftDrawer"
    />

    <!-- Main Screen -->
    <q-page-container id="main-content">
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

  methods: {
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen
    }
  }
})
</script>
