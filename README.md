# Starlight Tech Radar

<!-- BADGES -->
![CI/CD Pipeline](https://github.com/ele-starshade/starlight-tech-radar/actions/workflows/ci.yml/badge.svg)
![Coverage](https://sonarcloud.io/api/project_badges/measure?project=starlight-tech-radar_starlight-tech-radar&metric=coverage)
![Latest Release](https://img.shields.io/github/v/release/ele-starshade/starlight-tech-radar)
![Netlify Status](https://api.netlify.com/api/v1/badges/06a85395-4e55-41a6-b4ef-9317a66b8984/deploy-status)
![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=starlight-tech-radar_starlight-tech-radar&metric=alert_status)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
<!-- END BADGES -->

An open-source, highly customizable tech radar inspired by the ThoughtWorks Tech Radar. Built with Vue 3, Quasar Framework, and TypeScript.

## 🌟 Features

- Visualize your technology landscape
- SSR (Server-Side Rendering) Support
- Fully customizable via configuration

## ♿ Accessibility (a11y)

We believe software should be accessible to everyone. The Starlight Tech Radar strives to adhere to **WCAG 2.1 AA** standards.
Accessibility enhancements include:

- **OpenDyslexic Font Support**: An option to switch the application font to OpenDyslexic, which is designed to mitigate some of the common reading errors caused by dyslexia.
- **Dynamic Font Scaling**: Native support for increasing or decreasing font sizes across the entire application without breaking the layout.
- **Keyboard Navigation**: Full support for screen readers and keyboard-only navigation.

## 🌍 Internationalization (i18n)

The application supports multiple languages using `vue-i18n`. We welcome contributions to translate the radar into different languages. Here are some of the target languages we aim to support:

| Language             | Locale Code | % Complete |
| -------------------- | ----------- | ---------- |
| English              | `en-US`     | 100%       |
| Spanish              | `es-ES`     | 0%         |
| French               | `fr-FR`     | 0%         |
| German               | `de-DE`     | 0%         |
| Chinese (Simplified) | `zh-CN`     | 0%         |
| Japanese             | `ja-JP`     | 0%         |
| Portuguese (Brazil)  | `pt-BR`     | 0%         |

## 🧪 Testing Pyramid

Our project maintains a strong testing culture, adhering to the standard Testing Pyramid to balance speed and confidence:

- **E2E Tests (Playwright)**: We run End-to-End tests to verify critical user journeys. Mocking of external services is handled via WireMock.
- **Integration Tests (Vitest)**: Testing the interaction between Vue components and Pinia stores.
- **Unit Tests (Vitest)**: Fast, isolated tests for our utility functions and models.

## 📚 Documentation

For detailed explanations, architecture, and guides, please visit our [Documentation Folder](./docs/README.md).

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- npm, yarn, or pnpm

### Installation

```bash
npm install
# or
yarn
```

### Development

```bash
npm run dev
# or
yarn dev
```

## 🤝 Contributing

We love contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started with development, testing, and merge requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
