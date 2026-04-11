'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Check, CreditCard, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

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
        newEdits[req.id] = { remarkSelection: 'Paid Payment', customRemark: '' };
        changed = true;
      }
    });
    if (changed) setEdits(newEdits);
  }, [pendingRequests]);

  const updateEdit = (id: string, field: keyof PaymentEdit, value: any) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-[#2A2A26] tracking-tight">Payments Processing</h2>
          <p className="text-sm text-[#6B6A65] mt-1">Finalize and record processed payments.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
           <Banknote className="h-4 w-4 text-green-500" />
           <span className="text-sm font-medium text-slate-700">Pending: {pendingRequests.length}</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E7E2] bg-transparent flex justify-between items-center">
          <h3 className="text-base font-semibold text-[#2A2A26]">Settled History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 border-b border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Vendor Details</th>
                <th className="table-header">Reference</th>
                <th className="table-header">Breakdown</th>
                <th className="table-header bg-slate-100/50 border-x border-slate-200">Net Payable</th>
                <th className="table-header w-56">Remarks</th>
                <th className="table-header text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No pending payments.
                  </td>
                </tr>
              ) : (
                pendingRequests.map(req => {
                  const edit = edits[req.id] || { remarkSelection: 'Paid Payment', customRemark: '' };
                  
                  return (
                    <motion.tr key={req.id} layout className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-900">{req.projectName}</div>
                        <div className="text-xs text-slate-500">{req.vendorName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-900">{req.poNumber}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{req.paymentType}</div>
                      </td>
                      <td className="p-4">
                         <div className="text-xs text-slate-500">Bill: {formatCurrency(req.billAmount || 0)}</div>
                         <div className="text-xs text-rose-500 mt-0.5 mb-1">- TDS: {formatCurrency(req.tdsAmount || 0)}</div>
                      </td>
                      <td className="p-4 bg-slate-50/50 border-x border-slate-200">
                        <div className="text-lg font-bold text-slate-900 tracking-tight">{formatCurrency(req.finalPayableAmount || 0)}</div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                           <select 
                            className="input-field py-1.5 text-xs text-slate-700"
                            value={edit.remarkSelection}
                            onChange={e => updateEdit(req.id, 'remarkSelection', e.target.value)}
                           >
                            <option value="Paid Payment">Paid Payment</option>
                            <option value="Proforma Invoice Received">PI Received</option>
                            <option value="Advance Settled">Advance Settled</option>
                            <option value="Other">Custom Remark</option>
                           </select>
                           {edit.remarkSelection === 'Other' && (
                             <input type="text" placeholder="Specify..." className="input-field py-1.5 text-xs"
                               value={edit.customRemark} onChange={e => updateEdit(req.id, 'customRemark', e.target.value)} />
                           )}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <button 
                          onClick={() => handlePay(req.id)}
                          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 mx-auto flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 mr-1.5" /> Pay
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
