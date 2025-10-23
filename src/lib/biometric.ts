import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * Vérifie si la biométrie est disponible sur l'appareil
 */
export async function checkBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch (error) {
    console.error('Erreur lors de la vérification de la biométrie:', error);
    return false;
  }
}

/**
 * Authentifie l'utilisateur avec la biométrie
 */
export async function authenticateWithBiometric(): Promise<BiometricResult> {
  try {
    await BiometricAuth.authenticate({
      reason: "Authentifiez-vous pour accéder à Ankiba",
      cancelTitle: "Annuler",
      allowDeviceCredential: true,
      iosFallbackTitle: "Utiliser le code",
      androidTitle: "Authentification Ankiba",
      androidSubtitle: "Utilisez votre empreinte ou Face ID",
    });

    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || 'Échec de l\'authentification' 
    };
  }
}

/**
 * Vérifie si on est sur une plateforme native
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
