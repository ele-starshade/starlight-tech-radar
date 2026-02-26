import { defineStore, acceptHMRUpdate } from 'pinia'
import { LocalStorage } from 'quasar'

export const useAccessibilityStore = defineStore('accessibility', {
  state: () => ({
    fontSizeStep: LocalStorage.getItem('fontSizeStep') !== null ? Number(LocalStorage.getItem('fontSizeStep')) : 0,
    isDyslexicEnabled: LocalStorage.getItem('isDyslexicEnabled') !== null ? Boolean(LocalStorage.getItem('isDyslexicEnabled')) : false,
    isDarkMode: LocalStorage.getItem('isDarkMode') !== null ? Boolean(LocalStorage.getItem('isDarkMode')) : true,
  }),

  actions: {
    setFontSizeStep (step: number) {
      this.fontSizeStep = step
      LocalStorage.set('fontSizeStep', step)
    },
    setDyslexicEnabled (enabled: boolean) {
      this.isDyslexicEnabled = enabled
      LocalStorage.set('isDyslexicEnabled', enabled)
    },
    setDarkMode (enabled: boolean) {
      this.isDarkMode = enabled
      LocalStorage.set('isDarkMode', enabled)
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAccessibilityStore, import.meta.hot))
}
