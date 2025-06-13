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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:static md:border-0 md:p-0 md:bg-transparent safe-bottom">
      <div className="flex flex-wrap gap-2 max-w-md mx-auto md:max-w-none">
        {email && (
          <Button
            onClick={() => window.location.href = `mailto:${email}`}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Mail className="h-5 w-5" />
            E-posta ile Başvur
          </Button>
        )}
        
        {phone && (
          <>
            <Button
              onClick={() => window.location.href = `tel:${phone}`}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Ara
            </Button>
            
            <Button
              onClick={() => window.open(getWhatsAppLink(phone), '_blank')}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Button>
          </>
        )}
      </div>
    </div>
  );
}