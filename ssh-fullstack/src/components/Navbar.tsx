'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, GraduationCap, LayoutDashboard, LogIn, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/research', label: 'Research Centre', icon: BookOpen },
    { href: '/resources', label: 'Resources' },
    { href: '/community', label: 'Community', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <span className="text-navy font-serif font-bold text-sm">S</span>
          </div>
          <span className="font-serif font-semibold text-sm text-gray-900">
            Student <span className="text-gold-dark font-normal">Support Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5 ml-4">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                pathname === l.href || pathname.startsWith(l.href + '/')
                  ? 'text-gold-dark bg-gold-light'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-xs text-gray-400">{user.email}</span>
              <Link href="/admin" className="btn-navy text-xs flex items-center gap-1.5">
                <Shield size={12} /> Admin
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className="btn-gold text-xs flex items-center gap-1.5">
              <LogIn size={12} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
