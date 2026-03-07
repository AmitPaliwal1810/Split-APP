import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { Contact, Group } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '@constants/config';
import { addGroupMember } from '@services/groupService';

// Conditionally import Firebase Firestore
let firestore: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (error) {
  console.warn('⚠️ Firebase Firestore not available (Expo Go mode)');
}

export const AddMembersScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { groupId } = route.params as { groupId: string };
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [appUserMap, setAppUserMap] = useState<Record<string, { id: string; displayName: string; photoURL?: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    loadGroup();
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const loadGroup = async () => {
    if (!firestore) return;
    try {
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      if (groupDoc.exists) {
        setGroup({ id: groupDoc.id, ...groupDoc.data() } as Group);
      }
    } catch (error: any) {
      console.error('Load group error:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          const formattedContacts: Contact[] = data
            .filter((c) => c.name)
            .map((contact) => ({
              id: contact.id || String(Math.random()),
              name: contact.name || 'Unknown',
              phoneNumbers: contact.phoneNumbers || [],
              isAppUser: false,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);

          // Check which contacts have the app by matching phone numbers in Firestore
          if (firestore) {
            const allPhoneNumbers = formattedContacts
              .flatMap((c) => (c.phoneNumbers || []).map((p) => p.number?.replace(/\s+/g, '') || ''))
              .filter(Boolean);

            if (allPhoneNumbers.length > 0) {
              // Firestore 'in' query supports max 30 items at a time
              const chunks: string[][] = [];
              for (let i = 0; i < allPhoneNumbers.length; i += 30) {
                chunks.push(allPhoneNumbers.slice(i, i + 30));
              }
              const userMap: Record<string, { id: string; displayName: string; photoURL?: string }> = {};
              for (const chunk of chunks) {
                const snapshot = await firestore()
                  .collection('users')
                  .where('phoneNumber', 'in', chunk)
                  .get();
                snapshot.docs.forEach((doc: any) => {
                  const d = doc.data();
                  const phone = (d.phoneNumber || '').replace(/\s+/g, '');
                  if (phone) {
                    userMap[phone] = { id: doc.id, displayName: d.displayName || 'User', photoURL: d.photoURL };
                  }
                });
              }
              setAppUserMap(userMap);
            }
          }
        }
      } else {
        Alert.alert('Permission Denied', 'Cannot access contacts without permission');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleInviteSMS = async (contact: Contact) => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const phoneNumber = contact.phoneNumbers[0].number || '';
      const message = `Hi ${contact.name}! Join my group "${group?.name}" on SplitBills!\n${APP_CONFIG.downloadMessage}\n${APP_CONFIG.storeLink}`;
      await SMS.sendSMSAsync([phoneNumber], message);
    } else {
      Alert.alert('SMS not available', 'Cannot send SMS on this device');
    }
  };

  const handleAddByEmail = async () => {
    if (!emailInput.trim() || !firestore || !user) return;

    setLoading(true);
    try {
      // Search for user by email in Firestore
      const usersSnapshot = await firestore()
        .collection('users')
        .where('email', '==', emailInput.trim().toLowerCase())
        .get();

      if (usersSnapshot.empty) {
        Alert.alert(
          'User Not Found',
          'No user found with this email. Would you like to send an invite?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send Invite',
              onPress: async () => {
                const isAvailable = await SMS.isAvailableAsync();
                if (isAvailable) {
                  const message = `Join my group "${group?.name}" on SplitBills!\n${APP_CONFIG.downloadMessage}\n${APP_CONFIG.storeLink}`;
                  await SMS.sendSMSAsync([], message);
                }
              },
            },
          ]
        );
        return;
      }

      const foundUser = usersSnapshot.docs[0].data();
      const foundUserId = usersSnapshot.docs[0].id;

      if (foundUserId === user.id) {
        Alert.alert('Error', 'You are already in this group!');
        return;
      }

      await addGroupMember(
        groupId,
        foundUserId,
        foundUser.displayName || 'User',
        foundUser.photoURL
      );

      Alert.alert('Success', `${foundUser.displayName || foundUser.email} added to the group!`);
      setEmailInput('');
      loadGroup(); // Refresh group data
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const getAppUser = (contact: Contact) => {
    for (const p of (contact.phoneNumbers || [])) {
      const normalized = (p.number || '').replace(/\s+/g, '');
      if (appUserMap[normalized]) return appUserMap[normalized];
    }
    return null;
  };

  const handleAddAppUser = async (appUser: { id: string; displayName: string; photoURL?: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      await addGroupMember(groupId, appUser.id, appUser.displayName, appUser.photoURL);
      Alert.alert('Success', `${appUser.displayName} added to the group!`);
      loadGroup();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isMember = group?.members?.some((m) => m.displayName === item.name);
    const appUser = getAppUser(item);

    return (
      <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
            {appUser && (
              <View style={[styles.appBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.appBadgeText, { color: colors.primary }]}>On App</Text>
              </View>
            )}
          </View>
          {item.phoneNumbers && item.phoneNumbers.length > 0 && (
            <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
              {item.phoneNumbers[0].number}
            </Text>
          )}
        </View>
        {isMember ? (
          <View style={[styles.memberBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.memberBadgeText, { color: colors.success }]}>Member</Text>
          </View>
        ) : appUser ? (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => handleAddAppUser(appUser)}
            disabled={loading}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.inviteButton, { borderColor: colors.primary }]}
            onPress={() => handleInviteSMS(item)}
          >
            <Text style={[styles.inviteText, { color: colors.primary }]}>Invite</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Add by email section */}
      <View style={[styles.addByEmailSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Search by Email</Text>
        <View style={styles.emailRow}>
          <TextInput
            style={[styles.emailInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Enter email address"
            placeholderTextColor={colors.textSecondary}
            value={emailInput}
            onChangeText={setEmailInput}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.addEmailButton, { backgroundColor: colors.primary }]}
            onPress={handleAddByEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="add" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search contacts */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contacts list */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No contacts found
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
  addByEmailSection: {
    padding: 16,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  emailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emailInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  addEmailButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
  },
  appBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  appBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  inviteText: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
