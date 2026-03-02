# Deploying to Netlify

Starlight Tech Radar is a Server-Side Rendered (SSR) application using Quasar and Vite. It is pre-configured for seamless deployment to Netlify using Netlify Functions.

Quasar's SSR server is built on top of standard Node.js HTTP streams (via Express). Because Netlify Functions run in a serverless environment (AWS Lambda under the hood), the incoming requests and responses are mapped using `serverless-http`.

This setup is already handled out of the box via the included `netlify.toml` and the server wrapper in `netlify/functions/server.mjs`.

## Prerequisites

- A [Netlify](https://www.netlify.com/) account.
- Your code hosted on a Git repository (GitHub, GitLab, or Bitbucket).

## Deployment via Git (Recommended)

The easiest way to deploy to Netlify is by connecting your repository. Since the repository is already pre-configured, Netlify will detect the configuration automatically.

1. Log in to your Netlify dashboard.
2. Click **"Add new site"** > **"Import an existing project"**.
3. Connect your Git provider and select your repository.
4. Netlify will auto-detect the build settings based on `netlify.toml` (specifically, it runs `SERVERLESS=true npm run build`).
5. Click **"Deploy Site"**.

## Environment Variables

Since the app relies on environment variables (like `GITHUB_TOKEN` and `SLACK_WEBHOOK`), you must configure these in Netlify:

1. Go to **Site settings** > **Environment variables**.
2. Add your required variables:
   - `SERVERLESS`: Set to `true` (Required for the server to correctly identify the serverless environment).
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token (for fetching license information).
   - `SLACK_WEBHOOK` / `TEAMS_WEBHOOK`: (Optional) Webhook URLs for feedback notifications.
3. Trigger a re-deploy to ensure the functions pick up the new variables.
