'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest, CompanyName } from '../types';
import { AlertCircle, Plus, Trash2, Edit2, Check, X, Image as ImageIcon, Loader2, UploadCloud, Activity } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const PurchaseView: React.FC = () => {
  const { requests, addRequests, updateRequest, removeRequest } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  
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

  const handleAddRow = () => setRows([...rows, { ...initialRow }]);
  const handleRemoveRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const updateRow = (index: number, field: keyof PaymentRequest, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return alert("Please select a company.");
    if (!paymentDate) return alert("Please select a date.");
    if (!senderName) return alert("Please enter the requester name.");

    const requestsToSubmit = rows.map(row => ({
      ...row, companyName, paymentDate, senderName
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

  const handleEditClick = (req: PaymentRequest) => { setEditingId(req.id); setEditForm(req); };
  const handleCancelEdit = () => { setEditingId(null); setEditForm({}); };
  const handleSaveEdit = () => {
    if (editingId) {
      updateRequest(editingId, editForm, 'Purchase Data Updated', 'Updated by Purchase');
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this request?")) {
      removeRequest(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPastedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const imageItem = e.clipboardData.items[0];
    if (imageItem?.type.includes('image')) {
      const blob = imageItem.getAsFile();
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => setPastedImage(reader.result as string);
        reader.readAsDataURL(blob);
      }
      return;
    }

    const textData = e.clipboardData.getData('text/plain');
    if (textData && textData.includes('\t')) {
      try {
        const lines = textData.trim().split('\n');
        const newRows: Partial<PaymentRequest>[] = lines.map(line => {
          const cells = line.split('\t');
          return {
            ...initialRow,
            projectName: cells[0] || '',
            vendorName: cells[1] || '',
            natureOfWork: cells[2] || '',
            poNumber: cells[3] || '',
            paymentType: (cells[4] || 'Partial') as any,
            poAmount: Number(cells[5]?.replace(/[^0-9.]/g, '')) || 0,
            alreadyPaidAmount: Number(cells[6]?.replace(/[^0-9.]/g, '')) || 0,
            needToPayAmount: Number(cells[7]?.replace(/[^0-9.]/g, '')) || 0,
            needToPay: cells[8]?.toLowerCase().includes('y') || cells[8]?.toLowerCase().includes('true') || false,
          };
        });
        if (newRows.length > 0) { setRows(newRows); alert(`Imported ${newRows.length} rows.`); }
      } catch (err) { console.error("Paste error", err); }
    }
  };

  const extractData = async () => {
    if (!pastedImage) return;
    setIsExtracting(true);
    try {
      const response = await fetch('/api/extract-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: pastedImage }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      if (Array.isArray(data)) {
        setRows(data.map(item => ({ ...initialRow, ...item })));
        setPastedImage(null);
        alert(`Extracted ${data.length} rows successfully.`);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'AI Extraction Failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-[#2A2A26] tracking-tight">Purchase Requests</h2>
          <p className="text-sm text-[#6B6A65] mt-1">Create and manage unified purchase and payment requests.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={cn(isCreating ? "btn-secondary" : "btn-primary", "flex items-center")}
        >
          {isCreating ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {isCreating ? 'Cancel' : 'New Request'}
        </button>
      </div>

      <div className="flex gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 flex-1">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><AlertCircle className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Urgent Pending</p>
            <p className="text-2xl font-bold text-slate-900">{needToPayCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 flex-1">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Activity className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Requests</p>
            <p className="text-2xl font-bold text-slate-900">{myRequests.length}</p>
          </div>
        </div>
      </div>

      {isCreating ? (
        <div className="glass-card p-8">
          <h3 className="text-xl font-serif text-[#2A2A26] mb-6">Create New Payment Request</h3>
          
          {/* Smart Import Area */}
          <div 
            onPaste={handlePaste}
            className="mb-8 border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 text-center hover:bg-slate-100 transition-colors relative"
          >
            {pastedImage ? (
              <div className="flex flex-col items-center space-y-4">
                <img src={pastedImage} alt="Pasted" className="max-h-48 rounded shadow-sm border border-slate-200" />
                <div className="flex space-x-3">
                  <button type="button" onClick={extractData} disabled={isExtracting} className="btn-primary flex items-center">
                    {isExtracting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    {isExtracting ? 'Extracting Data...' : 'Extract Data via AI'}
                  </button>
                  <button type="button" onClick={() => setPastedImage(null)} className="btn-secondary">Clear Image</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">Paste Image or Excel Data</h4>
                <p className="text-xs text-slate-500 mt-1">Ctrl+V to paste an image/screenshot for AI extraction, or paste cells from Excel directly.</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Entity *</label>
                <select required className="input-field" value={companyName} onChange={e => setCompanyName(e.target.value as CompanyName)}>
                  <option value="">-- Select Company --</option>
                  <option value="Dev Accelerator Limited">Dev Accelerator Limited</option>
                  <option value="Needle & Thread LLP">Needle & Thread LLP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input required type="date" className="input-field" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requested By *</label>
                <input required type="text" placeholder="Full Name" className="input-field" value={senderName} onChange={e => setSenderName(e.target.value)} />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-header">Project</th>
                      <th className="table-header">Vendor</th>
                      <th className="table-header">Description</th>
                      <th className="table-header">PO No</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">PO Amt</th>
                      <th className="table-header">Paid</th>
                      <th className="table-header">Payable</th>
                      <th className="table-header text-center">Urgent</th>
                      <th className="table-header w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {rows.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="p-2"><input required type="text" className="w-full text-sm border-0 bg-transparent focus:ring-0 p-1" placeholder="Project" value={row.projectName} onChange={e => updateRow(index, 'projectName', e.target.value)} /></td>
                        <td className="p-2"><input required type="text" className="w-full text-sm border-0 bg-transparent focus:ring-0 p-1" placeholder="Vendor" value={row.vendorName} onChange={e => updateRow(index, 'vendorName', e.target.value)} /></td>
                        <td className="p-2"><input required type="text" className="w-full text-sm border-0 bg-transparent focus:ring-0 p-1" placeholder="Details" value={row.natureOfWork} onChange={e => updateRow(index, 'natureOfWork', e.target.value)} /></td>
                        <td className="p-2"><input required type="text" className="w-full text-sm border-0 bg-transparent focus:ring-0 p-1" placeholder="PO-123" value={row.poNumber} onChange={e => updateRow(index, 'poNumber', e.target.value)} /></td>
                        <td className="p-2">
                          <select className="w-full text-sm border-0 bg-transparent focus:ring-0 p-1" value={row.paymentType} onChange={e => updateRow(index, 'paymentType', e.target.value)}>
                            <option value="Advance">Advance</option>
                            <option value="Partial">Partial</option>
                            <option value="Final">Final</option>
                          </select>
                        </td>
                        <td className="p-2"><input required type="number" className="text-sm border-0 bg-transparent focus:ring-0 p-1" placeholder="0" value={row.poAmount || ''} onChange={e => updateRow(index, 'poAmount', Number(e.target.value))} /></td>
                        <td className="p-2"><input required type="number" className="text-sm border-0 bg-transparent focus:ring-0 p-1" placeholder="0" value={row.alreadyPaidAmount || ''} onChange={e => updateRow(index, 'alreadyPaidAmount', Number(e.target.value))} /></td>
                        <td className="p-2"><input required type="number" className="text-sm border-0 bg-transparent focus:ring-0 p-1 font-medium text-blue-600" placeholder="0" value={row.needToPayAmount || ''} onChange={e => updateRow(index, 'needToPayAmount', Number(e.target.value))} /></td>
                        <td className="p-2 text-center align-middle"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={row.needToPay} onChange={e => updateRow(index, 'needToPay', e.target.checked)} /></td>
                        <td className="p-2 text-center align-middle">
                          {rows.length > 1 && <button type="button" onClick={() => handleRemoveRow(index)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                <button type="button" onClick={handleAddRow} className="btn-secondary flex items-center text-xs"><Plus className="h-3 w-3 mr-1" /> Add Row</button>
                <button type="submit" className="btn-primary">Submit Requests</button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E7E2] bg-transparent flex justify-between items-center">
            <h3 className="text-base font-semibold text-[#2A2A26]">Recent Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-header">Project / Vendor</th>
                  <th className="table-header">PO Details</th>
                  <th className="table-header">Amounts</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {myRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No active requests found.</td></tr>
                ) : (
                  myRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      {editingId === req.id ? (
                        <>
                          <td className="px-6 py-4" colSpan={3}>
                            <div className="flex gap-4">
                              <input type="text" className="input-field py-1" value={editForm.projectName || ''} onChange={e => setEditForm({...editForm, projectName: e.target.value})} />
                              <input type="text" className="input-field py-1" value={editForm.vendorName || ''} onChange={e => setEditForm({...editForm, vendorName: e.target.value})} />
                              <input type="number" className="input-field py-1" value={editForm.needToPayAmount || 0} onChange={e => setEditForm({...editForm, needToPayAmount: Number(e.target.value)})} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right" colSpan={2}>
                            <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check className="h-4 w-4" /></button>
                            <button onClick={handleCancelEdit} className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-1"><X className="h-4 w-4" /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="table-cell">
                            <div className="font-medium text-slate-900">{req.projectName}</div>
                            <div className="text-xs text-slate-500">{req.vendorName}</div>
                          </td>
                          <td className="table-cell">
                            <div className="font-medium text-slate-900">{req.poNumber}</div>
                            <div className="text-xs text-slate-500">{req.paymentType}</div>
                          </td>
                          <td className="table-cell">
                            <div className="text-xs text-slate-500">PO: {formatCurrency(req.poAmount)}</div>
                            <div className="font-medium text-blue-600">{formatCurrency(req.needToPayAmount)}</div>
                          </td>
                          <td className="table-cell">
                            <span className="status-badge bg-blue-100 text-blue-700">{req.status}</span>
                            <div className="text-[10px] text-slate-500 uppercase mt-1 tracking-wider">{req.currentStage}</div>
                          </td>
                          <td className="table-cell text-right whitespace-nowrap">
                            <button onClick={() => handleEditClick(req)} className="p-1.5 text-[#8D8C86] hover:text-[#2A2A26] hover:bg-[#EBEAE5] rounded transition-colors mr-1" title="Edit">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(req.id)} className="p-1.5 text-[#8D8C86] hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4" />
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
