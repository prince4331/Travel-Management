import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { BellDot, Compass, Globe, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="border-b border-white/20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-white/30 p-2 text-white hover:bg-white/20 lg:hidden backdrop-blur-sm"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-md text-white group-hover:scale-110 transition-transform shadow-lg">
              <Globe className="h-6 w-6" />
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white drop-shadow-md">Travel Management</p>
              <p className="text-xs text-white/80">Plan. Sync. Explore. ✈️</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/guides"
            className="hidden rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 sm:inline-flex items-center shadow-md"
          >
            <Compass className="mr-2 h-4 w-4" /> 🗺️ Travel guides
          </Link>
          <Link
            href="/notifications"
            className="rounded-full border border-white/30 bg-white/10 backdrop-blur-sm p-2 text-white hover:bg-white/20 shadow-md"
            aria-label="Notifications"
          >
            <BellDot className="h-5 w-5" />
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1.5 text-sm text-white hover:bg-white/20 shadow-md"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                {(user?.email ?? "").slice(0, 2).toUpperCase() || "TM"}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-white drop-shadow">{user?.email ?? "Guest"}</p>
                <p className="text-xs text-white/80">{user?.role?.name ?? "member"}</p>
              </div>
            </button>
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-700">{user?.email ?? "Guest"}</p>
                    <p className="text-xs text-slate-500">{user?.role?.name ?? "member"}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        router.push('/login');
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
