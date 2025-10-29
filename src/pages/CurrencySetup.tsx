import { useState } from "react";
import { setCurrency, CURRENCIES } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet } from "lucide-react";

interface CurrencySetupProps {
  onComplete: () => void;
}

export default function CurrencySetup({ onComplete }: CurrencySetupProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  const handleConfirm = () => {
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 space-y-8 bg-gradient-card border-border/50 shadow-glow animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-gradient-primary shadow-glow">
            <Wallet className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bienvenue dans AKBWallet 👋
          </h1>
          <p className="text-muted-foreground">
            Avant de commencer, choisissez votre devise principale :
          </p>
        </div>

        {/* Currency Selector */}
        <div className="space-y-4">
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-full h-14 text-lg border-border/50 bg-background/50">
              <SelectValue placeholder="Sélectionnez votre devise" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code} className="text-lg py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <div className="font-semibold">{currency.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {currency.code} - {currency.symbol}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground text-center">
              ⚠️ <strong>Important :</strong> Ce choix est définitif et ne pourra pas être modifié depuis l'application.
            </p>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirm}
          disabled={!selectedCurrency}
          className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Confirmer ma devise
        </Button>
      </Card>
    </div>
  );
}
