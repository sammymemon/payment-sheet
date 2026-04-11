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
  ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, setCurrentUser, users, activeTab, setActiveTab } = useApp();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, role: 'Dashboard', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Purchase', icon: ShoppingCart, role: 'Purchase', color: 'text-sky-600', bg: 'bg-sky-50' },
    { name: 'Accounts', icon: Calculator, role: 'Accounts', color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Compliance', icon: ShieldCheck, role: 'Compliance', color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Payments', icon: CreditCard, role: 'Payments', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Register', icon: BookOpen, role: 'Register', color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'Admin', icon: Settings, role: 'Admin', color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-900 sélection:bg-blue-100 font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-72 bg-white border-r border-slate-200/60 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mr-3">
            <span className="text-white font-black text-xl italic tracking-tighter">DX</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">DevX</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">Enterprise</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
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
                  "sidebar-item group relative",
                  isActive 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : item.color)} />
                <span className="font-semibold tracking-tight">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill" 
                    className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <div className="flex items-center group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                 <UserCircle className="h-full w-full text-slate-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{currentUser.role} Role</p>
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
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                title="Switch to Master Admin"
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center px-10 justify-between shrink-0 z-10 shadow-sm shadow-slate-100/50">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
              {activeTab} Workspace
            </h2>
            <div className="flex items-center text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              Live System Status: Optimal
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200/50 shadow-inner">
               <span className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase whitespace-nowrap">Session Duration:</span>
               <span className="text-[10px] text-slate-700 font-black tracking-widest">02:14:52</span>
             </div>
             <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-white hover:text-slate-900 border border-slate-200/30 transition-all hover:shadow-sm">
                <Settings className="h-5 w-5" />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-slate-50 to-white">
          <div className="max-w-7xl mx-auto min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
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

