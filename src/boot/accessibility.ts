import { boot } from 'quasar/wrappers'
import { Cookies } from 'quasar'
import { useAccessibilityStore } from 'src/stores/accessibility'

export default boot(({ ssrContext, store }) => {
  const cookies = process.env.SERVER
    ? Cookies.parseSSR(ssrContext)
    : Cookies

  const accessibilityStore = useAccessibilityStore(store)

  if (cookies.has('isDarkMode')) {
    const val = cookies.get('isDarkMode')

    accessibilityStore.isDarkMode = val === 'true'
  }

  if (cookies.has('fontSizeStep')) {
    accessibilityStore.fontSizeStep = Number(cookies.get('fontSizeStep'))
  }

  if (cookies.has('isDyslexicEnabled')) {
    const val = cookies.get('isDyslexicEnabled')

    accessibilityStore.isDyslexicEnabled = val === 'true'
  }
})
