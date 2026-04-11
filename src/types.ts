export type Role = 'Purchase' | 'Accounts' | 'Compliance' | 'Payments' | 'Register' | 'Dashboard' | 'Admin';
export type RequestStatus = 
  | 'Draft' 
  | 'Pending Accounts' 
  | 'Pending Compliance' 
  | 'Pending Payment' 
  | 'Paid' 
  | 'Rejected';

export type CompanyName = 'Dev Accelerator Limited' | 'Needle & Thread LLP' | '';

export interface AuditLog {
  id: string;
  requestId: string;
  action: string;
  remarks?: string;
  userId: string;
  timestamp: string;
}

export interface PaymentRequest {
  id: string;
  
  // Stage 1: Purchase
  companyName: CompanyName;
  paymentDate?: string;
  senderName?: string;
  projectName: string;
  vendorName: string;
  natureOfWork: string;
  poNumber: string;
  paymentType: 'Advance' | 'Partial' | 'Final';
  paidAmountPercent: number;
  paidAmountRs: number;
  alreadyPaidAmount: number;
  needToPayAmount: number;
  needToPay: boolean; // High Priority Flag
  
  // Stage 2: Accounts
  poAmount: number;
  billAmount: number;
  outstandingAmount: number;
  mismatchFlag: boolean;
  tdsAmount?: number;
  payableAfterTds?: number;
  zohoCredentialsChecked?: boolean;
  poToBillStatus?: boolean;
  poApproved?: boolean;
  tds194cApplicable?: boolean;
  tds194cAmount?: number;
  tds194qApplicable?: boolean;
  tds194qAmount?: number;
  gstRecoVerified?: boolean;

  // Stage 3: Compliance
  complianceStatus?: 'All Okay' | 'All Not Okay' | '';

  // Stage 4: Payments
  finalPayableAmount: number;
  paymentRemarks: string;
  isClosed: boolean;

  // Metadata
  status: RequestStatus;
  currentStage: Role;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
}
