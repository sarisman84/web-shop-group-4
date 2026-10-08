'use client';

import { useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => {
    const target = searchParams.get('next') ?? searchParams.get('redirect') ?? '/account';
    // Only allow same-origin relative paths to avoid open redirects.
    return target.startsWith('/') && !target.startsWith('//') ? target : '/account';
  }, [searchParams]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h1 className="text-2xl font-bold mb-4">{t('login')}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t('email')}</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="w-full p-2 border rounded mt-1" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium">{t('password')}</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="w-full p-2 border rounded mt-1" 
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
        >
          {t('loginButton')}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 mb-3">{t('noAccount')}</p>
        <Link href="/auth/register">
          <button 
            type="button" 
            className="w-full border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors font-medium"
          >
            {t('register')}
          </button>
        </Link>
      </div>
    </div>
  );
}