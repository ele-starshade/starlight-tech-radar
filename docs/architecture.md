# Architecture

Starlight Tech Radar is built as a modern web application focusing on performance, accessibility, and maintainability.

## Technology Stack

- **Framework**: [Vue.js 3](https://vuejs.org/) (Options API)
- **UI Component Library**: [Quasar Framework](https://quasar.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Internationalization (i18n)**: [Vue I18n](https://vue-i18n.intlify.dev/)
- **Accessibility (a11y)**: Built-in WCAG 2.1 AA compliance strategies, including OpenDyslexic font support and dynamic scaling.
- **Tooling**: Vite (via Quasar CLI)
- **Testing Pyramid**:
  - [Vitest](https://vitest.dev/) (Unit & Integration Testing)
  - [Playwright](https://playwright.dev/) (E2E Testing)
  - WireMock (API Mocking)

## Directory Structure

- `/src`: Application source code.
  - `/components`: Reusable Vue components (e.g., RadarCanvas, RadarBlip).
  - `/pages`: View components mapped to routes.
  - `/layouts`: Layout wrappers.
  - `/stores`: Pinia state definitions.
  - `/models` & `/utils`: Business logic and types.
- `/src-ssr`: Server-Side Rendering specific code and middlewares.
- `/test`: All testing related files.
  - `/unit`: Vitest unit tests.
  - `/e2e`: Playwright tests.
  - `/wiremock`: Mocks for external dependencies.
- `/public`: Static assets (icons, etc.).
- `/docs`: Project documentation.
