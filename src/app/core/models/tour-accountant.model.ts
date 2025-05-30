export interface TourAccountant {
  id: number;
  tourName: string;
  startDate: string;
  totalCost: number;
  profit: number;
  bookingCode: number;
  status: string;
}

export interface ReceiptRecord {
  id: number;
  createdDate: string;
  accountingDate: string;
  customer: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

export interface PaymentRecord {
  id: number;
  createdDate: string;
  accountingDate: string; 
  provider: string;
  amount: number; 
  paymentMethod: string; 
  status: string; 
}

export interface RefundRecord {
  id: number;
  tourName: string;
  createdDate: string;
  accountingDate: string; 
  customerOrPartner: string;
  amount: number;
  status: string; 
}
