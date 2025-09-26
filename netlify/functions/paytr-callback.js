const { ref, get, update } = require('firebase/database');
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const crypto = require('crypto');

const firebaseConfig = {
  apiKey: "AIzaSyAUmnb0K1M6-U8uzSsYVpTxAAdXdU8I--o",
  authDomain: "btc3-d7d9b.firebaseapp.com",
  databaseURL: "https://btc3-d7d9b-default-rtdb.firebaseio.com",
  projectId: "btc3-d7d9b",
  storageBucket: "btc3-d7d9b.firebasestorage.app",
  messagingSenderId: "444798129246",
  appId: "1:444798129246:web:b5c9c03ab05c4303e310cf"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// PayTR bilgileri
const MERCHANT_KEY = 'AxMHK8nAEqG2yFB8';
const MERCHANT_SALT = 'qD9QqyHAHrw7G4B7';

exports.handler = async (event, context) => {
  // Sadece POST isteklerini kabul et
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('PayTR Callback received:', event.body);
    
    // POST verilerini parse et
    const params = new URLSearchParams(event.body);
    const merchant_oid = params.get('merchant_oid');
    const status = params.get('status');
    const total_amount = params.get('total_amount');
    const hash = params.get('hash');
    const failed_reason_code = params.get('failed_reason_code');
    const failed_reason_msg = params.get('failed_reason_msg');
    const test_mode = params.get('test_mode');
    const payment_type = params.get('payment_type');
    const currency = params.get('currency');
    const payment_amount = params.get('payment_amount');

    console.log('Payment details:', {
      merchant_oid,
      status,
      total_amount,
      test_mode,
      payment_type
    });

    // Hash doğrulama
    const hashStr = `${merchant_oid}${MERCHANT_SALT}${status}${total_amount}`;
    const calculatedHash = crypto.createHmac('sha256', MERCHANT_KEY).update(hashStr).digest('base64');

    if (hash !== calculatedHash) {
      console.error('Hash verification failed:', {
        received: hash,
        calculated: calculatedHash
      });
      return {
        statusCode: 400,
        body: 'HASH_VERIFICATION_FAILED'
      };
    }

    console.log('Hash verification successful');

    // Pending payment'ı kontrol et
    // Merchant OID'nin alfanumerik olduğundan emin ol
    const cleanMerchantOid = merchant_oid.replace(/[^a-zA-Z0-9]/g, '');
    const paymentRef = ref(db, `pending_payments/${cleanMerchantOid}`);
    const snapshot = await get(paymentRef);

    if (!snapshot.exists()) {
      console.error('Pending payment not found:', merchant_oid);
      return {
        statusCode: 404,
        body: 'PAYMENT_NOT_FOUND'
      };
    }

    const paymentData = snapshot.val();
    console.log('Pending payment found:', paymentData);

    if (status === 'success') {
      // Ödeme başarılı
      console.log('Payment successful, updating job...');
      
      // İlanı premium yap
      const jobRef = ref(db, `jobs/${paymentData.jobId}`);
      const jobSnapshot = await get(jobRef);
      
      if (jobSnapshot.exists()) {
        const packageDuration = {
          'daily': 1,
          'weekly': 7,
          'monthly': 30
        };
        
        const duration = packageDuration[paymentData.packageId] || 7;
        const endDate = Date.now() + (duration * 24 * 60 * 60 * 1000);
        
        await update(jobRef, {
          isPremium: true,
          premiumStartDate: Date.now(),
          premiumEndDate: endDate,
          premiumPackage: paymentData.packageId,
          updatedAt: Date.now()
        });

        console.log('Job updated to premium:', paymentData.jobId);
      }

      // Payment'ı completed olarak işaretle
      await update(paymentRef, {
        status: 'completed',
        completedAt: Date.now(),
        paymentDetails: {
          total_amount,
          payment_type,
          currency,
          test_mode
        }
      });

      console.log('Payment marked as completed');

      return {
        statusCode: 200,
        body: 'OK'
      };
    } else {
      // Ödeme başarısız
      console.log('Payment failed:', failed_reason_msg);
      
      await update(paymentRef, {
        status: 'failed',
        failedAt: Date.now(),
        failureReason: failed_reason_msg,
        failureCode: failed_reason_code
      });

      return {
        statusCode: 200,
        body: 'OK'
      };
    }

  } catch (error) {
    console.error('PayTR callback error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};