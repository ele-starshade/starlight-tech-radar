<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    show-if-above
    bordered
    :class="isDarkMode ? 'bg-grey-9' : 'bg-grey-3'"
  >
    <q-scroll-area class="fit">
      <q-list role="navigation">
        <q-item-label header class="row items-center justify-between">
          {{ $t('app.navigation') }}
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="$emit('toggle-drawer')"
            :aria-label="$t('app.close_menu')"
          />
        </q-item-label>

        <q-item clickable tag="router-link" to="/" exact v-ripple role="link">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('app.homepage') }}</q-item-label>
            <q-item-label caption>{{ $t('app.homepage_caption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="router-link" to="/settings" exact v-ripple role="link">
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainDrawer',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    isDarkMode: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue', 'toggle-drawer']
})
</script>
