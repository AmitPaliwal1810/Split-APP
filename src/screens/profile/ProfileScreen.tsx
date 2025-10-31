import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@services/firebase';
import { updateUserProfile } from '@services/authService';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { user, setUser } = useAuth();
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && user) {
        setLoading(true);
        const imageUri = result.assets[0].uri;

        // Upload to Firebase Storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = storageRef(storage, `profile_images/${user.id}`);
        await uploadBytes(imageRef, blob);
        const photoURL = await getDownloadURL(imageRef);

        // Update user profile
        await updateUserProfile(user.id, { photoURL });
        setUser({ ...user, photoURL });

        Alert.alert('Success', 'Profile picture updated!');
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.id, {
        displayName,
        phoneNumber,
        dateOfBirth,
      });

      setUser({
        ...user,
        displayName,
        phoneNumber,
        dateOfBirth,
      });

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}
            onPress={handlePickImage}
            disabled={loading}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={60} color={colors.primary} />
            )}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
            {editing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {displayName || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={24} color={colors.textSecondary} />
            {editing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Phone Number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            ) : (
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {phoneNumber || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
            {editing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="Date of Birth (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date of Birth</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {dateOfBirth || 'Not set'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {editing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => {
                setEditing(false);
                setDisplayName(user?.displayName || '');
                setPhoneNumber(user?.phoneNumber || '');
                setDateOfBirth(user?.dateOfBirth || '');
              }}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    marginLeft: 16,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
