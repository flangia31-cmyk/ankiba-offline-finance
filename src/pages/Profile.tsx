import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2, Lock, Info, Palette, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { exportData, importData, saveData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Profile() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ankiba-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Données exportées",
      description: "Vos données ont été téléchargées avec succès.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importData(content);
      
      if (success) {
        toast({
          title: "Données importées",
          description: "Vos données ont été restaurées avec succès.",
        });
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description: "Le fichier n'est pas valide.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleEmailBackup = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const backupData = exportData();
      
      const { data, error } = await supabase.functions.invoke('send-backup-email', {
        body: { 
          email: email,
          backupData: backupData
        }
      });

      if (error) throw error;

      toast({
        title: "Sauvegarde envoyée",
        description: `Vos données ont été envoyées à ${email}. Vérifiez votre boîte mail.`,
      });
      setIsEmailDialogOpen(false);
      setEmail("");
    } catch (error: any) {
      console.error("Erreur lors de l'envoi:", error);
      
      // Vérifie si c'est une erreur de validation de domaine Resend
      const errorMessage = error.message || "";
      if (errorMessage.includes("verify a domain") || errorMessage.includes("validation_error")) {
        toast({
          title: "Configuration Resend requise",
          description: "Veuillez vérifier un domaine sur resend.com/domains pour envoyer des emails à toute adresse.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer l'email. Vérifiez votre connexion internet.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleClearData = () => {
    saveData({ transactions: [], goals: [], chargesFixes: [], monthlyBudget: 0 });
    toast({
      title: "Données effacées",
      description: "Toutes vos données ont été supprimées.",
    });
    window.location.reload();
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-sm text-muted-foreground">Gérez vos données et paramètres</p>
        </div>

        {/* App Info */}
        <Card className="p-6 bg-gradient-primary text-white border-0 shadow-glow">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Ankiba</h2>
            <p className="text-white/80">Votre conseiller financier personnel</p>
            <p className="text-white/60 text-sm">Version 1.0.0</p>
          </div>
        </Card>

        {/* Appearance */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Apparence
          </h2>
          
          <Card className="p-4 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Thème</p>
                <p className="text-sm text-muted-foreground">
                  Basculer entre le mode clair et sombre
                </p>
              </div>
              <ThemeToggle />
            </div>
          </Card>
        </div>

        {/* Security */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Sécurité
          </h2>
          
          <Card className="p-4 bg-gradient-card border-border/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Données 100% locales</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Toutes vos données sont stockées uniquement sur votre appareil. 
                  Aucune information n'est envoyée sur Internet. Vous seul avez accès à vos finances.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Management */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Gestion des données</h2>
          
          <Card className="p-4 bg-gradient-card border-border/50">
            <div className="space-y-3">
              <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Sauvegarder par email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sauvegarde par email</DialogTitle>
                    <DialogDescription>
                      Entrez votre adresse email pour recevoir vos données
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleEmailBackup} 
                      className="w-full"
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? "Envoi en cours..." : "Envoyer la sauvegarde"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleExport}
                className="w-full justify-start"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger une copie locale
              </Button>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file">
                  <Button
                    type="button"
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => document.getElementById("import-file")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Restaurer depuis un fichier
                  </Button>
                </label>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Effacer toutes les données
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes vos transactions, objectifs 
                      et données seront définitivement supprimés. Assurez-vous d'avoir 
                      exporté vos données avant de continuer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>
                      Effacer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>

        {/* About */}
        <Card className="p-4 bg-gradient-card border-border/50">
          <h3 className="font-semibold mb-2">À propos</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ankiba est votre assistant personnel pour la gestion financière. 
            Simple, sécurisé et 100% hors ligne, il vous aide à suivre vos dépenses, 
            atteindre vos objectifs d'épargne et recevoir des conseils personnalisés.
          </p>
        </Card>
      </div>
    </Layout>
  );
}
