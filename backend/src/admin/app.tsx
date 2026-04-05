import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
    // Custom translations for Katy Pride branding
    translations: {
      en: {
        'app.components.LeftMenu.navbrand.title': 'Katy Pride',
        'app.components.LeftMenu.navbrand.workplace': 'Content Manager',
        'Auth.form.welcome.title': 'Welcome to Katy Pride',
        'Auth.form.welcome.subtitle': 'Log in to manage your website content',
        'HomePage.head.title': 'Katy Pride Dashboard',
      },
    },
    // Disable tutorials and guided tours
    tutorials: false,
    notifications: { releases: false },
    // Custom theme with Katy Pride purple
    theme: {
      light: {
        colors: {
          primary100: '#f3e8ff',
          primary200: '#e9d5ff',
          primary500: '#9333ea',
          primary600: '#7c3aed',
          primary700: '#6d28d9',
          buttonPrimary500: '#9333ea',
          buttonPrimary600: '#7c3aed',
        },
      },
      dark: {
        colors: {
          primary100: '#3b0764',
          primary200: '#4c1d95',
          primary500: '#a855f7',
          primary600: '#9333ea',
          primary700: '#7c3aed',
          buttonPrimary500: '#a855f7',
          buttonPrimary600: '#9333ea',
        },
      },
    },
  },
  bootstrap(app: StrapiApp) {
    // Minimal bootstrap - just log for debugging
    console.log('[Katy Pride] Admin app bootstrapped');
  },
};
