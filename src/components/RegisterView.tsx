'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { BookOpen, Search, Calendar, Download, RefreshCw, MoreVertical } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-serif text-[#2A2A26] tracking-tight">Master Register</h2>
          <p className="text-sm text-[#6B6A65] mt-1">Global view of all processed and pending requests.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
           <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center space-x-2">
             <span className="text-xs font-semibold text-slate-500 uppercase">Total:</span>
             <span className="text-sm font-bold text-slate-900">{requests.length}</span>
           </div>
           <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm flex items-center space-x-2">
             <span className="text-xs font-semibold text-blue-600 uppercase">Results:</span>
             <span className="text-sm font-bold text-blue-900">{filteredRequests.length}</span>
           </div>
        </div>
      </div>

      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Vendor, project, or PO..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
          <div className="relative">
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
          <div className="relative">
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-4 flex justify-between items-center pt-2">
           <button 
             onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); }}
             className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center"
           >
             <RefreshCw className="h-4 w-4 mr-1.5" /> Reset Filters
           </button>
           <button className="btn-secondary flex items-center">
              <Download className="h-4 w-4 mr-1.5" /> Export Data
           </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Date Processed</th>
                <th className="table-header">Company Entity</th>
                <th className="table-header">Vendor Details</th>
                <th className="table-header">Reference</th>
                <th className="table-header">Financials</th>
                <th className="table-header">Status</th>
                <th className="table-header w-12"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-sm text-slate-700">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {req.companyName || 'N/A'}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{req.projectName}</div>
                    <div className="text-xs text-slate-500">{req.vendorName}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{req.poNumber}</div>
                    <div className="text-xs text-slate-500">{req.paymentType}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{formatCurrency(req.needToPayAmount || req.paidAmountRs || 0)}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={cn(
                      "status-badge",
                      req.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {req.status}
                    </span>
                    <div className="text-[10px] text-slate-500 uppercase mt-1 tracking-wider">{req.currentStage}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap text-right">
                     <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No records found matching your criteria.
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
