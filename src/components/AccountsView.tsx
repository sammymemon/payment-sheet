'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency } from '../lib/utils';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

  // Initialize edits for new pending requests
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
      alert("Please provide remarks for rejection.");
      return;
    }
    updateRequest(id, {
      status: 'Rejected',
      currentStage: 'Purchase'
    }, 'Rejected by Accounts', finalRemark);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Accounts Department</h2>
        <p className="text-sm text-gray-500 mt-1">Verify details, deduct TDS, and approve for compliance row by row.</p>
      </div>

      {/* Pending Requests Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Verification</h3>
        {pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center border-dashed">
            <p className="text-gray-500">No pending requests for Accounts verification.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th colSpan={5} className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-100">
                    Purchase Data (Read-Only)
                  </th>
                  <th colSpan={5} className="px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider border-b border-gray-200 bg-blue-50">
                    Accounts Verification (Editable)
                  </th>
                </tr>
                <tr>
                  {/* Purchase Columns */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Vendor</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PO No</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PO Amt</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">Need to Pay</th>
                  
                  {/* Accounts Columns */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Bill Amt</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">TDS Amt</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Payable (Post TDS)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Remarks</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map(req => {
                  const edit = edits[req.id] || { 
                    projectName: req.projectName, vendorName: req.vendorName, poNumber: req.poNumber, poAmount: req.poAmount, needToPayAmount: req.needToPayAmount,
                    billAmount: 0, remarkSelection: '', customRemark: '', tdsAmount: 0 
                  };
                  const isMismatch = edit.poAmount !== edit.billAmount;
                  const canApprove = true; // Allow approval even if bill amount is 0 or mismatch
                  const payableAfterTds = (edit.needToPayAmount || 0) - edit.tdsAmount;
                  
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                      {/* Purchase Data (Editable by Accounts) */}
                      <td className="p-1 bg-blue-50/5 border-r border-gray-100">
                        <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" value={edit.projectName} onChange={e => updateEdit(req.id, 'projectName', e.target.value)} />
                      </td>
                      <td className="p-1 bg-blue-50/5 border-r border-gray-100">
                        <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" value={edit.vendorName} onChange={e => updateEdit(req.id, 'vendorName', e.target.value)} />
                      </td>
                      <td className="p-1 bg-blue-50/5 border-r border-gray-100">
                        <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" value={edit.poNumber} onChange={e => updateEdit(req.id, 'poNumber', e.target.value)} />
                      </td>
                      <td className="p-1 bg-blue-50/5 border-r border-gray-100">
                        <input type="number" className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" value={edit.poAmount} onChange={e => updateEdit(req.id, 'poAmount', Number(e.target.value))} />
                      </td>
                      <td className="p-1 bg-blue-50/5 border-r border-gray-200">
                        <input type="number" className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 text-red-600 font-medium" value={edit.needToPayAmount} onChange={e => updateEdit(req.id, 'needToPayAmount', Number(e.target.value))} />
                      </td>
                      
                      {/* Accounts Data */}
                      <td className="p-0 bg-blue-50/10 border-r border-gray-100 relative">
                        <input type="number" min="0" className={`w-24 px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm ${isMismatch ? 'text-red-600 font-bold' : ''}`}
                          value={edit.billAmount || ''} onChange={e => updateEdit(req.id, 'billAmount', Number(e.target.value))} />
                        {isMismatch && (
                          <div className="absolute right-2 top-3 text-red-500" title="Mismatch with PO Amount">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        )}
                      </td>
                      
                      {/* TDS and Payable */}
                      <td className="p-0 bg-blue-50/10 border-r border-gray-100">
                        <input type="number" min="0" placeholder="0" className="w-24 px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm text-red-600 font-medium"
                          value={edit.tdsAmount || ''} onChange={e => updateEdit(req.id, 'tdsAmount', Number(e.target.value))} />
                      </td>
                      <td className="px-3 py-3 text-sm font-bold text-green-700 whitespace-nowrap bg-blue-50/10 border-r border-gray-100">
                        {formatCurrency(payableAfterTds)}
                      </td>

                      {/* Remarks */}
                      <td className="p-2 bg-blue-50/10 border-r border-gray-100 min-w-[200px]">
                        <div className="flex flex-col space-y-1">
                          <select 
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
                            value={edit.remarkSelection}
                            onChange={e => updateEdit(req.id, 'remarkSelection', e.target.value)}
                          >
                            <option value="">-- Select Remark --</option>
                            <option value="PO not approved">PO not approved</option>
                            <option value="Bill qty mismatch">Bill qty mismatch</option>
                            <option value="Neither PI received nor bill received">Neither PI received nor bill received</option>
                            <option value="PI received">PI received</option>
                            <option value="Other">Other (Type below)...</option>
                          </select>
                          {edit.remarkSelection === 'Other' && (
                            <input type="text" placeholder="Custom remark..." className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              value={edit.customRemark} onChange={e => updateEdit(req.id, 'customRemark', e.target.value)} />
                          )}
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="p-2 text-center align-middle bg-blue-50/10 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleApprove(req.id)} disabled={!canApprove} title="Approve"
                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleReject(req.id)} title="Reject (Requires Remarks)"
                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Processed Requests Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Processed by Accounts</h3>
        {processedRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center border-dashed">
            <p className="text-gray-500">No processed requests yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Amt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TDS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payable</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.projectName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.vendorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.poNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(req.billAmount || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-{formatCurrency(req.tdsAmount || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(req.payableAfterTds || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
