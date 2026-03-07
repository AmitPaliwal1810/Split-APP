import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm } from 'react-hook-form';
import type { RootStackParamList } from '../../types';
import { useTheme } from '@contexts/ThemeContext';
import { signUpWithEmail, signInWithGoogle } from '@services/authService';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@components/common/FormInput';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterFormData {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRegister = async (data: RegisterFormData) => {
    if (!data.phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (data.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.phoneNumber.trim());
      console.log('✅ Registration successful - Firebase auth listener will handle navigation');
      // Don't call setUser or setLoading(false) here
      // Firebase's onAuthStateChanged listener will automatically:
      // 1. Detect the new user
      // 2. Fetch user data from Firestore
      // 3. Update the user state
      // 4. Trigger navigation to Main screen
    } catch (error: any) {
      console.error('❌ Registration failed:', error.message);
      Alert.alert('Registration Failed', error.message);
      setLoading(false); // Only stop loading on error
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      console.log('✅ Google sign-in successful - Firebase auth listener will handle navigation');
      // Firebase's onAuthStateChanged listener will handle the rest
    } catch (error: any) {
      console.error('❌ Google sign-in failed:', error.message);
      Alert.alert('Google Sign-In Failed', error.message);
      setLoading(false); // Only stop loading on error
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="wallet" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign up to get started
          </Text>
        </View>

          <View style={styles.form}>
            <FormInput
              name="email"
              control={control}
              placeholder="Email"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <FormInput
              name="phoneNumber"
              control={control}
              placeholder="Phone Number (required)"
              icon="call-outline"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
            />

            <FormInput
              name="password"
              control={control}
              placeholder="Password"
              icon="lock-closed-outline"
              isPassword
              autoComplete="password"
              error={errors.password}
            />

            <FormInput
              name="confirmPassword"
              control={control}
              placeholder="Confirm Password"
              icon="lock-closed-outline"
              isPassword
              autoComplete="password"
              error={errors.confirmPassword}
            />

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit(handleRegister)}
              disabled={loading}
            >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, { borderColor: colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
