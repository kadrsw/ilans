import CryptoJS from 'crypto-js';

const MERCHANT_ID = import.meta.env.VITE_PYTR_MERCHANT_ID;
const MERCHANT_KEY = import.meta.env.VITE_PYTR_MERCHANT_KEY;
const MERCHANT_SALT = import.meta.env.VITE_PYTR_MERCHANT_SALT;
const API_URL = 'https://www.paytr.com/odeme/api/get-token';
const SUCCESS_URL = import.meta.env.VITE_PYTR_SUCCESS_URL;
const FAIL_URL = import.meta.env.VITE_PYTR_FAIL_URL;

export const paymentPackages = [
  {
    id: 'daily',
    name: '1 Günlük Öne Çıkarma',
    duration: 1,
    price: 9.99,
    features: [
      'İlanınız 1 gün boyunca öne çıkar',
      'Daha fazla görüntülenme',
      'Hızlı başvuru alın'
    ]
  },
  {
    id: 'weekly',
    name: '1 Haftalık Öne Çıkarma',
    duration: 7,
    price: 29.99,
    features: [
      'İlanınız 7 gün boyunca öne çıkar',
      '3x daha fazla görüntülenme',
      'Premium rozet',
      'Öne çıkan renk'
    ],
    popular: true
  },
  {
    id: 'monthly',
    name: '1 Aylık Öne Çıkarma',
    duration: 30,
    price: 89.99,
    features: [
      'İlanınız 30 gün boyunca öne çıkar',
      '5x daha fazla görüntülenme',
      'Premium rozet',
      'Öne çıkan renk',
      'Öncelikli destek'
    ]
  }
];

export class PaymentService {
  private generatePaytrToken(data: any): string {
    console.log('🔐 PayTR token oluşturuluyor...');
    
    const hashStr = `${data.merchant_id}${data.user_ip}${data.merchant_oid}${data.email}${data.payment_amount}${data.user_basket}${data.no_installment}${data.max_installment}${data.user_name}${data.user_address}${data.user_phone}${data.merchant_ok_url}${data.merchant_fail_url}${data.timeout_limit}${data.currency}${data.test_mode}${MERCHANT_SALT}`;
    
    console.log('🔗 Hash string uzunluğu:', hashStr.length);
    
    // PayTR'nin istediği hash formatı: MD5 + SHA256
    const token = CryptoJS.MD5(hashStr).toString();
    const finalToken = CryptoJS.SHA256(`${token}${MERCHANT_KEY}`).toString();
    
    console.log('✅ PayTR token oluşturuldu, uzunluk:', finalToken.length);
    
    return finalToken;
  }

  async createPayment(
    jobId: string,
    packageId: string,
    userEmail: string,
    userName: string,
    userPhone: string,
    userAddress: string
  ): Promise<{ success: boolean; token?: string; iframeToken?: string; paymentUrl?: string; error?: string }> {
    try {
      console.log('🚀 PayTR ödeme başlatılıyor:', {
        jobId,
        packageId,
        userEmail,
        userName: userName.substring(0, 3) + '***',
        userPhone: userPhone.substring(0, 3) + '***'
      });

      // Parametreleri doğrula
      if (!userEmail || !userEmail.includes('@')) {
        console.error('❌ Geçersiz e-posta:', userEmail);
        return { success: false, error: 'Geçerli bir e-posta adresi gerekli' };
      }
      
      if (!userName || userName.trim().length < 2) {
        console.error('❌ Geçersiz ad soyad:', userName);
        return { success: false, error: 'Geçerli bir ad soyad gerekli' };
      }
      
      if (!userPhone || userPhone.replace(/[^0-9]/g, '').length < 10) {
        console.error('❌ Geçersiz telefon:', userPhone);
        return { success: false, error: 'Geçerli bir telefon numarası gerekli' };
      }
      
      const selectedPackage = paymentPackages.find(p => p.id === packageId);
      if (!selectedPackage) {
        console.error('❌ Geçersiz paket:', packageId);
        return { success: false, error: 'Geçersiz paket seçimi' };
      }

      console.log('✅ Parametreler doğrulandı, paket:', selectedPackage);

      // PayTR için alfanumerik merchant_oid oluştur (özel karakter yok)
      const cleanJobId = jobId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
      const timestamp = Date.now().toString();
      const merchantOid = `JOB${cleanJobId}${timestamp.substring(-8)}`;
      
      // Merchant OID'nin alfanumerik olduğundan emin ol
      const finalMerchantOid = merchantOid.replace(/[^a-zA-Z0-9]/g, '');
      
      console.log('🔑 Generated merchant_oid:', finalMerchantOid);
      const paymentAmount = Math.round(selectedPackage.price * 100); // Kuruş cinsinden
      
      console.log('💰 Payment amount (kuruş):', paymentAmount);

      // Parametreleri temizle ve doğrula
      const cleanUserName = userName.trim().replace(/[^\w\s]/g, '');
      const cleanUserAddress = userAddress.trim().replace(/[^\w\s]/g, '');
      const cleanUserPhone = userPhone.replace(/[^0-9]/g, '');
      
      if (paymentAmount <= 0) {
        console.error('❌ Geçersiz ödeme tutarı:', paymentAmount);
        return { success: false, error: 'Geçersiz ödeme tutarı' };
      }
      
      console.log('🧹 Temizlenmiş veriler:', {
        cleanUserName,
        cleanUserPhone: cleanUserPhone.substring(0, 3) + '***',
        paymentAmount
      });

      // PayTR için güvenli encoding - Türkçe karakterleri temizle
      const basketItem = `${selectedPackage.name} - İlan: ${jobId}`;
      const cleanBasketItem = basketItem.replace(/[^\w\s-]/g, ''); // Özel karakterleri temizle
      const userBasket = JSON.stringify([[cleanBasketItem, selectedPackage.price, 1]]);

      console.log('🛒 User basket:', userBasket);

      // IP adresini al
      const userIP = await this.getUserIP();
      console.log('🌐 User IP:', userIP);

      const paymentData = {
        merchant_id: MERCHANT_ID,
        user_ip: userIP,
        merchant_oid: finalMerchantOid,
        email: userEmail.trim(),
        payment_amount: paymentAmount.toString(),
        user_basket: btoa(unescape(encodeURIComponent(userBasket))),
        debug_on: '0',
        no_installment: '1',
        max_installment: '0',
        user_name: cleanUserName,
        user_address: cleanUserAddress,
        user_phone: cleanUserPhone,
        merchant_ok_url: `${SUCCESS_URL}?merchant_oid=${finalMerchantOid}`,
        merchant_fail_url: `${FAIL_URL}?merchant_oid=${finalMerchantOid}`,
        timeout_limit: '30',
        currency: 'TL',
        test_mode: '0' // Production mode
      };
      
      console.log('📋 PayTR Payment Data (gizli bilgiler hariç):', {
        merchant_id: paymentData.merchant_id,
        merchant_oid: paymentData.merchant_oid,
        email: paymentData.email,
        payment_amount: paymentData.payment_amount,
        user_name: paymentData.user_name.substring(0, 3) + '***',
        user_phone: paymentData.user_phone.substring(0, 3) + '***',
        currency: paymentData.currency,
        test_mode: paymentData.test_mode
      });

      // Son kontrol
      if (!paymentData.email || !paymentData.user_name || !paymentData.user_phone || !paymentData.payment_amount) {
        console.error('❌ Eksik ödeme parametreleri:', {
          email: !!paymentData.email,
          user_name: !!paymentData.user_name,
          user_phone: !!paymentData.user_phone,
          payment_amount: !!paymentData.payment_amount
        });
        return { success: false, error: 'Eksik ödeme parametreleri' };
      }

      const paytrToken = this.generatePaytrToken(paymentData);
      
      console.log('🔐 PayTR Token oluşturuldu, uzunluk:', paytrToken.length);

      const formData = new FormData();
      Object.entries(paymentData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('paytr_token', paytrToken);

      console.log('📤 PayTR API\'ye istek gönderiliyor...');

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('📥 PayTR API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PayTR API HTTP Error:', response.status, errorText);
        throw new Error(`PayTR API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 PayTR API Result:', result);

      if (result.status === 'success') {
        console.log('✅ Payment token received:', result.token || result.iframe_token);
        
        // Ödeme bilgilerini Firebase'e kaydet
        await this.savePendingPayment(jobId, packageId, finalMerchantOid, selectedPackage.price);
        
        // PayTR ödeme sayfası URL'sini oluştur
        const paymentUrl = result.token 
          ? `https://www.paytr.com/odeme/guvenli/${result.token}`
          : result.iframe_token 
          ? `https://www.paytr.com/odeme/guvenli/${result.iframe_token}`
          : null;
        
        console.log('🔗 Payment URL oluşturuldu:', paymentUrl);

        return {
          success: true,
          token: result.token,
          iframeToken: result.iframe_token,
          paymentUrl
        };
      } else {
        console.error('❌ PayTR API Error:', result);
        return {
          success: false,
          error: result.reason || 'Ödeme oluşturulamadı'
        };
      }
    } catch (error) {
      console.error('❌ Payment creation error:', error);
      return {
        success: false,
        error: 'Ödeme işlemi başlatılamadı'
      };
    }
  }

  private async getUserIP(): Promise<string> {
    try {
      console.log('🌐 IP adresi alınıyor...');
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      console.log('✅ IP adresi alındı:', data.ip);
      return data.ip;
    } catch {
      console.log('⚠️ IP alınamadı, varsayılan IP kullanılıyor');
      return '127.0.0.1';
    }
  }

  private async savePendingPayment(
    jobId: string,
    packageId: string,
    merchantOid: string,
    amount: number
  ): Promise<void> {
    // Merchant OID'nin alfanumerik olduğundan emin ol
    const cleanMerchantOid = merchantOid.replace(/[^a-zA-Z0-9]/g, '');
    
    // Firebase'e pending payment kaydet
    const { ref, set } = await import('firebase/database');
    const { db } = await import('../lib/firebase');
    
    const paymentRef = ref(db, `pending_payments/${cleanMerchantOid}`);
    await set(paymentRef, {
      jobId,
      packageId,
      amount,
      status: 'pending',
      createdAt: Date.now(),
      merchantOid: cleanMerchantOid
    });
  }

  async verifyPayment(merchantOid: string): Promise<boolean> {
    try {
      // Merchant OID'nin alfanumerik olduğundan emin ol
      const cleanMerchantOid = merchantOid.replace(/[^a-zA-Z0-9]/g, '');
      
      // Firebase'den ödeme durumunu kontrol et
      const { ref, get } = await import('firebase/database');
      const { db } = await import('../lib/firebase');
      
      const paymentRef = ref(db, `pending_payments/${cleanMerchantOid}`);
      const snapshot = await get(paymentRef);
      
      return snapshot.exists() && snapshot.val().status === 'completed';
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();