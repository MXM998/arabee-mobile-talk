import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.adeb78d7fd8e4f2d9bfceb97a6bc7cf7',
  appName: 'arabee-mobile-talk',
  webDir: 'dist',
  server: {
    url: 'https://adeb78d7-fd8e-4f2d-9bfc-eb97a6bc7cf7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2D5A3D',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#D4A574'
    }
  }
};

export default config;