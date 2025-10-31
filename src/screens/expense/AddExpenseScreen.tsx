import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { ref, push, set } from 'firebase/database';
import { db, realtimeDb } from '@services/firebase';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Group, ExpenseSplit } from '@types/index';
import { Ionicons } from '@expo/vector-icons';

export const AddExpenseScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { groupId } = route.params as { groupId: string };
  const [group, setGroup] = useState<Group | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'individual'>('equal');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroup();
  }, []);

  const loadGroup = async () => {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        setGroup({ id: groupDoc.id, ...groupDoc.data() } as Group);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddExpense = async () => {
    if (!title.trim() || !amount || !group || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
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
      const expenseRef = push(ref(realtimeDb, `expenses/${groupId}`));
      const expenseData = {
        title: title.trim(),
        amount: numAmount,
        paidBy: user.id,
        splitType,
        splits,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await set(expenseRef, expenseData);

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
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g., Dinner, Gas, Movie tickets"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
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
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Add details about this expense"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleAddExpense}
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
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
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
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 32,
    textAlignVertical: 'top',
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
