import { BiometricAuth, AndroidBiometryStrength } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  error?: string;
  code?: string;
  isNotAvailable?: boolean;
}

/**
 * Vérifie si on est sur une plateforme native
 * Note: La vérification réelle de la disponibilité se fait lors de l'authentification
 */
export async function canUseAuthentication(): Promise<boolean> {
  return Capacitor.isNativePlatform();
}

/**
 * Authentifie l'utilisateur avec la méthode de sécurité configurée sur l'appareil
 * S'adapte automatiquement à la méthode disponible :
 * - Empreinte digitale, Face ID, ou Iris (biométrie)
 * - PIN, schéma, ou mot de passe (device credentials)
 */
export async function authenticateWithBiometric(): Promise<BiometricResult> {
  try {
    await BiometricAuth.authenticate({
      reason: "Authentifiez-vous pour accéder à Ankiba",
      cancelTitle: "Annuler",
      allowDeviceCredential: true,
      iosFallbackTitle: "Utiliser le code",
      androidTitle: "Authentification requise",
      androidSubtitle: "Utilisez votre sécurité habituelle",
      androidConfirmationRequired: false,
    });

    return { success: true };
  } catch (error: any) {
    // Utilisateur a annulé
    if (error?.code === 'userCancel') {
      return { 
        success: false, 
        error: 'Authentification annulée',
        code: error?.code
      };
    }
    
    // Aucune méthode de sécurité configurée sur l'appareil
    const isNotAvailable = 
      error?.code === 'biometryNotAvailable' || 
      error?.code === 'biometryNotEnrolled' ||
      error?.code === 'passcodeNotSet' ||
      error?.code === 'noDeviceCredential';
    
    return { 
      success: false, 
      error: error?.message || 'Échec de l\'authentification',
      code: error?.code,
      isNotAvailable
    };
  }
}

/**
 * Vérifie si on est sur une plateforme native
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
