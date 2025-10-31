import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { signOut } from '@services/authService';
import { HomeNavigator } from './HomeNavigator';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { MainDrawerParamList } from '@types/index';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

const CustomDrawerContent = (props: any) => {
  const { colors, theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        <View style={styles.menuItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={toggleTheme}
        >
          <Ionicons
            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={24}
            color={colors.text}
          />
          <Text style={[styles.footerText, { color: colors.text }]}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.footerText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const DrawerNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerScroll: {
    flexGrow: 1,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuItems: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 16,
    marginLeft: 32,
  },
});
