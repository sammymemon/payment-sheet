import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { RequestList } from './RequestList';
import { PaymentRequest, CompanyName } from '../types';
import { AlertCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const PurchaseView: React.FC = () => {
  const { requests, addRequests, updateRequest } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  
  const [companyName, setCompanyName] = useState<CompanyName | ''>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [senderName, setSenderName] = useState<string>('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaymentRequest>>({});
  
  const initialRow: Partial<PaymentRequest> = {
    projectName: '',
    vendorName: '',
    natureOfWork: '',
    poNumber: '',
    paymentType: 'Partial',
    poAmount: 0,
    alreadyPaidAmount: 0,
    needToPayAmount: 0,
    needToPay: false,
  };

  const [rows, setRows] = useState<Partial<PaymentRequest>[]>([{ ...initialRow }]);

  const handleAddRow = () => {
    setRows([...rows, { ...initialRow }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof PaymentRequest, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      alert("Please select a company.");
      return;
    }
    if (!paymentDate) {
      alert("Please select a payment date.");
      return;
    }
    if (!senderName) {
      alert("Please enter a sender name.");
      return;
    }

    const requestsToSubmit = rows.map(row => ({
      ...row,
      companyName,
      paymentDate,
      senderName
    }));

    addRequests(requestsToSubmit);
    setIsCreating(false);
    setCompanyName('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setSenderName('');
    setRows([{ ...initialRow }]);
  };

  const myRequests = requests.filter(r => r.status !== 'Paid'); 
  const needToPayCount = myRequests.filter(r => r.needToPay).length;

  const handleEditClick = (req: PaymentRequest) => {
    setEditingId(req.id);
    setEditForm(req);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateRequest(editingId, editForm, 'Purchase Data Updated', 'Updated by Purchase');
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Purchase Department</h2>
          <p className="text-sm text-gray-500 mt-1">Initiate new payment requests.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          {isCreating ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {/* Need to Pay Box */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center shadow-sm">
        <div className="p-3 bg-red-100 rounded-lg">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-red-800">High Priority (Need to Pay)</p>
          <p className="text-2xl font-bold text-red-900">{needToPayCount} <span className="text-sm font-medium text-red-700">Pending Requests</span></p>
        </div>
      </div>

      {isCreating ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Create Payment Requests</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Details (Once) */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Global Details (Applies to all rows)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <select required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyName} onChange={e => setCompanyName(e.target.value as CompanyName)}>
                    <option value="">-- Select Company --</option>
                    <option value="Dev Accelerator Limited">Dev Accelerator Limited</option>
                    <option value="Needle & Thread LLP">Needle & Thread LLP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input required type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                  <input required type="text" placeholder="Enter sender name" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={senderName} onChange={e => setSenderName(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Dynamic Rows as Excel-like Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Project Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Vendor Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nature of Work</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PO Number</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PO Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Already Paid</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Need to Pay</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-0 border-r border-gray-100">
                        <input required type="text" placeholder="Project" className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm" 
                          value={row.projectName} onChange={e => updateRow(index, 'projectName', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-gray-100">
                        <input required type="text" placeholder="Vendor" className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm" 
                          value={row.vendorName} onChange={e => updateRow(index, 'vendorName', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-gray-100">
                        <input required type="text" placeholder="Work details" className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm" 
                          value={row.natureOfWork} onChange={e => updateRow(index, 'natureOfWork', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-gray-100">
                        <input required type="text" placeholder="PO-XXX" className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm" 
                          value={row.poNumber} onChange={e => updateRow(index, 'poNumber', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-gray-100">
                        <select className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm"
                          value={row.paymentType} onChange={e => updateRow(index, 'paymentType', e.target.value)}>
                          <option value="Advance">Advance</option>
                          <option value="Partial">Partial</option>
                          <option value="Final">Final</option>
                        </select>
                      </td>
                      <td className="p-0 border-r border-gray-100">
                        <input required type="number" min="0" placeholder="0" className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm" 
                          value={row.poAmount || ''} onChange={e => updateRow(index, 'poAmount', Number(e.target.value))} />
                      </td>
                      <td className="p-0 border-r border-gray-100">
                        <input required type="number" min="0" placeholder="0" className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm" 
                          value={row.alreadyPaidAmount || ''} onChange={e => updateRow(index, 'alreadyPaidAmount', Number(e.target.value))} />
                      </td>
                      <td className="p-0 border-r border-gray-100">
                        <input required type="number" min="0" placeholder="0" className="w-full px-3 py-3 border-0 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm font-medium text-blue-700" 
                          value={row.needToPayAmount || ''} onChange={e => updateRow(index, 'needToPayAmount', Number(e.target.value))} />
                      </td>
                      <td className="p-0 border-r border-gray-100 text-center align-middle">
                        <div className="flex items-center justify-center h-full w-full py-3">
                          <input type="checkbox" title="High Priority" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                            checked={row.needToPay} onChange={e => updateRow(index, 'needToPay', e.target.checked)} />
                        </div>
                      </td>
                      <td className="p-0 text-center align-middle w-10">
                        <div className="flex items-center justify-center h-full w-full py-3">
                          {rows.length > 1 ? (
                            <button type="button" onClick={() => handleRemoveRow(index)} className="text-gray-400 hover:text-red-600 transition-colors" title="Remove Row">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <div className="w-4 h-4"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button type="button" onClick={handleAddRow} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Row
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Submit All to Accounts
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">All Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Need to Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No requests found.</td>
                  </tr>
                ) : (
                  myRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      {editingId === req.id ? (
                        <>
                          <td className="px-4 py-2"><input type="text" className="w-full px-2 py-1 border rounded text-sm" value={editForm.projectName || ''} onChange={e => setEditForm({...editForm, projectName: e.target.value})} /></td>
                          <td className="px-4 py-2"><input type="text" className="w-full px-2 py-1 border rounded text-sm" value={editForm.vendorName || ''} onChange={e => setEditForm({...editForm, vendorName: e.target.value})} /></td>
                          <td className="px-4 py-2"><input type="text" className="w-full px-2 py-1 border rounded text-sm" value={editForm.poNumber || ''} onChange={e => setEditForm({...editForm, poNumber: e.target.value})} /></td>
                          <td className="px-4 py-2"><input type="number" className="w-full px-2 py-1 border rounded text-sm" value={editForm.poAmount || 0} onChange={e => setEditForm({...editForm, poAmount: Number(e.target.value)})} /></td>
                          <td className="px-4 py-2"><input type="number" className="w-full px-2 py-1 border rounded text-sm" value={editForm.needToPayAmount || 0} onChange={e => setEditForm({...editForm, needToPayAmount: Number(e.target.value)})} /></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center whitespace-nowrap">
                            <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-900 mr-3"><Check className="h-4 w-4 inline" /></button>
                            <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-900"><X className="h-4 w-4 inline" /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.projectName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.vendorName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.poNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(req.poAmount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatCurrency(req.needToPayAmount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button onClick={() => handleEditClick(req)} className="text-blue-600 hover:text-blue-900">
                              <Edit2 className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
