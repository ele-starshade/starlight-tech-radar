# Architecture

Starlight Tech Radar is built as a modern web application focusing on performance, accessibility, and maintainability. It leverages the **Quasar Framework** (v2) on top of **Vue 3** and **Vite**, with a heavy emphasis on **Server-Side Rendering (SSR)**.

## Technology Stack

- **Framework**: [Vue.js 3](https://vuejs.org/) (Composition & Options API)
- **UI Component Library**: [Quasar Framework](https://quasar.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Internationalization (i18n)**: [Vue I18n](https://vue-i18n.intlify.dev/)
- **Accessibility (a11y)**: Built-in WCAG 2.1 AA compliance strategies, including OpenDyslexic font support and dynamic scaling.
- **Tooling**: Vite (via Quasar CLI)

---

## 🏗️ Architecture: SSR vs SPA

By default, Starlight Tech Radar is configured for **Server-Side Rendering (SSR)**.

### Why SSR?

1. **Performance**: Faster "Time to First Byte" and "Largest Contentful Paint" as the initial HTML is pre-rendered on the server.
2. **Accessibility**: Ensures that the core content is available even if client-side JavaScript fails or is slow to load.

### How it Works

The application uses a **Node.js Express** server (found in `src-ssr/`) to handle incoming requests, render the Vue application using `vue/server-renderer`, and stream the final HTML to the client.

---

## 📂 Project Structure

A high-level overview of the repository's directory structure and its purpose.

```text
/starlight-tech-radar
├── .github/workflows   # CI/CD pipeline definitions
├── badges/             # Lighthouse score badges (auto-generated)
├── docs/               # Comprehensive project documentation
├── public/             # Static assets (favicons, manifest.json)
├── src/                # Core application source code
│   ├── assets/         # Images, global stylesheets
│   ├── boot/           # Initializers (axios, i18n, accessibility)
│   ├── components/     # Vue components (RadarBlip, MainHeader, etc.)
│   ├── config/         # Feature flags and environment mapping
│   ├── css/            # Quasar variables and SCSS
│   ├── data/           # The radar.json configuration file
│   ├── i18n/           # Translation files (en-US, etc.)
│   ├── layouts/        # Page layouts (MainLayout.vue)
│   ├── models/         # TypeScript interfaces and Zod schemas
│   ├── pages/          # Individual view routes
│   ├── router/         # Vue Router configuration
│   ├── services/       # API interaction logic (radarService.ts)
│   ├── stores/         # Pinia state management
│   └── utils/          # Business logic and visualization helpers
├── src-ssr/            # SSR specific server and middlewares
├── test/               # All testing files
│   ├── e2e/            # Playwright End-to-End tests
│   ├── unit/           # Vitest unit and integration tests
│   └── wiremock/       # API mocks and mappings
└── quasar.config.ts    # Main Quasar configuration (SSR, PWA, etc.)
```

---

## 🧩 Key Design Principles

1. **Accessibility by Default**: Every component is designed with semantic HTML and ARIA attributes. We use a custom Pinia store (`stores/accessibility.ts`) to manage user preferences like font scaling and dyslexic-friendly fonts.
2. **Type Safety**: We use **TypeScript** and **Zod** for schema validation. This ensures that the `radar.json` configuration file is always valid and consistent with our data models.
3. **Feature Flags**: Features like "Feedback" are enabled or disabled dynamically based on the presence of environment variables (e.g., `SLACK_WEBHOOK`).
4. **Mockable Dependencies**: All external API calls are isolated in `services/`, making it easy to mock them during testing or local development.
