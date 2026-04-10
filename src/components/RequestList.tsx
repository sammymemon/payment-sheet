import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PaymentRequest } from '../types';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';

interface RequestListProps {
  requests: PaymentRequest[];
  onSelect: (request: PaymentRequest) => void;
  selectedId?: string;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, onSelect, selectedId }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
        <p className="mt-1 text-sm text-gray-500">There are no requests pending in your queue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {requests.map((req) => (
          <li 
            key={req.id}
            onClick={() => onSelect(req)}
            className={cn(
              "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
              selectedId === req.id && "bg-blue-50/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {req.needToPay ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : req.status === 'Paid' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {req.vendorName} - {req.projectName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    PO: {req.poNumber} • {req.paymentType}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(req.needToPayAmount || req.paidAmountRs || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(req.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                req.status === 'Paid' ? "bg-green-100 text-green-800" :
                req.status === 'Rejected' ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              )}>
                {req.status}
              </span>
              <span className="text-xs text-gray-500">
                Stage: {req.currentStage}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
