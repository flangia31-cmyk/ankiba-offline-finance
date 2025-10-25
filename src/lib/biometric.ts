import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * Vérifie si une méthode de sécurité est disponible sur l'appareil
 * (empreinte, Face ID, PIN, schéma, mot de passe)
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
 * Authentifie l'utilisateur avec la méthode de sécurité configurée sur l'appareil
 * - Empreinte digitale si disponible
 * - Face ID si disponible (iOS)
 * - PIN, schéma ou mot de passe comme fallback (allowDeviceCredential: true)
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
