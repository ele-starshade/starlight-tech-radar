# Deploying to Netlify

While Starlight Tech Radar is a Server-Side Rendered (SSR) application using Quasar and Vite, it can be deployed seamlessly to Netlify using Netlify Edge Functions.

Quasar provides built-in support for generating output compatible with Netlify Edge out of the box.

## Prerequisites

- A [Netlify](https://www.netlify.com/) account.
- The [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed globally (`npm install netlify-cli -g`).
- Your code hosted on a Git repository (GitHub, GitLab, or Bitbucket).

## Preparing the Application

By default, Quasar's SSR mode handles the Node.js server. Your existing `package.json` should already have the correct build script for SSR (`"build": "quasar build -m ssr"`). 

To deploy to Netlify, we use a `netlify.toml` file to map Quasar's SSR output directories to Netlify's expected structure.

### `netlify.toml`

Ensure you have a `netlify.toml` file at the root of your project:

```toml
[build]
  command = "npm run build"
  publish = "dist/ssr/client"

[functions]
  directory = "dist/ssr/server"
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

*(Note: Ensure this aligns with Quasar's specific SSR output directories, which typically output to `dist/ssr/`)*

## Deployment via Git (Recommended)

The easiest way to deploy to Netlify is by connecting your repository:

1. Log in to your Netlify dashboard.
2. Click **"Add new site"** > **"Import an existing project"**.
3. Connect your Git provider and select the `starlight-tech-radar` repository.
4. Netlify will auto-detect the build settings based on `netlify.toml`.
5. Click **"Deploy Site"**.

## Environment Variables

Since the app relies on environment variables (like `GITHUB_TOKEN` and `SLACK_WEBHOOK`), you must configure these in Netlify:

1. Go to **Site settings** > **Environment variables**.
2. Add your required variables.
3. Trigger a re-deploy to ensure the Edge functions pick up the new variables.

## Deployment via Netlify CLI

If you prefer to deploy from your terminal:

1. Login to Netlify CLI:

   ```bash
   netlify login
   ```

2. Build the project locally:

   ```bash
   npm run build
   ```

3. Deploy to Netlify:

   ```bash
   netlify deploy --prod
   ```
