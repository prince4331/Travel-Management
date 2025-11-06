import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup, user, loading } = useAuth();
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, router, user]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signup(form);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Unable to create your account.');
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
      <div className='absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 animate-gradient-xy'></div>
      
      {/* Travel landscape overlay */}
      <div className='absolute inset-0 opacity-20' style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(2px)'
      }}></div>

      <div className='relative w-full max-w-xl rounded-2xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border border-white/20'>
        <div className='text-center mb-6'>
          <div className='inline-block p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl mb-4'>
            <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
            </svg>
          </div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent'>Create your travel HQ</h1>
          <p className='mt-2 text-sm text-slate-600'>Sign up to plan trips, invite friends, and track expenses together.</p>
        </div>

        <form onSubmit={handleSubmit} className='mt-6 grid gap-5'>
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
              value={form.email}
              onChange={handleChange}
              className='mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'
            />
          </div>

          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-slate-700'>
              Mobile number (with country code)
            </label>
            <input
              id='phone'
              name='phone'
              type='tel'
              autoComplete='tel'
              placeholder='+12025550123'
              required
              value={form.phone}
              onChange={handleChange}
              className='mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'
            />
            <p className='mt-1 text-xs text-slate-500'>We use this for OTP fallback and emergency contacts.</p>
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-slate-700'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='new-password'
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className='mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'
            />
          </div>

          {error && <p className='rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</p>}

          <button
            type='submit'
            disabled={submitting}
            className='flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 px-4 py-3 text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 font-semibold'
          >
            {submitting ? '🚀 Creating account...' : '✨ Create account'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-600'>
          Already have an account?{' '}
          <Link href='/login' className='font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent hover:from-cyan-700 hover:to-purple-700'>
            Log in →
          </Link>
        </p>
      </div>
    </main>
  );
}
