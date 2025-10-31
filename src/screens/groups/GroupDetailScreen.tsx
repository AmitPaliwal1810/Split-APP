import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Share as RNShare,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { doc, onSnapshot } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, realtimeDb } from '@services/firebase';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { Group, Expense } from '@types/index';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '@types/index';
import { APP_CONFIG } from '@constants/config';
import * as SMS from 'expo-sms';

type GroupDetailRouteProp = RouteProp<HomeStackParamList, 'GroupDetail'>;

export const GroupDetailScreen: React.FC = () => {
  const route = useRoute<GroupDetailRouteProp>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    // Listen to Firestore for group data
    const unsubscribeGroup = onSnapshot(doc(db, 'groups', groupId), (doc) => {
      if (doc.exists()) {
        setGroup({ id: doc.id, ...doc.data() } as Group);
      }
    });

    // Listen to Realtime Database for instant expense updates
    const expensesRef = ref(realtimeDb, `expenses/${groupId}`);
    const unsubscribeExpenses = onValue(expensesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const expensesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setExpenses(expensesArray);
      } else {
        setExpenses([]);
      }
    });

    return () => {
      unsubscribeGroup();
      unsubscribeExpenses();
    };
  }, [groupId]);

  const handleShare = async () => {
    try {
      const message = `${APP_CONFIG.downloadMessage}\n${APP_CONFIG.storeLink}`;
      await RNShare.share({
        message,
      });
    } catch (error: any) {
      console.error('Share error:', error);
    }
  };

  const handleShareSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const message = `${APP_CONFIG.downloadMessage}\n${APP_CONFIG.storeLink}`;
      await SMS.sendSMSAsync([], message);
    } else {
      Alert.alert('SMS not available', 'SMS is not available on this device');
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.expenseHeader}>
        <View style={[styles.expenseIcon, { backgroundColor: colors.secondary + '20' }]}>
          <Ionicons name="receipt-outline" size={24} color={colors.secondary} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.expenseAmount, { color: colors.primary }]}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  const userBalance = group.members.find((m) => m.userId === user?.id)?.balance || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Your Balance</Text>
        <Text style={[styles.balanceAmount, {
          color: userBalance > 0 ? colors.success : userBalance < 0 ? colors.error : colors.textSecondary
        }]}>
          ${Math.abs(userBalance).toFixed(2)}
        </Text>
        <Text style={[styles.balanceStatus, { color: colors.textSecondary }]}>
          {userBalance > 0 ? 'You are owed' : userBalance < 0 ? 'You owe' : 'Settled up'}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddExpense', { groupId })}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('AddMembers', { groupId })}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Add Members</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.shareRow}>
        <TouchableOpacity
          style={[styles.shareButton, { borderColor: colors.border }]}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.primary} />
          <Text style={[styles.shareButtonText, { color: colors.primary }]}>Share App</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareButton, { borderColor: colors.border }]}
          onPress={handleShareSMS}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={[styles.shareButtonText, { color: colors.primary }]}>SMS Invite</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No expenses yet. Add one to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    padding: 24,
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceStatus: {
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  expenseCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});
