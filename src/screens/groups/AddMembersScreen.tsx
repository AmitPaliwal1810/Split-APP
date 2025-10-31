import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@services/firebase';
import { useTheme } from '@contexts/ThemeContext';
import { Contact } from '@types/index';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '@constants/config';

export const AddMembersScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { groupId } = route.params as { groupId: string };
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          const formattedContacts: Contact[] = data.map((contact) => ({
            id: contact.id,
            name: contact.name || 'Unknown',
            phoneNumbers: contact.phoneNumbers || [],
            isAppUser: false, // You would check this against your user database
          }));
          setContacts(formattedContacts);
        }
      } else {
        Alert.alert('Permission Denied', 'Cannot access contacts without permission');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleInvite = async (contact: Contact) => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const phoneNumber = contact.phoneNumbers[0].number || '';
      const message = `Hi ${contact.name}! ${APP_CONFIG.downloadMessage}\n${APP_CONFIG.storeLink}`;
      await SMS.sendSMSAsync([phoneNumber], message);
    } else {
      Alert.alert('SMS not available', 'Cannot send SMS on this device');
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
          <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
            {item.phoneNumbers[0].number}
          </Text>
        )}
      </View>
      {item.isAppUser ? (
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.inviteButton, { borderColor: colors.primary }]}
          onPress={() => handleInvite(item)}
        >
          <Text style={[styles.inviteText, { color: colors.primary }]}>Invite</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '600',
  },
});
