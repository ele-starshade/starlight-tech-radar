# Contributing to Starlight Tech Radar

Thank you for considering contributing to Starlight Tech Radar! We welcome contributions of all kinds: from fixing bugs and adding features to improving documentation and translations.

---

## 🚀 Getting Started

1. **Fork and Clone**: Fork the repository on GitHub and clone it to your local machine.
2. **Environment Setup**:
    - Ensure you have **Node.js 24+** installed.
    - Install dependencies: `npm install`
    - Install Playwright browsers: `npx playwright install`
3. **Local Development**:
    - Start the development server (SSR): `npm run dev`
    - The app will be available at `http://localhost:3000`.

---

## 🛠️ Development Workflow

We follow a standard Git workflow:

- **Branching**: Create a feature branch from `main` (e.g., `feat/add-new-quadrant` or `fix/blip-alignment`).
- **Commit Convention**: We use **Conventional Commits**. This is critical for our automated release process.
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation changes
  - `perf:` Performance improvements
  - `refactor:` Code refactoring
  - `chore:` Maintenance
  - `test:` Adding or fixing tests
- **Linting**: Run `npm run lint` before committing. We use Husky to prevent commits with linting errors.

---

## 🧪 Testing Requirements

We take testing seriously. A Pull Request will not be accepted without sufficient test coverage.

### 1. Unit & Integration (Vitest)

All new business logic or components **must** have corresponding tests in `test/unit/`.

```bash
# Run unit tests
npm run test:unit
```

### 2. End-to-End (E2E) & Mocking (Playwright + WireMock)

For changes that affect user flow or accessibility, update the Playwright tests in `test/e2e/`.

Since we rely on external APIs, we use **WireMock** to mock these during E2E testing.

```bash
# Start the mocking server
npm run wiremock:up

# Run E2E tests
npm run test:e2e

# Stop mocking server
npm run wiremock:down
```

---

## 🏁 Pipeline Architecture

When you open a Pull Request, our GitHub Actions pipeline will:

1. **Code Quality**: Lint the code and perform TypeScript type-checking.
2. **Tests & Coverage**: Run all unit and E2E tests and combine the coverage results.
3. **Performance Audit**: Run a Lighthouse audit. If the performance scores fall below our threshold, the PR will fail.
4. **SonarCloud**: Analyze code for maintainability, security, and complexity.

Detailed information about the pipeline can be found in [docs/ci-cd.md](./docs/ci-cd.md).

---

## 🌍 Translations (i18n)

If you'd like to add a new language:

1. Locate `src/i18n/`.
2. Copy the `en-US` directory and rename it to your target locale code (e.g., `es-ES`).
3. Translate the strings in `index.ts`.
4. Register the new locale in `src/i18n/index.ts`.

---

## 📝 Pull Request Process

1. **Ensure all tests pass**: Run `npm run test:all`.
2. **Update Docs**: If you change the API, configuration schema, or UI behavior, update the corresponding file in `docs/`.
3. **Describe your changes**: Provide a clear description of the problem you're solving and how you've solved it.
4. **Link Issues**: If your PR fixes a specific issue, mention it (e.g., `Fixes #123`).

Once your PR is merged, a maintainer can manually trigger the **Manual Release** workflow via the GitHub Actions tab. We utilize **semantic-release** to calculate the next version, update the changelog, and create a GitHub Release based on your commit history.
