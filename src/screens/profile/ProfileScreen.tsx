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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
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

const CLOUDINARY_CLOUD_NAME = 'ecommerece';
const CLOUDINARY_UPLOAD_PRESET = 'ozyrxz4b';

let firestore: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (error) {
  console.warn('⚠️ Firestore not available (Expo Go mode)');
}

const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', { uri: imageUri, type: 'image/jpeg', name: 'profile.jpg' } as any);
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return 'Not set';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
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

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<ProfileFormData>({
      defaultValues: {
        displayName: user?.displayName || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth || '',
      },
    });

  const dobValue = watch('dateOfBirth');

  useEffect(() => {
    if (user) {
      reset({ displayName: user.displayName || '', phoneNumber: user.phoneNumber || '', dateOfBirth: user.dateOfBirth || '' });
      if (user.dateOfBirth) setSelectedDate(new Date(user.dateOfBirth));
    }
  }, [user, reset]);

  useEffect(() => {
    if (route.params?.startEditing) { setEditing(true); navigation.setParams({ startEditing: undefined }); }
  }, [route.params?.startEditing, navigation]);

  useEffect(() => {
    if (user?.needsProfileSetup) setEditing(true);
  }, [user?.needsProfileSetup]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try { await signOut(); setUser(null); }
          catch (error: any) { Alert.alert('Error', error.message || 'Failed to sign out'); }
        },
      },
    ]);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && date) { setSelectedDate(date); setValue('dateOfBirth', formatDate(date)); }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) { Alert.alert('Permission Required', 'Permission to access camera roll is required!'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      if (!result.canceled && user) {
        setLoading(true);
        const photoURL = await uploadToCloudinary(result.assets[0].uri);
        if (firestore) await firestore().collection('users').doc(user.id).set({ photoURL, updatedAt: new Date() }, { merge: true });
        try {
          const auth = require('@react-native-firebase/auth').default;
          const currentUser = auth().currentUser;
          if (currentUser) await currentUser.updateProfile({ photoURL });
        } catch (e) { console.warn('Could not update auth profile photo:', e); }
        setUser({ ...user, photoURL });
        Alert.alert('Success', 'Profile picture updated!');
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload image');
      setLoading(false);
    }
  };

  const handleSave = async (data: ProfileFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      if (firestore) {
        await firestore().collection('users').doc(user.id).set(
          { displayName: data.displayName.trim(), phoneNumber: data.phoneNumber.trim(), dateOfBirth: data.dateOfBirth, needsProfileSetup: false, updatedAt: new Date() },
          { merge: true }
        );
      }
      try {
        const auth = require('@react-native-firebase/auth').default;
        const currentUser = auth().currentUser;
        if (currentUser) await currentUser.updateProfile({ displayName: data.displayName.trim() });
      } catch (e) { console.warn('Could not update auth display name:', e); }
      setUser({ ...user, displayName: data.displayName.trim(), phoneNumber: data.phoneNumber.trim(), dateOfBirth: data.dateOfBirth, needsProfileSetup: false });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const handleCancel = () => {
    setEditing(false);
    reset({ displayName: user?.displayName || '', phoneNumber: user?.phoneNumber || '', dateOfBirth: user?.dateOfBirth || '' });
    if (user?.dateOfBirth) setSelectedDate(new Date(user.dateOfBirth));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {/* Top - Profile Section */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }}>
      <View style={[styles.profileTop, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={loading}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Text style={styles.avatarInitial}>
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
          <View style={[styles.cameraIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
      </SafeAreaView>

      <ScrollView style={styles.menuContainer}>
        {/* Edit Profile form or menu item */}
        {editing ? (
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Edit Profile</Text>

            <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
              <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
              <View style={styles.formInputWrapper}>
                <FormInput name="displayName" control={control} placeholder="Display Name" error={errors.displayName} />
              </View>
            </View>

            <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
              <Ionicons name="call-outline" size={22} color={colors.textSecondary} />
              <View style={styles.formInputWrapper}>
                <FormInput name="phoneNumber" control={control} placeholder="Phone Number" keyboardType="phone-pad" error={errors.phoneNumber} />
              </View>
            </View>

            <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
              <View style={styles.formInputWrapper}>
                <TouchableOpacity
                  style={[styles.datePickerButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.datePickerText, { color: dobValue ? colors.text : colors.textSecondary }]}>
                    {dobValue ? formatDisplayDate(dobValue) : 'Select Date of Birth'}
                  </Text>
                  <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <View>
                <DateTimePicker
                  value={selectedDate} mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange} maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[styles.dateConfirmButton, { backgroundColor: colors.primary }]}
                    onPress={() => { setShowDatePicker(false); setValue('dateOfBirth', formatDate(selectedDate)); }}
                  >
                    <Text style={styles.dateConfirmText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleCancel}>
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSubmit(handleSave)} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            {/* Edit Profile */}
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => setEditing(true)}>
              <View style={[styles.menuIconBox, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextBox}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Edit Profile</Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Name, phone, date of birth</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Dark / Light Mode */}
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleTheme}>
              <View style={[styles.menuIconBox, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.secondary} />
              </View>
              <View style={styles.menuTextBox}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Switch app theme</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom - Logout */}
      {!editing && (
        <TouchableOpacity style={[styles.logoutButton, { borderTopColor: colors.border }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileTop: {
    paddingTop: 48,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarInitial: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },

  menuContainer: { flex: 1, padding: 16 },

  menuCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuTextBox: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  menuSub: { fontSize: 12, marginTop: 2 },

  formCard: { borderRadius: 14, padding: 16, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  formRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 8, borderBottomWidth: 1,
  },
  formInputWrapper: { flex: 1, marginLeft: 12 },
  datePickerButton: {
    height: 52, borderWidth: 1, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14, marginBottom: 8,
  },
  datePickerText: { fontSize: 15 },
  dateConfirmButton: {
    alignSelf: 'center', paddingHorizontal: 28,
    paddingVertical: 8, borderRadius: 8, marginVertical: 8,
  },
  dateConfirmText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: {
    flex: 1, height: 48, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },
  saveButton: {
    flex: 1, height: 48, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderTopWidth: 1, gap: 10,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
});
