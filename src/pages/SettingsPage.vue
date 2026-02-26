<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">{{ $t('settings.title') }}</div>

    <div class="row q-col-gutter-md">
      <!-- Language Settings -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-h6">{{ $t('settings.language_region') }}</div>
            <div class="text-subtitle2 text-grey">{{ $t('settings.choose_language') }}</div>
          </q-card-section>

          <q-card-section>
            <q-select
              v-model="locale"
              :options="localeOptions"
              :label="$t('settings.app_language')"
              outlined
              emit-value
              map-options
              options-dense
            >
              <template v-slot:prepend>
                <q-icon name="language" />
              </template>
            </q-select>
          </q-card-section>
        </q-card>
      </div>

      <!-- Accessibility Settings -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-h6">{{ $t('accessibility.title') }}</div>
            <div class="text-subtitle2 text-grey">Customize your experience</div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle1 q-mb-xs">{{ $t('accessibility.font_size') }}</div>
            <div class="text-caption text-grey q-mb-md">{{ $t('accessibility.font_size_caption') }}</div>

            <div class="row items-center q-gutter-md">
              <q-btn
                color="primary"
                flat
                round
                icon="remove"
                @click="decreaseFontSize"
                :disable="accessibilityStore.fontSizeStep <= 0"
              />
              <div class="text-weight-bold text-h6" style="min-width: 40px; text-align: center;">
                {{ accessibilityStore.fontSizeStep > 0 ? '+' : '' }}{{ accessibilityStore.fontSizeStep }}
              </div>
              <q-btn
                color="primary"
                flat
                round
                icon="add"
                @click="increaseFontSize"
                :disable="accessibilityStore.fontSizeStep >= 4"
              />
            </div>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <q-item tag="label" v-ripple class="q-px-none">
              <q-item-section class="open-dyslexic">
                <q-item-label>{{ $t('accessibility.open_dyslexic') }}</q-item-label>
                <q-item-label caption>{{ $t('accessibility.open_dyslexic_caption') }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="accessibilityStore.isDyslexicEnabled"
                  @update:model-value="accessibilityStore.setDyslexicEnabled"
                />
              </q-item-section>
            </q-item>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <q-item tag="label" v-ripple class="q-px-none">
              <q-item-section>
                <q-item-label>{{ $t('accessibility.dark_mode') }}</q-item-label>
                <q-item-label caption>{{ $t('accessibility.dark_mode_caption') }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="accessibilityStore.isDarkMode"
                  @update:model-value="accessibilityStore.setDarkMode"
                />
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { watch, onMounted } from 'vue'
import { useAccessibilityStore } from 'src/stores/accessibility'

const $q = useQuasar()
const { locale } = useI18n({ useScope: 'global' })
const accessibilityStore = useAccessibilityStore()

const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: '中文 (Simplified)' },
  { value: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'ar-SA', label: 'العربية (Arabic)' }
]

function increaseFontSize () {
  if (accessibilityStore.fontSizeStep < 4) {
    accessibilityStore.setFontSizeStep(accessibilityStore.fontSizeStep + 1)
  }
}

function decreaseFontSize () {
  if (accessibilityStore.fontSizeStep > 0) {
    accessibilityStore.setFontSizeStep(accessibilityStore.fontSizeStep - 1)
  }
}

// Persist language choice
watch(locale, (newLocale) => {
  if ($q.platform.has.webStorage) {
    $q.localStorage.set('locale', newLocale)
  }
})

onMounted(() => {
  if ($q.platform.has.webStorage) {
    const savedLocale = $q.localStorage.getItem('locale')

    if (savedLocale) {
      locale.value = savedLocale as string
    }
  }
})
</script>
