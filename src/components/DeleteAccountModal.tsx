import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../hooks/useAuth';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!user || email !== user.email) {
      setError('E-posta adresinizi doğru girdiğinizden emin olun');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setError('Hesap silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-600">Hesabı Sil</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Dikkat!</h3>
                <p className="mt-1 text-sm text-red-700">
                  Hesabınızı silmek geri alınamaz bir işlemdir. Tüm ilanlarınız ve hesap bilgileriniz kalıcı olarak silinecektir.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Hesabınızı silmek istediğinizi onaylamak için e-posta adresinizi girin:
            </p>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              error={error}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Hesabı Sil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}