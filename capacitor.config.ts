import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d32eff7a55044835942df7b4dba62901',
  appName: 'ankiba-offline-finance',
  webDir: 'dist',
  server: {
    url: 'https://d32eff7a-5504-4835-942d-f7b4dba62901.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BiometricAuth: {
      androidTitle: "Authentification Ankiba",
      androidSubtitle: "Utilisez votre empreinte ou Face ID",
      androidDescription: "Sécurisez l'accès à vos données financières",
      allowDeviceCredential: true
    }
  }
};

export default config;
