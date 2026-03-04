import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';

// Components
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { QuickLaunchModal } from './components/QuickLaunchModal.js';

// Modules
import { LoginView } from './modules/Auth/LoginView.js';
import { TenantSelectionView } from './modules/Auth/TenantSelection.js';
import { HomeView } from './modules/Home/HomeView.js';
import { MonthlyDashboardView } from './modules/Dashboard/MonthlyDashboard.js';
import { StrategicDashboardView } from './modules/Dashboard/StrategicDashboard.js';
import { ImplementationDashboardView } from './modules/Dashboard/ImplementationDashboard.js';
import { GymView } from './modules/Gym/GymView.js';
import { PhysioView } from './modules/Physio/PhysioView.js';
import { ComplaintsView } from './modules/Complaints/ComplaintsView.js';
import { NR1View } from './modules/NR1/NR1View.js';
import { ErgoEngView } from './modules/Ergo/ErgoEngView.js';
import { AdmissionalView } from './modules/Admissional/AdmissionalView.js';
import { AbsenteeismView } from './modules/Absenteeism/AbsenteeismView.js';
import { EvidenceGalleryView } from './modules/Evidence/EvidenceGallery.js';
import { ActionPlansView } from './modules/ActionPlans/ActionPlans.js';
import { CampaignsView } from './modules/Campaigns/Campaigns.js';
import { ClosingView } from './modules/Gestao/ClosingView.js';
import { ReportsView } from './modules/Gestao/ReportsView.js';
import { AdminView } from './modules/Admin/AdminView.js';

// Types
type Role = 'admin_atividade' | 'professional' | 'client' | 'auditor';

interface Tenant {
  id: string;
  name: string;
  logo_url?: string;
}

interface User {
  id: string;
  name: string;
  role: Role;
  tenantId?: string;
  tenantName?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showQuickLaunch, setShowQuickLaunch] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Mock initial data
  useEffect(() => {
    setTenants([
      { id: 'toyota-br', name: 'Toyota Brasil' },
      { id: 'usina-pilon', name: 'Usina Pilon' }
    ]);
  }, []);

  const handleLogin = (role: string, tenantId: string | null) => {
    const tenant = tenants.find(t => t.id === tenantId);
    setUser({
      id: 'user-1',
      name: role === 'admin_atividade' ? 'Admin Atividade' : 'Ricardo Prof',
      role: role as Role,
      tenantId: tenantId || undefined,
      tenantName: tenant?.name
    });
    if (tenant) setSelectedTenant(tenant);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedTenant(null);
    setActiveTab('home');
  };

  if (!user) {
    return <LoginView tenants={tenants} onLogin={handleLogin} />;
  }

  if (user.role === 'admin_atividade' && !selectedTenant && activeTab !== 'admin') {
    return <TenantSelectionView tenants={tenants} onSelect={setSelectedTenant} />;
  }

  const currentTenantName = selectedTenant?.name || user.tenantName || 'Atividade Laboral';

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <Sidebar 
        collapsed={isSidebarCollapsed} 
        setCollapsed={setIsSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={user.role}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          tenantName={currentTenantName} 
          onQuickLaunch={() => setShowQuickLaunch(true)} 
        />

        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && <HomeView key="home" />}
            {activeTab === 'dashboard' && <MonthlyDashboardView key="dashboard" />}
            {activeTab === 'strategic' && selectedTenant && (
              <StrategicDashboardView 
                key="strategic" 
                tenant={selectedTenant} 
                role={user.role} 
              />
            )}
            {activeTab === 'implementation' && <ImplementationDashboardView key="implementation" />}
            {activeTab === 'gym' && selectedTenant && (
              <GymView 
                key="gym" 
                tenant={selectedTenant} 
                user={user} 
              />
            )}
            {activeTab === 'physio' && <PhysioView key="physio" />}
            {activeTab === 'complaints' && <ComplaintsView key="complaints" />}
            {activeTab === 'absenteeism' && selectedTenant && (
              <AbsenteeismView 
                key="absenteeism" 
                tenant={selectedTenant} 
                user={user} 
              />
            )}
            {activeTab === 'nr1' && <NR1View key="nr1" />}
            {activeTab === 'ergo' && <ErgoEngView key="ergo" />}
            {activeTab === 'admissional' && selectedTenant && (
              <AdmissionalView 
                key="admissional" 
                tenant={selectedTenant} 
                user={user} 
              />
            )}
            {activeTab === 'action_plans' && <ActionPlansView key="action_plans" />}
            {activeTab === 'evidence' && <EvidenceGalleryView key="evidence" />}
            {activeTab === 'campaigns' && <CampaignsView key="campaigns" />}
            {activeTab === 'closing' && <ClosingView key="closing" />}
            {activeTab === 'reports' && <ReportsView key="reports" />}
            {activeTab === 'admin' && <AdminView key="admin" />}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showQuickLaunch && (
          <QuickLaunchModal onClose={() => setShowQuickLaunch(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
