import { differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

export interface SavingsAdvice {
  remainingAmount: number;
  daysLeft: number;
  perDay: number;
  perWeek: number;
  perMonth: number;
  isUrgent: boolean;
  message: string;
}

/**
 * Calcule les recommandations d'épargne pour un objectif
 */
export function calculateSavingsAdvice(
  targetAmount: number,
  currentAmount: number,
  deadline: string
): SavingsAdvice | null {
  const remaining = targetAmount - currentAmount;
  
  // Objectif déjà atteint
  if (remaining <= 0) {
    return null;
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  
  const daysLeft = differenceInDays(deadlineDate, today);
  
  // Date limite dépassée
  if (daysLeft < 0) {
    return {
      remainingAmount: remaining,
      daysLeft: 0,
      perDay: 0,
      perWeek: 0,
      perMonth: 0,
      isUrgent: true,
      message: "⚠️ Date limite dépassée"
    };
  }

  // Moins d'un jour restant
  if (daysLeft === 0) {
    return {
      remainingAmount: remaining,
      daysLeft: 0,
      perDay: remaining,
      perWeek: 0,
      perMonth: 0,
      isUrgent: true,
      message: "🚨 Dernier jour !"
    };
  }

  const weeksLeft = differenceInWeeks(deadlineDate, today) || 1;
  const monthsLeft = differenceInMonths(deadlineDate, today) || 1;

  const perDay = remaining / daysLeft;
  const perWeek = remaining / weeksLeft;
  const perMonth = remaining / monthsLeft;

  // Déterminer l'urgence (moins de 30 jours)
  const isUrgent = daysLeft < 30;

  // Message personnalisé
  let message = "";
  if (daysLeft === 1) {
    message = "🚨 Plus qu'un jour !";
  } else if (daysLeft < 7) {
    message = `⏰ Seulement ${daysLeft} jours restants`;
  } else if (daysLeft < 30) {
    message = `⚡ Moins d'un mois pour atteindre votre objectif`;
  } else if (monthsLeft === 1) {
    message = "📅 Un mois pour y arriver";
  } else {
    message = `📅 ${monthsLeft} mois pour atteindre votre objectif`;
  }

  return {
    remainingAmount: remaining,
    daysLeft,
    perDay,
    perWeek,
    perMonth,
    isUrgent,
    message
  };
}

/**
 * Retourne le conseil d'épargne le plus adapté selon le temps restant
 */
export function getBestAdvice(advice: SavingsAdvice): {
  amount: number;
  period: string;
  icon: string;
} {
  if (advice.daysLeft < 7) {
    return {
      amount: advice.perDay,
      period: "par jour",
      icon: "📅"
    };
  } else if (advice.daysLeft < 60) {
    return {
      amount: advice.perWeek,
      period: "par semaine",
      icon: "📆"
    };
  } else {
    return {
      amount: advice.perMonth,
      period: "par mois",
      icon: "📊"
    };
  }
}
