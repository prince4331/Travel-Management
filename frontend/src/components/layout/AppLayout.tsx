import Link from "next/link";
import { useRouter } from "next/router";
import { LogOut, Menu, PanelLeftOpen, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";
import { TopNav } from "./TopNav";
import { navigationItems } from "./navigation";
import { MobileNav } from "./MobileNav";
import { BottomNav } from "./BottomNav";
import { OfflineIndicator } from "../ui/OfflineIndicator";

interface AppLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AppLayout({ title, description, actions, children }: AppLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePath = router.pathname;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -z-10"></div>
      
      {/* Landscape background with parallax effect */}
      <div className="fixed inset-0 -z-10 opacity-10" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}></div>

      {/* Decorative blobs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob -z-10"></div>
      <div className="fixed top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 -z-10"></div>
      <div className="fixed bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 -z-10"></div>

      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-10 pt-6 lg:px-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-700">{user?.email ?? "Guest"}</p>
                <p className="text-xs text-slate-500">{user?.role?.name ?? "member"}</p>
              </div>
            </div>
            <nav className="mt-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    activePath === item.href
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </nav>
            <div className="mt-6 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 p-3 text-xs text-white shadow-md">
              ✨ Offline-first enabled. Syncs automatically when online.
            </div>
          </div>
        </aside>
        <main className="flex-1">
          <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-4 shadow-2xl md:p-6">
            <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="touch-target rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </button>
                  <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{title}</h1>
                </div>
                {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </header>
            <div className="pt-6">{children}</div>
          </div>
        </main>
      </div>
      <BottomNav />
      <OfflineIndicator />
    </div>
  );
}
