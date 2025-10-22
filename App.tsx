import React, { useState, useCallback } from 'react';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useStoreUser } from './hooks/useStoreUser';

import Sidebar from './components/Sidebar';
import AdGeneratorTool from './pages/AdGeneratorTool';
import { SocialPostWriterTool } from './pages/SocialPostWriterTool';
import Dashboard from './pages/Dashboard';
import GbpOptimizerTool from './pages/GbpOptimizerTool';
import ContentCalendarTool from './pages/ContentCalendarTool';
import ClientServicesPage from './pages/ClientServicesPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import ThemeToggle from './components/ThemeToggle';
import type { Tool } from './types';
import LandingPage from './pages/LandingPage';

const MainApp: React.FC = () => {
  useStoreUser(); // Hook to sync Clerk user with Convex DB
  const [activeTool, setActiveTool] = useState<Tool>('dashboard');

  const handleNavClick = useCallback((tool: Tool) => {
    setActiveTool(tool);
  }, []);

  const renderTool = () => {
    const backToDashboard = () => handleNavClick('dashboard');

    switch (activeTool) {
      case 'dashboard':
        return <Dashboard onNavClick={handleNavClick} />;
      case 'ad-generator':
        return <AdGeneratorTool onBackToDashboard={backToDashboard} />;
      case 'social-posts':
        return <SocialPostWriterTool onBackToDashboard={backToDashboard} />;
      case 'gbp-optimizer':
        return <GbpOptimizerTool onBackToDashboard={backToDashboard} />;
      case 'content-calendar':
        return <ContentCalendarTool onBackToDashboard={backToDashboard} />;
      case 'client-services':
        return <ClientServicesPage onBackToDashboard={backToDashboard} />;
      case 'payments':
        return <PaymentsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard onNavClick={handleNavClick} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      <Sidebar activeTool={activeTool} onNavClick={handleNavClick} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-20 flex items-center gap-4">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
        </div>
        {renderTool()}
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <>
      <SignedIn>
        <MainApp />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
};

export default App;