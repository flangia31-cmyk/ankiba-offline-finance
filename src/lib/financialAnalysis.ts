import { getData, getMonthlyStats, getTotalChargesFixes, EXPENSE_CATEGORIES } from "./storage";
import type { Transaction } from "./storage";

export interface SmartInsight {
  id: string;
  icon: string;
  title: string;
  message: string;
  level: "positive" | "warning" | "danger" | "info";
  priority: number; // plus haut = plus important
}

export interface FinancialHealth {
  score: number; // 0-100
  label: string;
  color: "success" | "primary" | "warning" | "destructive";
}

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

// Regroupe les dépenses par mois
function expensesByMonth(transactions: Transaction[]): Record<string, number> {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const k = monthKey(new Date(t.date));
      map[k] = (map[k] || 0) + t.amount;
    });
  return map;
}

function incomeByMonth(transactions: Transaction[]): Record<string, number> {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "income")
    .forEach((t) => {
      const k = monthKey(new Date(t.date));
      map[k] = (map[k] || 0) + t.amount;
    });
  return map;
}

/**
 * Score de santé financière (0-100) basé sur plusieurs facteurs
 */
export function getFinancialHealth(): FinancialHealth {
  const stats = getMonthlyStats();
  let score = 50;

  if (stats.totalIncome > 0) {
    const savingsRate = (stats.balance / stats.totalIncome) * 100;
    // taux d'épargne (max +30)
    score += Math.max(-25, Math.min(30, savingsRate));

    // poids des charges fixes (max -20)
    const chargesRatio = (stats.totalChargesFixes / stats.totalIncome) * 100;
    if (chargesRatio > 50) score -= 20;
    else if (chargesRatio > 35) score -= 10;
    else if (chargesRatio < 20) score += 10;
  } else {
    score = 30;
  }

  // balance négative = pénalité forte
  if (stats.balance < 0) score -= 20;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Critique";
  let color: FinancialHealth["color"] = "destructive";
  if (score >= 75) {
    label = "Excellente";
    color = "success";
  } else if (score >= 55) {
    label = "Bonne";
    color = "primary";
  } else if (score >= 35) {
    label = "Moyenne";
    color = "warning";
  }

  return { score, label, color };
}

/**
 * Analyse financière poussée -> liste d'insights intelligents et triés
 */
export function getSmartInsights(): SmartInsight[] {
  const data = getData();
  const stats = getMonthlyStats();
  const insights: SmartInsight[] = [];
  const transactions = data.transactions;

  // Aucune donnée
  if (transactions.length === 0) {
    return [
      {
        id: "empty",
        icon: "✨",
        title: "Commencez votre suivi",
        message:
          "Enregistrez vos premières transactions pour débloquer une analyse financière personnalisée.",
        level: "info",
        priority: 1,
      },
    ];
  }

  // 1. Balance négative
  if (stats.balance < 0) {
    insights.push({
      id: "negative-balance",
      icon: "🚨",
      title: "Budget en déficit",
      message: `Vos dépenses dépassent vos revenus de ${Math.abs(stats.balance).toFixed(0)}. Réduisez vos dépenses non essentielles dès maintenant.`,
      level: "danger",
      priority: 100,
    });
  }

  // 2. Taux d'épargne
  if (stats.totalIncome > 0) {
    const savingsRate = (stats.balance / stats.totalIncome) * 100;
    if (savingsRate >= 20) {
      insights.push({
        id: "great-savings",
        icon: "🎉",
        title: "Épargne excellente",
        message: `Vous épargnez ${savingsRate.toFixed(0)}% de vos revenus. Pensez à placer ce surplus dans un objectif d'épargne.`,
        level: "positive",
        priority: 40,
      });
    } else if (savingsRate >= 0 && savingsRate < 10) {
      insights.push({
        id: "low-savings",
        icon: "💡",
        title: "Épargne faible",
        message: `Vous n'épargnez que ${savingsRate.toFixed(0)}% de vos revenus. Visez au moins 10% pour bâtir une sécurité financière.`,
        level: "warning",
        priority: 60,
      });
    }
  }

  // 3. Poids des charges fixes
  if (stats.totalIncome > 0 && stats.totalChargesFixes > 0) {
    const ratio = (stats.totalChargesFixes / stats.totalIncome) * 100;
    if (ratio > 50) {
      insights.push({
        id: "high-charges",
        icon: "⚠️",
        title: "Charges fixes trop élevées",
        message: `Vos charges fixes représentent ${ratio.toFixed(0)}% de vos revenus. Idéalement, elles devraient rester sous 50%. Renégociez vos abonnements.`,
        level: "warning",
        priority: 70,
      });
    } else if (ratio < 30) {
      insights.push({
        id: "good-charges",
        icon: "👍",
        title: "Charges fixes maîtrisées",
        message: `Vos charges fixes ne pèsent que ${ratio.toFixed(0)}% de vos revenus. Excellente marge de manœuvre.`,
        level: "positive",
        priority: 20,
      });
    }
  }

  // 4. Catégorie dominante
  const categories = Object.entries(stats.expensesByCategory);
  if (categories.length > 0 && stats.totalExpenses > 0) {
    const [topCat, topAmount] = categories.reduce((m, c) => (c[1] > m[1] ? c : m));
    const pct = (topAmount / stats.totalExpenses) * 100;
    if (pct > 40 && topCat !== "💰 Épargne") {
      insights.push({
        id: "dominant-category",
        icon: "📊",
        title: `Dépense concentrée : ${topCat}`,
        message: `${pct.toFixed(0)}% de vos dépenses vont dans "${topCat}". Vérifiez si certaines sont réductibles.`,
        level: "info",
        priority: 50,
      });
    }
  }

  // 5. Tendance mois-sur-mois des dépenses
  const expMonths = expensesByMonth(transactions);
  const now = new Date();
  const curKey = monthKey(now);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = monthKey(prevDate);
  const curExp = expMonths[curKey] || 0;
  const prevExp = expMonths[prevKey] || 0;
  if (prevExp > 0 && curExp > 0) {
    const change = ((curExp - prevExp) / prevExp) * 100;
    if (change > 20) {
      insights.push({
        id: "rising-spending",
        icon: "📈",
        title: "Dépenses en hausse",
        message: `Vos dépenses ce mois-ci sont ${change.toFixed(0)}% plus élevées que le mois dernier. Surveillez votre budget.`,
        level: "warning",
        priority: 65,
      });
    } else if (change < -15) {
      insights.push({
        id: "falling-spending",
        icon: "📉",
        title: "Dépenses en baisse",
        message: `Bravo ! Vous avez réduit vos dépenses de ${Math.abs(change).toFixed(0)}% par rapport au mois dernier.`,
        level: "positive",
        priority: 30,
      });
    }
  }

  // 6. Régularité des revenus
  const incMonths = incomeByMonth(transactions);
  const incValues = Object.values(incMonths);
  if (incValues.length >= 3) {
    const avg = incValues.reduce((a, b) => a + b, 0) / incValues.length;
    const variance =
      incValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / incValues.length;
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 0;
    if (cv > 0.4) {
      insights.push({
        id: "irregular-income",
        icon: "🌊",
        title: "Revenus irréguliers",
        message:
          "Vos revenus varient fortement d'un mois à l'autre. Constituez un fonds d'urgence de 3 mois de charges pour amortir les creux.",
        level: "info",
        priority: 45,
      });
    }
  }

  // 7. Fonds d'urgence
  if (stats.totalChargesFixes > 0) {
    const emergencyTarget = stats.totalChargesFixes * 3;
    if (stats.balance > 0 && stats.balance < emergencyTarget) {
      insights.push({
        id: "emergency-fund",
        icon: "🛡️",
        title: "Fonds d'urgence à constituer",
        message: `Visez ${emergencyTarget.toFixed(0)} (3 mois de charges) comme matelas de sécurité. Vous êtes à ${((stats.balance / emergencyTarget) * 100).toFixed(0)}%.`,
        level: "info",
        priority: 35,
      });
    }
  }

  // 8. Objectifs d'épargne en retard
  data.goals.forEach((goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return;
    const daysLeft = Math.ceil(
      (new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft > 0 && daysLeft < 30) {
      const perDay = remaining / daysLeft;
      insights.push({
        id: `goal-${goal.id}`,
        icon: "🎯",
        title: `Objectif "${goal.name}" urgent`,
        message: `Il reste ${daysLeft} jours. Épargnez ${perDay.toFixed(0)} par jour pour l'atteindre à temps.`,
        level: "warning",
        priority: 55,
      });
    }
  });

  // Fallback positif
  if (insights.length === 0) {
    insights.push({
      id: "stable",
      icon: "✅",
      title: "Situation stable",
      message:
        "Vos finances sont équilibrées. Continuez à enregistrer vos transactions et fixez-vous un objectif d'épargne pour progresser.",
      level: "positive",
      priority: 10,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
}
