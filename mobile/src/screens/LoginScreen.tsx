import React, { useCallback, useState } from "react";
import { ActivityIndicator, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api/client";

type LoginMode = "password" | "otp";

export const LoginScreen: React.FC = () => {
  const { login, otpLogin, loading, authError, clearError, setTokens } = useAuth();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  const handlePasswordLogin = useCallback(async () => {
    setSubmitting(true);
    clearError();
    setSocialError(null);
    try {
      await login(email.trim(), password);
    } finally {
      setSubmitting(false);
    }
  }, [login, email, password, clearError]);

  const handleOtpLogin = useCallback(async () => {
    setSubmitting(true);
    clearError();
    setSocialError(null);
    try {
      await otpLogin(phone.trim(), otp.trim());
    } finally {
      setSubmitting(false);
    }
  }, [otpLogin, phone, otp, clearError]);

  const handleGoogleLogin = useCallback(async () => {
    setSubmitting(true);
    clearError();
    setSocialError(null);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: Constants.expoConfig?.scheme ?? "travelapp",
      });
      const authUrl = `${API_BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUri,
      });

      if (result.type === "success" && result.params) {
        const { accessToken, refreshToken } = result.params;
        if (accessToken && refreshToken) {
          await setTokens({ accessToken, refreshToken });
        } else if (result.params.error) {
          throw new Error(result.params.error_description ?? result.params.error);
        } else {
          throw new Error("Google login did not return tokens. Ensure backend redirect includes accessToken and refreshToken query parameters.");
        }
      } else if (result.type === "error") {
        throw new Error(result.params?.error_description ?? "Google authentication failed");
      }
    } catch (error: any) {
      setSocialError(error?.message ?? "Google authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }, [setTokens, clearError]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Travel Management Login</Text>
        <View style={styles.toggleRow}>
          <Button title="Email & Password" color={mode === "password" ? "#0ea5e9" : "#1e293b"} onPress={() => setMode("password")} />
          <Button title="OTP" color={mode === "otp" ? "#0ea5e9" : "#1e293b"} onPress={() => setMode("otp")} />
        </View>

        {mode === "password" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button title={submitting ? "Signing in..." : "Sign in"} onPress={handlePasswordLogin} disabled={submitting || loading} />
          </View>
        )}

        {mode === "otp" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="One-time passcode"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <Button title={submitting ? "Verifying..." : "Verify OTP"} onPress={handleOtpLogin} disabled={submitting || loading} />
          </View>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button title="Continue with Google" onPress={handleGoogleLogin} disabled={submitting || loading} />

        {(loading || submitting) && (
          <View style={styles.loading}>
            <ActivityIndicator color="#0ea5e9" />
          </View>
        )}
        {(authError || socialError) && <Text style={styles.error}>{authError ?? socialError}</Text>}
        <Text style={styles.hintText}>
          OTP login expects the static code 123456 for now. Social login button reuses demo credentials until the Google flow is
          wired.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
    textAlign: "center",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#e2e8f0",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1f2937",
  },
  dividerText: {
    color: "#64748b",
    fontSize: 12,
  },
  loading: {
    alignItems: "center",
  },
  error: {
    fontSize: 12,
    color: "#fca5a5",
    textAlign: "center",
  },
  hintText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});
