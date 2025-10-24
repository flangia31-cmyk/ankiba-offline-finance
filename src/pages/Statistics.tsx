import { Layout } from "@/components/Layout";
import { getMonthlyStats, formatAmount } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PieChart } from "lucide-react";

export default function Statistics() {
  const stats = getMonthlyStats();

  const chartData = Object.entries(stats.expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const total = chartData.reduce((sum, [, amount]) => sum + amount, 0);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Statistiques</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de vos finances</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-card border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Revenus</span>
            </div>
            <p className="text-2xl font-bold">{formatAmount(stats.totalIncome)}</p>
          </Card>

          <Card className="p-4 bg-gradient-card border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Dépenses</span>
            </div>
            <p className="text-2xl font-bold">{formatAmount(stats.totalExpenses)}</p>
          </Card>
        </div>

        {/* Expense Breakdown */}
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Répartition des dépenses</h2>
            </div>

            <div className="space-y-3">
              {chartData.map(([category, amount], index) => {
                const percentage = total > 0 ? (amount / total) * 100 : 0;
                const colors = [
                  "bg-primary",
                  "bg-secondary",
                  "bg-success",
                  "bg-destructive",
                  "bg-accent",
                  "bg-muted-foreground",
                ];
                const color = colors[index % colors.length];

                return (
                  <Card key={category} className="p-4 bg-gradient-card border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-muted rounded-full h-2 mr-4">
                        <div
                          className={`h-2 rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-sm whitespace-nowrap">
                        {formatAmount(amount)}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            <Card className="p-6 bg-gradient-primary text-white border-0 shadow-glow">
              <div className="text-center">
                <p className="text-white/80 text-sm mb-2">Balance du mois</p>
                <p className="text-4xl font-bold mb-1">{formatAmount(stats.balance)}</p>
                <p className="text-white/60 text-sm">
                  {stats.balance >= 0 ? "Excédent" : "Déficit"}
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <PieChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune donnée disponible</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ajoutez des transactions pour voir vos statistiques
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
