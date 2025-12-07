export type OrderStatus = 
  | 'booked'
  | 'sample_received'
  | 'accepted'
  | 'rejected'
  | 'work_in_progress'
  | 'result_saved'
  | 'report_created'
  | 'verified'
  | 'on_hold'
  | 'delivered';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  createdAt: Date;
}

export interface Test {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  referenceRange?: string;
}

export interface TestResult {
  testId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export interface Order {
  id: string;
  orderId: string;
  patient: Patient;
  tests: Test[];
  status: OrderStatus;
  barcode: string;
  createdAt: Date;
  sampleReceivedAt?: Date;
  sampleReceivedBy?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  results?: TestResult[];
  reportContent?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  deliveredAt?: Date;
}

export const AVAILABLE_TESTS: Test[] = [
  { id: '1', name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'Hematology', price: 25, referenceRange: 'Various' },
  { id: '2', name: 'Thyroid Profile (T3, T4, TSH)', code: 'THYROID', category: 'Endocrinology', price: 45, referenceRange: 'Various' },
  { id: '3', name: 'Liver Function Test (LFT)', code: 'LFT', category: 'Biochemistry', price: 35, referenceRange: 'Various' },
  { id: '4', name: 'Kidney Function Test (KFT)', code: 'KFT', category: 'Biochemistry', price: 35, referenceRange: 'Various' },
  { id: '5', name: 'Lipid Profile', code: 'LIPID', category: 'Biochemistry', price: 30, referenceRange: 'Various' },
  { id: '6', name: 'Blood Sugar Fasting', code: 'BSF', category: 'Biochemistry', price: 10, referenceRange: '70-100 mg/dL' },
  { id: '7', name: 'Blood Sugar PP', code: 'BSPP', category: 'Biochemistry', price: 10, referenceRange: '<140 mg/dL' },
  { id: '8', name: 'HbA1c', code: 'HBA1C', category: 'Biochemistry', price: 40, referenceRange: '<5.7%' },
  { id: '9', name: 'Urine Routine', code: 'URINE', category: 'Pathology', price: 15, referenceRange: 'Various' },
  { id: '10', name: 'Vitamin D', code: 'VITD', category: 'Biochemistry', price: 50, referenceRange: '30-100 ng/mL' },
  { id: '11', name: 'Vitamin B12', code: 'VITB12', category: 'Biochemistry', price: 45, referenceRange: '200-900 pg/mL' },
  { id: '12', name: 'Iron Studies', code: 'IRON', category: 'Biochemistry', price: 40, referenceRange: 'Various' },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  booked: 'Booked',
  sample_received: 'Sample Received',
  accepted: 'Accepted',
  rejected: 'Rejected',
  work_in_progress: 'Work In Progress',
  result_saved: 'Result Saved',
  report_created: 'Report Created',
  verified: 'Verified',
  on_hold: 'On Hold',
  delivered: 'Delivered',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  booked: 'status-booked',
  sample_received: 'status-received',
  accepted: 'status-accepted',
  rejected: 'status-rejected',
  work_in_progress: 'status-wip',
  result_saved: 'status-result-saved',
  report_created: 'status-report-created',
  verified: 'status-verified',
  on_hold: 'status-on-hold',
  delivered: 'status-delivered',
};
