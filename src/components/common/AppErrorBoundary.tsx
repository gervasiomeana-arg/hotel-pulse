import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Hotel Pulse encontró un error inesperado:', error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-slate-900">
        <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-7 py-8 text-white">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/15 text-2xl font-black text-amber-400">
              !
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Hotel Pulse</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">No pudimos mostrar esta pantalla</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
              Tus datos no se borraron. Podés intentar abrir nuevamente la vista o recargar la aplicación para recuperar la sesión.
            </p>
          </div>

          <div className="space-y-4 px-7 py-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Si el problema continúa, cerrá sesión y volvé a ingresar antes de realizar nuevos cambios.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                Intentar nuevamente
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Recargar aplicación
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }
}
