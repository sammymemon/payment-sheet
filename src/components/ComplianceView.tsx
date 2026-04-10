import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency } from '../lib/utils';
import { CheckCircle, ClipboardPaste, AlertCircle } from 'lucide-react';
import Fuse from 'fuse.js';

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
      alert("Please paste data with headers and at least one row.");
      return;
    }

    const headers = lines[0].map(h => h.trim().toLowerCase());
    const vendorIdx = headers.findIndex(h => h.includes('name of party') || h.includes('vendor'));
    const statusIdx = headers.findIndex(h => h === 'status');
    const diffIdx = headers.findIndex(h => h.includes('total diff'));
    const remarkIdx = headers.findIndex(h => h.includes('remaks') || h.includes('remarks') || h.includes('samir'));

    if (vendorIdx === -1) {
      alert("Could not find 'Name of Party' or 'Vendor' column in pasted data.");
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
            // Use the original header case if possible, fallback to lowercase
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
    alert(`Successfully matched and updated ${matchCount} requests.`);
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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Compliance Department</h2>
          <p className="text-sm text-gray-500 mt-1">Verify GST Reco and mark status row by row.</p>
        </div>
        <button
          onClick={() => setShowPasteArea(!showPasteArea)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <ClipboardPaste className="h-4 w-4" />
          <span>Paste GST Data</span>
        </button>
      </div>

      {showPasteArea && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-start space-x-3 mb-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Automate "All Not Okay" Status</h4>
              <p className="text-xs text-blue-700 mt-1">
                Paste Excel data with headers (must include "Name of Party"). The system will fuzzy match vendors and auto-fill the remarks and set status to "All Not Okay".
              </p>
            </div>
          </div>
          <textarea
            className="w-full h-32 p-3 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Paste Excel data here (TSV format)..."
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
          />
          <div className="mt-3 flex justify-end space-x-3">
            <button
              onClick={() => setShowPasteArea(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePasteData}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Process Data
            </button>
          </div>
        </div>
      )}

      {/* Pending Requests Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Audit</h3>
        {pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center border-dashed">
            <p className="text-gray-500">No pending requests for Compliance verification.</p>
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
                    <th colSpan={3} className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-100">
                      Accounts Data (Read-Only)
                    </th>
                    <th colSpan={3} className="px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider border-b border-gray-200 bg-blue-50">
                      Compliance Audit (Editable)
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
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Bill Amt</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">TDS</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">Payable</th>

                    {/* Compliance Columns */}
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Remarks</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map(req => {
                    const edit = edits[req.id] || { complianceStatus: '', remarks: '' };

                    return (
                      <React.Fragment key={req.id}>
                        <tr className="hover:bg-gray-50 transition-colors group">
                          {/* Purchase Data */}
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{req.projectName}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{req.vendorName}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{req.poNumber}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(req.poAmount)}</td>
                          <td className="px-3 py-3 text-sm font-medium text-red-600 whitespace-nowrap border-r border-gray-200">{formatCurrency(req.needToPayAmount)}</td>

                          {/* Accounts Data */}
                          <td className="px-3 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{formatCurrency(req.billAmount || 0)}</td>
                          <td className="px-3 py-3 text-sm text-red-600 whitespace-nowrap">-{formatCurrency(req.tdsAmount || 0)}</td>
                          <td className="px-3 py-3 text-sm font-medium text-gray-900 whitespace-nowrap border-r border-gray-200">{formatCurrency(req.payableAfterTds || 0)}</td>

                          {/* Compliance Data */}
                          <td className="p-2 bg-blue-50/10 border-r border-gray-100">
                            <select
                              className={`w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${edit.complianceStatus === 'All Okay' ? 'border-green-300 bg-green-50 text-green-800' :
                                edit.complianceStatus === 'All Not Okay' ? 'border-red-300 bg-red-50 text-red-800' :
                                  'border-gray-300 bg-white'
                                }`}
                              value={edit.complianceStatus}
                              onChange={e => updateEdit(req.id, 'complianceStatus', e.target.value)}
                            >
                              <option value="">-- Select --</option>
                              <option value="All Okay">All Okay</option>
                              <option value="All Not Okay">All Not Okay</option>
                            </select>
                          </td>
                          <td className="p-2 bg-blue-50/10 border-r border-gray-100 min-w-[200px]">
                            <input type="text" placeholder="Remarks..." className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              value={edit.remarks} onChange={e => updateEdit(req.id, 'remarks', e.target.value)} />
                          </td>

                          {/* Actions */}
                          <td className="p-2 text-center align-middle bg-blue-50/10 whitespace-nowrap">
                            <button onClick={() => handleApprove(req.id)} disabled={!edit.complianceStatus} title={edit.complianceStatus ? "Approve" : "Select status to approve"}
                              className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                        {edit.pastedData && edit.pastedData.length > 0 && (
                          <tr>
                            <td colSpan={11} className="p-0 border-b border-gray-200">
                              <div className="bg-red-50/50 p-4 border-l-4 border-red-400">
                                <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-2">Pasted GST Data</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-red-200 border border-red-200">
                                    <thead className="bg-red-100/50">
                                      <tr>
                                        {Object.keys(edit.pastedData[0]).map((key, idx) => (
                                          <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-red-800 whitespace-nowrap border-r border-red-200">
                                            {key}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-red-100">
                                      {edit.pastedData.map((row, rowIdx) => (
                                        <tr key={rowIdx} className="hover:bg-red-50/30">
                                          {Object.values(row).map((val, colIdx) => (
                                            <td key={colIdx} className="px-3 py-2 text-xs text-red-900 whitespace-nowrap border-r border-red-100">
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
                          </tr>
                        )}
                      </React.Fragment>
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Processed by Compliance</h3>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Payable</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedRequests.map(req => {
                    return (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.projectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.vendorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.poNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(req.finalPayableAmount || 0)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.complianceStatus === 'All Okay' ? 'bg-green-100 text-green-800' :
                            req.complianceStatus === 'All Not Okay' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {req.complianceStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {req.status}
                          </span>
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
    </div>
  );
};
