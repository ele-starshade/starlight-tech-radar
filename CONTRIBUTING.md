# Contributing to Starlight Tech Radar

First off, thank you for considering contributing to Starlight Tech Radar! It's people like you that make open-source a great community.

## 🛠️ Development Setup

1. Fork and clone the repository.
2. Install dependencies: `npm install` (or `yarn`).
3. Start the development server: `npm run dev`.

## 🧪 Testing Requirements

To maintain a high level of quality, we require tests for all new features and bug fixes. We follow the **Testing Pyramid** philosophy: write many fast Unit Tests, a good amount of Integration Tests, and a few critical E2E tests.

### Unit & Integration Testing

We use [Vitest](https://vitest.dev/) for unit and integration testing.

- **Unit Tests**: Write isolated tests for utilities, models, and purely functional logic.
- **Integration Tests**: Write tests to ensure Vue components interact correctly with Pinia stores and Vue Router.
- Place tests in the `test/unit` directory.
- Run unit tests: `npm run test:unit`
- Update snapshots if needed: `npm run test:update`

### End-to-End (E2E) Testing

We use [Playwright](https://playwright.dev/) for E2E testing to simulate real user interactions and catch regressions in critical flows.

- E2E tests live in the `test/e2e` directory.
- **Mocking**: Our application relies on external APIs. We use WireMock (via Docker Compose) to mock these dependencies during E2E tests.
  - Start WireMock: `npm run wiremock:up`
  - Stop WireMock: `npm run wiremock:down`
- Run E2E tests: `npm run test:e2e`
- Use the Playwright UI for debugging: `npm run test:e2e:ui`

*Note: A Merge Request will not be accepted without sufficient test coverage.*

## 🌍 Translating (i18n)

We manage languages using `vue-i18n`. If you'd like to translate the application into a new language or improve an existing translation:

1. Locate the locale files in `src/i18n/`.
2. Add or modify the translation strings.
3. Ensure you follow the correct locale code (e.g., `es-ES`, `fr-FR`, `pt-BR`).
4. Submit a Merge Request with your additions.

## 📝 Code Style & Linting

- We use ESLint and TypeScript for static analysis.
- Run the linter before committing: `npm run lint`
- You can automatically fix many issues with: `npm run lint:fix`
- Type checking is enforced; ensure `npm run type-check` passes.

## 📬 Merge Request Process

1. Ensure all tests and linting pass (`npm run test:all`).
2. Update the `README.md` or `docs/` with details of changes to the interface or behavior.
3. Submit a Merge Request with a clear description of the problem and the proposed solution.
