import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';
import { createGroup } from '@services/groupService';

interface CreateGroupFormData {
  groupName: string;
  description: string;
}

const GROUP_CATEGORIES = [
  { id: 'trip', label: 'Trip', icon: 'airplane-outline' as const },
  { id: 'home', label: 'Home', icon: 'home-outline' as const },
  { id: 'couple', label: 'Couple', icon: 'heart-outline' as const },
  { id: 'friends', label: 'Friends', icon: 'people-outline' as const },
  { id: 'work', label: 'Work', icon: 'briefcase-outline' as const },
  { id: 'food', label: 'Food', icon: 'restaurant-outline' as const },
  { id: 'other', label: 'Other', icon: 'grid-outline' as const },
];

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('friends');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    defaultValues: {
      groupName: '',
      description: '',
    },
  });

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    if (!user) return;

    if (!data.groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      await createGroup(
        data.groupName,
        data.description,
        selectedCategory,
        user.id,
        user.displayName || 'User',
        user.photoURL
      );
      Alert.alert('Success', 'Group created successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Create group error:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons
              name={GROUP_CATEGORIES.find(c => c.id === selectedCategory)?.icon || 'people-outline'}
              size={60}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Group Name *</Text>
          <FormInput
            name="groupName"
            control={control}
            placeholder="e.g., Weekend Trip, Roommates"
            error={errors.groupName}
          />

          <Text style={[styles.label, { color: colors.text }]}>Group Type</Text>
          <View style={styles.categoryGrid}>
            {GROUP_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  selectedCategory === cat.id && { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={24}
                  color={selectedCategory === cat.id ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.categoryLabel,
                  { color: selectedCategory === cat.id ? colors.primary : colors.textSecondary },
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
          <FormInput
            name="description"
            control={control}
            placeholder="What's this group for?"
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(handleCreateGroup)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryItem: {
    width: '30%',
    flexGrow: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
