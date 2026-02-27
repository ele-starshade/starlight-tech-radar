export interface LocaleOption {
  value: string;
  label: string;
}

export interface AppConfig {
  title: string;
  logo: string;
  githubToken: string;
  githubApiBaseUrl: string;
  gitlabToken: string;
  gitlabApiBaseUrl: string;
  locales: LocaleOption[];
  defaultLocale: string;
  accessibility: {
    defaultDarkMode: boolean;
    defaultFontSizeStep: number;
    defaultDyslexic: boolean;
  };
}

export const appConfig: AppConfig = {
  title: 'Starlight Tech Radar',
  logo: '/icons/starlight-logo.png',
  githubToken: process.env.GITHUB_TOKEN || '',
  githubApiBaseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
  gitlabToken: process.env.GITLAB_TOKEN || '',
  gitlabApiBaseUrl: process.env.GITLAB_API_BASE_URL || 'https://gitlab.com',
  locales: [
    { value: 'en-US', label: 'English' }
  ],
  defaultLocale: 'en-US',
  accessibility: {
    defaultDarkMode: true,
    defaultFontSizeStep: 1,
    defaultDyslexic: false
  }
}
