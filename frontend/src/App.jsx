import React, { useState } from 'react';
import { useAegis } from './context/AegisContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveSurveillancePage } from './pages/LiveSurveillancePage';
import { DroneDetectionPage } from './pages/DroneDetectionPage';
import { ThreatClassificationPage } from './pages/ThreatClassificationPage';
import { SurveillanceZonesPage } from './pages/SurveillanceZonesPage';
import { SensorStationPage } from './pages/SensorStationPage';
import { DroneTrackingPage } from './pages/DroneTrackingPage';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { ResponseTeamPage } from './pages/ResponseTeamPage';
import { AlertManagementPage } from './pages/AlertManagementPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';

export function App() {
  const { currentUser } = useAegis();
  const [activeTab, setActiveTab] = useState('dashboard');

  // If user is not logged in, render LoginPage
  if (!currentUser) {
    return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  // Render active page based on tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'surveillance':
        return <LiveSurveillancePage onNavigate={setActiveTab} />;
      case 'detections':
        return <DroneDetectionPage onNavigate={setActiveTab} />;
      case 'threats':
        return <ThreatClassificationPage />;
      case 'zones':
        return <SurveillanceZonesPage />;
      case 'sensors':
        return <SensorStationPage />;
      case 'tracking':
        return <DroneTrackingPage />;
      case 'incidents':
        return <IncidentManagementPage />;
      case 'teams':
        return <ResponseTeamPage />;
      case 'alerts':
        return <AlertManagementPage />;
      case 'reports':
        return <ReportsAnalyticsPage />;
      case 'users':
        return <UserManagementPage />;
      case 'settings':
        return <SystemSettingsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Tactical Command Header */}
      <Header />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-gradient-to-b from-[#050b14] via-[#070e1c] to-[#040812]">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-200">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
