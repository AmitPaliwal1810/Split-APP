import { Expense, ExpenseSplit } from '@types/index';

// Conditionally import Firebase (won't work in Expo Go)
let database: any = null;
try {
  database = require('@react-native-firebase/database').default;
} catch (error) {
  console.warn('⚠️ Realtime Database not available (Expo Go mode)');
}

const getDatabase = () => {
  if (!database) throw new Error('Realtime Database not available. Requires a development build.');
  return database();
};

/**
 * Create a new expense
 */
export const createExpense = async (
  groupId: string,
  expense: Omit<Expense, 'id'>
): Promise<string> => {
  const db = getDatabase();
  const expenseRef = db.ref(`expenses/${groupId}`).push();
  const expenseData = {
    ...expense,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await expenseRef.set(expenseData);
  return expenseRef.key || '';
};

/**
 * Get an expense by ID
 */
export const getExpense = async (
  groupId: string,
  expenseId: string
): Promise<Expense | null> => {
  const db = getDatabase();
  const snapshot = await db.ref(`expenses/${groupId}/${expenseId}`).once('value');

  if (snapshot.exists()) {
    return { id: expenseId, ...snapshot.val() } as Expense;
  }
  return null;
};

/**
 * Get all expenses for a group
 */
export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
  const db = getDatabase();
  const snapshot = await db.ref(`expenses/${groupId}`).once('value');

  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
  }
  return [];
};

/**
 * Delete an expense
 */
export const deleteExpense = async (
  groupId: string,
  expenseId: string
): Promise<void> => {
  const db = getDatabase();
  await db.ref(`expenses/${groupId}/${expenseId}`).remove();
};

/**
 * Calculate equal split for an expense
 */
export const calculateEqualSplit = (
  amount: number,
  memberIds: string[],
  paidBy: string
): ExpenseSplit[] => {
  const splitAmount = Math.round((amount / memberIds.length) * 100) / 100;
  return memberIds.map((userId) => ({
    userId,
    amount: splitAmount,
    paid: userId === paidBy,
  }));
};
