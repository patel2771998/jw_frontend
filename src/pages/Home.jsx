import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const path = user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' ? '/staff' : '/client';
      navigate(path, { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wellness-cream">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wellness-cream">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Easy Booking',
      description: 'Book your wellness session in minutes. Choose your preferred time, duration, and staff.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Trusted Professionals',
      description: 'Skilled wellness practitioners—Indian, North-East, and Thai wellness traditions.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Self-Care Focus',
      description: 'Prioritize your well-being with massage, therapies, and relaxation sessions.',
    },
  ];

  return (
    <div className="min-h-screen bg-wellness-cream">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-2xl font-bold text-primary-700">
            Jolly Wellness
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-wellness-cream to-accent-50/30" />
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl" />
          <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-accent-200/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-600">
            Wellness Made Simple
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Nurture Your
            <span className="text-primary-600"> Body & Mind</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Book skilled wellness practitioners for massage, traditional therapies, and self-care. 
            Choose your time, relax, and feel renewed.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              Book Your Session
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary-200 bg-white px-8 py-4 text-lg font-semibold text-primary-700 transition-all hover:border-primary-300 hover:bg-primary-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200/60 bg-white/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-center text-3xl font-bold text-slate-900">Why Jolly Wellness?</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            We make wellness accessible and enjoyable for everyone.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to Feel Better?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Create your free account and book your first wellness session in minutes.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:shadow-xl"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link to="/" className="font-display text-2xl font-bold text-primary-700">
              Jolly Wellness
            </Link>
            <div className="flex gap-8">
              <Link to="/login" className="text-slate-600 hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="text-slate-600 hover:text-primary-600">
                Register
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Jolly Wellness. Nurture your body & mind.
          </p>
        </div>
      </footer>
    </div>
  );
}
