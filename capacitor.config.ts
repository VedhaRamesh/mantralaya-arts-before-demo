import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mantralayaarts.app',
  appName: 'Mantralaya Arts',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#701A1E',
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;
