'use client';

import { AppProvider, useApp } from '@/src/store/AppContext';
import { Layout } from '@/src/components/Layout';
import { PurchaseView } from '@/src/components/PurchaseView';
import { AccountsView } from '@/src/components/AccountsView';
import { ComplianceView } from '@/src/components/ComplianceView';
import { PaymentsView } from '@/src/components/PaymentsView';
import { DashboardView } from '@/src/components/DashboardView';
import { RegisterView } from '@/src/components/RegisterView';

const AppContent = () => {
  const { currentUser } = useApp();

  const renderView = () => {
    switch (currentUser.role) {
      case 'Purchase':
        return <PurchaseView />;
      case 'Accounts':
        return <AccountsView />;
      case 'Compliance':
        return <ComplianceView />;
      case 'Payments':
        return <PaymentsView />;
      case 'Register':
        return <RegisterView />;
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
