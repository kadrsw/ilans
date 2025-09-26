import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { paymentPackages } from '../services/paymentService';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const merchantOid = searchParams.get('merchant_oid');
      const status = searchParams.get('status');
      
      if (!merchantOid || status !== 'success') {
        navigate('/odeme/iptal');
        return;
      }

      try {
        // Pending payment'ı kontrol et
        const paymentRef = ref(db, `pending_payments/${merchantOid}`);
        const snapshot = await get(paymentRef);
        
        if (snapshot.exists()) {
          const payment = snapshot.val();
          setPaymentData(payment);
          
          // İlanı premium yap
          const jobRef = ref(db, `jobs/${payment.jobId}`);
          const selectedPackage = paymentPackages.find(p => p.id === payment.packageId);
          
          if (selectedPackage) {
            const endDate = Date.now() + (selectedPackage.duration * 24 * 60 * 60 * 1000);
            
            await update(jobRef, {
              isPremium: true,
              premiumStartDate: Date.now(),
              premiumEndDate: endDate,
              premiumPackage: payment.packageId,
              updatedAt: Date.now()
            });

            // Payment'ı completed olarak işaretle
            await update(paymentRef, {
              status: 'completed',
              completedAt: Date.now()
            });
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        navigate('/odeme/iptal');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const selectedPackage = paymentData ? 
    paymentPackages.find(p => p.id === paymentData.packageId) : null;

  return (
    <div className="max-w-2xl mx-auto py-8 text-center">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ödeme Başarılı!
        </h1>
        
        <p className="text-gray-600 mb-6">
          İlanınız başarıyla öne çıkarıldı. Artık daha fazla görüntülenecek!
        </p>

        {selectedPackage && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="h-6 w-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-purple-900">
                {selectedPackage.name}
              </h2>
            </div>
            <p className="text-purple-700">
              İlanınız {selectedPackage.duration} gün boyunca öne çıkacak
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/ilanlarim')}
            className="w-full flex items-center justify-center gap-2"
          >
            İlanlarıma Git
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>
  );
}