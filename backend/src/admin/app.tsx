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
    // Disable video tutorials on the homepage
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
    // Inject helpful links into the admin homepage after render
    const originalRender = app.render;
    if (typeof window !== 'undefined') {
      // Add Katy Pride quick links bar after the page loads
      setTimeout(() => {
        const mainContent = document.querySelector('main');
        if (mainContent && !document.getElementById('kp-quick-links')) {
          const linksBar = document.createElement('div');
          linksBar.id = 'kp-quick-links';
          linksBar.innerHTML = `
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); border-radius: 12px; padding: 24px; margin: 24px; color: white;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">🌈 Katy Pride Quick Links</h2>
              <p style="margin: 0 0 16px 0; opacity: 0.85; font-size: 14px;">Manage your website content below, or jump to these tools:</p>
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <a href="https://app.growthsphere360.com" target="_blank" rel="noopener"
                   style="background: white; color: #7c3aed; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 6px;">
                  📊 GrowthSphere360 CRM
                </a>
                <a href="/" target="_blank" rel="noopener"
                   style="background: rgba(255,255,255,0.15); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,255,255,0.3);">
                  🌐 View Website
                </a>
                <a href="https://calendar.google.com" target="_blank" rel="noopener"
                   style="background: rgba(255,255,255,0.15); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,255,255,0.3);">
                  📅 Google Calendar
                </a>
              </div>
            </div>
          `;
          mainContent.prepend(linksBar);
        }
      }, 1500);
    }
  },
};
