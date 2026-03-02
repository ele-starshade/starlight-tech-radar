# Configuration

The Starlight Tech Radar is designed to be highly customizable. The application's data is driven by a configuration file, while its features and integrations are controlled via environment variables.

## Tech Radar Data

The core data of your Tech Radar is located in `src/data/radar.json`. This file defines the structure of the radar and the technologies (blips) displayed on it.

### Modifying Quadrants and Rings

By default, the radar uses the ThoughtWorks standard:

- **Quadrants**: Techniques, Platforms, Tools, Languages & Frameworks
- **Rings**: Adopt, Trial, Assess, Hold

If you wish to customize these categories, you must update two files to ensure the application maintains type safety and validation:

1. **`src/data/radar.json`**: Update the `quadrants` and `rings` arrays at the root of the JSON file.
2. **`src/models/radar.ts`**: Update the Zod schemas (`QuadrantEnum` and `RingEnum`) to reflect your new values.

*Note: If you change the names of the quadrants, you may also need to update the translation keys mapped in `getQuadrantTranslationKey` within `src/models/radar.ts` and the corresponding locale files in `src/i18n/`.*

### Adding or Editing Blips

To add a new technology to your radar, add a new object to the `blips` array in `src/data/radar.json`.

Each blip requires the following properties:

- `name` (string): The name of the technology.
- `quadrant` (string): Must exactly match one of your defined quadrants.
- `ring` (string): Must exactly match one of your defined rings.
- `isNew` (boolean): Set to `true` to highlight the blip as recently added or changed.
- `description` (string): A short summary of the technology and why it's placed there.
- `repoUrl` (string): A valid URL pointing to the source code repository (e.g., GitHub, GitLab).
- `guidanceLink` (string): A valid URL pointing to your organization's internal guidance, or official documentation.

## Application Configuration & Integrations

The application utilizes environment variables (which can be set in an `.env` file during development) to manage features like the Feedback mechanism and API rate limiting.

These settings are mapped in `src/config/index.ts`.

### Enabling the Feedback Feature

The Tech Radar includes a feedback feature that allows users to submit thoughts or suggestions about specific blips. This feature integrates with Microsoft Teams or Slack via webhooks.

To enable the feedback functionality, you must provide at least one webhook URL in your environment variables:

```env
# Enable Teams Feedback
TEAMS_WEBHOOK=https://your-teams-webhook-url

# Enable Slack Feedback
SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

When either (or both) of these variables are present, the `isFeedbackEnabled` flag is set to `true`, and the feedback dialog will become accessible in the user interface.

### Repository Metadata (Tokens)

The application attempts to fetch license and repository metadata (like Blue Oak ratings) automatically based on the `repoUrl` provided in `radar.json`. To prevent rate limiting from GitHub or GitLab, you should provide API tokens:

```env
GITHUB_TOKEN=your_github_personal_access_token
GITLAB_TOKEN=your_gitlab_personal_access_token
```

By default, the application uses the public APIs (`https://api.github.com` and `https://gitlab.com`). If you are using enterprise/self-hosted instances, you can override the base URLs:

```env
GITHUB_API_BASE_URL=https://github.yourcompany.com/api/v3
GITLAB_API_BASE_URL=https://gitlab.yourcompany.com
```
