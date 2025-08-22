import { ref, push, update, get } from 'firebase/database';
import { db } from '../lib/firebase';
import type { PaymentData, PaymentStatus, JobListing } from '../types';

// PYTR ödeme fiyatları (TL)
export const PROMOTION_PRICES = {
  premium: {
    7: 25,   // 7 gün öne çıkarma - 25 TL
    15: 45,  // 15 gün öne çıkarma - 45 TL
    30: 75   // 30 gün öne çıkarma - 75 TL
  },
  highlight: {
    7: 15,   // 7 gün vurgulama - 15 TL
    15: 25,  // 15 gün vurgulama - 25 TL
    30: 40   // 30 gün vurgulama - 40 TL
  },
  top: {
    7: 35,   // 7 gün en üstte - 35 TL
    15: 60,  // 15 gün en üstte - 60 TL
    30: 100  // 30 gün en üstte - 100 TL
  }
};

export class PaymentService {
  private static instance: PaymentService;
  private pytrConfig = {
    merchantId: '', // PYTR'den alınacak
    apiKey: '',     // PYTR'den alınacak
    secretKey: '',  // PYTR'den alınacak
    baseUrl: 'https://api.pytr.com/v1', // PYTR API URL'si
    returnUrl: `${window.location.origin}/odeme/basarili`,
    cancelUrl: `${window.location.origin}/odeme/iptal`
  };

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // PYTR konfigürasyonunu güncelle
  public updateConfig(config: Partial<typeof this.pytrConfig>) {
    this.pytrConfig = { ...this.pytrConfig, ...config };
  }

  // Ödeme başlatma
  public async initiatePayment(paymentData: PaymentData): Promise<{ paymentUrl: string; paymentId: string }> {
    try {
      // Firebase'e ödeme kaydı oluştur
      const paymentRef = ref(db, 'payments');
      const paymentRecord: PaymentStatus = {
        id: '',
        status: 'pending',
        amount: paymentData.amount,
        createdAt: Date.now()
      };

      const newPaymentRef = await push(paymentRef, paymentRecord);
      const paymentId = newPaymentRef.key!;

      // PYTR API'sine ödeme isteği gönder
      const pytrPayload = {
        merchant_id: this.pytrConfig.merchantId,
        amount: paymentData.amount * 100, // Kuruş cinsinden
        currency: 'TRY',
        order_id: paymentData.orderId,
        return_url: `${this.pytrConfig.returnUrl}?payment_id=${paymentId}&job_id=${paymentData.jobId}`,
        cancel_url: `${this.pytrConfig.cancelUrl}?payment_id=${paymentId}`,
        description: `İlan öne çıkarma - ${paymentData.promotionType}`,
        customer_email: '', // Kullanıcı emaili
        customer_name: '',  // Kullanıcı adı
        items: [{
          name: `İlan Öne Çıkarma - ${paymentData.promotionDuration} Gün`,
          price: paymentData.amount * 100,
          quantity: 1
        }]
      };

      // PYTR API çağrısı (gerçek implementasyon PYTR dokümantasyonuna göre yapılacak)
      const response = await fetch(`${this.pytrConfig.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pytrConfig.apiKey}`
        },
        body: JSON.stringify(pytrPayload)
      });

      if (!response.ok) {
        throw new Error('Ödeme başlatılamadı');
      }

      const result = await response.json();

      return {
        paymentUrl: result.payment_url,
        paymentId
      };

    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new Error('Ödeme işlemi başlatılamadı');
    }
  }

  // Ödeme durumunu kontrol et
  public async checkPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    try {
      const paymentRef = ref(db, `payments/${paymentId}`);
      const snapshot = await get(paymentRef);
      
      if (snapshot.exists()) {
        return { id: paymentId, ...snapshot.val() };
      }
      
      return null;
    } catch (error) {
      console.error('Payment status check error:', error);
      return null;
    }
  }

  // Ödeme tamamlandığında ilanı öne çıkar
  public async completePromotion(paymentId: string, jobId: string, promotionType: string, duration: number): Promise<boolean> {
    try {
      const now = Date.now();
      const expiresAt = now + (duration * 24 * 60 * 60 * 1000);

      // İlan güncelleme
      const jobRef = ref(db, `jobs/${jobId}`);
      const promotionData: Partial<JobListing> = {
        isPremium: promotionType === 'premium' || promotionType === 'top',
        isPromoted: true,
        promotionExpiresAt: expiresAt,
        updatedAt: now
      };

      await update(jobRef, promotionData);

      // Ödeme durumunu güncelle
      const paymentRef = ref(db, `payments/${paymentId}`);
      await update(paymentRef, {
        status: 'completed',
        completedAt: now
      });

      return true;
    } catch (error) {
      console.error('Promotion completion error:', error);
      return false;
    }
  }

  // Promosyon süresini kontrol et ve süresi dolmuş olanları temizle
  public async cleanExpiredPromotions(): Promise<void> {
    try {
      const jobsRef = ref(db, 'jobs');
      const snapshot = await get(jobsRef);
      
      if (snapshot.exists()) {
        const now = Date.now();
        const updates: Record<string, Partial<JobListing>> = {};

        snapshot.forEach((childSnapshot) => {
          const job = childSnapshot.val() as JobListing;
          const jobId = childSnapshot.key!;

          if (job.promotionExpiresAt && job.promotionExpiresAt < now) {
            updates[`jobs/${jobId}`] = {
              isPremium: false,
              isPromoted: false,
              promotionExpiresAt: null,
              updatedAt: now
            };
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
          console.log(`${Object.keys(updates).length} promosyon süresi dolmuş ilan temizlendi`);
        }
      }
    } catch (error) {
      console.error('Expired promotions cleanup error:', error);
    }
  }
}

// Singleton instance
export const paymentService = PaymentService.getInstance();