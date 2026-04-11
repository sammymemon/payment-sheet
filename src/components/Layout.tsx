'use client';

import React from 'react';
import { useApp } from '../store/AppContext';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Calculator, 
  ShieldCheck, 
  CreditCard,
  UserCircle,
  BookOpen,
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
    { name: 'Purchase', icon: ShoppingCart, role: 'Purchase' },
    { name: 'Accounts', icon: Calculator, role: 'Accounts' },
    { name: 'Compliance', icon: ShieldCheck, role: 'Compliance' },
    { name: 'Payments', icon: CreditCard, role: 'Payments' },
    { name: 'Register', icon: BookOpen, role: 'Register' },
    { name: 'Admin', icon: UsersIcon, role: 'Admin' },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-[#2A2A26] font-sans bg-[#F8F7F4]">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col z-30 shrink-0 h-full overflow-hidden absolute md:relative border-r border-[#E8E7E2] bg-[#F8F7F4]"
          >
            <div className="h-20 flex items-center px-4 shrink-0 mt-2 mb-2">
              <div className="w-8 h-8 rounded bg-[#D9795A] flex items-center justify-center mr-3 text-white font-serif italic text-lg font-bold shrink-0">
                P
              </div>
              <h1 className="text-[13px] font-semibold tracking-tight text-[#2A2A26] font-serif leading-snug">Project Payment <br/> Sheet Master</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
              {navItems.filter(item => {
                if (currentUser.role === 'Admin') return true;
                if (item.role === 'Dashboard') return true;
                if (currentUser.role === 'Accounts' && item.role !== 'Admin') return true;
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
                        ? "bg-[#EBEAE5] text-[#2A2A26]" 
                        : "text-[#6B6A65] hover:bg-[#EBEAE5]/50 hover:text-[#2A2A26]"
                    )}
                  >
                    <item.icon className={cn("mr-2.5 h-4 w-4", isActive ? "text-[#2A2A26]" : "text-[#8D8C86]")} />
                    {item.name}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#E8E7E2]">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded bg-[#EBEAE5] flex items-center justify-center text-[#6B6A65]">
                   <UserCircle className="h-5 w-5" />
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-[#2A2A26] truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-[#6B6A65] uppercase tracking-wider">{currentUser.role}</p>
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
                    className="p-1.5 text-[#8D8C86] hover:text-[#2A2A26] hover:bg-[#EBEAE5] rounded-md transition-all"
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
      <main className="flex-1 flex flex-col min-w-0 bg-white md:rounded-l-[2rem] border-l border border-[#E8E7E2] shadow-sm my-2 mr-2">
        <header className="h-16 flex items-center px-6 justify-between shrink-0 z-10 sticky top-0 border-b border-[#E8E7E2]/50">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-[#6B6A65] hover:text-[#2A2A26] hover:bg-[#EAE9E4] rounded-md transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-medium text-[#2A2A26] font-serif tracking-wide">
              {navItems.find(i => i.role === activeTab)?.name || activeTab}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="hidden md:flex relative max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#8D8C86]" />
                </div>
                <input 
                  type="text" 
                  placeholder="Ask Claude..." 
                  className="block w-64 pl-9 pr-3 py-1.5 border border-[#E8E7E2] rounded-md leading-5 bg-[#FAF9F5] text-[#2A2A26] placeholder-[#8D8C86] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#D9795A] focus:border-[#D9795A] sm:text-sm transition-all"
                />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#FAFAFA] rounded-bl-[2rem]">
          <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
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
