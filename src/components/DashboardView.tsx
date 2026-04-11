'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { Activity, CheckCircle2, Clock, FileText } from 'lucide-react';

import { motion } from 'framer-motion';

export const DashboardView: React.FC = () => {
  const { requests, auditLogs } = useApp();
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const stats = [
    { name: 'Active Stream', value: requests.length, label: 'Total Volume', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { name: 'Accounts Ledger', value: requests.filter(r => r.currentStage === 'Accounts').length, label: 'Pending Verification', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { name: 'Compliance Audit', value: requests.filter(r => r.currentStage === 'Compliance').length, label: 'In Review', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { name: 'Settled', value: requests.filter(r => r.status === 'Paid').length, label: 'Successfully Completed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  ];

  const selectedLogs = selectedReqId ? auditLogs.filter(l => l.requestId === selectedReqId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Hub</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Real-time surveillance of your financial ecosystem.</p>
        </div>
        <div className="text-right hidden sm:block">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Re-index</span>
           <span className="text-xs font-black text-slate-800">JUST NOW</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 glass-card-hover group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <Activity className="h-4 w-4 text-slate-100/50" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.name}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            <p className="text-[10px] font-medium text-slate-500 mt-2 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
              {stat.label}
            </p>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Active Requests Ledger</h3>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-full uppercase tracking-widest">Real-time Sync</span>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity / Context</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantum Amount</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Stage</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.map((req) => (
                    <motion.tr 
                      key={req.id} 
                      onClick={() => setSelectedReqId(req.id)}
                      whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
                      className={`cursor-pointer transition-all duration-200 ${selectedReqId === req.id ? 'bg-blue-50/70' : ''}`}
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800 leading-tight">{req.projectName}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">{req.vendorName}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="text-sm font-black text-slate-900">{formatCurrency(req.needToPayAmount || req.paidAmountRs || 0)}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{req.paymentType}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                         <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{req.currentStage}</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`status-badge ${
                          req.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-sm font-medium text-slate-400">
                        <div className="flex flex-col items-center">
                          <Activity className="h-10 w-10 text-slate-200 mb-3" />
                          Zero active transmissions detected in this window.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card overflow-hidden h-[600px] flex flex-col bg-slate-900 shadow-2xl shadow-blue-900/10">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-900">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Audit Protocol</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Historical Activity Stream</p>
              </div>
              <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
            </div>
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {selectedReqId ? (
                selectedLogs.length > 0 ? (
                  <div className="space-y-8">
                    {selectedLogs.map((log, logIdx) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: logIdx * 0.05 }}
                        className="relative flex space-x-4 group"
                      >
                        {logIdx !== selectedLogs.length - 1 && (
                          <div className="absolute top-10 left-4 -ml-px h-full w-0.5 bg-white/10" aria-hidden="true" />
                        )}
                        <div className="relative z-10">
                          <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                             <CheckCircle2 className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{formatDate(log.timestamp)}</div>
                          <p className="text-sm font-bold text-slate-100 leading-snug">
                            {log.action}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 mt-1 italic">
                            Agent Identification: {log.userId}
                          </p>
                          {log.remarks && (
                            <div className="mt-2 text-xs font-medium text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                              "{log.remarks}"
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <Clock className="h-12 w-12 text-slate-700 mb-4" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Protocol Buffer Empty</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-800/20 rounded-3xl border border-white/5">
                  <Activity className="h-16 w-16 text-slate-800 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-tighter">Action Required</h4>
                  <p className="mt-2 text-xs font-medium text-slate-500 max-w-[180px]">Select a ledger entry to decrypt its operational history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

