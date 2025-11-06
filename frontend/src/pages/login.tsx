import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-slate-50'>
        <p className='text-slate-600'>Preparing your workspace...</p>
      </main>
    );
  }

  return (
    <main className='relative flex min-h-screen items-center justify-center px-4 overflow-hidden'>
      {/* Animated gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy'></div>
      
      {/* Mountain landscape overlay */}
      <div className='absolute inset-0 opacity-20' style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(2px)'
      }}></div>

      <div className='relative w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border border-white/20'>
        <div className='text-center mb-6'>
          <div className='inline-block p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4'>
            <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>Welcome back</h1>
          <p className='mt-2 text-sm text-slate-600'>Log in to access your trips and group dashboards.</p>
        </div>

        <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-slate-700'>
              Email address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              className='mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-slate-700'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              className='mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'
            />
          </div>

          {error && <p className='rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</p>}

          <button
            type='submit'
            disabled={submitting}
            className='flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 font-semibold'
          >
            {submitting ? '🚀 Signing in...' : '✨ Sign in'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-600'>
          New here?{' '}
          <Link href='/signup' className='font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700'>
            Create an account →
          </Link>
        </p>
      </div>
    </main>
  );
}
