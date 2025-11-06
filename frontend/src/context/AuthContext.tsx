import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

type Role = {
  id: number;
  name: string;
};

type User = {
  id: number;
  email: string;
  phone: string;
  photoUrl?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  role?: Role | null;
  createdAt: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
};

type SignupPayload = {
  email: string;
  phone: string;
  password: string;
  role?: string;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  authFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const TOKENS_STORAGE_KEY = 'travel-management.tokens';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredTokens = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TOKENS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to parse stored auth tokens', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
  });

  const persistTokens = useCallback((accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        TOKENS_STORAGE_KEY,
        JSON.stringify({ accessToken, refreshToken }),
      );
    }
    setState(prev => ({ ...prev, accessToken, refreshToken }));
  }, []);

  const clearTokens = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKENS_STORAGE_KEY);
    }
    setState(prev => ({ ...prev, accessToken: null, refreshToken: null }));
  }, []);

  const loadProfile = useCallback(
    async (token: string) => {
      const profile = await apiFetch<User>('/auth/me', { accessToken: token });
      setState(prev => ({ ...prev, user: profile }));
    },
    [],
  );

  const refreshTokens = useCallback(async (): Promise<string | null> => {
    if (!state.refreshToken) return null;
    const data = await apiFetch<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: state.refreshToken }),
        accessToken: null,
      },
    );
    persistTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }, [persistTokens, state.refreshToken]);

  useEffect(() => {
    let isMounted = true;
    const initialise = async () => {
      const stored = readStoredTokens();
      if (stored?.accessToken && stored?.refreshToken) {
        if (!isMounted) return;
        setState(prev => ({
          ...prev,
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
        }));
        try {
          await loadProfile(stored.accessToken);
        } catch (error) {
          console.warn('Failed to restore session, clearing tokens.', error);
          if (isMounted) {
            clearTokens();
            setState(prev => ({ ...prev, user: null }));
          }
        }
      }
      if (isMounted) {
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    initialise();
    return () => {
      isMounted = false;
    };
  }, [clearTokens, loadProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      persistTokens(data.accessToken, data.refreshToken);
      await loadProfile(data.accessToken);
    },
    [loadProfile, persistTokens],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await apiFetch<{ message: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await login(payload.email, payload.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearTokens();
    setState({ user: null, accessToken: null, refreshToken: null, loading: false });
  }, [clearTokens]);

  const refreshProfile = useCallback(async () => {
    if (!state.accessToken) return;
    await loadProfile(state.accessToken);
  }, [loadProfile, state.accessToken]);

  const authFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      try {
        return await apiFetch<T>(path, { ...options, accessToken: state.accessToken });
      } catch (error: any) {
        if (error?.status === 401) {
          const newAccessToken = await refreshTokens();
          if (newAccessToken) {
            return apiFetch<T>(path, { ...options, accessToken: newAccessToken });
          }
          logout();
        }
        throw error;
      }
    },
    [logout, refreshTokens, state.accessToken],
  );

  const value: AuthContextValue = useMemo(
    () => ({
      ...state,
      login,
      signup,
      logout,
      refreshProfile,
      authFetch,
    }),
    [authFetch, login, logout, refreshProfile, signup, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
