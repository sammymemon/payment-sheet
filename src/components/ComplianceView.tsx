'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Check, ClipboardPaste, AlertCircle, Search, FileText } from 'lucide-react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';

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
        newEdits[req.id] = { complianceStatus: req.complianceStatus || '', remarks: '' };
        changed = true;
      }
    });
    if (changed) setEdits(newEdits);
  }, [pendingRequests]);

  const updateEdit = (id: string, field: keyof ComplianceEdit, value: any) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handlePasteData = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n').map(l => l.split('\t'));
    if (lines.length < 2) return alert("Please paste data with headers and at least one row.");

    const headers = lines[0].map(h => h.trim().toLowerCase());
    const vendorIdx = headers.findIndex(h => h.includes('name of party') || h.includes('vendor'));

    if (vendorIdx === -1) return alert("Could not find a 'Vendor' or 'Name of Party' column.");

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
    alert(`Matched and updated ${matchCount} records.`);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Compliance Review</h2>
          <p className="text-sm text-slate-500 mt-1">Verify GST details and compliance status.</p>
        </div>
        <button
          onClick={() => setShowPasteArea(!showPasteArea)}
          className="btn-secondary flex items-center"
        >
          <ClipboardPaste className="h-4 w-4 mr-2" />
          Cross-check GST Data
        </button>
      </div>

      <AnimatePresence>
        {showPasteArea && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 border-blue-200 bg-blue-50/50"
          >
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Bulk Cross-Check</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Paste data from Excel here. We will match vendor names and highlight discrepancies.
                </p>
              </div>
            </div>
            <textarea
              className="input-field h-32 font-mono text-xs"
              placeholder="Paste TSV data here..."
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button onClick={() => setShowPasteArea(false)} className="btn-secondary">Cancel</button>
              <button onClick={handlePasteData} className="btn-primary">Process Data</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-800">Pending Reviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 border-b border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Vendor Details</th>
                <th className="table-header">PO Amount</th>
                <th className="table-header">Final Payable</th>
                <th className="table-header w-48">Status</th>
                <th className="table-header w-64">Remarks</th>
                <th className="table-header text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No requests pending compliance review.
                  </td>
                </tr>
              ) : (
                pendingRequests.map(req => {
                  const edit = edits[req.id] || { complianceStatus: '', remarks: '' };

                  return (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="text-sm font-medium text-slate-900">{req.projectName}</div>
                          <div className="text-xs text-slate-500">{req.vendorName}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{req.poNumber}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-slate-500">{formatCurrency(req.poAmount)}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-semibold text-slate-900">{formatCurrency(req.payableAfterTds || 0)}</div>
                        </td>
                        <td className="p-3">
                          <select
                            className={cn(
                              "input-field py-1.5 text-xs font-medium",
                              edit.complianceStatus === 'All Okay' ? 'text-green-700 bg-green-50 border-green-200' :
                              edit.complianceStatus === 'All Not Okay' ? 'text-red-700 bg-red-50 border-red-200' : ''
                            )}
                            value={edit.complianceStatus}
                            onChange={e => updateEdit(req.id, 'complianceStatus', e.target.value)}
                          >
                            <option value="">-- Pending --</option>
                            <option value="All Okay">All Okay</option>
                            <option value="All Not Okay">All Not Okay</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input type="text" placeholder="Notes..." className="input-field py-1.5 text-xs"
                            value={edit.remarks} onChange={e => updateEdit(req.id, 'remarks', e.target.value)} />
                        </td>
                        <td className="p-3 align-middle text-center">
                          <button 
                            onClick={() => handleApprove(req.id)} 
                            disabled={!edit.complianceStatus}
                            className={cn(
                              "p-2 rounded-md transition-colors",
                              edit.complianceStatus 
                                ? "bg-slate-900 text-white hover:bg-slate-800" 
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Cross-Reference Data Sub-row */}
                      {edit.pastedData && edit.pastedData.length > 0 && (
                        <tr className="bg-red-50/30">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="border-l-2 border-red-400 pl-4">
                              <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1.5" /> Discrepancy Found in Upload
                              </h4>
                              <div className="overflow-x-auto bg-white rounded border border-red-100 shadow-sm">
                                <table className="min-w-full divide-y divide-red-100">
                                  <thead>
                                    <tr className="bg-red-50/50">
                                      {Object.keys(edit.pastedData[0]).map((key, idx) => (
                                        <th key={idx} className="px-3 py-2 text-left text-[10px] font-semibold text-red-700 uppercase tracking-wider">
                                          {key}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-red-50 text-[11px] text-slate-700">
                                    {edit.pastedData.map((row, rowIdx) => (
                                      <tr key={rowIdx}>
                                        {Object.values(row).map((val, colIdx) => (
                                          <td key={colIdx} className="px-3 py-2 whitespace-nowrap">{val}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processed History */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-base font-semibold text-slate-800">Processed Reviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Vendor Details</th>
                <th className="table-header">Payable Amount</th>
                <th className="table-header">Compliance Status</th>
                <th className="table-header">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {processedRequests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No historical reviews found.</td></tr>
              ) : (
                processedRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <div className="font-medium text-slate-900">{req.projectName}</div>
                      <div className="text-xs text-slate-500">{req.vendorName}</div>
                    </td>
                    <td className="table-cell font-medium text-slate-900">
                      {formatCurrency(req.finalPayableAmount || 0)}
                    </td>
                    <td className="table-cell">
                      <span className={cn(
                        "status-badge",
                        req.complianceStatus === 'All Okay' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {req.complianceStatus}
                      </span>
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
