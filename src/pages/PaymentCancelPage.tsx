import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-gray-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme İptal Edildi</h1>
        <p className="text-gray-600 mb-6">
          Ödeme işlemi iptal edildi. İlanınızı istediğiniz zaman öne çıkarabilirsiniz.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/ilanlarim')}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            İlanlarıma Dön
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