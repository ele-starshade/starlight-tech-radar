// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    preFetch: true,

    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'i18n',
      'axios',
      'accessibility'
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node24'
      },

      typescript: {
        strict: true,
        vueShim: true,
        extendTsConfig (tsConfig) {
          tsConfig.compilerOptions = tsConfig.compilerOptions || {}
          tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {}
          tsConfig.compilerOptions.paths['test/*'] = ['./../test/*']
        }
      },

      vueRouterMode: 'history',
      vueDevtools: true,
      rebuildCache: true, // rebuilds Vite/linter/etc cache on startup
      // analyze: true,
      env: {},
      minify: true,

      vitePlugins: [
        ['@intlify/unplugin-vue-i18n/vite', {
          ssr: ctx.modeName === 'ssr',
          include: [fileURLToPath(new URL('./src/i18n', import.meta.url))]
        }],

        ['vite-plugin-istanbul', {
          include: 'src/*',
          exclude: ['node_modules', 'test/'],
          extension: ['.js', '.ts', '.vue'],
          requireEnv: true
        }],

        ['vite-plugin-checker', {
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src/**/*.{ts,js,mjs,cjs,vue}"',
            useFlatConfig: true
          }
        }, { server: false }]
      ]
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // https: true,
      open: true // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {
        loadingBar: {
          position: 'top'
        }
      },
      // Quasar plugins
      plugins: [
        'Dialog',
        'Loading',
        'LoadingBar',
        'Notify',
        'LocalStorage'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000,
      middlewares: [
        'api',
        'render' // keep this as last one
      ],
    },
  }
})
