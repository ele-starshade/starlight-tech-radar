# Getting Started

This guide provides a detailed walkthrough to get the Starlight Tech Radar running locally.

## Prerequisites

- **Node.js**: v24.x is recommended (as specified in `package.json`).
- **Package Manager**: npm, yarn, or pnpm.
- **Docker**: Optional, but required for running WireMock for E2E testing.

## Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd starlight-tech-radar
npm install
```

## Running the Application

To start the application in development mode with hot-code reloading:

```bash
npm run dev
```

By default, this will start the Quasar application using the Server-Side Rendering (SSR) mode.

## Useful Commands

- `npm run dev` - Start development server (SSR).
- `npm run build` - Build the application for production.
- `npm run test:all` - Run type-checking, unit tests, and E2E tests.
- `npm run lint` - Lint the codebase using ESLint.
