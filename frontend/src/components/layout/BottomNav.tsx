import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Compass, Wallet, Bell, User } from 'lucide-react';
import { cn } from '../../utils/cn';

const bottomNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/groups', icon: Compass, label: 'Trips' },
  { href: '/finance', icon: Wallet, label: 'Finance' },
  { href: '/notifications', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const router = useRouter();

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white md:hidden">
      <div className="flex items-center justify-around">
        {bottomNavItems.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-2 text-xs font-medium transition touch-target',
                isActive
                  ? 'text-primary-600'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('h-6 w-6', isActive ? 'stroke-2' : 'stroke-1.5')} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
