import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, Lock, Smartphone } from "lucide-react";
import { authenticateWithBiometric, checkBiometricAvailable, isNativePlatform } from "@/lib/biometric";
import { useToast } from "@/hooks/use-toast";

interface BiometricLockProps {
  onUnlock: () => void;
}

export default function BiometricLock({ onUnlock }: BiometricLockProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    setIsChecking(true);
    
    // Si on n'est pas sur une plateforme native, on déverrouille automatiquement
    if (!isNativePlatform()) {
      onUnlock();
      return;
    }

    const available = await checkBiometricAvailable();
    setBiometricAvailable(available);
    setIsChecking(false);

    // Si pas de sécurité configurée, débloquer automatiquement
    if (!available) {
      toast({
        title: "Accès autorisé",
        description: "Aucune sécurité configurée sur l'appareil",
      });
      onUnlock();
      return;
    }

    // Lancer l'authentification automatiquement si disponible
    if (available) {
      handleAuthenticate();
    }
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    
    const result = await authenticateWithBiometric();
    
    if (result.success) {
      toast({
        title: "Authentification réussie",
        description: "Bienvenue dans Ankiba !",
      });
      onUnlock();
    } else {
      toast({
        title: "Échec de l'authentification",
        description: result.error || "Veuillez réessayer",
        variant: "destructive",
      });
    }
    
    setIsAuthenticating(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
        <Card className="w-full max-w-md p-8 text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold">Vérification...</h2>
          <p className="text-muted-foreground">Préparation de la sécurité</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <Card className="w-full max-w-md p-8 text-center space-y-6 animate-scale-in">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
          {biometricAvailable ? (
            <Fingerprint className="w-12 h-12 text-white" />
          ) : (
            <Lock className="w-12 h-12 text-white" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Ankiba
          </h1>
          <p className="text-sm text-muted-foreground">
            Votre conseiller financier personnel
          </p>
        </div>

        {biometricAvailable ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Utilisez votre méthode de sécurité habituelle pour accéder à vos données
            </p>
            <p className="text-xs text-muted-foreground">
              (Empreinte, Face ID, PIN, schéma ou mot de passe)
            </p>
            <Button
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              size="lg"
            >
              {isAuthenticating ? (
                <>
                  <Lock className="w-5 h-5 mr-2 animate-pulse" />
                  Authentification...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 mr-2" />
                  S'authentifier
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Aucune méthode de sécurité n'est configurée sur cet appareil.
              Accès direct autorisé.
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            🔒 Vos données restent 100% locales et sécurisées
          </p>
        </div>
      </Card>
    </div>
  );
}
