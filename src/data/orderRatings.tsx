import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { OrderRating, OrderStatus } from '../models/types';

const STORAGE_KEY = '@coffee/order-ratings';

type RatingsMap = Record<string, OrderRating>;

type SaveRatingInput = {
  orderId: string;
  rating: number;
  feedback?: string;
  status: OrderStatus;
};

type SaveRatingResult =
  | { ok: true; rating: OrderRating }
  | { ok: false; message: string };

type OrderRatingsContextValue = {
  ratings: RatingsMap;
  isLoading: boolean;
  saveRating: (input: SaveRatingInput) => Promise<SaveRatingResult>;
};

const OrderRatingsContext = createContext<OrderRatingsContextValue | undefined>(
  undefined,
);

const clampRating = (value: number) =>
  Math.max(1, Math.min(5, Math.round(value)));

export const OrderRatingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ratings, setRatings] = useState<RatingsMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRatings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as RatingsMap;
          if (parsed && typeof parsed === 'object') {
            setRatings(parsed);
          }
        }
      } catch {
        setRatings({});
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRatings();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveRating = useCallback(
    async (input: SaveRatingInput): Promise<SaveRatingResult> => {
      if (input.status !== 'completed') {
        return {
          ok: false,
          message: 'Ratings are available once the order is completed.',
        };
      }
      if (!Number.isFinite(input.rating)) {
        return { ok: false, message: 'Select a rating before submitting.' };
      }

      const normalizedRating = clampRating(input.rating);
      const next: OrderRating = {
        orderId: input.orderId,
        rating: normalizedRating,
        feedback: input.feedback?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      setRatings((prev) => {
        const updated = { ...prev, [input.orderId]: next };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      return { ok: true, rating: next };
    },
    [],
  );

  const value = useMemo(
    () => ({
      ratings,
      isLoading,
      saveRating,
    }),
    [ratings, isLoading, saveRating],
  );

  return (
    <OrderRatingsContext.Provider value={value}>
      {children}
    </OrderRatingsContext.Provider>
  );
};

export const useOrderRatings = () => {
  const context = useContext(OrderRatingsContext);
  if (!context) {
    throw new Error('useOrderRatings must be used within OrderRatingsProvider');
  }
  return context;
};
