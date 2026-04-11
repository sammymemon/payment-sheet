'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { RequestList } from './RequestList';
import { PaymentRequest, CompanyName } from '../types';
import { AlertCircle, Plus, Trash2, Edit2, Check, X, Image as ImageIcon, Upload, Loader2, ClipboardPaste } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

import { motion } from 'framer-motion';

export const PurchaseView: React.FC = () => {
  const { requests, addRequests, updateRequest } = useApp();
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPastedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const imageItem = e.clipboardData.items[0];
    if (imageItem?.type.includes('image')) {
      const blob = imageItem.getAsFile();
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPastedImage(reader.result as string);
        };
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
        
        if (newRows.length > 0) {
          setRows(newRows);
          alert(`Success: Synced ${newRows.length} rows from clipboard.`);
        }
      } catch (err) {
        console.error("Paste error", err);
      }
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
      
      if (!response.ok) throw new Error('AI Extraction Pipeline Offline');
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (Array.isArray(data)) {
        const newRows = data.map(item => ({
          ...initialRow,
          ...item
        }));
        setRows(newRows);
        setPastedImage(null);
        alert(`AI Sync Complete: ${data.length} records processed.`);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'AI Extraction Failed. Check system logs.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Gateway</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Initiation node for global procurement settlements.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center shadow-lg",
            isCreating 
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
          )}
        >
          {isCreating ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {isCreating ? 'Abort Operation' : 'Initialize Request'}
        </button>
      </div>

      <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex items-center shadow-xl shadow-rose-500/5 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-rose-100/50 to-transparent pointer-events-none" />
        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
          <AlertCircle className="h-7 w-7 text-rose-600" />
        </div>
        <div className="ml-6">
          <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Priority Surveillance</p>
          <p className="text-3xl font-black text-rose-900">{needToPayCount} <span className="text-sm font-bold text-rose-700/60 uppercase tracking-tight">Critical Exceptions Pending</span></p>
        </div>
      </div>

      {isCreating ? (
        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-card p-10 bg-white"
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Dispatch Configuration</h3>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-inner">
               <ClipboardPaste className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">Smart-Sync Active</span>
            </div>
          </div>
          
          <div 
            onPaste={handlePaste}
            className="mb-10 p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-300 transition-all group relative overflow-hidden flex flex-col items-center justify-center text-center"
          >
            <div className="absolute top-4 right-4 flex space-x-1">
              <span className="text-[10px] uppercase font-black text-blue-500 bg-blue-100/50 px-2 py-1 rounded-lg border border-blue-200">Neural Extractor v1.5</span>
            </div>
            {pastedImage ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative p-2 bg-white rounded-2xl shadow-xl">
                  <img src={pastedImage} alt="Pasted" className="max-h-56 rounded-xl" />
                </div>
                <div className="flex space-x-4">
                  <button 
                    type="button"
                    onClick={extractData}
                    disabled={isExtracting}
                    className="btn-primary flex items-center"
                  >
                    {isExtracting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {isExtracting ? 'Decrypting Image...' : 'Execute Data Extraction'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPastedImage(null)}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Clear Canvas
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl border border-slate-100 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ImageIcon className="h-7 w-7 text-blue-500" />
                </div>
                <h4 className="text-lg font-black text-slate-800">Quantum Clipboard Drop</h4>
                <p className="text-xs text-slate-500 mt-2 font-medium">Paste image (Ctrl+V) or click to browse payment sheets.</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Entity Profile</label>
                  <select required className="input-field font-bold text-slate-800"
                    value={companyName} onChange={e => setCompanyName(e.target.value as CompanyName)}>
                    <option value="">-- Select Corporate Entity --</option>
                    <option value="Dev Accelerator Limited">Dev Accelerator Limited</option>
                    <option value="Needle & Thread LLP">Needle & Thread LLP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Dispatch Timestamp</label>
                  <input required type="date" className="input-field font-bold text-slate-800"
                    value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Origin Agent</label>
                  <input required type="text" placeholder="Enter full name" className="input-field font-bold text-slate-800 placeholder:text-slate-300"
                    value={senderName} onChange={e => setSenderName(e.target.value)} />
                </div>
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-[2rem] bg-white shadow-2xl shadow-slate-200/50">
              <table className="min-w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Project ID</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Vendor Link</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Nature</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">PO ID</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Type</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Amount</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Paid</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Required</th>
                    <th className="px-5 py-4 text-center text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Pri.</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors group">
                      <td className="p-0 border-r border-slate-50">
                        <input required type="text" placeholder="Project" className="w-full px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm font-bold border-0" 
                          value={row.projectName} onChange={e => updateRow(index, 'projectName', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-slate-50">
                        <input required type="text" placeholder="Vendor" className="w-full px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm font-bold border-0" 
                          value={row.vendorName} onChange={e => updateRow(index, 'vendorName', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-slate-50">
                        <input required type="text" placeholder="Details" className="w-full px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-[11px] font-medium border-0" 
                          value={row.natureOfWork} onChange={e => updateRow(index, 'natureOfWork', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-slate-50">
                        <input required type="text" placeholder="PO-000" className="w-full px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-[11px] font-black border-0" 
                          value={row.poNumber} onChange={e => updateRow(index, 'poNumber', e.target.value)} />
                      </td>
                      <td className="p-0 border-r border-slate-50">
                        <select className="w-full px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-xs font-bold border-0"
                          value={row.paymentType} onChange={e => updateRow(index, 'paymentType', e.target.value)}>
                          <option value="Advance">Advance</option>
                          <option value="Partial">Partial</option>
                          <option value="Final">Final</option>
                        </select>
                      </td>
                      <td className="p-0 border-r border-slate-50">
                        <input required type="number" min="0" placeholder="0" className="w-24 px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-[11px] font-black border-0" 
                          value={row.poAmount || ''} onChange={e => updateRow(index, 'poAmount', Number(e.target.value))} />
                      </td>
                      <td className="p-0 border-r border-slate-50">
                        <input required type="number" min="0" placeholder="0" className="w-24 px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-[11px] font-medium text-slate-400 border-0" 
                          value={row.alreadyPaidAmount || ''} onChange={e => updateRow(index, 'alreadyPaidAmount', Number(e.target.value))} />
                      </td>
                      <td className="p-0 border-r border-slate-50">
                        <input required type="number" min="0" placeholder="0" className="w-24 px-5 py-4 bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm font-black text-blue-600 border-0" 
                          value={row.needToPayAmount || ''} onChange={e => updateRow(index, 'needToPayAmount', Number(e.target.value))} />
                      </td>
                      <td className="p-0 border-r border-slate-50 text-center align-middle">
                        <div className="flex items-center justify-center p-4">
                          <input type="checkbox" className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300 rounded cursor-pointer transition-transform group-hover:scale-125"
                            checked={row.needToPay} onChange={e => updateRow(index, 'needToPay', e.target.checked)} />
                        </div>
                      </td>
                      <td className="p-0 text-center align-middle w-12">
                        {rows.length > 1 && (
                          <button type="button" onClick={() => handleRemoveRow(index)} className="p-4 text-slate-300 hover:text-rose-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-8 bg-slate-50/50">
              <button type="button" onClick={handleAddRow} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all flex items-center shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Stream Entry
              </button>
              <button type="submit" className="px-10 py-4 bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                Authorize & Dispatch to Accounts
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Transmission History</h3>
            <div className="flex space-x-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Requests: {myRequests.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/30">
                <tr>
                  <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context</th>
                  <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
                  <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financials</th>
                  <th className="px-10 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surveillance Status</th>
                  <th className="px-10 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-16 text-center text-sm font-medium text-slate-400 uppercase tracking-widest">
                      <div className="flex flex-col items-center">
                        <Activity className="h-10 w-10 text-slate-100 mb-4" />
                        No active transmissions detected.
                      </div>
                    </td>
                  </tr>
                ) : (
                  myRequests.map(req => (
                    <tr key={req.id} className="hover:bg-blue-50 transition-all duration-300">
                      {editingId === req.id ? (
                        <>
                          <td className="px-8 py-4" colSpan={3}>
                             <div className="grid grid-cols-3 gap-4">
                                <input type="text" className="input-field py-1.5 text-xs font-bold" value={editForm.projectName || ''} onChange={e => setEditForm({...editForm, projectName: e.target.value})} />
                                <input type="text" className="input-field py-1.5 text-xs font-bold" value={editForm.vendorName || ''} onChange={e => setEditForm({...editForm, vendorName: e.target.value})} />
                                <input type="number" className="input-field py-1.5 text-xs font-black" value={editForm.needToPayAmount || 0} onChange={e => setEditForm({...editForm, needToPayAmount: Number(e.target.value)})} />
                             </div>
                          </td>
                          <td className="px-10 py-4 whitespace-nowrap text-right" colSpan={2}>
                            <button onClick={handleSaveEdit} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg mr-2"><Check className="h-5 w-5" /></button>
                            <button onClick={handleCancelEdit} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><X className="h-5 w-5" /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-10 py-6">
                            <div className="text-sm font-bold text-slate-900 leading-none">{req.projectName}</div>
                            <div className="text-[11px] font-medium text-slate-500 mt-1">{req.vendorName}</div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{req.poNumber}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{req.paymentType} Protocol</div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="text-[11px] font-medium text-slate-400 italic">PO Sum: {formatCurrency(req.poAmount)}</div>
                            <div className="text-sm font-black text-rose-600 mt-1">{formatCurrency(req.needToPayAmount)}</div>
                          </td>
                          <td className="px-10 py-6 whitespace-nowrap">
                            <span className={`status-badge border ${
                              req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                'bg-blue-50 text-blue-700 border-blue-100'}`}>
                              {req.status}
                            </span>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">Current Node: {req.currentStage}</div>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <button onClick={() => handleEditClick(req)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                              <Edit2 className="h-5 w-5" />
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

