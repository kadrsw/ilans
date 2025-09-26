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
}

// İş ilanı tipi
export interface JobListing extends JobFormData {
  id: string;
  userId: string;
  createdAt: number;
  status: 'active' | 'inactive' | 'expired';
  updatedAt?: number;
  isPremium?: boolean;
  premiumStartDate?: number;
  premiumEndDate?: number;
  premiumPackage?: string;
}