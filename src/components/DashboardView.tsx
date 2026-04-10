import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { Activity, CheckCircle2, Clock, FileText } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { requests, auditLogs } = useApp();
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const stats = [
    { name: 'Total Requests', value: requests.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Accounts', value: requests.filter(r => r.currentStage === 'Accounts').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Pending Compliance', value: requests.filter(r => r.currentStage === 'Compliance').length, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Paid', value: requests.filter(r => r.status === 'Paid').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const selectedLogs = selectedReqId ? auditLogs.filter(l => l.requestId === selectedReqId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Workflow Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Overview of all payment requests and audit trails.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">All Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project / Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedReqId(req.id)}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedReqId === req.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{req.projectName}</div>
                        <div className="text-sm text-gray-500">{req.vendorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(req.needToPayAmount || req.paidAmountRs || 0)}</div>
                        <div className="text-xs text-gray-500">{req.paymentType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.currentStage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
              <p className="text-xs text-gray-500">Select a request to view its history</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[600px]">
              {selectedReqId ? (
                selectedLogs.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {selectedLogs.map((log, logIdx) => (
                        <li key={log.id}>
                          <div className="relative pb-8">
                            {logIdx !== selectedLogs.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                  <Activity className="h-4 w-4 text-blue-600" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {log.action} <span className="font-medium text-gray-900">by {log.userId}</span>
                                  </p>
                                  {log.remarks && (
                                    <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                      "{log.remarks}"
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                  {formatDate(log.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No audit logs found for this request.</p>
                )
              ) : (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">Select a request from the table to view its audit trail.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
