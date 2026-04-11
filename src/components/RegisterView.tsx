'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  RefreshCw,
  MoreVertical,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const RegisterView: React.FC = () => {
  const { requests } = useApp();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter(req => {
    let matchesDate = true;
    if (startDate || endDate) {
      const reqDate = new Date(req.createdAt).getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity;
      matchesDate = reqDate >= start && reqDate <= end;
    }

    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        (req.vendorName?.toLowerCase().includes(query)) ||
        (req.projectName?.toLowerCase().includes(query)) ||
        (req.companyName?.toLowerCase().includes(query)) ||
        (req.poNumber?.toLowerCase().includes(query));
    }

    return matchesDate && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-blue-500/30">Master Register</h2>
          <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-widest">Global Transaction Archives & Intelligence</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
           <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center">
             <span className="text-[10px] font-bold text-slate-400 uppercase">Total Logged</span>
             <span className="text-lg font-black text-slate-900">{requests.length}</span>
           </div>
           <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center">
             <span className="text-[10px] font-bold text-blue-400 uppercase">Result Set</span>
             <span className="text-lg font-black text-blue-900">{filteredRequests.length}</span>
           </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Global Query Search</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Query vendor, project, po..."
              className="input-field pl-11 py-3 bg-slate-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Temporal Range Start</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              className="input-field pl-11 py-3 bg-slate-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Temporal Range End</label>
          <div className="relative">
            <input
              type="date"
              className="input-field py-3 bg-slate-50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-4 flex justify-between items-center pt-2 border-t border-slate-50">
           <div className="flex space-x-2">
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); }}
                className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
           </div>
           <button className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
              <Download className="h-3.5 w-3.5" />
              <span>Export Dataset</span>
           </button>
        </div>
      </div>

      {/* Results Ledger */}
      <div className="glass-card overflow-hidden shadow-2xl shadow-blue-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Entity Parent</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Workspace / Origin</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">PO / Vector</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Financial profile</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Pipeline status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-[11px] font-bold text-slate-900">{formatDate(req.createdAt)}</div>
                    <div className="text-[9px] font-medium text-slate-400 mt-0.5">Auto-generated ID</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-900 text-[10px] font-black rounded uppercase tracking-tighter">
                      {req.companyName || 'GLOBAL'}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900 leading-tight">{req.projectName}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">{req.vendorName}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{req.poNumber}</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">{req.paymentType} Node</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900">{formatCurrency(req.needToPayAmount || req.paidAmountRs || 0)}</div>
                    {req.needToPay && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 block">Payable Trigger</span>}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col space-y-1.5">
                      <span className={cn(
                        "status-badge",
                        req.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      )}>
                        {req.status}
                      </span>
                      <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase px-1">
                         <ChevronRight className="h-3 w-3 mr-1" /> {req.currentStage}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                       <BookOpen className="h-16 w-16 text-slate-100 mb-6" />
                       <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Archive Query Returned Nil</p>
                    </motion.div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
