import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@services/firebase';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Group } from '@types/index';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList, MainDrawerParamList } from '@types/index';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeScreen'> &
  DrawerNavigationProp<MainDrawerParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', { userId: user.id })
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];
      setGroups(groupsData);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const renderGroupCard = ({ item }: { item: Group }) => {
    const totalBalance = item.members.find((m) => m.userId === user?.id)?.balance || 0;
    const balanceColor = totalBalance > 0 ? colors.success : totalBalance < 0 ? colors.error : colors.textSecondary;

    return (
      <TouchableOpacity
        style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
      >
        <View style={styles.groupHeader}>
          <View style={[styles.groupIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="people" size={24} color={colors.primary} />
          </View>
          <View style={styles.groupInfo}>
            <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.membersCount, { color: colors.textSecondary }]}>
              {item.members.length} members
            </Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Your balance</Text>
          <Text style={[styles.balanceAmount, { color: balanceColor }]}>
            ${Math.abs(totalBalance).toFixed(2)}
          </Text>
          <Text style={[styles.balanceStatus, { color: balanceColor }]}>
            {totalBalance > 0 ? 'you are owed' : totalBalance < 0 ? 'you owe' : 'settled up'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Split Bills</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={groups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No groups yet. Create one to get started!
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  groupCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  membersCount: {
    fontSize: 14,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceStatus: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
