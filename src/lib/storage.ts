// Local storage management for Ankiba
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export interface FinancialData {
  transactions: Transaction[];
  goals: Goal[];
  monthlyBudget: number;
}

const STORAGE_KEY = 'ankiba_data';

// Initialize default data
const defaultData: FinancialData = {
  transactions: [],
  goals: [],
  monthlyBudget: 0,
};

// Get all data
export const getData = (): FinancialData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultData;
  } catch (error) {
    console.error('Error reading data:', error);
    return defaultData;
  }
};

// Save all data
export const saveData = (data: FinancialData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Transaction operations
export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const data = getData();
  const newTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
  };
  data.transactions.push(newTransaction);
  saveData(data);
  return newTransaction;
};

export const deleteTransaction = (id: string): void => {
  const data = getData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
};

// Goal operations
export const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>): Goal => {
  const data = getData();
  const newGoal = {
    ...goal,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.goals.push(newGoal);
  saveData(data);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<Goal>): void => {
  const data = getData();
  const goalIndex = data.goals.findIndex(g => g.id === id);
  if (goalIndex !== -1) {
    data.goals[goalIndex] = { ...data.goals[goalIndex], ...updates };
    saveData(data);
  }
};

export const deleteGoal = (id: string): void => {
  const data = getData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveData(data);
};

// Financial calculations
export const getMonthlyStats = (month?: Date) => {
  const data = getData();
  const targetMonth = month || new Date();
  const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

  const monthTransactions = data.transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= monthStart && transDate <= monthEnd;
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Category breakdown
  const expensesByCategory: Record<string, number> = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  return {
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    transactions: monthTransactions,
  };
};

// Export data
export const exportData = (): string => {
  const data = getData();
  return JSON.stringify(data, null, 2);
};

// Import data
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    saveData(data);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Financial advice based on spending habits
export const getFinancialAdvice = (): string[] => {
  const stats = getMonthlyStats();
  const advice: string[] = [];

  if (stats.balance < 0) {
    advice.push("⚠️ Vos dépenses dépassent vos revenus ce mois-ci. Essayez de réduire vos dépenses.");
  }

  if (stats.totalIncome > 0) {
    const savingsRate = (stats.balance / stats.totalIncome) * 100;
    if (savingsRate < 10) {
      advice.push("💡 Essayez d'économiser au moins 10% de vos revenus chaque mois.");
    } else if (savingsRate >= 20) {
      advice.push("🎉 Excellent ! Vous économisez plus de 20% de vos revenus !");
    }
  }

  // Find highest expense category
  const categories = Object.entries(stats.expensesByCategory);
  if (categories.length > 0) {
    const [topCategory, topAmount] = categories.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    const percentage = stats.totalExpenses > 0 
      ? ((topAmount / stats.totalExpenses) * 100).toFixed(0)
      : 0;
    advice.push(`📊 Catégorie la plus dépensière : ${topCategory} (${percentage}% de vos dépenses)`);
  }

  if (advice.length === 0) {
    advice.push("✨ Commencez à enregistrer vos transactions pour recevoir des conseils personnalisés !");
  }

  return advice;
};
