import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">İlan Yayınlama Koşulları</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800">Önemli Uyarılar</h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Bu ilan tüm site ziyaretçileri tarafından görüntülenebilecektir</li>
                  <li>• Paylaştığınız iletişim bilgileri herkese açık olacaktır</li>
                  <li>• Küfür, hakaret ve yasadışı içerik paylaşımı yasaktır</li>
                  <li>• İlan içeriğinden ve doğruluğundan siz sorumlusunuz</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              İlanımın herkese açık olarak yayınlanacağını, içeriğinden ve doğruluğundan sorumlu olduğumu,
              Bilwin Inc. / Kadir A.'nın hiçbir sorumluluk kabul etmediğini anlıyor ve kabul ediyorum.
            </p>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button onClick={onAccept}>
              Kabul Ediyorum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}