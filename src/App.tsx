import React, { Suspense, lazy } from 'react';
import { HotelPulseProvider, useHotelPulse } from './context/HotelPulseContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toasts } from './components/common/Toasts';
import { DemoWalkthroughModal } from './components/common/DemoWalkthroughModal';

// Views
const DashboardView = lazy(() => import('./components/admin/DashboardView').then((module) => ({ default: module.DashboardView })));
const OperationsView = lazy(() => import('./components/admin/OperationsView').then((module) => ({ default: module.OperationsView })));
const RoomsView = lazy(() => import('./components/admin/RoomsView').then((module) => ({ default: module.RoomsView })));
const MaintenanceView = lazy(() => import('./components/admin/MaintenanceView').then((module) => ({ default: module.MaintenanceView })));
const OpportunitiesView = lazy(() => import('./components/admin/OpportunitiesView').then((module) => ({ default: module.OpportunitiesView })));
const ExperiencesView = lazy(() => import('./components/admin/ExperiencesView').then((module) => ({ default: module.ExperiencesView })));
const ConfigurationView = lazy(() => import('./components/admin/ConfigurationView').then((module) => ({ default: module.ConfigurationView })));
const GuestPortal = lazy(() => import('./components/guest/GuestPortal').then((module) => ({ default: module.GuestPortal })));
const StaffPortal = lazy(() => import('./components/staff/StaffPortal').then((module) => ({ default: module.StaffPortal })));
const ReceptionView = lazy(() => import('./components/reception/ReceptionView').then((module) => ({ default: module.ReceptionView })));

const WorkspaceLoading = () => (
  <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-live="polite">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
      Preparando tu espacio de trabajo…
    </div>
  </div>
);

const MainLayout: React.FC = () => {
  const { currentRole, adminView } = useHotelPulse();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Universal App Header */}
      <Header />

      {/* Main Role-Based Workspace */}
      <div className="flex-1 flex flex-col">
        {currentRole === 'admin' && (
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Admin Lateral Navigation */}
            <Sidebar />

            {/* Admin Content Area */}
            <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
              <Suspense fallback={<WorkspaceLoading />}>
              {adminView === 'dashboard' && <DashboardView />}
              {adminView === 'operaciones' && <OperationsView />}
              {adminView === 'habitaciones' && <RoomsView />}
              {adminView === 'mantenimiento' && <MaintenanceView />}
              {adminView === 'oportunidades' && <OpportunitiesView />}
              {adminView === 'experiencias' && <ExperiencesView />}
              {adminView === 'configuracion' && <ConfigurationView />}
              </Suspense>
            </main>
          </div>
        )}

        {currentRole === 'reception' && (
          <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full">
            <Suspense fallback={<WorkspaceLoading />}><ReceptionView /></Suspense>
          </main>
        )}

        {currentRole === 'staff' && (
          <main className="flex-1 p-4 sm:p-6">
            <Suspense fallback={<WorkspaceLoading />}><StaffPortal /></Suspense>
          </main>
        )}

        {currentRole === 'guest' && (
          <main className="flex-1">
            <Suspense fallback={<WorkspaceLoading />}><GuestPortal /></Suspense>
          </main>
        )}
      </div>

      {/* Notifications and Tour Modal */}
      <Toasts />
      <DemoWalkthroughModal />
    </div>
  );
};

export default function App() {
  return (
    <HotelPulseProvider>
      <MainLayout />
    </HotelPulseProvider>
  );
}
