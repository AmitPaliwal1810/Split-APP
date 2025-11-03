import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Group, ExpenseSplit } from '@types/index';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';

interface AddExpenseFormData {
  title: string;
  amount: string;
  description: string;
}

export const AddExpenseScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { groupId } = route.params as { groupId: string };
  const [group, setGroup] = useState<Group | null>(null);
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'individual'>('equal');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddExpenseFormData>({
    defaultValues: {
      title: '',
      amount: '',
      description: '',
    },
  });

  useEffect(() => {
    loadGroup();
  }, []);

  const loadGroup = async () => {
    try {
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      if (groupDoc.exists) {
        setGroup({ id: groupDoc.id, ...groupDoc.data() } as Group);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddExpense = async (data: AddExpenseFormData) => {
    if (!group || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(data.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Calculate splits based on split type
      let splits: ExpenseSplit[] = [];
      if (splitType === 'equal') {
        const splitAmount = numAmount / group.members.length;
        splits = group.members.map((member) => ({
          userId: member.userId,
          amount: splitAmount,
          paid: member.userId === user.id,
        }));
      }

      // Add expense to Realtime Database for instant updates
      const expenseRef = database().ref(`expenses/${groupId}`).push();
      const expenseData = {
        title: data.title.trim(),
        amount: numAmount,
        paidBy: user.id,
        splitType,
        splits,
        description: data.description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await expenseRef.set(expenseData);

      Alert.alert('Success', 'Expense added successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
          <Ionicons name="receipt" size={60} color={colors.secondary} />
        </View>

          <Text style={[styles.label, { color: colors.text }]}>Expense Title *</Text>
          <FormInput
            name="title"
            control={control}
            placeholder="e.g., Dinner, Gas, Movie tickets"
            error={errors.title}
          />

          <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
          <FormInput
            name="amount"
            control={control}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.amount}
          />

        <Text style={[styles.label, { color: colors.text }]}>Split Type</Text>
        <View style={styles.splitTypeContainer}>
          <TouchableOpacity
            style={[
              styles.splitTypeButton,
              { borderColor: colors.border },
              splitType === 'equal' && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSplitType('equal')}
          >
            <Text style={[
              styles.splitTypeText,
              { color: splitType === 'equal' ? '#fff' : colors.text },
            ]}>
              Equal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.splitTypeButton,
              { borderColor: colors.border },
              splitType === 'custom' && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSplitType('custom')}
          >
            <Text style={[
              styles.splitTypeText,
              { color: splitType === 'custom' ? '#fff' : colors.text },
            ]}>
              Custom
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.splitTypeButton,
              { borderColor: colors.border },
              splitType === 'individual' && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSplitType('individual')}
          >
            <Text style={[
              styles.splitTypeText,
              { color: splitType === 'individual' ? '#fff' : colors.text },
            ]}>
              Individual
            </Text>
          </TouchableOpacity>
        </View>

          <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
          <FormInput
            name="description"
            control={control}
            placeholder="Add details about this expense"
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(handleAddExpense)}
            disabled={loading}
          >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  splitTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  splitTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
