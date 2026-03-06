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
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Group, ExpenseSplit } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';
import { updateMemberBalances } from '@services/groupService';

// Conditionally import Firebase modules
let firestore: any = null;
let database: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
  database = require('@react-native-firebase/database').default;
} catch (error) {
  console.warn('⚠️ Firebase not available (Expo Go mode)');
}

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
    if (!firestore) {
      Alert.alert('Not Available', 'Firebase is required.');
      return;
    }
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
    if (!group || !user || !database || !firestore) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
        const splitAmount = Math.round((numAmount / group.members.length) * 100) / 100;
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
        groupId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await expenseRef.set(expenseData);

      // Update member balances in Firestore
      await updateMemberBalances(groupId, user.id, numAmount, splits);

      Alert.alert('Success', 'Expense added successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Add expense error:', error);
      Alert.alert('Error', error.message || 'Failed to add expense');
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

        {group && (
          <View style={[styles.groupInfo, { backgroundColor: colors.card }]}>
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
            <Text style={[styles.groupMembers, { color: colors.textSecondary }]}>
              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

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
          {(['equal', 'custom', 'individual'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.splitTypeButton,
                { borderColor: colors.border },
                splitType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSplitType(type)}
            >
              <Ionicons
                name={type === 'equal' ? 'git-compare-outline' : type === 'custom' ? 'options-outline' : 'person-outline'}
                size={18}
                color={splitType === type ? '#fff' : colors.text}
              />
              <Text style={[
                styles.splitTypeText,
                { color: splitType === type ? '#fff' : colors.text },
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {splitType === 'equal' && group && (
          <View style={[styles.splitPreview, { backgroundColor: colors.card }]}>
            <Text style={[styles.splitPreviewTitle, { color: colors.textSecondary }]}>
              Split equally among {group.members.length} members
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
        <FormInput
          name="description"
          control={control}
          placeholder="Add details about this expense"
          multiline
          numberOfLines={3}
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  groupInfo: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupMembers: {
    fontSize: 13,
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  splitTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  splitTypeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  splitTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  splitPreview: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  splitPreviewTitle: {
    fontSize: 13,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
