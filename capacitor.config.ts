import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dopewars98.game',
  appName: 'Dope Wars 98',
  // Vite builds to dist/; `npx cap sync` copies this into the native shell.
  webDir: 'dist',
};

export default config;
