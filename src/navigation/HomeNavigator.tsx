import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@contexts/ThemeContext';
import { HomeScreen } from '@screens/home/HomeScreen';
import { GroupDetailScreen } from '@screens/groups/GroupDetailScreen';
import { CreateGroupScreen } from '@screens/groups/CreateGroupScreen';
import { AddExpenseScreen } from '@screens/expense/AddExpenseScreen';
import { AddMembersScreen } from '@screens/groups/AddMembersScreen';
import { HomeStackParamList } from '@types/index';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Split Bills' }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ title: 'Group Details' }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: 'Create Group' }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: 'Add Expense' }}
      />
      <Stack.Screen
        name="AddMembers"
        component={AddMembersScreen}
        options={{ title: 'Add Members' }}
      />
    </Stack.Navigator>
  );
};
