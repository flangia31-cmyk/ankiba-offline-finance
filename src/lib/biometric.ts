import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  error?: string;
  code?: string;
  isNotAvailable?: boolean; // true si aucune méthode de sécurité n'est configurée
}

/**
 * Vérifie si une méthode d'authentification est disponible
 * Note: On ne peut pas détecter les credentials (PIN/schéma) avant l'authentification
 * La seule façon de savoir est d'essayer d'authentifier
 */
export async function canUseAuthentication(): Promise<boolean> {
  // Sur plateforme native, on suppose toujours qu'une méthode peut être disponible
  // L'authentification nous dira si rien n'est configuré
  return Capacitor.isNativePlatform();
}

/**
 * Authentifie l'utilisateur avec la méthode de sécurité configurée sur l'appareil
 * - Empreinte digitale si disponible
 * - Face ID si disponible (iOS)
 * - PIN, schéma ou mot de passe (allowDeviceCredential: true)
 */
export async function authenticateWithBiometric(): Promise<BiometricResult> {
  try {
    await BiometricAuth.authenticate({
      reason: "Authentifiez-vous pour accéder à Ankiba",
      cancelTitle: "Annuler",
      allowDeviceCredential: true, // ✅ Permet PIN, schéma, mot de passe en plus de la biométrie
      iosFallbackTitle: "Utiliser le code",
      androidTitle: "Authentification Ankiba",
      androidSubtitle: "Utilisez votre méthode de sécurité habituelle",
    });

    return { success: true };
  } catch (error: any) {
    // Si aucune méthode de sécurité n'est configurée sur l'appareil
    const isNotAvailable = 
      error?.code === 'biometryNotAvailable' || 
      error?.code === 'biometryNotEnrolled' ||
      error?.code === 'notAvailable' ||
      error?.message?.includes('not available') ||
      error?.message?.includes('not enrolled');
    
    return { 
      success: false, 
      error: error?.message || 'Échec de l\'authentification',
      code: error?.code,
      isNotAvailable // Indique si aucune sécurité n'est configurée
    };
  }
}

/**
 * Vérifie si on est sur une plateforme native
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
