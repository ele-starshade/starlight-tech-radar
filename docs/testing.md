# Testing Guide

Starlight Tech Radar emphasizes a robust testing strategy to ensure reliability, accessibility, and high performance. We follow the **Testing Pyramid**, which balances different testing layers: many fast unit tests, a significant number of integration tests, and critical End-to-End (E2E) journeys.

## 🧪 Testing Pyramid

### 1. Unit & Integration Testing (Vitest)

We use [Vitest](https://vitest.dev/) for unit and integration testing. These tests are fast, run in a JSDOM environment, and focus on individual functions, models, and UI components.

- **Unit Tests**: Focus on business logic in `/src/utils`, `/src/models`, and `/src/services`.
- **Integration Tests**: Verify the interaction between Vue components, Pinia stores, and Vue Router.

**Commands:**

```bash
# Run all unit and integration tests
npm run test:unit

# Run tests in watch mode for development
npm run test:unit:watch

# Update test snapshots
npm run test:update
```

**Location:** `test/unit/`

---

### 2. End-to-End (E2E) Testing (Playwright)

We use [Playwright](https://playwright.dev/) for E2E testing to simulate real user behavior in a headless browser (Chromium).

- **Coverage**: Critical user journeys, including radar interaction, font-scaling, and feedback submission.
- **Accessibility**: We use `@axe-core/playwright` to perform automated accessibility audits as part of our E2E suite.

**Mocking with WireMock:**
Our application depends on external services (GitHub API, Slack webhooks). To ensure deterministic results and avoid rate-limiting, we use **WireMock** to mock these APIs.

- **Setup**: WireMock runs in a Docker container and serves JSON responses defined in `test/wiremock/mappings/`.
- **Usage**:

  ```bash
  # Start WireMock
  npm run wiremock:up

  # Run E2E tests
  npm run test:e2e

  # Stop WireMock
  npm run wiremock:down
  ```

**Location:** `test/e2e/`

---

### 3. Performance Testing (Lighthouse CI)

We use [Lighthouse CI (LHCI)](https://github.com/GoogleChrome/lighthouse-ci) to ensure the application remains fast and accessible.

- **Metrics**: Performance, Accessibility, Best Practices, and SEO.
- **CI/CD Integration**: Every Pull Request triggers a Lighthouse audit. If the scores fall below our defined thresholds, the build fails.

**Thresholds:**

- **Performance**: 80+
- **Accessibility**: 90+
- **Best Practices**: 90+

**Commands:**

```bash
# Run the full production performance audit locally
npm run test:perf:all
```

The `test:perf:all` script builds the production SSR application, starts the server, runs `lhci autorun`, and then cleans up.

---

## 🔍 Code Coverage

We aim for high code coverage (90%+) across the codebase.

- **Collection**: Coverage is collected during both Unit and E2E tests.
- **Combined Report**: Our CI pipeline merges these results to provide a holistic view of the project's health.
- **Tools**: `v8` for unit tests and `istanbul` for E2E tests, combined via `nyc`.

---

## 🛠️ Summary of Testing Commands

| Command | Description |
| :--- | :--- |
| `npm run test:unit` | Runs Vitest unit and integration tests. |
| `npm run test:e2e` | Runs Playwright E2E tests (Requires WireMock). |
| `npm run test:perf:all` | Runs Lighthouse CI performance audit on production build. |
| `npm run test:all` | Runs type-checking, unit tests, and E2E tests. |
| `npm run type-check` | Performs TypeScript type-checking using `vue-tsc`. |
