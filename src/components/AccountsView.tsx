'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Calculator, Check, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
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
    if (!finalRemark) return alert("Please select a remark for rejection.");
    updateRequest(id, { status: 'Rejected', currentStage: 'Purchase' }, 'Rejected by Accounts', finalRemark);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Accounts Audit</h2>
          <p className="text-sm text-slate-500 mt-1">Review and approve purchase requests.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
           <Calculator className="h-4 w-4 text-amber-500" />
           <span className="text-sm font-medium text-slate-700">Pending: {pendingRequests.length}</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-800">Pending Approvals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 border-b border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Details</th>
                <th className="table-header">PO Info</th>
                <th className="table-header border-x border-slate-200 bg-slate-100/50">Bill & TDS</th>
                <th className="table-header">Net Payable</th>
                <th className="table-header">Remarks</th>
                <th className="table-header text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No requests pending audit.
                  </td>
                </tr>
              ) : (
                pendingRequests.map(req => {
                  const edit = edits[req.id];
                  if (!edit) return null;
                  const isMismatch = edit.poAmount !== edit.billAmount;
                  const payableAfterTds = (edit.needToPayAmount || 0) - edit.tdsAmount;
                  
                  return (
                    <motion.tr key={req.id} layout className="hover:bg-slate-50">
                      <td className="p-3">
                        <input type="text" className="input-field py-1 text-sm font-medium mb-1" value={edit.projectName} onChange={e => updateEdit(req.id, 'projectName', e.target.value)} />
                        <input type="text" className="input-field py-1 text-xs text-slate-500" value={edit.vendorName} onChange={e => updateEdit(req.id, 'vendorName', e.target.value)} />
                      </td>
                      <td className="p-3">
                        <input type="text" className="input-field py-1 text-sm mb-1 w-24" value={edit.poNumber} onChange={e => updateEdit(req.id, 'poNumber', e.target.value)} />
                        <div className="flex items-center text-xs text-slate-500">
                           <span className="mr-1">PO Amt:</span>
                           <input type="number" className="w-20 border-0 bg-transparent p-0 focus:ring-0 text-slate-900" value={edit.poAmount} onChange={e => updateEdit(req.id, 'poAmount', Number(e.target.value))} />
                        </div>
                      </td>
                      <td className="p-3 border-x border-slate-200 bg-slate-50/50">
                        <div className="flex flex-col gap-2">
                          <div>
                            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">Bill Amount</label>
                            <input type="number" className={cn("input-field py-1.5 text-sm", isMismatch && "border-amber-400 focus:border-amber-500 focus:ring-amber-500")} value={edit.billAmount || ''} onChange={e => updateEdit(req.id, 'billAmount', Number(e.target.value))} />
                            {isMismatch && <div className="text-[10px] text-amber-600 mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Mismatch</div>}
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">TDS Deducted</label>
                            <input type="number" min="0" placeholder="0" className="input-field py-1.5 text-sm text-rose-600" value={edit.tdsAmount || ''} onChange={e => updateEdit(req.id, 'tdsAmount', Number(e.target.value))} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div className="text-sm text-slate-500 line-through">Subtotal: {formatCurrency(edit.needToPayAmount)}</div>
                        <div className="text-base font-bold text-slate-900 mt-1">{formatCurrency(payableAfterTds)}</div>
                      </td>
                      <td className="p-3">
                        <select className="input-field py-1.5 text-sm mb-2" value={edit.remarkSelection} onChange={e => updateEdit(req.id, 'remarkSelection', e.target.value)}>
                          <option value="">-- Select Remark --</option>
                          <option value="PO not approved">PO not approved</option>
                          <option value="Bill qty mismatch">Bill qty mismatch</option>
                          <option value="PI received">PI received</option>
                          <option value="Other">Custom Remark</option>
                        </select>
                        {edit.remarkSelection === 'Other' && (
                          <input type="text" placeholder="Type custom remark..." className="input-field py-1.5 text-sm" value={edit.customRemark} onChange={e => updateEdit(req.id, 'customRemark', e.target.value)} />
                        )}
                      </td>
                      <td className="p-3 align-middle text-center">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleApprove(req.id)} className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors" title="Approve">
                            <Check className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleReject(req.id)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors" title="Reject">
                            <X className="h-5 w-5" />
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

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="text-base font-semibold text-slate-800">Recently Processed</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Project & Vendor</th>
                <th className="table-header">Amounts</th>
                <th className="table-header">Net Payable</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {processedRequests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No processed history found.</td></tr>
              ) : (
                processedRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <div className="font-medium text-slate-900">{req.projectName}</div>
                      <div className="text-xs text-slate-500">{req.vendorName}</div>
                    </td>
                    <td className="table-cell">
                      <div className="text-xs text-slate-500">Bill: {formatCurrency(req.billAmount || 0)}</div>
                      <div className="text-xs text-rose-500 mt-0.5">TDS: -{formatCurrency(req.tdsAmount || 0)}</div>
                    </td>
                    <td className="table-cell font-medium text-slate-900">
                      {formatCurrency(req.payableAfterTds || 0)}
                    </td>
                    <td className="table-cell">
                      <span className="status-badge bg-slate-100 text-slate-700">{req.status}</span>
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
