'use client';

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
  BookOpen,
  Settings,
  Users as UsersIcon,
  ShieldAlert,
  Bell,
  Search,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, setCurrentUser, users, activeTab, setActiveTab } = useApp();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, role: 'Dashboard' },
    { name: 'Purchase Requests', icon: ShoppingCart, role: 'Purchase' },
    { name: 'Accounts Audit', icon: Calculator, role: 'Accounts' },
    { name: 'Compliance Review', icon: ShieldCheck, role: 'Compliance' },
    { name: 'Payments Processing', icon: CreditCard, role: 'Payments' },
    { name: 'Master Register', icon: BookOpen, role: 'Register' },
    { name: 'User Access', icon: UsersIcon, role: 'Admin' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-900 font-sans">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-r border-slate-200 flex flex-col z-30 shrink-0 h-full overflow-hidden absolute md:relative shadow-xl md:shadow-none"
          >
            <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm tracking-tighter">DX</span>
              </div>
              <h1 className="text-sm font-semibold text-slate-900 tracking-tight">FinOps Portal</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.filter(item => {
                if (currentUser.role === 'Admin') return true;
                if (item.role === 'Dashboard') return true;
                return currentUser.role === item.role;
              }).map((item) => {
                const isActive = activeTab === item.role;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.role as any)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-slate-100 text-slate-900" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-slate-900" : "text-slate-500")} />
                    {item.name}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                   <UserCircle className="h-5 w-5 text-slate-500" />
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-slate-700 truncate">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.role}</p>
                </div>
                {currentUser.role !== 'Admin' && (
                  <button 
                    onClick={() => {
                      const admin = users.find(u => u.role === 'Admin');
                      if (admin) {
                         setCurrentUser(admin);
                         setActiveTab('Dashboard');
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all"
                    title="Switch to Admin"
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold text-slate-800">
              {navItems.find(i => i.role === activeTab)?.name || activeTab}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="hidden md:flex relative max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="block w-64 pl-10 pr-3 py-1.5 border border-slate-300 rounded-md leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                />
             </div>
             <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
