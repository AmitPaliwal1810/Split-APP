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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Expense, Group, ExpenseSplit } from '../../types';
import { HomeStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';

// Conditionally import Firebase modules
let firestore: any = null;
let database: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
  database = require('@react-native-firebase/database').default;
} catch (error) {
  console.warn('⚠️ Firebase not available (Expo Go mode)');
}

type ExpenseDetailRouteProp = RouteProp<HomeStackParamList, 'ExpenseDetail'>;

interface EditExpenseFormData {
  title: string;
  amount: string;
  description: string;
}

export const ExpenseDetailScreen: React.FC = () => {
  const route = useRoute<ExpenseDetailRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { expenseId, groupId } = route.params;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditExpenseFormData>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!database || !firestore) {
      setLoading(false);
      return;
    }

    try {
      // Load expense from Realtime DB
      const snapshot = await database().ref(`expenses/${groupId}/${expenseId}`).once('value');
      if (snapshot.exists()) {
        const data = snapshot.val();
        setExpense({ id: expenseId, groupId, ...data } as Expense);
        reset({
          title: data.title || '',
          amount: String(data.amount || ''),
          description: data.description || '',
        });
      }

      // Load group from Firestore
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      if (groupDoc.exists) {
        setGroup({ id: groupDoc.id, ...groupDoc.data() } as Group);
      }
    } catch (error: any) {
      console.error('Load expense error:', error);
      Alert.alert('Error', 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (userId: string) => {
    if (userId === user?.id) return 'You';
    const member = group?.members?.find((m) => m.userId === userId);
    return member?.displayName || 'Unknown';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr || '';
    }
  };

  const handleSave = async (data: EditExpenseFormData) => {
    if (!expense || !database || !group || !user) return;

    const newAmount = parseFloat(data.amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      const oldAmount = expense.amount;
      const oldSplits = expense.splits || [];

      // Recalculate splits if amount changed
      let newSplits: ExpenseSplit[] = oldSplits;
      if (newAmount !== oldAmount && expense.splitType === 'equal' && group.members) {
        const splitAmount = Math.round((newAmount / group.members.length) * 100) / 100;
        newSplits = group.members.map((member) => ({
          userId: member.userId,
          amount: splitAmount,
          paid: member.userId === expense.paidBy,
        }));
      }

      // Update expense in Realtime DB
      await database().ref(`expenses/${groupId}/${expenseId}`).update({
        title: data.title.trim(),
        amount: newAmount,
        description: (data.description || '').trim(),
        splits: newSplits,
        updatedAt: new Date().toISOString(),
      });

      // Reverse old balance changes, apply new ones
      if (newAmount !== oldAmount && firestore) {
        const groupRef = firestore().collection('groups').doc(groupId);
        const groupDoc = await groupRef.get();
        if (groupDoc.exists) {
          const groupData = groupDoc.data();
          const updatedMembers = (groupData.members || []).map((member: any) => {
            const oldSplit = oldSplits.find((s) => s.userId === member.userId);
            const newSplit = newSplits.find((s) => s.userId === member.userId);
            if (!oldSplit || !newSplit) return member;

            let balanceChange = 0;
            if (member.userId === expense.paidBy) {
              // Reverse old: -(oldAmount - oldSplit), Apply new: +(newAmount - newSplit)
              balanceChange = -(oldAmount - oldSplit.amount) + (newAmount - newSplit.amount);
            } else {
              // Reverse old: +oldSplit, Apply new: -newSplit
              balanceChange = oldSplit.amount - newSplit.amount;
            }

            return { ...member, balance: (member.balance || 0) + balanceChange };
          });

          await groupRef.update({
            members: updatedMembers,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      setExpense({ ...expense, title: data.title.trim(), amount: newAmount, description: data.description?.trim(), splits: newSplits });
      setEditing(false);
      Alert.alert('Success', 'Expense updated!');
    } catch (error: any) {
      console.error('Update expense error:', error);
      Alert.alert('Error', error.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense?.title}"? This will reverse the balance changes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!expense || !database) return;
            setSaving(true);
            try {
              // Delete from Realtime DB
              await database().ref(`expenses/${groupId}/${expenseId}`).remove();

              // Reverse balance changes in Firestore
              if (firestore && expense.splits) {
                const groupRef = firestore().collection('groups').doc(groupId);
                const groupDoc = await groupRef.get();
                if (groupDoc.exists) {
                  const groupData = groupDoc.data();
                  const updatedMembers = (groupData.members || []).map((member: any) => {
                    const split = expense.splits.find((s) => s.userId === member.userId);
                    if (!split) return member;

                    if (member.userId === expense.paidBy) {
                      return { ...member, balance: (member.balance || 0) - (expense.amount - split.amount) };
                    } else {
                      return { ...member, balance: (member.balance || 0) + split.amount };
                    }
                  });

                  await groupRef.update({
                    members: updatedMembers,
                    updatedAt: firestore.FieldValue.serverTimestamp(),
                  });
                }
              }

              Alert.alert('Deleted', 'Expense has been deleted.');
              navigation.goBack();
            } catch (error: any) {
              console.error('Delete expense error:', error);
              Alert.alert('Error', error.message || 'Failed to delete expense');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Expense not found</Text>
      </View>
    );
  }

  const paidByMe = expense.paidBy === user?.id;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Expense Header */}
        <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="receipt" size={40} color={colors.secondary} />
          </View>

          {editing ? (
            <>
              <FormInput name="title" control={control} placeholder="Expense title" error={errors.title} />
              <FormInput name="amount" control={control} placeholder="Amount" keyboardType="decimal-pad" error={errors.amount} />
              <FormInput name="description" control={control} placeholder="Description (optional)" multiline numberOfLines={2} error={errors.description} />
            </>
          ) : (
            <>
              <Text style={[styles.expenseTitle, { color: colors.text }]}>{expense.title}</Text>
              <Text style={[styles.expenseAmount, { color: colors.primary }]}>
                ${expense.amount?.toFixed(2)}
              </Text>
              {expense.description ? (
                <Text style={[styles.expenseDescription, { color: colors.textSecondary }]}>
                  {expense.description}
                </Text>
              ) : null}
              <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
                {formatDate(expense.createdAt as any)}
              </Text>
              <Text style={[styles.paidBy, { color: colors.textSecondary }]}>
                Paid by {paidByMe ? 'You' : getMemberName(expense.paidBy)}
              </Text>
            </>
          )}
        </View>

        {/* Split Details */}
        {!editing && (
          <View style={[styles.splitsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Split Details</Text>
            {expense.splits?.map((split, index) => {
              const isMe = split.userId === user?.id;
              const isPayer = split.userId === expense.paidBy;

              return (
                <View key={index} style={[styles.splitRow, index < expense.splits.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={[styles.splitAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.splitInitial, { color: colors.primary }]}>
                      {getMemberName(split.userId).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.splitInfo}>
                    <Text style={[styles.splitName, { color: colors.text }]}>
                      {getMemberName(split.userId)}
                    </Text>
                    <Text style={[styles.splitDetail, { color: colors.textSecondary }]}>
                      {isPayer ? 'Paid the bill' : `Owes $${split.amount?.toFixed(2)}`}
                    </Text>
                  </View>
                  <Text style={[styles.splitAmount, {
                    color: isPayer ? colors.success : colors.error
                  }]}>
                    {isPayer ? `+$${(expense.amount - split.amount).toFixed(2)}` : `-$${split.amount?.toFixed(2)}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Action Buttons */}
        {editing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => {
                setEditing(false);
                reset({ title: expense.title, amount: String(expense.amount), description: expense.description || '' });
              }}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSubmit(handleSave)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: '#fff' }]}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={[styles.buttonText, { color: '#fff' }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={handleDelete}
              disabled={saving}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={[styles.buttonText, { color: '#fff' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  headerCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  expenseDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  paidBy: {
    fontSize: 14,
  },
  splitsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  splitAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  splitInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  splitInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 15,
    fontWeight: '600',
  },
  splitDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
