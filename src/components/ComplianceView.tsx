'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  CheckCircle2, 
  ClipboardPaste, 
  AlertCircle, 
  ShieldCheck,
  Search,
  Activity,
  ChevronRight,
  Database
} from 'lucide-react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

type ComplianceEdit = {
  complianceStatus: 'All Okay' | 'All Not Okay' | '';
  remarks: string;
  pastedData?: Record<string, string>[];
};

export const ComplianceView: React.FC = () => {
  const { requests, updateRequest } = useApp();
  const pendingRequests = requests.filter(r => r.currentStage === 'Compliance');
  const processedRequests = requests.filter(r =>
    r.currentStage === 'Payments' && r.status !== 'Rejected' && r.status !== 'Paid'
  );

  const [edits, setEdits] = useState<Record<string, ComplianceEdit>>({});
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');

  useEffect(() => {
    const newEdits = { ...edits };
    let changed = false;
    pendingRequests.forEach(req => {
      if (!newEdits[req.id]) {
        newEdits[req.id] = {
          complianceStatus: req.complianceStatus || '',
          remarks: '',
        };
        changed = true;
      }
    });
    if (changed) setEdits(newEdits);
  }, [pendingRequests]);

  const updateEdit = (id: string, field: keyof ComplianceEdit, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handlePasteData = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n').map(l => l.split('\t'));
    if (lines.length < 2) {
      alert("Verification Error: Please paste data with headers and at least one payload row.");
      return;
    }

    const headers = lines[0].map(h => h.trim().toLowerCase());
    const vendorIdx = headers.findIndex(h => h.includes('name of party') || h.includes('vendor'));

    if (vendorIdx === -1) {
      alert("Data Mapping Error: Could not identify 'Name of Party' or 'Vendor' column.");
      return;
    }

    const fuse = new Fuse(pendingRequests, { keys: ['vendorName'], threshold: 0.4 });
    const newEdits = { ...edits };
    let matchCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (!row || row.length <= vendorIdx) continue;
      const vendorName = row[vendorIdx];
      if (!vendorName) continue;

      const results = fuse.search(vendorName);
      if (results.length > 0) {
        const match: any = results[0].item;

        const rowData: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          if (row[j] && row[j].trim() !== '') {
            const originalHeader = lines[0][j] ? lines[0][j].trim() : headers[j];
            rowData[originalHeader] = row[j].trim();
          }
        }

        newEdits[match.id] = {
          ...newEdits[match.id],
          complianceStatus: 'All Not Okay',
          pastedData: [...(newEdits[match.id]?.pastedData || []), rowData]
        };
        matchCount++;
      }
    }

    setEdits(newEdits);
    setPasteText('');
    setShowPasteArea(false);
    alert(`Intelligence Logic: Successfully matched and cross-referenced ${matchCount} records.`);
  };

  const handleApprove = (id: string) => {
    const req = requests.find(r => r.id === id);
    const edit = edits[id];
    if (!req || !edit) return;

    const finalPayableAmount = req.payableAfterTds || req.billAmount || 0;

    updateRequest(id, {
      complianceStatus: edit.complianceStatus,
      finalPayableAmount,
      status: 'Pending Payment',
      currentStage: 'Payments'
    }, 'Compliance Audit Approved', edit.remarks || edit.complianceStatus);
  };

  return (
    <div className="space-y-10 animate-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Compliance Audit</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Regulatory validation node for GST reconciliation and tax audits.</p>
        </div>
        <button
          onClick={() => setShowPasteArea(!showPasteArea)}
          className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center transition-all animate-pulse"
        >
          <ClipboardPaste className="h-4 w-4 mr-2" />
          <span>Cross-Reference GST Data</span>
        </button>
      </div>

      <AnimatePresence>
        {showPasteArea && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-900 p-8 rounded-[2rem] border border-blue-800 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-blue-800 rounded-2xl shadow-inner">
                 <AlertCircle className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Neural GST Matching</h4>
                <p className="text-xs text-blue-300 mt-1 max-w-xl font-medium tracking-wide">
                  Paste raw spreadsheet data (TSV). The engine will fuzzy-match party names and automatically flag discrepancies as "All Not Okay" for manual review.
                </p>
              </div>
            </div>
            <textarea
              className="w-full h-40 p-4 bg-slate-950/50 border border-blue-800 rounded-2xl text-sm font-medium text-blue-100 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all custom-scrollbar placeholder:text-blue-900"
              placeholder="Paste raw Excel cells here (Ctrl+V)..."
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
            />
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowPasteArea(false)}
                className="px-6 py-2.5 text-xs font-bold text-blue-300 hover:text-white transition-colors"
              >
                Aborted Logic
              </button>
              <button
                onClick={handlePasteData}
                className="px-8 py-3 bg-white text-blue-900 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-50 shadow-lg active:scale-95 transition-all"
              >
                Start Matching Protocol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Section */}
      <div className="glass-card overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Compliance Ledger</h3>
            <div className="px-3 py-1 bg-purple-50 text-[10px] font-bold text-purple-600 rounded-full uppercase tracking-widest">Regulatory Mode</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-900">
              <tr>
                <th colSpan={3} className="px-6 py-4 text-center text-[10px] font-bold text-white/50 uppercase tracking-widest border-r border-white/5 whitespace-nowrap">Source Data</th>
                <th colSpan={2} className="px-6 py-4 text-center text-[10px] font-bold text-blue-400 uppercase tracking-widest border-r border-white/5 bg-blue-900/10 whitespace-nowrap">Audit Values</th>
                <th colSpan={3} className="px-6 py-4 text-center text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-900/10 whitespace-nowrap">Compliance Logic</th>
              </tr>
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Entity / context</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Reference</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest border-r border-white/5">Orig. Sum</th>
                
                <th className="px-8 py-5 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10">Bill Sum</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10 border-r border-white/5">Net Pay</th>

                <th className="px-8 py-5 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-900/10">Status</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-900/10">Audit Remarks</th>
                <th className="px-8 py-5 text-center text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-900/10">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                       <ShieldCheck className="h-16 w-16 text-emerald-100 mb-6" />
                       <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Audit Buffer Cleared</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingRequests.map(req => {
                  const edit = edits[req.id] || { complianceStatus: '', remarks: '' };

                  return (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold text-slate-900 leading-tight">{req.projectName}</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-1">{req.vendorName}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{req.poNumber}</div>
                        </td>
                        <td className="px-8 py-6 border-r border-slate-100">
                          <div className="text-[11px] font-medium text-slate-400">{formatCurrency(req.poAmount)}</div>
                          <div className="text-sm font-black text-rose-500 mt-1">{formatCurrency(req.needToPayAmount)}</div>
                        </td>

                        <td className="px-8 py-6 bg-blue-50/30">
                          <div className="text-sm font-black text-blue-800">{formatCurrency(req.billAmount || 0)}</div>
                        </td>
                        <td className="px-8 py-6 bg-blue-50/30 border-r border-slate-100">
                          <div className="text-sm font-black text-slate-900">{formatCurrency(req.payableAfterTds || 0)}</div>
                        </td>

                        <td className="px-8 py-6 bg-purple-50/30">
                          <select
                            className={cn(
                              "input-field py-2 text-[11px] font-black uppercase tracking-wider bg-white shadow-sm",
                              edit.complianceStatus === 'All Okay' ? 'text-emerald-600 border-emerald-100 ring-4 ring-emerald-500/10' :
                              edit.complianceStatus === 'All Not Okay' ? 'text-rose-600 border-rose-100 ring-4 ring-rose-500/10' : 'text-slate-600'
                            )}
                            value={edit.complianceStatus}
                            onChange={e => updateEdit(req.id, 'complianceStatus', e.target.value)}
                          >
                            <option value="">-- PENDING --</option>
                            <option value="All Okay">ALL OKAY</option>
                            <option value="All Not Okay">ALL NOT OKAY</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 bg-purple-50/30 border-r border-slate-100 min-w-[200px]">
                          <input type="text" placeholder="Add audit note..." className="input-field py-2 text-xs font-medium bg-white"
                            value={edit.remarks} onChange={e => updateEdit(req.id, 'remarks', e.target.value)} />
                        </td>

                        <td className="px-8 py-6 bg-purple-50/30">
                          <button 
                            onClick={() => handleApprove(req.id)} 
                            disabled={!edit.complianceStatus}
                            className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90",
                              edit.complianceStatus 
                                ? "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700" 
                                : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            )}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                          </button>
                        </td>
                      </tr>
                      {/* Cross-Reference Data Sub-row */}
                      <AnimatePresence>
                        {edit.pastedData && edit.pastedData.length > 0 && (
                          <motion.tr 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={8} className="p-0 bg-rose-50/50">
                              <div className="p-8 border-l-8 border-rose-500 shadow-inner">
                                <div className="flex items-center space-x-2 mb-6 text-rose-800">
                                   <Database className="h-4 w-4" />
                                   <h4 className="text-xs font-black uppercase tracking-[0.2em]">External Reference Discrepancy detected</h4>
                                </div>
                                <div className="overflow-x-auto rounded-2xl border border-rose-200 bg-white">
                                  <table className="min-w-full divide-y divide-rose-100">
                                    <thead>
                                      <tr className="bg-rose-50">
                                        {Object.keys(edit.pastedData[0]).map((key, idx) => (
                                          <th key={idx} className="px-5 py-3 text-left text-[10px] font-black text-rose-700 uppercase tracking-widest">
                                            {key}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-rose-50">
                                      {edit.pastedData.map((row, rowIdx) => (
                                        <tr key={rowIdx} className="hover:bg-rose-50/40">
                                          {Object.values(row).map((val, colIdx) => (
                                            <td key={colIdx} className="px-5 py-3 text-xs font-bold text-rose-900 whitespace-nowrap">
                                              {val}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processed History Ledger */}
      <div className="glass-card overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
        <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-600 tracking-tight uppercase tracking-[0.1em]">Compliance Archives</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audited: {processedRequests.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-10 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity context</th>
                <th className="px-10 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Net</th>
                <th className="px-10 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Vector</th>
                <th className="px-10 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {processedRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-12 text-center text-xs font-bold text-slate-200 uppercase tracking-widest">Archive Empty</td>
                </tr>
              ) : (
                processedRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="text-sm font-bold text-slate-700 leading-tight">{req.projectName}</div>
                      <div className="text-[10px] font-medium text-slate-500 mt-1">{req.vendorName}</div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(req.finalPayableAmount || 0)}</div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "status-badge",
                        req.complianceStatus === 'All Okay' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      )}>
                        {req.complianceStatus || 'UNSET'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="status-badge bg-blue-50 text-blue-700 border border-blue-100">{req.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
