import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi, AuthTokens } from "../api/client";
import { ApiUser } from "../types/api";

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  otpLogin: (phone: string, otp: string) => Promise<void>;
  setTokens: (tokens: AuthTokens, profile?: ApiUser | null) => Promise<void>;
  refreshTokens: () => Promise<string | null>;
  logout: () => void;
  clearError: () => void;
};

type AuthProviderProps = {
  initialTokens?: Partial<AuthTokens>;
  children: React.ReactNode;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ initialTokens = {}, children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(initialTokens.accessToken ?? null);
  const [refreshToken, setRefreshToken] = useState<string | null>(initialTokens.refreshToken ?? null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = useCallback(() => setAuthError(null), []);

  const resetState = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(
    async (token: string) => {
      try {
        const profile = await AuthApi.profile(token);
        setUser(profile);
      } catch (error: any) {
        setAuthError(error?.message ?? "Failed to load profile");
        resetState();
        throw error;
      }
    },
    [resetState],
  );

  const applyTokens = useCallback(
    async (tokens: AuthTokens, profile?: ApiUser | null) => {
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      if (profile) {
        setUser(profile);
        return;
      }
      await fetchProfile(tokens.accessToken);
    },
    [fetchProfile],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setAuthError(null);
      try {
        const tokens = await AuthApi.login(email, password);
        await applyTokens(tokens);
      } catch (error: any) {
        setAuthError(error?.message ?? "Unable to login with email and password.");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [applyTokens],
  );

  const otpLogin = useCallback(
    async (phone: string, otp: string) => {
      setLoading(true);
      setAuthError(null);
      try {
        const tokens = await AuthApi.otpLogin(phone, otp);
        await applyTokens(tokens);
      } catch (error: any) {
        setAuthError(error?.message ?? "OTP verification failed.");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [applyTokens],
  );

  const logout = useCallback(() => {
    resetState();
  }, [resetState]);

  const refreshTokens = useCallback(async (): Promise<string | null> => {
    if (!refreshToken) return null;
    try {
      const tokens = await AuthApi.refresh(refreshToken);
      await applyTokens(tokens);
      return tokens.accessToken;
    } catch (error) {
      resetState();
      return null;
    }
  }, [refreshToken, applyTokens, resetState]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      refreshToken,
      user,
      loading,
      authError,
      login,
      otpLogin,
      setTokens: applyTokens,
      refreshTokens,
      logout,
      clearError,
    }),
    [accessToken, refreshToken, user, loading, authError, login, otpLogin, applyTokens, refreshTokens, logout, clearError],
  );

  useEffect(() => {
    if (accessToken && !user) {
      fetchProfile(accessToken).catch(() => {
        // error handled in fetchProfile
      });
    }
  }, [accessToken, user, fetchProfile]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

