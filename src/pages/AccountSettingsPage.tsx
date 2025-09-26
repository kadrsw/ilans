import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Phone, Mail, Shield, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { formatDateTime } from '../utils/dateUtils';

interface AccountFormData {
  phone?: string;
}

export function AccountSettingsPage() {
  const { user } = useAuthContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  // Kullanıcı oluşturma tarihini formatla
  const createdAt = formatDateTime(user.createdAt);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Hesap Bilgileri</h1>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Kullanıcı Bilgileri */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Hesap Detayları
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">E-posta</div>
                <div className="font-medium">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Telefon</div>
                <div className="font-medium">{user.phone || 'Belirtilmemiş'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Kayıt Tarihi</div>
                <div className="font-medium">{createdAt}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Güvenlik Bilgileri */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Güvenlik
          </h2>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => navigate('/sifremi-unuttum')}
              className="w-full sm:w-auto"
            >
              Şifremi Değiştir
            </Button>
          </div>
        </div>

        {/* Hesap Silme */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Tehlikeli Bölge
          </h2>
          
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-700">
              Hesabınızı silmek geri alınamaz bir işlemdir. Tüm verileriniz ve ilanlarınız kalıcı olarak silinecektir.
            </p>
          </div>

          <Button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Hesabı Sil
          </Button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}