export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
  imageURL?: string;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  addedAt: Date;
  balance: number; // positive means they are owed, negative means they owe
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: string; // userId
  splitType: 'equal' | 'custom' | 'individual';
  splits: ExpenseSplit[];
  category?: string;
  description?: string;
  imageURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  paid: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumbers?: { number: string }[];
  isAppUser?: boolean;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainDrawerParamList = {
  Home: undefined;
  Groups: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  GroupDetail: { groupId: string };
  AddExpense: { groupId: string };
  ExpenseDetail: { expenseId: string };
  CreateGroup: undefined;
  AddMembers: { groupId: string };
};

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}
