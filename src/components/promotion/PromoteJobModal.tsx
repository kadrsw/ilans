import React, { useState } from 'react';
import { X, Star, TrendingUp, Zap, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { PROMOTION_PRICES, paymentService } from '../../services/paymentService';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PromoteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export function PromoteJobModal({ isOpen, onClose, jobId, jobTitle }: PromoteJobModalProps) {
  const { user } = useAuthContext();
  const [selectedPromotion, setSelectedPromotion] = useState<{
    type: keyof typeof PROMOTION_PRICES;
    duration: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePromotionSelect = (type: keyof typeof PROMOTION_PRICES, duration: number) => {
    setSelectedPromotion({ type, duration });
  };

  const handlePayment = async () => {
    if (!selectedPromotion || !user) return;

    try {
      setIsProcessing(true);
      
      const amount = PROMOTION_PRICES[selectedPromotion.type][selectedPromotion.duration as keyof typeof PROMOTION_PRICES[typeof selectedPromotion.type]];
      
      const paymentData = {
        amount,
        currency: 'TRY',
        orderId: `job_${jobId}_${Date.now()}`,
        jobId,
        userId: user.id,
        promotionType: selectedPromotion.type,
        promotionDuration: selectedPromotion.duration
      };

      const { paymentUrl } = await paymentService.initiatePayment(paymentData);
      
      // Ödeme sayfasına yönlendir
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Ödeme işlemi başlatılamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'premium': return <Star className="h-5 w-5" />;
      case 'highlight': return <Zap className="h-5 w-5" />;
      case 'top': return <TrendingUp className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getPromotionTitle = (type: string) => {
    switch (type) {
      case 'premium': return 'Premium İlan';
      case 'highlight': return 'Vurgulama';
      case 'top': return 'En Üstte Göster';
      default: return 'Öne Çıkar';
    }
  };

  const getPromotionDescription = (type: string) => {
    switch (type) {
      case 'premium': return 'İlanınız özel tasarım ile öne çıkar ve daha fazla görüntülenir';
      case 'highlight': return 'İlanınız renkli arka plan ile vurgulanır';
      case 'top': return 'İlanınız kategori sayfasının en üstünde görüntülenir';
      default: return 'İlanınızı öne çıkarın';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">İlanı Öne Çıkar</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">İlan: {jobTitle}</h3>
            <p className="text-sm text-gray-600">
              İlanınızı öne çıkararak daha fazla başvuru alın
            </p>
          </div>

          {/* Promotion Options */}
          <div className="space-y-4 mb-6">
            {Object.entries(PROMOTION_PRICES).map(([type, durations]) => (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    type === 'premium' ? 'bg-yellow-100 text-yellow-600' :
                    type === 'highlight' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {getPromotionIcon(type)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{getPromotionTitle(type)}</h4>
                    <p className="text-sm text-gray-600">{getPromotionDescription(type)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(durations).map(([duration, price]) => (
                    <button
                      key={`${type}-${duration}`}
                      onClick={() => handlePromotionSelect(type as keyof typeof PROMOTION_PRICES, parseInt(duration))}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedPromotion?.type === type && selectedPromotion?.duration === parseInt(duration)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{duration} Gün</div>
                      <div className="text-sm text-gray-600">{price} ₺</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          {selectedPromotion && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Ödeme Özeti</h4>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">
                  {getPromotionTitle(selectedPromotion.type)} - {selectedPromotion.duration} Gün
                </span>
                <span className="font-bold text-blue-900">
                  {PROMOTION_PRICES[selectedPromotion.type][selectedPromotion.duration as keyof typeof PROMOTION_PRICES[typeof selectedPromotion.type]]} ₺
                </span>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button
              onClick={handlePayment}
              isLoading={isProcessing}
              disabled={!selectedPromotion}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-5 w-5" />
              Ödeme Yap
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 text-xs text-gray-500">
            <p>• Ödemeler PYTR güvenli ödeme sistemi ile işlenir</p>
            <p>• Promosyon süresi ödeme onayından sonra başlar</p>
            <p>• İptal ve iade koşulları için destek ekibimizle iletişime geçin</p>
          </div>
        </div>
      </div>
    </div>
  );
}