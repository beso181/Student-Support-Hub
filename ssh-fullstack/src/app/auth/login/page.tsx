'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [mode, setMode] = useState<'email' | 'admin'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const redirect = useSearchParams().get('redirect') || '/';

  const handleEmailLogin = async () => {
    if (!email.endsWith('@amg.sch.ae')) { setError('Only @amg.sch.ae emails are allowed'); return; }
    setLoading(true); setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}` } });
    if (err) { setError(err.message); setLoading(false); return; }
    setError('Check your email for a login link!');
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    setLoading(true); setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push(redirect);
    router.refresh();
  };

  const handleGuest = () => { router.push('/'); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-navy font-serif font-bold">S</span>
        </div>
        <h1 className="font-serif text-xl font-semibold mb-1">
          {mode === 'admin' ? 'Management Portal' : 'Welcome'}
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          {mode === 'admin' ? 'Staff access only' : 'Sign in with your school email'}
        </p>

        <input
          type="email"
          placeholder={mode === 'admin' ? 'Admin email' : 'yourname@amg.sch.ae'}
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md mb-2 text-center outline-none focus:border-gold"
        />
        {mode === 'admin' && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md mb-2 text-center outline-none focus:border-gold"
          />
        )}

        <button
          onClick={mode === 'admin' ? handleAdminLogin : handleEmailLogin}
          disabled={loading}
          className={`w-full py-2.5 text-sm font-medium rounded-md mb-2 transition-colors ${
            mode === 'admin' ? 'btn-navy' : 'btn-gold'
          } ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>

        {error && <p className={`text-xs mt-1 ${error.includes('Check') ? 'text-green-600' : 'text-red-500'}`}>{error}</p>}

        <div className="flex items-center gap-3 my-4 text-gray-300 text-[10px]">
          <span className="flex-1 h-px bg-gray-200" />or<span className="flex-1 h-px bg-gray-200" />
        </div>

        {mode === 'email' ? (
          <>
            <button onClick={handleGuest} className="w-full btn-outline text-xs mb-2">Continue as Guest</button>
            <button onClick={() => setMode('admin')} className="text-[10px] text-gray-400 hover:text-gold-dark">Staff? Admin login →</button>
          </>
        ) : (
          <button onClick={() => setMode('email')} className="text-[10px] text-gray-400 hover:text-gold-dark">← Back to student login</button>
        )}
      </div>
    </div>
  );
}
