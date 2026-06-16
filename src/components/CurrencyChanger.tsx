import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Coins, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CURRENCIES, getCurrency, convertAllAmounts } from "@/lib/storage";
import { fetchExchangeRate } from "@/lib/exchange";
import { useToast } from "@/hooks/use-toast";

export function CurrencyChanger() {
  const { toast } = useToast();
  const current = getCurrency() || "KMF";
  const currentCurrency = CURRENCIES.find((c) => c.code === current);

  const [target, setTarget] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [confirmRate, setConfirmRate] = useState<number | null>(null);

  const targetCurrency = CURRENCIES.find((c) => c.code === target);

  const handlePreview = async () => {
    if (!target || target === current) return;
    setLoading(true);
    try {
      const { rate } = await fetchExchangeRate(current, target);
      setConfirmRate(rate);
    } catch (err) {
      toast({
        title: "Conversion impossible",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (confirmRate == null) return;
    convertAllAmounts(confirmRate, target);
    toast({
      title: "Devise mise à jour",
      description: `Tous vos montants ont été convertis en ${targetCurrency?.name}.`,
    });
    setConfirmRate(null);
    window.location.reload();
  };

  return (
    <Card className="p-4 bg-gradient-card border-border/50 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Coins className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">Devise actuelle</p>
          <p className="text-sm text-muted-foreground">
            {currentCurrency ? `${currentCurrency.flag} ${currentCurrency.name} (${currentCurrency.symbol})` : current}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Convertir vers une autre devise</p>
        <p className="text-xs text-muted-foreground">
          Les montants seront recalculés selon les cours mondiaux en temps réel (connexion requise).
        </p>
        <div className="flex gap-2">
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choisir une devise" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {CURRENCIES.filter((c) => c.code !== current).map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handlePreview} disabled={!target || loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Convertir"}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmRate != null} onOpenChange={(o) => !o && setConfirmRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la conversion</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
                  <span>{currentCurrency?.symbol}</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span>{targetCurrency?.symbol}</span>
                </div>
                <p>
                  Taux appliqué : <strong>1 {current} = {confirmRate?.toFixed(4)} {target}</strong>
                </p>
                <p>
                  Tous vos montants (revenus, dépenses, objectifs, charges fixes et seuils d'alerte)
                  seront convertis définitivement en {targetCurrency?.name}.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Convertir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
