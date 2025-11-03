import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  error?: string;
  code?: string;
  isNotAvailable?: boolean;
}

/**
 * Vérifie si l'appareil a une méthode de sécurité configurée
 * Vérifie à la fois la biométrie ET les device credentials (PIN/schéma/password)
 */
export async function canUseAuthentication(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await BiometricAuth.checkBiometry();
    // deviceIsSecure = true si PIN, pattern, password, ou biométrie configuré
    return result.isAvailable || result.deviceIsSecure;
  } catch (error) {
    console.error('Erreur lors de la vérification de la sécurité:', error);
    return false;
  }
}

/**
 * Authentifie l'utilisateur avec la méthode de sécurité configurée sur l'appareil
 * S'adapte automatiquement à la méthode disponible :
 * - Empreinte digitale, Face ID, ou Iris (biométrie)
 * - PIN, schéma, ou mot de passe (device credentials)
 */
export async function authenticateWithBiometric(): Promise<BiometricResult> {
  try {
    console.log('[BIOMETRIC] Début authentification...');
    
    // Vérifier d'abord ce qui est disponible
    const check = await BiometricAuth.checkBiometry();
    console.log('[BIOMETRIC] Statut sécurité:', JSON.stringify(check, null, 2));
    
    // Configuration de l'authentification
    const authConfig = {
      reason: "Authentifiez-vous pour accéder à Ankiba",
      cancelTitle: "Annuler",
      allowDeviceCredential: true, // ✅ Permet PIN/schéma/mot de passe
      iosFallbackTitle: "Utiliser le code",
      androidTitle: "Ankiba",
      androidSubtitle: "Authentification requise",
      androidConfirmationRequired: false, // ✅ Pas de confirmation supplémentaire
      androidMaxAttempts: -1, // ✅ Pas de limite de tentatives
    };
    
    console.log('[BIOMETRIC] Config auth:', JSON.stringify(authConfig, null, 2));
    
    await BiometricAuth.authenticate(authConfig);
    
    console.log('[BIOMETRIC] ✅ Authentification réussie');
    return { success: true };
  } catch (error: any) {
    console.error('[BIOMETRIC] ❌ Erreur:', error);
    
    // L'utilisateur a annulé
    if (error?.code === 'userCancel' || error?.code === 'authenticationCanceled') {
      return { 
        success: false, 
        error: 'Authentification annulée',
        code: error?.code
      };
    }
    
    // Aucune méthode de sécurité configurée
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
