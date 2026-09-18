import React, { useState } from 'react';
import { FarmProvider } from './context/FarmContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DemoControlModal } from './components/demo/DemoControlModal';
import { LandingView } from './components/landing/LandingView';
import { DashboardView } from './components/dashboard/DashboardView';
import { LiveMonitoringView } from './components/hardware/LiveMonitoringView';
import { EdgeAiView } from './components/edgeai/EdgeAiView';
import { SmartIrrigationView } from './components/irrigation/SmartIrrigationView';
import { EnvironmentalRiskView } from './components/risks/EnvironmentalRiskView';
import { CropScanView } from './components/cropscan/CropScanView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { FarmerAdvisoryView } from './components/advisory/FarmerAdvisoryView';
import { AlertCenterView } from './components/alerts/AlertCenterView';
import { SystemArchitectureView } from './components/architecture/SystemArchitectureView';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingView
            onLaunchDashboard={() => setActiveTab('dashboard')}
            onExploreTech={() => setActiveTab('architecture')}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenDemoControls={() => setIsDemoModalOpen(true)}
          />
        );
      case 'monitoring':
        return <LiveMonitoringView />;
      case 'cropscan':
        return <CropScanView />;
      case 'edgeai':
        return <EdgeAiView />;
      case 'irrigation':
        return <SmartIrrigationView />;
      case 'risks':
        return <EnvironmentalRiskView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'advisory':
        return <FarmerAdvisoryView />;
      case 'alerts':
        return <AlertCenterView />;
      case 'architecture':
        return <SystemArchitectureView />;
      default:
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenDemoControls={() => setIsDemoModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#040e0a] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Global Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenDemoControls={() => setIsDemoModalOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-row w-full max-w-[1720px] mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Demo Scenario & Hardware Control Modal */}
      <DemoControlModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FarmProvider>
      <MainAppContent />
    </FarmProvider>
  );
}
