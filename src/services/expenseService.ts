import { ref, push, set, update, remove, get } from 'firebase/database';
import { realtimeDb } from './firebase';
import { Expense, ExpenseSplit } from '@types/index';

/**
 * Create a new expense
 */
export const createExpense = async (
  groupId: string,
  expense: Omit<Expense, 'id'>
): Promise<string> => {
  try {
    const expenseRef = push(ref(realtimeDb, `expenses/${groupId}`));
    const expenseData = {
      ...expense,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await set(expenseRef, expenseData);
    return expenseRef.key || '';
  } catch (error: any) {
    throw new Error(`Failed to create expense: ${error.message}`);
  }
};

/**
 * Get an expense by ID
 */
export const getExpense = async (
  groupId: string,
  expenseId: string
): Promise<Expense | null> => {
  try {
    const expenseRef = ref(realtimeDb, `expenses/${groupId}/${expenseId}`);
    const snapshot = await get(expenseRef);

    if (snapshot.exists()) {
      return {
        id: expenseId,
        ...snapshot.val(),
      } as Expense;
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to get expense: ${error.message}`);
  }
};

/**
 * Get all expenses for a group
 */
export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
  try {
    const expensesRef = ref(realtimeDb, `expenses/${groupId}`);
    const snapshot = await get(expensesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
    }
    return [];
  } catch (error: any) {
    throw new Error(`Failed to get expenses: ${error.message}`);
  }
};

/**
 * Update an expense
 */
export const updateExpense = async (
  groupId: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> => {
  try {
    const expenseRef = ref(realtimeDb, `expenses/${groupId}/${expenseId}`);
    await update(expenseRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update expense: ${error.message}`);
  }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (
  groupId: string,
  expenseId: string
): Promise<void> => {
  try {
    const expenseRef = ref(realtimeDb, `expenses/${groupId}/${expenseId}`);
    await remove(expenseRef);
  } catch (error: any) {
    throw new Error(`Failed to delete expense: ${error.message}`);
  }
};

/**
 * Calculate equal split for an expense
 */
export const calculateEqualSplit = (
  amount: number,
  memberIds: string[],
  paidBy: string
): ExpenseSplit[] => {
  const splitAmount = amount / memberIds.length;
  return memberIds.map((userId) => ({
    userId,
    amount: splitAmount,
    paid: userId === paidBy,
  }));
};

/**
 * Mark a split as paid
 */
export const markSplitAsPaid = async (
  groupId: string,
  expenseId: string,
  userId: string
): Promise<void> => {
  try {
    const expense = await getExpense(groupId, expenseId);
    if (!expense) throw new Error('Expense not found');

    const updatedSplits = expense.splits.map((split) => {
      if (split.userId === userId) {
        return { ...split, paid: true };
      }
      return split;
    });

    await updateExpense(groupId, expenseId, { splits: updatedSplits });
  } catch (error: any) {
    throw new Error(`Failed to mark split as paid: ${error.message}`);
  }
};

/**
 * Calculate balance changes for an expense
 */
export const calculateBalanceChanges = (
  expense: Expense
): Map<string, number> => {
  const balanceChanges = new Map<string, number>();

  expense.splits.forEach((split) => {
    if (split.userId === expense.paidBy) {
      // Person who paid gets positive balance (they are owed)
      balanceChanges.set(
        split.userId,
        (balanceChanges.get(split.userId) || 0) + (expense.amount - split.amount)
      );
    } else {
      // Others get negative balance (they owe)
      balanceChanges.set(
        split.userId,
        (balanceChanges.get(split.userId) || 0) - split.amount
      );
    }
  });

  return balanceChanges;
};
