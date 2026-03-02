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

## 📝 Commit Convention & Releases

We use **[Conventional Commits](https://www.conventionalcommits.org/)** to automate our versioning and release process. This means your commit messages must follow a specific format:

- `feat: ...` for new features (triggers a **minor** version bump).
- `fix: ...` for bug fixes (triggers a **patch** version bump).
- `docs: ...` for documentation changes.
- `chore: ...` for maintenance tasks.
- `perf: ...` for performance improvements.
- `refactor: ...` for code changes that neither fix a bug nor add a feature.
- `BREAKING CHANGE: ...` in the footer or `!` after the type/scope for breaking changes (triggers a **major** version bump).

### Automated Releases

When a Merge Request is merged into the `main` branch, our GitLab CI pipeline automatically:

1. Calculates the next version number using **semantic-release**.
2. Generates release notes based on commit messages.
3. Updates `CHANGELOG.md` and `package.json`.
4. Creates a new Git tag and a **GitLab Release**.
5. Uploads build artifacts (the `dist/` directory) as release assets.

## 📬 Merge Request Process

1. Ensure all tests and linting pass (`npm run test:all`).
2. Update the `README.md` or `docs/` with details of changes to the interface or behavior.
3. Submit a Merge Request with a clear description of the problem and the proposed solution.
