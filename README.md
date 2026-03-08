# Starlight Tech Radar

<!-- BADGES -->
![Tests & Coverage](https://github.com/ele-starshade/starlight-tech-radar/actions/workflows/tests.yml/badge.svg)
![Code Quality](https://github.com/ele-starshade/starlight-tech-radar/actions/workflows/quality.yml/badge.svg)
![Latest Release](https://img.shields.io/github/v/release/ele-starshade/starlight-tech-radar)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

![Coverage](https://sonarcloud.io/api/project_badges/measure?project=starlight-tech-radar_starlight-tech-radar&metric=coverage)
![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=starlight-tech-radar_starlight-tech-radar&metric=alert_status)

![Performance](https://raw.githubusercontent.com/ele-starshade/starlight-tech-radar/badges/lighthouse_performance.svg)
![Accessibility](https://raw.githubusercontent.com/ele-starshade/starlight-tech-radar/badges/lighthouse_accessibility.svg)
![Best Practices](https://raw.githubusercontent.com/ele-starshade/starlight-tech-radar/badges/lighthouse_best-practices.svg)
<!-- END BADGES -->

Starlight Tech Radar is an open-source, highly customizable, and **accessible** technology radar. Inspired by the ThoughtWorks Tech Radar, it's designed to help engineering organizations visualize their technology landscape, manage lifecycle stages, and drive architectural alignment.

---

## 🚀 Key Features

- **Interactive Visualization**: A high-performance SVG radar canvas with interactive blips, tooltips, and detailed views.
- **Server-Side Rendering (SSR)**: Built for speed, SEO, and accessibility using Vue 3 and Quasar.
- **Accessibility (a11y) First**:
  - **WCAG 2.1 AA** compliance.
  - **OpenDyslexic Font Support** and dynamic font scaling.
  - Full keyboard and screen reader navigation.
- **Dynamic Configuration**: Easily customize quadrants, rings, and blips via a simple `radar.json` file.
- **Feedback Loop**: Integrated feedback mechanism that hooks into **Slack** or **Microsoft Teams** via webhooks.
- **Automated Insights**: Automatically fetches license ratings and repository metadata (via Blue Oak Council) for your technology blips.

---

## 🧩 Core Technology Stack

- **Frontend**: [Vue.js 3](https://vuejs.org/) & [Quasar Framework](https://quasar.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit), [Playwright](https://playwright.dev/) (E2E), [WireMock](https://wiremock.org/) (Mocking)
- **Pipeline**: GitHub Actions, Lighthouse CI, SonarCloud, Semantic Release

---

## 📚 Documentation

For comprehensive guides on architecture, testing, configuration, and deployment, visit our **[Documentation Hub](./docs/README.md)**.

- **[Getting Started](./docs/getting-started.md)**: Local installation and core commands.
- **[Architecture](./docs/architecture.md)**: Detailed project structure and SSR design.
- **[Configuration Guide](./docs/configuration.md)**: How to customize your radar's data and integrations.
- **[Testing Guide](./docs/testing.md)**: Unit, E2E, and Performance testing.
- **[CI/CD & Pipeline](./docs/ci-cd.md)**: Pipeline architecture and automated releases.
- **[Deployment](./docs/deployment/README.md)**: Deploying to AWS, GCP, K8s, and Netlify.

---

## 🏁 Quick Start

### Prerequisites

- **Node.js 24+**
- Docker (Optional, for E2E mocking)

### Installation

```bash
git clone https://github.com/ele-starshade/starlight-tech-radar.git
cd starlight-tech-radar
npm install
npx playwright install
```

### Development

```bash
npm run dev
```

---

## 🤝 Contributing

We love contributions! Whether you're fixing a bug, adding a new feature, or improving documentation, please read our **[Contributing Guidelines](CONTRIBUTING.md)** to get started.

- Follow **Conventional Commits** for all PRs.
- Ensure all tests pass: `npm run test:all`.
- Maintain high accessibility standards.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
