import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@split-app/hasCompletedOnboarding';

interface OnboardingContextValue {
    hasCompletedOnboarding: boolean;
    loading: boolean;
    completeOnboarding: () => Promise<void>;
    resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
                setHasCompletedOnboarding(storedValue === 'true');
            } catch (error) {
                console.error('Failed to load onboarding status:', error);
                setHasCompletedOnboarding(false);
            } finally {
                setLoading(false);
            }
        };

        loadStatus();
    }, []);

    const completeOnboarding = async () => {
        try {
            setHasCompletedOnboarding(true);
            await AsyncStorage.setItem(STORAGE_KEY, 'true');
        } catch (error) {
            console.error('Failed to persist onboarding completion:', error);
        }
    };

    const resetOnboarding = async () => {
        try {
            setHasCompletedOnboarding(false);
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to reset onboarding status:', error);
        }
    };

    const value = useMemo(
        () => ({
            hasCompletedOnboarding,
            loading,
            completeOnboarding,
            resetOnboarding,
        }),
        [hasCompletedOnboarding, loading]
    );

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = (): OnboardingContextValue => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};


