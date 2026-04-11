'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Activity, CheckCircle2, Clock, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardView: React.FC = () => {
  const { requests, auditLogs } = useApp();
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const stats = [
    { name: 'Total Requests', value: requests.length, label: 'All time volume', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Accounts Audit', value: requests.filter(r => r.currentStage === 'Accounts').length, label: 'Pending review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Compliance Review', value: requests.filter(r => r.currentStage === 'Compliance').length, label: 'Pending review', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Settled Payments', value: requests.filter(r => r.status === 'Paid').length, label: 'Successfully paid', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const selectedLogs = selectedReqId ? auditLogs.filter(l => l.requestId === selectedReqId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">High-level view of operations and processing status.</p>
        </div>
        <div className="text-right hidden sm:block">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Sync</span>
           <span className="text-xs font-semibold text-slate-800">Just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">Recent Requests</h3>
            </div>
            <div className="overflow-x-auto flex-1 bg-white">
              <table className="min-w-full divide-y divide-slate-200 border-b border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-header">Vendor Details</th>
                    <th className="table-header text-right">Amount</th>
                    <th className="table-header">Stage</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedReqId(req.id)}
                      className={cn(
                        "cursor-pointer hover:bg-slate-50 transition-colors",
                        selectedReqId === req.id && "bg-blue-50/50 hover:bg-blue-50"
                      )}
                    >
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-900">{req.projectName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{req.vendorName}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-sm font-semibold text-slate-900">{formatCurrency(req.needToPayAmount || req.paidAmountRs || 0)}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">{req.paymentType}</div>
                      </td>
                      <td className="p-4">
                         <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{req.currentStage}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "status-badge",
                          req.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        )}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm font-medium text-slate-400">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card overflow-hidden h-[600px] flex flex-col bg-slate-50">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Audit Trail</h3>
                <p className="text-xs text-slate-500 mt-0.5">Activity history</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {selectedReqId ? (
                selectedLogs.length > 0 ? (
                  <div className="space-y-6">
                    {selectedLogs.map((log, logIdx) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: logIdx * 0.05 }}
                        className="relative flex space-x-3"
                      >
                        {logIdx !== selectedLogs.length - 1 && (
                          <div className="absolute top-8 left-3 -ml-px h-full w-px bg-slate-200" aria-hidden="true" />
                        )}
                        <div className="relative z-10">
                          <div className="h-6 w-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                             <CheckCircle2 className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-semibold text-slate-500 mb-0.5">{formatDate(log.timestamp)}</div>
                          <p className="text-sm font-medium text-slate-800">
                            {log.action}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            By {log.userId}
                          </p>
                          {log.remarks && (
                            <div className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                              "{log.remarks}"
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <Clock className="h-8 w-8 text-slate-400 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No logs found</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-slate-300">
                  <Activity className="h-8 w-8 text-slate-300 mb-4" />
                  <h4 className="text-sm font-semibold text-slate-700">Select a Request</h4>
                  <p className="mt-1 text-xs text-slate-500 text-center">Click on any request in the ledger to view its full audit history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
