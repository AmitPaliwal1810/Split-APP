import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from '@services/authService';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';

// Conditionally import Firebase Storage (won't work in Expo Go)
let storage: any = null;
try {
  storage = require('@react-native-firebase/storage').default;
} catch (error) {
  console.warn('⚠️ Firebase Storage not available (Expo Go mode)');
}

interface ProfileFormData {
  displayName: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export const ProfileScreen: React.FC = () => {
  const { user, setUser } = useAuth();
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
      });
    }
  }, [user, reset]);

  const handlePickImage = async () => {
    // Check if Firebase Storage is available
    if (!storage) {
      Alert.alert(
        'Feature Not Available',
        'Profile picture upload is not available in Expo Go.\n\nFor full features, run:\nnpx expo prebuild && npx expo run:android'
      );
      return;
    }

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
        const reference = storage().ref(`profile_images/${user.id}`);
        await reference.putFile(imageUri);
        const photoURL = await reference.getDownloadURL();

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

  const handleSave = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.id, {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
      });

      setUser({
        ...user,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
      });

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    reset({
      displayName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
    });
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
            {editing ? (
              <>
                <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
                  <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
                  <View style={styles.formInputWrapper}>
                    <FormInput
                      name="displayName"
                      control={control}
                      placeholder="Display Name"
                      error={errors.displayName}
                    />
                  </View>
                </View>

                <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
                  <Ionicons name="call-outline" size={24} color={colors.textSecondary} />
                  <View style={styles.formInputWrapper}>
                    <FormInput
                      name="phoneNumber"
                      control={control}
                      placeholder="Phone Number"
                      keyboardType="phone-pad"
                      error={errors.phoneNumber}
                    />
                  </View>
                </View>

                <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
                  <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
                  <View style={styles.formInputWrapper}>
                    <FormInput
                      name="dateOfBirth"
                      control={control}
                      placeholder="Date of Birth (YYYY-MM-DD)"
                      error={errors.dateOfBirth}
                    />
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {user?.displayName || 'Not set'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Ionicons name="call-outline" size={24} color={colors.textSecondary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {user?.phoneNumber || 'Not set'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date of Birth</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {user?.dateOfBirth || 'Not set'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

        {editing ? (
          <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmit(handleSave)}
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
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  formInputWrapper: {
    flex: 1,
    marginLeft: 16,
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
