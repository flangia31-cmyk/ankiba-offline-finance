// Local storage management for AKBWallet
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Transport',
  'Shopping',
  'Santé',
  'Loisirs',
  'Logement',
  'Factures',
  'Éducation',
  '💰 Épargne',
  'Autre'
];

export const INCOME_CATEGORIES = [
  'Salaire',
  'Freelance',
  'Vente',
  'Investissement',
  'Cadeau',
  'Remboursement',
  'Prime',
  'Autre'
];

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export interface ChargeFixe {
  id: string;
  nomCharge: string;
  montant: number;
  datePaiement?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'KMF', symbol: 'FC', name: 'Franc comorien', flag: '🇰🇲' },
  { code: 'MGA', symbol: 'Ar', name: 'Ariary malgache', flag: '🇲🇬' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'USD', symbol: '$', name: 'Dollar américain', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling', flag: '🇬🇧' },
  { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain', flag: '🇿🇦' },
];

export interface FinancialData {
  transactions: Transaction[];
  goals: Goal[];
  chargesFixes: ChargeFixe[];
  monthlyBudget: number;
  currency?: string; // Currency code (KMF, EUR, etc.)
}

const STORAGE_KEY = 'akbwallet_data';
const CURRENCY_KEY = 'akbwallet_currency';

// Initialize default data
const defaultData: FinancialData = {
  transactions: [],
  goals: [],
  chargesFixes: [],
  monthlyBudget: 0,
  currency: undefined,
};

// Currency operations
export const getCurrency = (): string | null => {
  try {
    return localStorage.getItem(CURRENCY_KEY);
  } catch (error) {
    console.error('Error reading currency:', error);
    return null;
  }
};

export const setCurrency = (currencyCode: string): void => {
  try {
    localStorage.setItem(CURRENCY_KEY, currencyCode);
  } catch (error) {
    console.error('Error saving currency:', error);
  }
};

export const formatAmount = (amount: number): string => {
  const currencyCode = getCurrency();
  if (!currencyCode) return `${amount.toFixed(2)} F`;
  
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `${amount.toFixed(2)} F`;
  
  // Format based on currency
  if (currency.code === 'EUR' || currency.code === 'GBP') {
    return `${amount.toFixed(2)} ${currency.symbol}`;
  } else if (currency.code === 'USD') {
    return `${currency.symbol}${amount.toFixed(2)}`;
  } else {
    // For KMF, MGA, ZAR - no decimals
    return `${amount.toFixed(0)} ${currency.symbol}`;
  }
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
    const oldGoal = data.goals[goalIndex];
    data.goals[goalIndex] = { ...oldGoal, ...updates };
    
    // Si on ajoute de l'argent à l'objectif (currentAmount augmente)
    if (updates.currentAmount && updates.currentAmount > oldGoal.currentAmount) {
      const amountAdded = updates.currentAmount - oldGoal.currentAmount;
      
      // Créer une transaction de type "expense" pour déduire des revenus
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'expense',
        amount: amountAdded,
        category: '💰 Épargne',
        description: `Ajout à l'objectif: ${oldGoal.name}`,
        date: new Date().toISOString(),
      };
      
      data.transactions.push(transaction);
    }
    
    saveData(data);
  }
};

export const deleteGoal = (id: string): void => {
  const data = getData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveData(data);
};

// Charges fixes operations
export const addChargeFixe = (charge: Omit<ChargeFixe, 'id'>): ChargeFixe => {
  const data = getData();
  const newCharge = {
    ...charge,
    id: crypto.randomUUID(),
  };
  data.chargesFixes.push(newCharge);
  saveData(data);
  return newCharge;
};

export const updateChargeFixe = (id: string, updates: Partial<ChargeFixe>): void => {
  const data = getData();
  const chargeIndex = data.chargesFixes.findIndex(c => c.id === id);
  if (chargeIndex !== -1) {
    data.chargesFixes[chargeIndex] = { ...data.chargesFixes[chargeIndex], ...updates };
    saveData(data);
  }
};

export const deleteChargeFixe = (id: string): void => {
  const data = getData();
  data.chargesFixes = data.chargesFixes.filter(c => c.id !== id);
  saveData(data);
};

export const getTotalChargesFixes = (): number => {
  const data = getData();
  return data.chargesFixes.reduce((sum, charge) => sum + charge.montant, 0);
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

  const totalChargesFixes = getTotalChargesFixes();
  const soldeDisponible = totalIncome - totalChargesFixes;
  const balance = soldeDisponible - totalExpenses;

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
    totalChargesFixes,
    soldeDisponible,
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
