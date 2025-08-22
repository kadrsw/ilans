// Kullanıcı tipi
export interface User {
  id: string;
  email: string;
  phone?: string;
  createdAt: number;
  role?: 'admin' | 'user';
}

// İş ilanı formu tipi
export interface JobFormData {
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  category: string;
  subCategory: string;
  salary?: string;
  contactEmail?: string;
  contactPhone?: string;
  businessPhone?: string;
  educationLevel?: string;
  experience?: string;
  jobId?: string;
  createdAt?: number;
  isDisabledFriendly?: boolean;
  isPremium?: boolean;
  isPromoted?: boolean;
  promotionExpiresAt?: number;
}

// İş ilanı tipi
export interface JobListing extends JobFormData {
  id: string;
  userId: string;
  createdAt: number;
  status: 'active' | 'inactive' | 'expired';
  updatedAt?: number;
  isPremium?: boolean;
  isPromoted?: boolean;
  promotionExpiresAt?: number;
}

// PYTR Ödeme tipi
export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  jobId: string;
  userId: string;
  promotionType: 'premium' | 'highlight' | 'top';
  promotionDuration: number; // days
}

// Ödeme durumu
export interface PaymentStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  createdAt: number;
  completedAt?: number;
  paymentMethod?: string;
  transactionId?: string;
}