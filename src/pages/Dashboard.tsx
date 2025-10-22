import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { getMonthlyStats, getFinancialAdvice } from "@/lib/storage";
import { TrendingUp, TrendingDown, Wallet, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [stats, setStats] = useState(getMonthlyStats());
  const [advice, setAdvice] = useState<string[]>([]);

  useEffect(() => {
    setStats(getMonthlyStats());
    setAdvice(getFinancialAdvice());
  }, []);

  return (
    <Layout>
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
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Revenus"
            value={`${stats.totalIncome.toFixed(0)} F`}
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Dépenses"
            value={`${stats.totalExpenses.toFixed(0)} F`}
            icon={TrendingDown}
            trend="down"
          />
        </div>

        {/* Balance Card */}
        <Card className="p-6 bg-gradient-primary text-white border-0 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Solde du mois</p>
              <p className="text-3xl font-bold">{stats.balance.toFixed(2)} F</p>
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
                        <p className="font-bold">{amount.toFixed(2)} F</p>
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
