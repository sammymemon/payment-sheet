import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaymentRequest, AuditLog, User, Role } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  requests: PaymentRequest[];
  auditLogs: AuditLog[];
  addRequest: (request: Partial<PaymentRequest>) => void;
  addRequests: (requests: Partial<PaymentRequest>[]) => void;
  updateRequest: (id: string, updates: Partial<PaymentRequest>, action: string, remarks?: string) => void;
  getLogsForRequest: (requestId: string) => AuditLog[];
}

const defaultUsers: User[] = [
  { id: 'u1', name: 'Alice (Purchase)', role: 'Purchase' },
  { id: 'u2', name: 'Bob (Accounts)', role: 'Accounts' },
  { id: 'u3', name: 'Charlie (Compliance)', role: 'Compliance' },
  { id: 'u4', name: 'Diana (Payments)', role: 'Payments' },
];

const initialTestRequest: PaymentRequest = {
  id: 'test-req-1',
  companyName: 'Dev Accelerator Limited',
  paymentDate: new Date().toISOString().split('T')[0],
  senderName: 'Test User',
  projectName: 'aelum',
  vendorName: 'hiralal',
  natureOfWork: 'civil',
  poNumber: 'PO/25-26/788',
  paymentType: 'Partial',
  poAmount: 778899,
  alreadyPaidAmount: 200000,
  needToPayAmount: 120000,
  needToPay: true,
  paidAmountPercent: 0,
  paidAmountRs: 0,
  billAmount: 0,
  outstandingAmount: 0,
  mismatchFlag: false,
  tdsAmount: 0,
  payableAfterTds: 0,
  complianceStatus: '',
  finalPayableAmount: 0,
  paymentRemarks: '',
  isClosed: false,
  status: 'Pending Accounts',
  currentStage: 'Accounts',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(defaultUsers[0]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedRequestsStr = localStorage.getItem('devx_requests');
    const savedLogsStr = localStorage.getItem('devx_logs');
    
    let loadedRequests: PaymentRequest[] = [];
    if (savedRequestsStr) {
      loadedRequests = JSON.parse(savedRequestsStr);
    }
    
    // Inject test entry if it doesn't exist
    if (!loadedRequests.find(r => r.id === 'test-req-1')) {
      loadedRequests.push(initialTestRequest);
    }
    
    setRequests(loadedRequests);
    
    if (savedLogsStr) {
      setAuditLogs(JSON.parse(savedLogsStr));
    } else {
      // Add initial log for test request
      setAuditLogs([{
        id: uuidv4(),
        requestId: 'test-req-1',
        action: 'Created Request & Submitted to Accounts',
        userId: 'System',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('devx_requests', JSON.stringify(requests));
    localStorage.setItem('devx_logs', JSON.stringify(auditLogs));
  }, [requests, auditLogs]);

  const addAuditLog = (requestId: string, action: string, remarks?: string) => {
    const newLog: AuditLog = {
      id: uuidv4(),
      requestId,
      action,
      remarks,
      userId: currentUser.name, // Using name for display simplicity
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [...prev, newLog]);
  };

  const addRequests = (requestDataArray: Partial<PaymentRequest>[]) => {
    const timestamp = new Date().toISOString();
    
    const newRequests: PaymentRequest[] = requestDataArray.map(requestData => ({
      id: uuidv4(),
      companyName: requestData.companyName || '',
      paymentDate: requestData.paymentDate || '',
      senderName: requestData.senderName || '',
      projectName: requestData.projectName || '',
      vendorName: requestData.vendorName || '',
      natureOfWork: requestData.natureOfWork || '',
      poNumber: requestData.poNumber || '',
      paymentType: requestData.paymentType || 'Partial',
      paidAmountPercent: requestData.paidAmountPercent || 0,
      paidAmountRs: requestData.paidAmountRs || 0,
      alreadyPaidAmount: requestData.alreadyPaidAmount || 0,
      needToPayAmount: requestData.needToPayAmount || 0,
      needToPay: requestData.needToPay || false,
      
      poAmount: requestData.poAmount || 0,
      billAmount: 0,
      zohoCredentialsChecked: false,
      poToBillStatus: false,
      poApproved: false,
      outstandingAmount: 0,
      mismatchFlag: false,

      tds194cApplicable: false,
      tds194cAmount: 0,
      tds194qApplicable: false,
      tds194qAmount: 0,
      gstRecoVerified: false,

      finalPayableAmount: 0,
      paymentRemarks: '',
      isClosed: false,

      status: 'Pending Accounts',
      currentStage: 'Accounts',
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const newLogs: AuditLog[] = newRequests.map(req => ({
      id: uuidv4(),
      requestId: req.id,
      action: 'Created Request & Submitted to Accounts',
      remarks: undefined,
      userId: currentUser.name,
      timestamp,
    }));

    setRequests((prev) => [...newRequests, ...prev]);
    setAuditLogs((prev) => [...prev, ...newLogs]);
  };

  const addRequest = (requestData: Partial<PaymentRequest>) => {
    const newRequest: PaymentRequest = {
      id: uuidv4(),
      companyName: requestData.companyName || '',
      projectName: requestData.projectName || '',
      vendorName: requestData.vendorName || '',
      natureOfWork: requestData.natureOfWork || '',
      poNumber: requestData.poNumber || '',
      paymentType: requestData.paymentType || 'Partial',
      paidAmountPercent: requestData.paidAmountPercent || 0,
      paidAmountRs: requestData.paidAmountRs || 0,
      alreadyPaidAmount: requestData.alreadyPaidAmount || 0,
      needToPayAmount: requestData.needToPayAmount || 0,
      needToPay: requestData.needToPay || false,
      
      poAmount: requestData.poAmount || 0,
      billAmount: 0,
      zohoCredentialsChecked: false,
      poToBillStatus: false,
      poApproved: false,
      outstandingAmount: 0,
      mismatchFlag: false,

      tds194cApplicable: false,
      tds194cAmount: 0,
      tds194qApplicable: false,
      tds194qAmount: 0,
      gstRecoVerified: false,

      finalPayableAmount: 0,
      paymentRemarks: '',
      isClosed: false,

      status: 'Pending Accounts',
      currentStage: 'Accounts',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    addAuditLog(newRequest.id, 'Created Request & Submitted to Accounts');
  };

  const updateRequest = (id: string, updates: Partial<PaymentRequest>, action: string, remarks?: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, ...updates, updatedAt: new Date().toISOString() }
          : req
      )
    );
    addAuditLog(id, action, remarks);
  };

  const getLogsForRequest = (requestId: string) => {
    return auditLogs.filter((log) => log.requestId === requestId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        requests,
        auditLogs,
        addRequest,
        addRequests,
        updateRequest,
        getLogsForRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { defaultUsers };
