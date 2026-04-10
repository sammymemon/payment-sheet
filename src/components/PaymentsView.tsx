import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Department</h2>
        <p className="text-sm text-gray-500 mt-1">Final execution and settlement row by row.</p>
      </div>

      {/* Pending Payments Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Execution</h3>
        {pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center border-dashed">
            <p className="text-gray-500">No pending requests for Payment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th colSpan={7} className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-100">
                      Request Data (Read-Only)
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider border-b border-gray-200 bg-blue-50">
                      Execution (Editable)
                    </th>
                  </tr>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Vendor</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PO No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Bill Amt</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">TDS</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">Final Payable</th>
                    
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Remarks</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map(req => {
                    const edit = edits[req.id] || { remarkSelection: 'Paid Payment', customRemark: '' };
                    
                    return (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{req.projectName}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{req.vendorName}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{req.poNumber}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{req.paymentType}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(req.billAmount || 0)}</td>
                        <td className="px-3 py-3 text-sm text-red-600 whitespace-nowrap">-{formatCurrency(req.tdsAmount || 0)}</td>
                        <td className="px-3 py-3 text-sm font-bold text-green-700 whitespace-nowrap border-r border-gray-200">{formatCurrency(req.finalPayableAmount || 0)}</td>
                        
                        <td className="p-2 bg-blue-50/10 border-r border-gray-100 min-w-[200px]">
                          <div className="flex flex-col space-y-1">
                            <select 
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
                              value={edit.remarkSelection}
                              onChange={e => updateEdit(req.id, 'remarkSelection', e.target.value)}
                            >
                              <option value="Paid Payment">Paid Payment</option>
                              <option value="Proforma Invoice Received">Proforma Invoice Received</option>
                              <option value="Advance Settled">Advance Settled</option>
                              <option value="Other">Other (Type below)...</option>
                            </select>
                            {edit.remarkSelection === 'Other' && (
                              <input type="text" placeholder="Custom remark..." className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                value={edit.customRemark} onChange={e => updateEdit(req.id, 'customRemark', e.target.value)} />
                            )}
                          </div>
                        </td>
                        
                        <td className="p-2 text-center align-middle bg-blue-50/10 whitespace-nowrap">
                          <button onClick={() => handlePay(req.id)} title="Execute Payment"
                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
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
