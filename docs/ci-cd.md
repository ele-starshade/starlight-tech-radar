# CI/CD & Pipeline Architecture

Starlight Tech Radar uses GitHub Actions to automate its development lifecycle, from code quality and testing to releases and performance monitoring.

## 🏗️ Pipeline Overview

Our CI/CD architecture is composed of three primary workflows that run on every pull request and on pushes to the `main` branch.

---

### 1. Tests & Coverage (`tests.yml`)

This is the most comprehensive workflow, ensuring that the code is functional and that changes do not introduce regressions.

- **Build Job**: Compiles the application in SSR mode with coverage instruments enabled (`VITE_COVERAGE=true`).
- **Unit Test Job**: Runs Vitest suite and generates unit coverage.
- **E2E Test Job**:
  - Downloads build artifacts.
  - Spins up a standalone **WireMock** instance to mock external APIs (GitHub, GitLab, Slack, Teams).
  - Executes Playwright tests inside the `playwright:v1.58.2-noble` container.
- **Coverage Report**: Merges unit and E2E coverage results using `nyc` to produce a combined Cobertura and LCOV report.
- **SonarScan**: Performs a deep code analysis and uploads coverage reports to **SonarCloud** (runs only on `main`).

---

### 2. Code Quality (`quality.yml`)

A fast-feedback loop for linting and type-safety.

- **Lint Code**: Runs `eslint` to enforce the project's coding standards.
- **Type Check**: Uses `vue-tsc` to perform static analysis and ensure TypeScript type safety.
- **Security Audit**: Runs `npm audit` to check for known vulnerabilities in dependencies.

---

### 3. Performance & Accessibility (`performance.yml`)

We monitor the application's speed and accessibility standards automatically.

- **Lighthouse CI**: Runs a full Lighthouse audit (5 runs) against a production build.
- **Badge Generation**: Generates Lighthouse score badges (Performance, Accessibility, Best Practices, SEO) for the `README.md`.
- **Badge Deployment**: On pushes to `main`, updated badges are automatically pushed to a dedicated `badges` branch for public rendering.

---

## 📦 Manual Releases

We use **[semantic-release](https://github.com/semantic-release/semantic-release)** to handle our versioning and release process. **Note that releases are triggered manually** via GitHub Actions to ensure full control over the versioning lifecycle.

### How to trigger a release

1. Navigate to the **Actions** tab in GitHub.
2. Select the **Manual Release** workflow.
3. Click **"Run workflow"** and choose the `main` branch.
4. (Optional) Enable the `dry_run` option to see what version would be generated without actually committing.

### How it works

1. **Commit Analysis**: Analyzes commit messages since the last release.
2. **Versioning**: Determines the next semantic version.
3. **Changelog**: Automatically updates `CHANGELOG.md`.
4. **GitHub Release**: Creates a new Git tag and GitHub Release with build artifacts (`dist.tar.gz`).
5. **Metadata Update**: Updates `package.json` and `sonar-project.properties`.

### Commit Types & Bumps

- `feat`: Minor version bump (e.g., `1.1.0` -> `1.2.0`).
- `fix`: Patch version bump (e.g., `1.1.0` -> `1.1.1`).
- `perf`: Patch version bump.
- `BREAKING CHANGE`: Major version bump (e.g., `1.1.0` -> `2.0.0`).

---

## 🛠️ Summary of Pipeline Tools

| Tool | Purpose |
| :--- | :--- |
| **GitHub Actions** | Workflow orchestration. |
| **Vitest** | Unit and integration tests. |
| **Playwright** | E2E testing and browser automation. |
| **WireMock** | API mocking for external dependencies. |
| **Lighthouse CI** | Performance and accessibility auditing. |
| **SonarCloud** | Code quality and security analysis. |
| **Semantic Release** | Automated versioning and changelog generation. |
| **Husky** | Git hooks (Pre-commit linting). |
