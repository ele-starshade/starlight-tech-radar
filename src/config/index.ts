export interface LocaleOption {
  value: string;
  label: string;
}

export interface AppConfig {
  title: string;
  logo: string;
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
