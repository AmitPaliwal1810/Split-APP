import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Group } from '@types/index';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '@types/index';

// Conditionally import Firebase Firestore (won't work in Expo Go)
let firestore: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (error) {
  console.warn('⚠️ Firebase Firestore not available (Expo Go mode)');
}

const GROUP_ICONS: Record<string, string> = {
  trip: 'airplane-outline',
  home: 'home-outline',
  couple: 'heart-outline',
  friends: 'people-outline',
  work: 'briefcase-outline',
  food: 'restaurant-outline',
  other: 'grid-outline',
};

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeScreen'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (!firestore) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // Query using memberIds flat array (simple query, no composite index needed)
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = firestore()
        .collection('groups')
        .where('memberIds', 'array-contains', user.id)
        .onSnapshot(
          (snapshot: any) => {
            const groupsData = snapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data(),
            })) as Group[];
            setGroups(groupsData);
            setLoading(false);
            setRefreshing(false);
          },
          (error: any) => {
            console.error('Groups query error:', error);
            setGroups([]);
            setLoading(false);
            setRefreshing(false);
          }
        );
    } catch (error) {
      console.error('Failed to setup groups listener:', error);
      setGroups([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    // The snapshot listener will automatically update
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGroupIcon = (category?: string) => {
    return (GROUP_ICONS[category || 'other'] || GROUP_ICONS.other) as any;
  };

  const renderGroupCard = ({ item }: { item: Group }) => {
    const myMember = item.members?.find((m) => m.userId === user?.id);
    const totalBalance = myMember?.balance || 0;
    const balanceColor = totalBalance > 0 ? colors.success : totalBalance < 0 ? colors.error : colors.textSecondary;

    return (
      <TouchableOpacity
        style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
      >
        <View style={styles.groupHeader}>
          <View style={[styles.groupIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={getGroupIcon((item as any).category)} size={24} color={colors.primary} />
          </View>
          <View style={styles.groupInfo}>
            <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.membersCount, { color: colors.textSecondary }]}>
              {item.members?.length || 1} member{(item.members?.length || 1) !== 1 ? 's' : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
        <View style={[styles.balanceContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Your balance</Text>
          <Text style={[styles.balanceAmount, { color: balanceColor }]}>
            {totalBalance >= 0 ? '+' : '-'}${Math.abs(totalBalance).toFixed(2)}
          </Text>
          <Text style={[styles.balanceStatus, { color: balanceColor }]}>
            {totalBalance > 0 ? 'you are owed' : totalBalance < 0 ? 'you owe' : 'settled up'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Split Bills</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={[styles.avatarButton, { backgroundColor: colors.primary + '20' }]}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarInitial, { color: colors.primary }]}>
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No groups yet</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Create a group to start splitting expenses with friends!
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
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
    flex: 1,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
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
