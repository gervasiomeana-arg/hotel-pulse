import React from 'react';
import { HotelPulseProvider, useHotelPulse } from './context/HotelPulseContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toasts } from './components/common/Toasts';
import { DemoWalkthroughModal } from './components/common/DemoWalkthroughModal';

// Views
import { DashboardView } from './components/admin/DashboardView';
import { OperationsView } from './components/admin/OperationsView';
import { RoomsView } from './components/admin/RoomsView';
import { MaintenanceView } from './components/admin/MaintenanceView';
import { OpportunitiesView } from './components/admin/OpportunitiesView';
import { ExperiencesView } from './components/admin/ExperiencesView';
import { GuestPortal } from './components/guest/GuestPortal';
import { StaffPortal } from './components/staff/StaffPortal';
import { ReceptionView } from './components/reception/ReceptionView';

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
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {adminView === 'dashboard' && <DashboardView />}
              {adminView === 'operaciones' && <OperationsView />}
              {adminView === 'habitaciones' && <RoomsView />}
              {adminView === 'mantenimiento' && <MaintenanceView />}
              {adminView === 'oportunidades' && <OpportunitiesView />}
              {adminView === 'experiencias' && <ExperiencesView />}
            </main>
          </div>
        )}

        {currentRole === 'reception' && (
          <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <ReceptionView />
          </main>
        )}

        {currentRole === 'staff' && (
          <main className="flex-1 p-4 sm:p-6">
            <StaffPortal />
          </main>
        )}

        {currentRole === 'guest' && (
          <main className="flex-1">
            <GuestPortal />
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
