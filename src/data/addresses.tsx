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
import type { Address } from '../models/types';

const STORAGE_KEY = '@coffee/addresses';

const buildSeedAddresses = (): Address[] => {
  const seedUser = loadUsers()[0];
  const userId = seedUser?.id ?? 'local-user';
  return [
    {
      id: 'addr_001',
      userId,
      label: 'Home',
      line1: '18 Jalan SS 2/24',
      city: 'Petaling Jaya',
      postalCode: '47300',
      note: 'Leave at guardhouse',
      isDefault: true,
    },
    {
      id: 'addr_002',
      userId,
      label: 'Office',
      line1: 'Level 12, Menara Spring',
      city: 'Kuala Lumpur',
      postalCode: '50450',
      isDefault: false,
    },
  ];
};

const normalizeDefault = (addresses: Address[]) => {
  if (addresses.length === 0) {
    return [];
  }
  const defaultIndex = addresses.findIndex((address) => address.isDefault);
  const resolvedIndex = defaultIndex >= 0 ? defaultIndex : 0;
  return addresses.map((address, index) => ({
    ...address,
    isDefault: index === resolvedIndex,
  }));
};

type AddressContextValue = {
  addresses: Address[];
  isLoading: boolean;
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
};

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

export const AddressesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [addresses, setAddresses] = useState<Address[]>(buildSeedAddresses);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAddresses = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Address[];
          if (Array.isArray(parsed)) {
            setAddresses(normalizeDefault(parsed));
            return;
          }
        }
        setAddresses(normalizeDefault(buildSeedAddresses()));
      } catch {
        setAddresses(normalizeDefault(buildSeedAddresses()));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses, isLoading]);

  const addAddress = useCallback(async (address: Address) => {
    setAddresses((prev) => {
      const hasDefault = prev.some((entry) => entry.isDefault);
      const shouldBeDefault = address.isDefault || !hasDefault;
      const next = [
        ...prev.map((entry) =>
          shouldBeDefault ? { ...entry, isDefault: false } : entry,
        ),
        { ...address, isDefault: shouldBeDefault },
      ];
      return normalizeDefault(next);
    });
  }, []);

  const updateAddress = useCallback(
    async (id: string, updates: Partial<Address>) => {
      setAddresses((prev) => {
        const existing = prev.find((entry) => entry.id === id);
        if (!existing) {
          return prev;
        }
        const next = prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry,
        );
        if (updates.isDefault) {
          return normalizeDefault(
            next.map((entry) =>
              entry.id === id
                ? { ...entry, isDefault: true }
                : { ...entry, isDefault: false },
            ),
          );
        }
        if (existing.isDefault && updates.isDefault === false) {
          return normalizeDefault(
            next.map((entry) =>
              entry.id === id ? { ...entry, isDefault: false } : entry,
            ),
          );
        }
        return normalizeDefault(next);
      });
    },
    [],
  );

  const removeAddress = useCallback(async (id: string) => {
    setAddresses((prev) => normalizeDefault(prev.filter((entry) => entry.id !== id)));
  }, []);

  const value = useMemo(
    () => ({
      addresses,
      isLoading,
      addAddress,
      updateAddress,
      removeAddress,
    }),
    [addresses, isLoading, addAddress, updateAddress, removeAddress],
  );

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddresses must be used within AddressesProvider');
  }
  return context;
};
