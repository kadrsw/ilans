import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8 text-center">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ödeme İptal Edildi
        </h1>
        
        <p className="text-gray-600 mb-6">
          Ödeme işlemi iptal edildi veya bir hata oluştu. 
          İsterseniz tekrar deneyebilirsiniz.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/ilanlarim')}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            İlanlarıma Dön
          </Button>
        </div>
      </div>
    </div>
  );
}