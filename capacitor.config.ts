import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ankiba.app',
  appName: 'ankiba',
  webDir: 'dist',
  android: {
    minSdkVersion: 22,
    compileSdkVersion: 35
  }
};

export default config;
