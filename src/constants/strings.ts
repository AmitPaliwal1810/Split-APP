/**
 * Common strings and messages used throughout the app
 */

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  FILL_ALL_FIELDS: 'Please fill in all required fields.',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  GROUP_CREATE_FAILED: 'Failed to create group. Please try again.',
  EXPENSE_CREATE_FAILED: 'Failed to create expense. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please enable in settings.',
};

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  GROUP_CREATED: 'Group created successfully!',
  EXPENSE_ADDED: 'Expense added successfully!',
  MEMBER_ADDED: 'Member added to group!',
  SIGNED_OUT: 'Signed out successfully!',
};

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_REQUIRED: 'Name is required',
  AMOUNT_REQUIRED: 'Amount is required',
  TITLE_REQUIRED: 'Title is required',
  INVALID_AMOUNT: 'Please enter a valid amount',
};

export const PLACEHOLDER_TEXT = {
  EMAIL: 'Enter your email',
  PASSWORD: 'Enter your password',
  NAME: 'Enter your name',
  PHONE: 'Enter your phone number',
  GROUP_NAME: 'e.g., Weekend Trip, Roommates',
  GROUP_DESCRIPTION: 'Add a description for this group',
  EXPENSE_TITLE: 'e.g., Dinner, Gas, Movie tickets',
  EXPENSE_AMOUNT: '0.00',
  EXPENSE_DESCRIPTION: 'Add details about this expense',
};

export const BUTTON_TEXT = {
  SIGN_IN: 'Sign In',
  SIGN_UP: 'Sign Up',
  SIGN_OUT: 'Sign Out',
  CONTINUE_WITH_GOOGLE: 'Continue with Google',
  GET_STARTED: 'Get Started',
  NEXT: 'Next',
  SKIP: 'Skip',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  CREATE: 'Create',
  ADD: 'Add',
  EDIT: 'Edit',
  DELETE: 'Delete',
  INVITE: 'Invite',
  SHARE: 'Share',
  DONE: 'Done',
};

export const SCREEN_TITLES = {
  LOGIN: 'Welcome Back!',
  REGISTER: 'Create Account',
  HOME: 'Split Bills',
  PROFILE: 'Profile',
  CREATE_GROUP: 'Create Group',
  GROUP_DETAIL: 'Group Details',
  ADD_EXPENSE: 'Add Expense',
  ADD_MEMBERS: 'Add Members',
  SETTINGS: 'Settings',
};

export const EMPTY_STATES = {
  NO_GROUPS: 'No groups yet. Create one to get started!',
  NO_EXPENSES: 'No expenses yet. Add one to get started!',
  NO_MEMBERS: 'No members yet. Add some friends!',
  NO_CONTACTS: 'No contacts found.',
};

export const ONBOARDING_SLIDES = [
  {
    title: 'Split Bills Easily',
    description: 'Share expenses with friends and family. Keep track of who owes what.',
  },
  {
    title: 'Create Groups',
    description: 'Organize expenses by creating groups for trips, roommates, or events.',
  },
  {
    title: 'Real-time Updates',
    description: 'Get instant notifications when expenses are added or settled.',
  },
  {
    title: 'Easy Settlements',
    description: 'View balances and settle up with a single tap. No more awkward conversations.',
  },
];

export const SPLIT_TYPES = {
  EQUAL: 'Equal',
  CUSTOM: 'Custom',
  INDIVIDUAL: 'Individual',
};

export const THEME_MODES = {
  LIGHT: 'Light Mode',
  DARK: 'Dark Mode',
  AUTO: 'Auto (System)',
};
