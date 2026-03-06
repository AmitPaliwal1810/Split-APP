import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserData } from '@services/authService';
import { User } from '@types/index';
import { auth, isFirebaseAvailable } from '@services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext: Setting up auth listener...');
    console.log('🔥 Firebase available:', isFirebaseAvailable);

    // If Firebase auth is not available (Expo Go mode), just set loading to false
    if (!auth || !isFirebaseAvailable) {
      console.log('⚠️ AuthContext: Firebase not available (Expo Go mode)');
      console.log('💡 Use test@example.com / test123 for testing');
      setLoading(false);
      return;
    }

    // Set up auth state listener for React Native Firebase
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser: any) => {
      console.log('🔄 AuthContext: Auth state changed');
      console.log('👤 Firebase user:', firebaseUser?.email || 'null');

      if (firebaseUser) {
        try {
          console.log('📄 AuthContext: Fetching user data from Firestore...');
          const userData = await getUserData(firebaseUser.uid);
          console.log('✅ AuthContext: User data fetched:', userData?.displayName);
          setUser(userData);
        } catch (error) {
          console.error('❌ AuthContext: Error fetching user data:', error);
          setUser(null);
        }
      } else {
        console.log('🚪 AuthContext: No user signed in');
        setUser(null);
      }
      setLoading(false);
      console.log('✅ AuthContext: Loading complete');
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
