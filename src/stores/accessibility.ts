import { defineStore, acceptHMRUpdate } from 'pinia'
import { LocalStorage, Cookies } from 'quasar'

export const useAccessibilityStore = defineStore('accessibility', {
  state: () => ({
    fontSizeStep: 0,
    isDyslexicEnabled: false,
    isDarkMode: true,
  }),

  actions: {
    setFontSizeStep (step: number) {
      this.fontSizeStep = step
      LocalStorage.set('fontSizeStep', step)
      Cookies.set('fontSizeStep', String(step), { path: '/' })
    },
    setDyslexicEnabled (enabled: boolean) {
      this.isDyslexicEnabled = enabled
      LocalStorage.set('isDyslexicEnabled', enabled)
      Cookies.set('isDyslexicEnabled', String(enabled), { path: '/' })
    },
    setDarkMode (enabled: boolean) {
      this.isDarkMode = enabled
      LocalStorage.set('isDarkMode', enabled)
      Cookies.set('isDarkMode', String(enabled), { path: '/' })
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAccessibilityStore, import.meta.hot))
}
