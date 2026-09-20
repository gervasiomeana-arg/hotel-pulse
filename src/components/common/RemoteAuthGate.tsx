import React, { FormEvent, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { getConfiguredDataSource } from '../../services/backendContract';
import { supabase, supabaseConfigured } from '../../services/supabaseClient';

export const RemoteAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const remote = getConfiguredDataSource() === 'remote';
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(remote);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!remote || !supabase) return;
    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) setError('No pudimos validar la sesión. Intentá nuevamente.');
        setSession(data.session);
      })
      .catch(() => setError('No pudimos conectar con el servicio de acceso.'))
      .finally(() => setChecking(false));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [remote]);

  if (!remote) return <>{children}</>;
  if (!supabaseConfigured) return <AuthMessage title="Supabase no está configurado" text="Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para usar el modo remoto." />;
  if (checking) return <AuthMessage title="Conectando…" text="Validando la sesión segura." />;
  if (session) return <>{children}</>;

  const signIn = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { error: signInError } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) setError('El correo o la contraseña no son correctos.');
    } catch {
      setError('No pudimos conectar con el servicio de acceso. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="min-h-screen bg-slate-950 grid place-items-center p-6">
    <form onSubmit={signIn} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
      <p className="text-xs font-bold tracking-[0.24em] text-amber-600">HOTEL PULSE</p>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Acceso del equipo</h1>
      <p className="mt-2 text-sm text-slate-500">Ingresá con el usuario autorizado para tu hotel.</p>
      <label className="mt-6 block text-sm font-semibold text-slate-700">Email</label>
      <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="mt-4 block text-sm font-semibold text-slate-700">Contraseña</label>
      <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <button disabled={busy} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  </main>;
};

const AuthMessage = ({ title, text }: { title: string; text: string }) => <main className="min-h-screen bg-slate-950 grid place-items-center p-6"><div className="max-w-md rounded-3xl bg-white p-8"><h1 className="text-xl font-bold">{title}</h1><p className="mt-2 text-slate-600">{text}</p></div></main>;
