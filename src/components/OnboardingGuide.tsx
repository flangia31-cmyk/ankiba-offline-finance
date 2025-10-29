import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Receipt,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
}

const ONBOARDING_KEY = "akbwallet_onboarding_completed";

const steps: OnboardingStep[] = [
  {
    title: "Bienvenue sur AKBWallet 👋",
    description: "Votre conseiller financier personnel qui vous aide à gérer votre argent intelligemment.",
    icon: <Wallet className="w-12 h-12 text-primary" />,
    tips: [
      "Suivez vos revenus et dépenses en temps réel",
      "Obtenez des conseils personnalisés",
      "Atteignez vos objectifs financiers"
    ]
  },
  {
    title: "Gérez vos transactions",
    description: "Ajoutez facilement vos revenus et dépenses depuis l'onglet Transactions.",
    icon: <TrendingUp className="w-12 h-12 text-success" />,
    tips: [
      "Appuyez sur le bouton '+' pour ajouter une transaction",
      "Choisissez entre revenu ou dépense",
      "Catégorisez vos dépenses pour un meilleur suivi"
    ]
  },
  {
    title: "Charges fixes",
    description: "Enregistrez vos charges mensuelles récurrentes pour mieux planifier votre budget.",
    icon: <Receipt className="w-12 h-12 text-destructive" />,
    tips: [
      "Loyer, abonnements, factures...",
      "Elles sont automatiquement déduites de votre solde disponible",
      "Suivez-les dans la section dédiée"
    ]
  },
  {
    title: "Définissez vos objectifs",
    description: "Créez des objectifs d'épargne et suivez votre progression.",
    icon: <Target className="w-12 h-12 text-primary" />,
    tips: [
      "Fixez un montant cible et une date limite",
      "Visualisez votre progression en temps réel",
      "Recevez des encouragements à chaque étape"
    ]
  },
  {
    title: "Analysez vos finances",
    description: "Consultez vos statistiques détaillées pour mieux comprendre vos habitudes.",
    icon: <BarChart3 className="w-12 h-12 text-primary" />,
    tips: [
      "Graphiques de revenus et dépenses",
      "Répartition par catégorie",
      "Évolution sur plusieurs mois"
    ]
  },
  {
    title: "Prêt à commencer ! 🚀",
    description: "Vous avez maintenant toutes les clés pour gérer vos finances efficacement.",
    icon: <Check className="w-12 h-12 text-success" />,
    tips: [
      "Commencez par ajouter vos revenus mensuels",
      "Enregistrez vos charges fixes",
      "Définissez votre premier objectif d'épargne"
    ]
  }
];

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      // Petit délai pour laisser la page se charger
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <div className="flex justify-center mb-4 animate-float">
            {currentStepData.icon}
          </div>
          <DialogTitle className="text-2xl text-center">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {currentStepData.tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gradient-card border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>
            )}
            <Button
              onClick={handleNext}
              size="sm"
              className="bg-gradient-primary text-white"
            >
              {isLastStep ? "Commencer" : "Suivant"}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm"
        >
          Passer
        </button>
      </DialogContent>
    </Dialog>
  );
}
