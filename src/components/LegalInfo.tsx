import React from 'react';
import { Shield, Lock, UserCheck, AlertTriangle } from 'lucide-react';

export function LegalInfo() {
  return (
    <div className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Gizlilik ve Veri Politikası</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Veri Güvenliği</h3>
                  <p className="text-sm text-gray-600">
                    Hesap bilgileriniz ve kişisel verileriniz güvenli bir şekilde saklanır ve korunur.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Lock className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">İlan Görünürlüğü</h3>
                  <p className="text-sm text-gray-600">
                    Yayınlanan ilanlar herkese açıktır ve tüm site ziyaretçileri tarafından görüntülenebilir.
                    İletişim bilgileriniz iş başvuruları için erişilebilir olacaktır.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <UserCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Hesap Gizliliği</h3>
                  <p className="text-sm text-gray-600">
                    Hesap bilgileriniz ve oturum verileriniz gizli tutulur, üçüncü taraflarla paylaşılmaz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold">Yasal Bilgilendirme</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Sorumluluk Reddi</h3>
                  <p className="text-sm text-gray-600">
                    İlan içeriklerinin doğruluğundan ve yasallığından ilan sahipleri sorumludur.
                    Bilwin Inc. / Kadir A. platformda paylaşılan içeriklerden sorumlu tutulamaz.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Bu platform, iş arayanlar ile işverenler arasında bir köprü görevi görmektedir.
                  Paylaşılan ilanlar ve iletişim bilgileri herkese açıktır.
                  Güvenliğiniz için ilk görüşmeleri güvenli ortamlarda gerçekleştirmenizi öneririz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}