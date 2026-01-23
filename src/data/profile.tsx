import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadUsers } from './seedLoader';
import type { UserPreferences, UserProfile } from '../models/types';

const STORAGE_KEY = '@coffee/profile';

const DEFAULT_PREFERENCES: UserPreferences = {
  marketingOptIn: false,
  orderUpdates: true,
};

const buildInitialProfile = (): UserProfile => {
  const seed = loadUsers()[0];
  return {
    id: seed?.id ?? 'local-user',
    name: seed?.name ?? '',
    email: seed?.email ?? '',
    phone: seed?.phone ?? '',
    preferences: DEFAULT_PREFERENCES,
  };
};

type ProfileContextValue = {
  profile: UserProfile;
  isLoading: boolean;
  saveProfile: (next: UserProfile) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const normalizeProfile = (profile: UserProfile): UserProfile => ({
  ...profile,
  preferences: {
    ...DEFAULT_PREFERENCES,
    ...(profile.preferences ?? {}),
  },
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(buildInitialProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserProfile;
          if (parsed && typeof parsed === 'object') {
            setProfile(normalizeProfile({ ...buildInitialProfile(), ...parsed }));
          }
        }
      } catch {
        setProfile(buildInitialProfile());
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveProfile = useCallback(async (next: UserProfile) => {
    const normalized = normalizeProfile(next);
    setProfile(normalized);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      saveProfile,
    }),
    [profile, isLoading, saveProfile],
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
