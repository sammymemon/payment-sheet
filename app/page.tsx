'use client';

import { AppProvider, useApp } from '@/src/store/AppContext';
import { Layout } from '@/src/components/Layout';
import { PurchaseView } from '@/src/components/PurchaseView';
import { AccountsView } from '@/src/components/AccountsView';
import { ComplianceView } from '@/src/components/ComplianceView';
import { PaymentsView } from '@/src/components/PaymentsView';
import { DashboardView } from '@/src/components/DashboardView';
import { RegisterView } from '@/src/components/RegisterView';
import { AdminView } from '@/src/components/AdminView';
import { useEffect } from 'react';

const AppContent = () => {
  const { currentUser, setCurrentUser, users, activeTab, setActiveTab } = useApp();

  // Handle invite links / direct role access via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    
    if (roleParam) {
      const user = users.find(u => u.role === roleParam);
      if (user) {
        setCurrentUser(user);
        setActiveTab(roleParam as any);
        // Clear param without reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [users, setCurrentUser, setActiveTab]);

  const renderView = () => {
    switch (activeTab) {
      case 'Purchase':
        return <PurchaseView />;
      case 'Accounts':
        return <AccountsView />;
      case 'Compliance':
        return <ComplianceView />;
      case 'Payments':
        return <PaymentsView />;
      case 'Register' as any:
        return <RegisterView />;
      case 'Admin':
        return <AdminView />;
      case 'Dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
