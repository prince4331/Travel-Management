import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { queryClient } from "../lib/api";
import { SyncStatusBar } from "../components/layout/SyncStatusBar";
import { InstallPromptBanner } from "../components/layout/InstallPromptBanner";
import { useSeedDemoData } from "../hooks/useSeedDemoData";
import "../styles/globals.css";
import "leaflet/dist/leaflet.css";

function AppBootstrap({ children }: { children: React.ReactNode }) {
  useSeedDemoData();
  
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);
  
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppBootstrap>
          <Head>
            <title>Travel Management</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
            <meta name="description" content="Coordinate group trips, manage expenses, and stay connected even when offline" />
          </Head>
          <SyncStatusBar />
          <InstallPromptBanner />
          <Component {...pageProps} />
        </AppBootstrap>
      </AuthProvider>
    </QueryClientProvider>
  );
}
