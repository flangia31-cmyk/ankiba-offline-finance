import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { getMonthlyStats, getFinancialAdvice, formatAmount } from "@/lib/storage";
import { TrendingUp, TrendingDown, Wallet, Lightbulb, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(getMonthlyStats());
  const [advice, setAdvice] = useState<string[]>([]);

  useEffect(() => {
    setStats(getMonthlyStats());
    setAdvice(getFinancialAdvice());
  }, []);

  return (
    <Layout>
      <OnboardingGuide />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Ankiba
          </h1>
          <p className="text-muted-foreground">
            Votre conseiller financier personnel
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            title="Revenus"
            value={formatAmount(stats.totalIncome)}
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Dépenses"
            value={formatAmount(stats.totalExpenses)}
            icon={TrendingDown}
            trend="down"
          />
        </div>

        {/* Charges Fixes Card */}
        {stats.totalChargesFixes > 0 && (
          <Link to="/charges-fixes">
            <Card className="p-4 bg-gradient-card border-border/50 hover:shadow-soft transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Receipt className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Charges fixes / mois</p>
                    <p className="text-xl font-bold">{formatAmount(stats.totalChargesFixes)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Solde Disponible Card */}
        <Card className="p-4 bg-gradient-subtle border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">💰 Solde disponible</p>
              <p className="text-2xl font-bold text-success">{formatAmount(stats.soldeDisponible)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Après déduction des charges fixes
              </p>
            </div>
          </div>
        </Card>

        {/* Balance Card */}
        <Card className="p-6 bg-gradient-primary text-white border-0 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Balance finale</p>
              <p className="text-3xl font-bold">{formatAmount(stats.balance)}</p>
              <p className="text-white/60 text-xs mt-1">Solde disponible - Dépenses</p>
            </div>
            <Wallet className="w-12 h-12 text-white/80 animate-float" />
          </div>
        </Card>

        {/* Financial Advice */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Conseils du jour</h2>
          </div>
          
          <div className="space-y-3">
            {advice.map((tip, index) => (
              <Card
                key={index}
                className="p-4 bg-gradient-card border-border/50 hover:shadow-soft transition-all"
              >
                <p className="text-sm leading-relaxed">{tip}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {Object.keys(stats.expensesByCategory).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Dépenses par catégorie</h2>
            <div className="space-y-2">
              {Object.entries(stats.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => {
                  const percentage = (amount / stats.totalExpenses) * 100;
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-card border border-border/50"
                    >
                      <span className="capitalize font-medium">{category}</span>
                      <div className="text-right">
                        <p className="font-bold">{formatAmount(amount)}</p>
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
