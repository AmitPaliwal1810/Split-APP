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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';

interface CreateGroupFormData {
  groupName: string;
  description: string;
}

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const groupData = {
        name: data.groupName.trim(),
        description: data.description.trim(),
        createdBy: user.id,
        members: [
          {
            userId: user.id,
            displayName: user.displayName,
            photoURL: user.photoURL,
            addedAt: new Date(),
            balance: 0,
          },
        ],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('groups').add(groupData);
      Alert.alert('Success', 'Group created successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="people" size={60} color={colors.primary} />
        </View>

          <Text style={[styles.label, { color: colors.text }]}>Group Name *</Text>
          <FormInput
            name="groupName"
            control={control}
            placeholder="e.g., Weekend Trip, Roommates"
            error={errors.groupName}
          />

          <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
          <FormInput
            name="description"
            control={control}
            placeholder="Add a description for this group"
            multiline
            numberOfLines={4}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
