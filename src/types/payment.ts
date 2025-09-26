export interface PaymentPackage {
  id: string;
  name: string;
  duration: number; // gün cinsinden
  price: number; // TL cinsinden
  features: string[];
  popular?: boolean;
}

export interface PaymentRequest {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: string;
  paytr_token: string;
  user_basket: string;
  debug_on: string;
  no_installment: string;
  max_installment: string;
  user_name: string;
  user_address: string;
  user_phone: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  timeout_limit: string;
  currency: string;
  test_mode: string;
}

export interface PaymentResponse {
  status: 'success' | 'failed';
  reason?: string;
  token?: string;
}

export interface PremiumJobData {
  jobId: string;
  packageId: string;
  startDate: number;
  endDate: number;
  paymentId: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
}