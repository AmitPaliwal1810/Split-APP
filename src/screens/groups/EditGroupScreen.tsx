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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { useTheme } from '@contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';
import { updateGroup } from '@services/groupService';
import { HomeStackParamList } from '@types/index';

interface EditGroupFormData {
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

type EditGroupRouteProp = RouteProp<HomeStackParamList, 'EditGroup'>;

export const EditGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditGroupRouteProp>();
  const { groupId, currentName, currentDescription, currentCategory } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'friends');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditGroupFormData>({
    defaultValues: {
      groupName: currentName || '',
      description: currentDescription || '',
    },
  });

  const handleSave = async (data: EditGroupFormData) => {
    if (!data.groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      await updateGroup(groupId, data.groupName, data.description, selectedCategory);
      Alert.alert('Success', 'Group updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Update group error:', error);
      Alert.alert('Error', error.message || 'Failed to update group');
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
            onPress={handleSubmit(handleSave)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
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
