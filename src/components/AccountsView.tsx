'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  Calculator, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Activity, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

type RowEdit = {
  projectName: string;
  vendorName: string;
  poNumber: string;
  poAmount: number;
  needToPayAmount: number;
  billAmount: number;
  remarkSelection: string;
  customRemark: string;
  tdsAmount: number;
};

export const AccountsView: React.FC = () => {
  const { requests, updateRequest } = useApp();
  const pendingRequests = requests.filter(r => r.currentStage === 'Accounts' && r.status !== 'Rejected');
  const processedRequests = requests.filter(r => 
    (r.currentStage === 'Compliance' || r.currentStage === 'Payments') && r.status !== 'Rejected' && r.status !== 'Paid'
  );

  const [edits, setEdits] = useState<Record<string, RowEdit>>({});

  useEffect(() => {
    const newEdits = { ...edits };
    let changed = false;
    pendingRequests.forEach(req => {
      if (!newEdits[req.id]) {
        newEdits[req.id] = {
          projectName: req.projectName || '',
          vendorName: req.vendorName || '',
          poNumber: req.poNumber || '',
          poAmount: req.poAmount || 0,
          needToPayAmount: req.needToPayAmount || 0,
          billAmount: req.billAmount || req.needToPayAmount || req.paidAmountRs || 0,
          remarkSelection: '',
          customRemark: '',
          tdsAmount: req.tdsAmount || 0,
        };
        changed = true;
      }
    });
    if (changed) setEdits(newEdits);
  }, [pendingRequests]);

  const updateEdit = (id: string, field: keyof RowEdit, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleApprove = (id: string) => {
    const req = requests.find(r => r.id === id);
    const edit = edits[id];
    if (!req || !edit) return;
    
    const outstandingAmount = edit.billAmount - (edit.needToPayAmount || req.paidAmountRs || 0);
    const isMismatch = edit.poAmount !== edit.billAmount;
    const finalRemark = edit.remarkSelection === 'Other' ? edit.customRemark : edit.remarkSelection;
    const payableAfterTds = (edit.needToPayAmount || 0) - edit.tdsAmount;

    updateRequest(id, {
      projectName: edit.projectName,
      vendorName: edit.vendorName,
      poNumber: edit.poNumber,
      poAmount: edit.poAmount,
      needToPayAmount: edit.needToPayAmount,
      billAmount: edit.billAmount,
      outstandingAmount,
      mismatchFlag: isMismatch,
      tdsAmount: edit.tdsAmount,
      payableAfterTds,
      status: 'Pending Compliance',
      currentStage: 'Compliance'
    }, 'Approved by Accounts', finalRemark);
  };

  const handleReject = (id: string) => {
    const edit = edits[id];
    const finalRemark = edit.remarkSelection === 'Other' ? edit.customRemark : edit.remarkSelection;
    
    if (!finalRemark) {
      alert("Verification Failed: Remark selection required for rejection protocol.");
      return;
    }
    updateRequest(id, {
      status: 'Rejected',
      currentStage: 'Purchase'
    }, 'Rejected by Accounts', finalRemark);
  };

  return (
    <div className="space-y-10 animate-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Accounts Verification</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Secondary validation node for financial integrity check.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 px-5 py-2.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 shadow-sm">
           <Calculator className="h-4.5 w-4.5" />
           <span className="text-xs font-black uppercase tracking-widest">Awaiting Verification: {pendingRequests.length}</span>
        </div>
      </div>

      {/* Pending Ledger */}
      <div className="glass-card overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Clearing Table</h3>
          <div className="px-3 py-1 bg-blue-50 text-[10px] font-bold text-blue-500 rounded-full uppercase tracking-widest">Real-time Verification Active</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-900">
              <tr>
                <th colSpan={3} className="px-6 py-3 text-center text-[10px] font-bold text-white/50 uppercase tracking-widest border-r border-white/5">
                  Origin Context
                </th>
                <th colSpan={4} className="px-6 py-3 text-center text-[10px] font-bold text-blue-400 uppercase tracking-widest border-r border-white/5 bg-blue-900/10">
                  Verification protocol
                </th>
                <th className="px-6 py-3"></th>
              </tr>
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest">Entity / Vendor</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest">PO Link</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest border-r border-white/5">Need to Pay</th>
                
                <th className="px-8 py-4 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10">Bill Sum</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10">TDS Lock</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10 whitespace-nowrap">Payable (Post TDS)</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10 border-r border-white/5">Remarks</th>
                
                <th className="px-8 py-4 text-center text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-10 py-24 text-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                       <CheckCircle2 className="h-16 w-16 text-emerald-100 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]" />
                       <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Verification Buffer Empty</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                pendingRequests.map(req => {
                  const edit = edits[req.id];
                  if (!edit) return null;
                  const isMismatch = edit.poAmount !== edit.billAmount;
                  const payableAfterTds = (edit.needToPayAmount || 0) - edit.tdsAmount;
                  
                  return (
                    <motion.tr 
                      key={req.id} 
                      layout
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <input type="text" className="input-field py-1 text-xs font-bold w-full bg-white/50" value={edit.projectName} onChange={e => updateEdit(req.id, 'projectName', e.target.value)} />
                        <input type="text" className="input-field py-1 text-[10px] font-medium w-full bg-white/50 mt-1" value={edit.vendorName} onChange={e => updateEdit(req.id, 'vendorName', e.target.value)} />
                      </td>
                      <td className="px-8 py-6">
                        <input type="text" className="input-field py-1 text-xs font-black w-24 bg-white/50" value={edit.poNumber} onChange={e => updateEdit(req.id, 'poNumber', e.target.value)} />
                        <div className="mt-2 flex items-center space-x-1">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Input:</span>
                           <input type="number" className="w-20 text-[10px] font-black outline-none bg-transparent" value={edit.poAmount} onChange={e => updateEdit(req.id, 'poAmount', Number(e.target.value))} />
                        </div>
                      </td>
                      <td className="px-8 py-6 border-r border-slate-100 bg-slate-50/30">
                        <input type="number" className="input-field py-2 text-sm font-black text-rose-600 bg-white w-24 shadow-inner" value={edit.needToPayAmount} onChange={e => updateEdit(req.id, 'needToPayAmount', Number(e.target.value))} />
                      </td>
                      
                      <td className="px-8 py-6 bg-blue-50/30 relative">
                        <div className="relative">
                          <input type="number" min="0" className={cn(
                            "input-field py-3 text-sm font-black w-28 bg-white shadow-xl shadow-blue-500/5 transition-all focus:ring-4",
                            isMismatch ? 'text-amber-600 border-amber-200 focus:ring-amber-100' : 'text-blue-700 border-blue-100 focus:ring-blue-100'
                          )}
                            value={edit.billAmount || ''} onChange={e => updateEdit(req.id, 'billAmount', Number(e.target.value))} />
                          {isMismatch && (
                            <div className="absolute -top-6 left-0 text-[10px] font-black text-amber-600 uppercase tracking-tighter flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" /> PO Mismatch
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-8 py-6 bg-blue-50/30">
                        <input type="number" min="0" placeholder="0" className="input-field py-3 text-sm font-black text-rose-500 bg-white w-24 border-rose-100 focus:ring-rose-100"
                          value={edit.tdsAmount || ''} onChange={e => updateEdit(req.id, 'tdsAmount', Number(e.target.value))} />
                      </td>
                      
                      <td className="px-8 py-6 bg-blue-50/30">
                        <div className="text-lg font-black text-emerald-600 tracking-tighter">{formatCurrency(payableAfterTds)}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">Net Disbursement</div>
                      </td>

                      <td className="px-8 py-6 bg-blue-50/30 border-r border-slate-100 min-w-[200px]">
                        <div className="space-y-2">
                          <select 
                            className="input-field py-2 text-xs font-bold bg-white"
                            value={edit.remarkSelection}
                            onChange={e => updateEdit(req.id, 'remarkSelection', e.target.value)}
                          >
                            <option value="">-- Choose Protocol --</option>
                            <option value="PO not approved">PO not approved</option>
                            <option value="Bill qty mismatch">Bill qty mismatch</option>
                            <option value="PI received">PI received</option>
                            <option value="Other">Custom Manual Remark</option>
                          </select>
                          {edit.remarkSelection === 'Other' && (
                            <input type="text" placeholder="Specify..." className="input-field py-2 text-xs font-medium bg-white animate-in"
                              value={edit.customRemark} onChange={e => updateEdit(req.id, 'customRemark', e.target.value)} />
                          )}
                        </div>
                      </td>
                      
                      <td className="px-8 py-6 bg-slate-50/50">
                        <div className="flex flex-col space-y-2 max-w-[120px] mx-auto">
                          <button onClick={() => handleApprove(req.id)}
                            className="px-4 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                          </button>
                          <button onClick={() => handleReject(req.id)}
                            className="px-4 py-2.5 bg-white border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Void
                          </button>
                        </div>
                      </td>
                    </motion.tr>
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
          <h3 className="text-lg font-black text-slate-600 tracking-tight uppercase tracking-[0.1em]">Verification Archives</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Audited: {processedRequests.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context</th>
                <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Numbers</th>
                <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post-TDS Net</th>
                <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {processedRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-12 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">Archive Empty</td>
                </tr>
              ) : (
                processedRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-5">
                      <div className="text-sm font-bold text-slate-700 leading-tight">{req.projectName}</div>
                      <div className="text-[10px] font-medium text-slate-500 mt-1">{req.vendorName}</div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="text-[11px] font-medium text-slate-500 italic">Bill Ledger: {formatCurrency(req.billAmount || 0)}</div>
                      <div className="text-[11px] font-bold text-rose-500 mt-0.5">TDS Deduct: -{formatCurrency(req.tdsAmount || 0)}</div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(req.payableAfterTds || 0)}</div>
                    </td>
                    <td className="px-10 py-5">
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
