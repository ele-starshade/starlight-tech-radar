<template>
  <q-layout view="hHh Lpr lff" class="shadow-2 rounded-borders">
    <!-- Top Bar -->
    <q-header bordered :class="isDarkModeActive ? 'bg-primary' : 'bg-black'">
      <q-toolbar>
        <q-btn flat @click="toggleLeftDrawer" round dense icon="menu" />

        <q-toolbar-title>
          <q-avatar>
            <img src="/icons/starlight-logo.png">
          </q-avatar>
          {{ $t('app.title') }}
        </q-toolbar-title>

        <q-space />
      </q-toolbar>
    </q-header>

    <!-- Left Navigation Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :class="isDarkModeActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header class="row items-center justify-between">
            {{ $t('app.navigation') }}
            <q-btn flat round dense icon="close" @click="toggleLeftDrawer" />
          </q-item-label>

          <q-item clickable tag="router-link" to="/" exact v-ripple>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('app.homepage') }}</q-item-label>
              <q-item-label caption>{{ $t('app.homepage_caption') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable tag="router-link" to="/settings" exact v-ripple>
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('app.settings') }}</q-item-label>
              <q-item-label caption>{{ $t('app.settings_caption') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Screen -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer bordered class="bg-grey-8 text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-space />
        <div>{{ $t('app.created_by') }} <a href="https://ele.codes" class="text-accent">Ele</a> {{ $t('app.with_love') }} <span class="text-red">&hearts;</span></div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useAccessibilityStore } from 'src/stores/accessibility'
import { mapState } from 'pinia'

export default defineComponent({
  name: 'MainLayout',

  data () {
    return {
      leftDrawerOpen: false,
      isDarkModeActive: false
    }
  },

  computed: {
    ...mapState(useAccessibilityStore, ['fontSizeStep', 'isDyslexicEnabled'])
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

  created () {
    const $q = useQuasar()

    this.isDarkModeActive = $q.dark.isActive
  },

  mounted () {
    if (this.isDyslexicEnabled) {
      document.body.classList.add('open-dyslexic')
    }

    this.applyFontSize()
  }
})
</script>
