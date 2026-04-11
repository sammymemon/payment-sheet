'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  CheckCircle2, 
  CreditCard,
  History,
  Activity,
  ChevronRight,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

type PaymentEdit = {
  remarkSelection: string;
  customRemark: string;
};

export const PaymentsView: React.FC = () => {
  const { requests, updateRequest } = useApp();
  const pendingRequests = requests.filter(r => r.currentStage === 'Payments' && r.status !== 'Paid');

  const [edits, setEdits] = useState<Record<string, PaymentEdit>>({});

  useEffect(() => {
    const newEdits = { ...edits };
    let changed = false;
    pendingRequests.forEach(req => {
      if (!newEdits[req.id]) {
        newEdits[req.id] = {
          remarkSelection: 'Paid Payment',
          customRemark: '',
        };
        changed = true;
      }
    });
    if (changed) setEdits(newEdits);
  }, [pendingRequests]);

  const updateEdit = (id: string, field: keyof PaymentEdit, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handlePay = (id: string) => {
    const req = requests.find(r => r.id === id);
    const edit = edits[id];
    if (!req || !edit) return;

    const isClosed = req.paymentType === 'Final';
    const finalRemark = edit.remarkSelection === 'Other' ? edit.customRemark : (edit.remarkSelection || edit.customRemark || 'Paid Payment');

    updateRequest(id, {
      status: 'Paid',
      paymentRemarks: finalRemark,
      isClosed
    }, 'Payment Executed', finalRemark);
  };

  return (
    <div className="space-y-10 animate-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Settlement</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Final execution node for capital outlays and fund transfers.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
           <Banknote className="h-4.5 w-4.5" />
           <span className="text-xs font-black uppercase tracking-widest">Awaiting Disbursement: {pendingRequests.length}</span>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="glass-card shadow-2xl shadow-blue-900/5 overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Disbursement Ledger</h3>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ready for finalization</span>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Target Context</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Ref ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-white uppercase tracking-widest">Financial profile</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10 whitespace-nowrap">Settlement Net</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/10">Execution Notes</th>
                <th className="px-8 py-5 text-center text-[10px] font-bold text-white uppercase tracking-widest">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                       <CreditCard className="h-16 w-16 text-slate-100 mb-6" />
                       <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Disbursement Queue Empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingRequests.map(req => {
                  const edit = edits[req.id] || { remarkSelection: 'Paid Payment', customRemark: '' };
                  
                  return (
                    <motion.tr 
                      key={req.id} 
                      layout
                      className="hover:bg-slate-50 group transition-all duration-300"
                    >
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900 leading-tight">{req.projectName}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-1">{req.vendorName}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{req.poNumber}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{req.paymentType} Node</div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="text-[11px] font-medium text-slate-500 italic">Bill value: {formatCurrency(req.billAmount || 0)}</div>
                         <div className="text-[11px] font-bold text-rose-500 mt-0.5">TDS Deduct: -{formatCurrency(req.tdsAmount || 0)}</div>
                      </td>
                      <td className="px-8 py-6 bg-blue-50/20">
                        <div className="text-xl font-black text-emerald-600 tracking-tighter">{formatCurrency(req.finalPayableAmount || 0)}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Approved Disburse Sum</div>
                      </td>
                      <td className="px-8 py-6 bg-blue-50/20 min-w-[200px]">
                        <div className="space-y-2">
                           <select 
                            className="input-field py-2 text-[11px] font-bold bg-white"
                            value={edit.remarkSelection}
                            onChange={e => updateEdit(req.id, 'remarkSelection', e.target.value)}
                           >
                            <option value="Paid Payment">SETTLEMENT COMPLETE</option>
                            <option value="Proforma Invoice Received">PI SECURED</option>
                            <option value="Advance Settled">ADVANCE RECONCILED</option>
                            <option value="Other">MANUAL LOG ENTRY</option>
                           </select>
                           {edit.remarkSelection === 'Other' && (
                             <input type="text" placeholder="Specify..." className="input-field py-2 text-xs font-medium bg-white"
                               value={edit.customRemark} onChange={e => updateEdit(req.id, 'customRemark', e.target.value)} />
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-6 bg-slate-50/50">
                        <button 
                          onClick={() => handlePay(req.id)}
                          className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-90 transition-all mx-auto"
                        >
                          <CheckCircle2 className="h-7 w-7" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
