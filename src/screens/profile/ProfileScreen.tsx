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
  Platform,
} from 'react-native';

import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { updateUserProfile, signOut } from '@services/authService';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';
import type { HomeStackParamList } from '@types/index';

// Cloudinary config (public values, safe to hardcode)
const CLOUDINARY_CLOUD_NAME = 'ecommerece';
const CLOUDINARY_UPLOAD_PRESET = 'ozyrxz4b';

// Conditionally import Firestore
let firestore: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (error) {
  console.warn('⚠️ Firestore not available (Expo Go mode)');
}

const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  const data = await response.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
};

interface ProfileFormData {
  displayName: string;
  phoneNumber: string;
  dateOfBirth: string;
}

type ProfileRouteProp = RouteProp<HomeStackParamList, 'Profile'>;
type ProfileNavigationProp = StackNavigationProp<HomeStackParamList, 'Profile'>;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return 'Not set';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileRouteProp>();
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, setUser } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date(2000, 0, 1)
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
    },
  });

  const dobValue = watch('dateOfBirth');

  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
      });
      if (user.dateOfBirth) {
        setSelectedDate(new Date(user.dateOfBirth));
      }
    }
  }, [user, reset]);

  useEffect(() => {
    if (route.params?.startEditing) {
      setEditing(true);
      navigation.setParams({ startEditing: undefined });
    }
  }, [route.params?.startEditing, navigation]);

  useEffect(() => {
    if (user?.needsProfileSetup) {
      setEditing(true);
    }
  }, [user?.needsProfileSetup]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            setUser(null);
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      setValue('dateOfBirth', formatDate(date));
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && user) {
        setLoading(true);
        const imageUri = result.assets[0].uri;

        // Upload to Cloudinary
        const photoURL = await uploadToCloudinary(imageUri);

        // Update Firestore
        if (firestore) {
          await firestore().collection('users').doc(user.id).set(
            { photoURL, updatedAt: new Date() },
            { merge: true }
          );
        }

        // Update Firebase Auth profile
        try {
          const auth = require('@react-native-firebase/auth').default;
          const currentUser = auth().currentUser;
          if (currentUser) {
            await currentUser.updateProfile({ photoURL });
          }
        } catch (e) {
          console.warn('Could not update auth profile photo:', e);
        }

        setUser({ ...user, photoURL });
        Alert.alert('Success', 'Profile picture updated!');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
      setLoading(false);
    }
  };

  const handleSave = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Use set with merge to handle both new and existing documents
      if (firestore) {
        await firestore().collection('users').doc(user.id).set(
          {
            displayName: data.displayName.trim(),
            phoneNumber: data.phoneNumber.trim(),
            dateOfBirth: data.dateOfBirth,
            needsProfileSetup: false,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }

      // Update Firebase Auth display name
      try {
        const auth = require('@react-native-firebase/auth').default;
        const currentUser = auth().currentUser;
        if (currentUser) {
          await currentUser.updateProfile({
            displayName: data.displayName.trim(),
          });
        }
      } catch (e) {
        console.warn('Could not update auth display name:', e);
      }

      setUser({
        ...user,
        displayName: data.displayName.trim(),
        phoneNumber: data.phoneNumber.trim(),
        dateOfBirth: data.dateOfBirth,
        needsProfileSetup: false,
      });

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
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
    if (user?.dateOfBirth) {
      setSelectedDate(new Date(user.dateOfBirth));
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
                  <TouchableOpacity
                    style={[styles.datePickerButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.datePickerText, { color: dobValue ? colors.text : colors.textSecondary }]}>
                      {dobValue ? formatDisplayDate(dobValue) : 'Select Date of Birth'}
                    </Text>
                    <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <View>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1920, 0, 1)}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={[styles.dateConfirmButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setShowDatePicker(false);
                        setValue('dateOfBirth', formatDate(selectedDate));
                      }}
                    >
                      <Text style={styles.dateConfirmText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
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
                    {formatDisplayDate(user?.dateOfBirth || '')}
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

        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={20}
            color={colors.text}
          />
          <Text style={[styles.themeButtonText, { color: colors.text }]}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutButtonText, { color: colors.error }]}>Sign Out</Text>
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
  datePickerButton: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
  },
  dateConfirmButton: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  dateConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  themeButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
