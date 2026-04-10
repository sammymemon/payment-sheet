/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Layout } from './components/Layout';
import { PurchaseView } from './components/PurchaseView';
import { AccountsView } from './components/AccountsView';
import { ComplianceView } from './components/ComplianceView';
import { PaymentsView } from './components/PaymentsView';
import { DashboardView } from './components/DashboardView';
import { RegisterView } from './components/RegisterView';

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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

