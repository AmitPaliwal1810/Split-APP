import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Share as RNShare,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { Group, Expense, GroupMember } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../types';
import { APP_CONFIG } from '@constants/config';
import * as SMS from 'expo-sms';

// Conditionally import Firebase modules
let firestore: any = null;
let database: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
  database = require('@react-native-firebase/database').default;
} catch (error) {
  console.warn('⚠️ Firebase not available (Expo Go mode)');
}

type GroupDetailRouteProp = RouteProp<HomeStackParamList, 'GroupDetail'>;

export const GroupDetailScreen: React.FC = () => {
  const route = useRoute<GroupDetailRouteProp>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !database) {
      Alert.alert('Not Available', 'Firebase is required for this screen.');
      setLoading(false);
      return;
    }

    // Listen to Firestore for group data
    const unsubscribeGroup = firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot((doc: any) => {
        if (doc.exists) {
          setGroup({ id: doc.id, ...doc.data() } as Group);
        }
        setLoading(false);
      });

    // Listen to Realtime Database for instant expense updates
    const expensesRef = database().ref(`expenses/${groupId}`);
    expensesRef.on('value', (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const expensesArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExpenses(expensesArray);
      } else {
        setExpenses([]);
      }
    });

    return () => {
      unsubscribeGroup();
      expensesRef.off('value');
    };
  }, [groupId]);

  const handleShare = async () => {
    try {
      const message = `Join my group "${group?.name}" on SplitBills!\n${APP_CONFIG.downloadMessage}\n${APP_CONFIG.storeLink}`;
      await RNShare.share({ message });
    } catch (error: any) {
      console.error('Share error:', error);
    }
  };

  const handleShareSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const message = `Join my group "${group?.name}" on SplitBills!\n${APP_CONFIG.downloadMessage}\n${APP_CONFIG.storeLink}`;
      await SMS.sendSMSAsync([], message);
    } else {
      Alert.alert('SMS not available', 'SMS is not available on this device');
    }
  };

  const getMemberName = (userId: string) => {
    const member = group?.members?.find((m) => m.userId === userId);
    return member?.displayName || 'Unknown';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const paidByMe = item.paidBy === user?.id;
    const paidByName = paidByMe ? 'You' : getMemberName(item.paidBy);
    const mySplit = item.splits?.find((s) => s.userId === user?.id);
    const myShare = mySplit?.amount || 0;

    return (
      <TouchableOpacity
        style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('ExpenseDetail' as any, { expenseId: item.id, groupId })}
      >
        <View style={styles.expenseHeader}>
          <View style={[styles.expenseIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="receipt-outline" size={24} color={colors.secondary} />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.expensePaidBy, { color: colors.textSecondary }]}>
              {paidByName} paid ${item.amount?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.expenseRight}>
            <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
              {formatDate(item.createdAt as any)}
            </Text>
            {paidByMe ? (
              <Text style={[styles.expenseYouGet, { color: colors.success }]}>
                +${(item.amount - myShare).toFixed(2)}
              </Text>
            ) : (
              <Text style={[styles.expenseYouOwe, { color: colors.error }]}>
                -${myShare.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMemberItem = (member: GroupMember) => {
    const isMe = member.userId === user?.id;
    const balanceColor = member.balance > 0 ? colors.success : member.balance < 0 ? colors.error : colors.textSecondary;

    return (
      <View key={member.userId} style={styles.memberRow}>
        <View style={[styles.memberAvatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.memberInitial, { color: colors.primary }]}>
            {(member.displayName || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.memberName, { color: colors.text }]}>
          {isMe ? 'You' : member.displayName}
        </Text>
        <Text style={[styles.memberBalance, { color: balanceColor }]}>
          {member.balance >= 0 ? '+' : ''}${member.balance?.toFixed(2) || '0.00'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Group not found</Text>
      </View>
    );
  }

  const userBalance = group.members?.find((m) => m.userId === user?.id)?.balance || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Your Balance</Text>
              <Text style={[styles.balanceAmount, {
                color: userBalance > 0 ? colors.success : userBalance < 0 ? colors.error : colors.textSecondary
              }]}>
                {userBalance >= 0 ? '+' : '-'}${Math.abs(userBalance).toFixed(2)}
              </Text>
              <Text style={[styles.balanceStatus, { color: colors.textSecondary }]}>
                {userBalance > 0 ? 'You are owed' : userBalance < 0 ? 'You owe' : 'All settled up'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AddExpense' as any, { groupId })}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Add Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                onPress={() => navigation.navigate('AddMembers' as any, { groupId })}
              >
                <Ionicons name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Add Members</Text>
              </TouchableOpacity>
            </View>

            {/* Share Buttons */}
            <View style={styles.shareRow}>
              <TouchableOpacity
                style={[styles.shareButton, { borderColor: colors.border }]}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                <Text style={[styles.shareButtonText, { color: colors.primary }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { borderColor: colors.border }]}
                onPress={handleShareSMS}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                <Text style={[styles.shareButtonText, { color: colors.primary }]}>SMS Invite</Text>
              </TouchableOpacity>
            </View>

            {/* Members Section */}
            <View style={[styles.membersSection, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Members ({group.members?.length || 0})
              </Text>
              {group.members?.map(renderMemberItem)}
            </View>

            {/* Expenses Header */}
            <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginTop: 8 }]}>
              Expenses ({expenses.length})
            </Text>
          </>
        }
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  balanceCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
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
    gap: 12,
    marginBottom: 12,
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
    gap: 12,
    marginBottom: 16,
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
  membersSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberName: {
    flex: 1,
    fontSize: 15,
  },
  memberBalance: {
    fontSize: 15,
    fontWeight: '600',
  },
  expenseCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  expensePaidBy: {
    fontSize: 13,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  expenseYouGet: {
    fontSize: 14,
    fontWeight: '600',
  },
  expenseYouOwe: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});
