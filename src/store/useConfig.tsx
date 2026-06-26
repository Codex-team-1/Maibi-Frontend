import { createContext, useContext } from 'react';
import { getConfig } from '@/api';
import type { ApiConfig, ApiPaymentMethod, ApiColor } from '@/api';
import { useAsync } from '@/hooks/useAsync';
import { WILAYAS, FALLBACK_PAYMENTS, FALLBACK_COLORS, FALLBACK_CATS } from '../data/products';

export interface ConfigValue {
  wilayas: string[];
  paymentMethods: ApiPaymentMethod[];
  colors: ApiColor[];
  categories: string[];
  loading: boolean;
}

const FALLBACK: Omit<ConfigValue, 'loading'> = {
  wilayas: WILAYAS,
  paymentMethods: FALLBACK_PAYMENTS,
  colors: [...FALLBACK_COLORS],
  categories: [...FALLBACK_CATS],
};

const ConfigContext = createContext<ConfigValue>({ ...FALLBACK, loading: true });

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { data, loading } = useAsync<ApiConfig>((signal) => getConfig(signal), []);

  const value: ConfigValue = data
    ? {
        wilayas: data.wilayas?.length ? data.wilayas : FALLBACK.wilayas,
        paymentMethods: data.paymentMethods?.length
          ? data.paymentMethods
          : FALLBACK.paymentMethods,
        colors: data.colors?.length ? data.colors : FALLBACK.colors,
        categories: data.categories?.length ? data.categories : FALLBACK.categories,
        loading: false,
      }
    : { ...FALLBACK, loading };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export const useConfig = (): ConfigValue => useContext(ConfigContext);
