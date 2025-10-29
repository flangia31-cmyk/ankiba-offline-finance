import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ankiba.app',
  appName: 'AKBWallet',
  webDir: 'dist',
  android: {
    minSdkVersion: 22,
    compileSdkVersion: 35
  }
};

export default config;
