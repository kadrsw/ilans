import React from 'react';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ApplyButtonProps {
  email?: string;
  phone?: string;
}

export function ApplyButton({ email, phone }: ApplyButtonProps) {
  const getWhatsAppLink = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/90${cleaned.startsWith('0') ? cleaned.substring(1) : cleaned}`;
  };

  return (
    <div className="sticky bottom-0 bg-white border-t-2 border-red-100 p-4 safe-bottom shadow-xl">
      <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
        {email && (
          <Button
            onClick={() => window.location.href = `mailto:${email}`}
            className="flex-1 bg-red-600 hover:bg-red-700 py-4 text-base font-bold rounded-xl shadow-lg"
          >
            <Mail className="h-5 w-5" />
            E-posta ile Başvur
          </Button>
        )}
        
        {phone && (
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = `tel:${phone}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Ara
            </Button>
          
            <Button
              onClick={() => window.open(getWhatsAppLink(phone), '_blank')}
              className="flex-1 bg-green-600 hover:bg-green-700 py-4 rounded-xl shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}