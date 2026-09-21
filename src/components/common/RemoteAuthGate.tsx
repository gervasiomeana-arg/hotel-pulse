import React, { FormEvent, useEffect, useState } from 'react';
import { KeyRound, MailCheck } from 'lucide-react';
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
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'sign-in' | 'forgot-password' | 'update-password'>('sign-in');

  useEffect(() => {
    if (!remote || !supabase) return;
    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) setError('No pudimos validar la sesión. Intentá nuevamente.');
        setSession(data.session);
      })
      .catch(() => setError('No pudimos conectar con el servicio de acceso.'))
      .finally(() => setChecking(false));
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setView('update-password');
    });
    return () => data.subscription.unsubscribe();
  }, [remote]);

  if (!remote) return <>{children}</>;
  if (!supabaseConfigured) return <AuthMessage title="Supabase no está configurado" text="Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para usar el modo remoto." />;
  if (checking) return <AuthMessage title="Conectando…" text="Validando la sesión segura." />;
  if (session && view !== 'update-password') return <>{children}</>;

  const signIn = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const { error: signInError } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) setError('El correo o la contraseña no son correctos.');
    } catch {
      setError('No pudimos conectar con el servicio de acceso. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  const requestPasswordReset = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const { error: resetError } = await supabase!.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setNotice('Si el correo está registrado, vas a recibir un enlace para crear una nueva contraseña.');
    } catch {
      setError('No pudimos solicitar el enlace. Revisá la conexión e intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    if (password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      setBusy(false);
      return;
    }
    try {
      const { error: updateError } = await supabase!.auth.updateUser({ password });
      if (updateError) throw updateError;
      setNotice('Contraseña actualizada. Ya podés continuar en Hotel Pulse.');
      setPassword('');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {
      setError('El enlace venció o no pudimos actualizar la contraseña. Solicitá uno nuevo.');
    } finally {
      setBusy(false);
    }
  };

  if (view === 'update-password') {
    return <AuthShell icon={<KeyRound size={22} />} eyebrow="ACCESO SEGURO" title="Creá tu nueva contraseña" description="Elegí una clave de al menos 8 caracteres para proteger la cuenta.">
      {notice ? <>
        <AuthFeedback error="" notice={notice} />
        <button type="button" onClick={() => setView('sign-in')} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800">Continuar a Hotel Pulse</button>
      </> : <form onSubmit={updatePassword}>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="new-password">Nueva contraseña</label>
        <input id="new-password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" type="password" minLength={8} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <AuthFeedback error={error} notice="" />
        <button disabled={busy} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Guardando…' : 'Guardar contraseña'}</button>
      </form>}
    </AuthShell>;
  }

  if (view === 'forgot-password') {
    return <AuthShell icon={<MailCheck size={22} />} eyebrow="RECUPERAR ACCESO" title="Restablecé tu contraseña" description="Te enviaremos un enlace seguro al correo de tu cuenta.">
      <form onSubmit={requestPasswordReset}>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="recovery-email">Email</label>
        <input id="recovery-email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthFeedback error={error} notice={notice} />
        <button disabled={busy} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Enviando…' : 'Enviar enlace seguro'}</button>
        <button type="button" onClick={() => { setView('sign-in'); setError(''); setNotice(''); }} className="mt-4 w-full text-sm font-semibold text-slate-600 hover:text-slate-900">Volver al ingreso</button>
      </form>
    </AuthShell>;
  }

  return <main className="min-h-screen bg-slate-950 grid place-items-center p-6">
    <form onSubmit={signIn} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-black/30">
      <p className="text-xs font-bold tracking-[0.24em] text-amber-600">HOTEL PULSE</p>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Acceso del equipo</h1>
      <p className="mt-2 text-sm text-slate-500">Ingresá con el usuario autorizado para tu hotel.</p>
      <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
      <input id="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">Contraseña</label>
        <button type="button" onClick={() => { setView('forgot-password'); setError(''); }} className="text-sm font-semibold text-amber-700 hover:text-amber-800">¿Olvidaste tu contraseña?</button>
      </div>
      <input id="password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <AuthFeedback error={error} notice={notice} />
      <button disabled={busy} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  </main>;
};

const AuthFeedback = ({ error, notice }: { error: string; notice: string }) => <>
  {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
  {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{notice}</p>}
</>;

const AuthShell = ({ icon, eyebrow, title, description, children }: { icon: React.ReactNode; eyebrow: string; title: string; description: string; children: React.ReactNode }) => <main className="min-h-screen bg-slate-950 grid place-items-center p-6">
  <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-black/30">
    <div className="grid size-11 place-items-center rounded-2xl bg-amber-100 text-amber-700">{icon}</div>
    <p className="mt-5 text-xs font-bold tracking-[0.24em] text-amber-600">{eyebrow}</p>
    <h1 className="mt-3 text-2xl font-extrabold text-slate-900">{title}</h1>
    <p className="mb-6 mt-2 text-sm leading-6 text-slate-500">{description}</p>
    {children}
  </section>
</main>;

const AuthMessage = ({ title, text }: { title: string; text: string }) => <main className="min-h-screen bg-slate-950 grid place-items-center p-6"><div className="max-w-md rounded-3xl bg-white p-8"><h1 className="text-xl font-bold">{title}</h1><p className="mt-2 text-slate-600">{text}</p></div></main>;
