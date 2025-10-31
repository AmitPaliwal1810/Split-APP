import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();

// Login Screen
function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (email === 'test@example.com' && password === 'test123') {
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Error', 'Invalid credentials. Use test@example.com / test123');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="wallet" size={60} color="#6366f1" />
        </View>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.testHint}>
          <Ionicons name="information-circle" size={16} color="#6366f1" />
          <Text style={styles.testHintText}>
            Test: test@example.com / test123
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#64748b"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#64748b"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Dashboard Screen
function DashboardScreen({ navigation }: any) {
  const groups = [
    { id: 1, name: 'Weekend Trip', amount: 450.50, members: 5, color: '#ef4444' },
    { id: 2, name: 'Office Lunch', amount: 125.00, members: 8, color: '#f59e0b' },
    { id: 3, name: 'Apartment Rent', amount: 2400.00, members: 4, color: '#10b981' },
  ];

  return (
    <ScrollView style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.greeting}>Hello, Test User!</Text>
          <Text style={styles.dashboardSubtitle}>Here's your expense summary</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        >
          <Ionicons name="person-circle" size={40} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#dcfce7' }]}>
          <Ionicons name="arrow-down-circle" size={32} color="#16a34a" />
          <Text style={styles.summaryAmount}>$250.00</Text>
          <Text style={styles.summaryLabel}>You'll Get</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fee2e2' }]}>
          <Ionicons name="arrow-up-circle" size={32} color="#dc2626" />
          <Text style={styles.summaryAmount}>$180.50</Text>
          <Text style={styles.summaryLabel}>You Owe</Text>
        </View>
      </View>

      {/* Groups Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Groups</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {groups.map((group) => (
        <TouchableOpacity
          key={group.id}
          style={styles.groupCard}
          onPress={() => Alert.alert(group.name, 'Group details coming soon!')}
        >
          <View style={[styles.groupIcon, { backgroundColor: group.color + '20' }]}>
            <Ionicons name="people" size={24} color={group.color} />
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupMembers}>{group.members} members</Text>
          </View>
          <View style={styles.groupAmount}>
            <Text style={styles.groupAmountText}>${group.amount.toFixed(2)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Create New Group</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Groups Screen
function GroupsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Ionicons name="people" size={80} color="#6366f1" />
        <Text style={styles.emptyTitle}>All Your Groups</Text>
        <Text style={styles.emptyText}>
          View and manage all your expense groups here
        </Text>
      </View>
    </View>
  );
}

// Profile Screen
function ProfileScreen({ navigation }: any) {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={50} color="#6366f1" />
        </View>
        <Text style={styles.profileName}>Test User</Text>
        <Text style={styles.profileEmail}>test@example.com</Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="person-outline" size={24} color="#64748b" />
          <Text style={styles.profileOptionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="notifications-outline" size={24} color="#64748b" />
          <Text style={styles.profileOptionText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="settings-outline" size={24} color="#64748b" />
          <Text style={styles.profileOptionText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="help-circle-outline" size={24} color="#64748b" />
          <Text style={styles.profileOptionText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#dc2626" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Main App
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'SplitBills',
              headerLeft: () => null,
            }}
          />
          <Stack.Screen
            name="Groups"
            component={GroupsScreen}
            options={{ title: 'My Groups' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    width: '100%',
  },
  testHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    marginBottom: 16,
    gap: 8,
  },
  testHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 48,
    fontSize: 16,
    color: '#0f172a',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: '#64748b',
  },
  groupAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 32,
    marginBottom: 12,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748b',
  },
  profileSection: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  profileOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
