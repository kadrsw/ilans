import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { paymentService } from '../services/paymentService';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get('payment_id');
  const jobId = searchParams.get('job_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!paymentId || !jobId) {
        setError('Geçersiz ödeme bilgileri');
        setIsProcessing(false);
        return;
      }

      try {
        // Ödeme durumunu kontrol et
        const paymentStatus = await paymentService.checkPaymentStatus(paymentId);
        
        if (paymentStatus?.status === 'completed') {
          setSuccess(true);
        } else {
          setError('Ödeme henüz tamamlanmamış');
        }
      } catch (err) {
        setError('Ödeme durumu kontrol edilemedi');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [paymentId, jobId]);

  if (isProcessing) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Ödeme durumu kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Hatası</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/ilanlarim')}>
            İlanlarıma Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
        <p className="text-gray-600 mb-6">
          İlanınız başarıyla öne çıkarıldı. Artık daha fazla görüntülenecek ve daha çok başvuru alacaksınız.
        </p>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center gap-2 text-yellow-700 mb-2">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-semibold">İlanınız Öne Çıkarıldı</span>
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm text-yellow-600">
            İlanınız artık listede öne çıkarılmış olarak görünecek
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate(`/ilan/${jobId}`)}
            className="w-full flex items-center justify-center gap-2"
          >
            İlanımı Görüntüle
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/ilanlarim')}
            className="w-full"
          >
            İlanlarıma Dön
          </Button>
        </div>
      </div>
    </div>
  );
}