# Starlight Tech Radar - Implementation Todo List

Based on the [ROADMAP.md](ROADMAP.md), here is the progress of the project.

## Phase 1: Core Scaffolding and Infrastructure
- [x] Initialize Quasar CLI with Vue 3 and SSR support.
- [x] Configure TypeScript to support Vue Options API.
- [x] Implement Zod schemas for data validation (`src/models/radar.ts`).
- [x] Create baseline JSON data structure (`src/data/radar.json`).
- [x] Set up Pinia store for radar data management.

## Phase 2: Mathematical Visualization and UI Rendering
- [x] Implement polar-to-Cartesian coordinate translation logic.
- [x] Develop SVG canvas component for radar visualization.
- [x] Implement collision detection for blip placement.
- [x] Create interactive SVG blip nodes with hover states.
- [x] Integrate Quasar `<q-tooltip>` and `<q-card>` for blip metadata display.
- [x] Replace current card-based list on IndexPage with the SVG Radar.
- [x] Implement ability to click the blip that pops up a modal that allows for some interaction in future.

## Phase 3: External API Integrations and Interaction Design
- [x] Implement server-side middleware for GitHub REST API (License fetching).
- [x] Implement server-side middleware for GitLab REST API (License fetching).
- [x] Integrate Blue Oak Council license ratings.

## Phase 4: Feedback Modal functionality
- [ ] Implement Feedback modal (`<q-dialog>`).
- [ ] Set up Microsoft Teams Webhook integration using Adaptive Cards.

## Phase 4: Accessibility and Theming
- [x] Implement dynamic font scaling (200% scaling support).
- [x] Integrate OpenDyslexic typeface with global toggle.
- [x] Configure Quasar Dark plugin support.
- [x] Add Dark/Light mode toggle in Settings page (Currently hardcoded to Dark).
- [ ] Implement comprehensive ARIA labels and descriptions for SVG elements.
- [x] Implement multi-language support (i18n).

## Phase 5: Quality Assurance and Documentation
- [x] Set up Vitest for unit testing data transformations.
- [x] Set up Playwright for E2E testing with WireMock mock server (docker composable).
- [x] Integrate `axe-core` and `axe-core/playwright` for automated accessibility audits.
- [ ] Author comprehensive README.md with deployment guides (K8s, GCP, AWS, Netlify).
- [x] Assign permissive open-source license (MIT).
- [x] Add husky for pre commit hooks for unit testing, linting, etc.

## Current Status Summary
The project has a solid foundation with SSR, TypeScript, and Zod validation. Accessibility features like font scaling and OpenDyslexic are already implemented. The primary next steps involve the **Mathematical Visualization (Phase 2)** and **External API Integrations (Phase 3)**.
