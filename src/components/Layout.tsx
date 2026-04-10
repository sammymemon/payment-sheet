import React from 'react';
import { useApp, defaultUsers } from '../store/AppContext';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Calculator, 
  ShieldCheck, 
  CreditCard,
  UserCircle,
  BookOpen
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, setCurrentUser } = useApp();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, role: null },
    { name: 'Purchase', icon: ShoppingCart, role: 'Purchase' },
    { name: 'Accounts', icon: Calculator, role: 'Accounts' },
    { name: 'Compliance', icon: ShieldCheck, role: 'Compliance' },
    { name: 'Payments', icon: CreditCard, role: 'Payments' },
    { name: 'Register', icon: BookOpen, role: 'Register' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">DevX Payments</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentUser.role === item.role || (!item.role && currentUser.role === 'Dashboard');
            // For simplicity, we just change the current user role to simulate switching views
            // In a real app, this would be route-based, but here we just use the role to filter views
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.role) {
                    const user = defaultUsers.find(u => u.role === item.role);
                    if (user) {
                      setCurrentUser(user);
                    } else if (item.role === 'Register') {
                      setCurrentUser({ id: 'admin-reg', name: 'Admin', role: 'Register' as any });
                    }
                  } else {
                    setCurrentUser({ id: 'admin', name: 'Admin', role: 'Dashboard' as any });
                  }
                }}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <UserCircle className="h-8 w-8 text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role} Dept</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shrink-0">
          <h2 className="text-lg font-medium text-gray-800">
            {currentUser.role} Workspace
          </h2>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              System Online
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
