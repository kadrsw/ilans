import React from 'react';
import { Shield, Lock, UserCheck, AlertTriangle } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Kişisel Verilerin Korunması ve Gizlilik Politikası</h2>

      <div className="space-y-8">
        {/* Veri Sorumlusu */}
        <section>
          <h3 className="text-lg font-semibold mb-3">1. Veri Sorumlusu</h3>
          <p className="text-gray-600">
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; 
            veri sorumlusu olarak Bilwin Inc. / Kadir A. tarafından aşağıda açıklanan kapsamda işlenebilecektir.
          </p>
        </section>

        {/* Toplanan Veriler */}
        <section>
          <h3 className="text-lg font-semibold mb-3">2. Toplanan Kişisel Veriler</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Kimlik ve İletişim Bilgileri</h4>
                <p className="text-gray-600">
                  Ad-soyad, e-posta adresi, telefon numarası
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Hesap Bilgileri</h4>
                <p className="text-gray-600">
                  Kullanıcı hesap bilgileri, şifre (hashlenmiş format)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium mb-1">İş İlanı Bilgileri</h4>
                <p className="text-gray-600">
                  Yayınlanan iş ilanlarındaki bilgiler, başvuru geçmişi
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Veri İşleme Amaçları */}
        <section>
          <h3 className="text-lg font-semibold mb-3">3. Kişisel Verilerin İşlenme Amaçları</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Üyelik kaydının oluşturulması ve yönetilmesi</li>
            <li>İş ilanı yayınlama ve başvuru süreçlerinin yürütülmesi</li>
            <li>İletişim faaliyetlerinin yürütülmesi</li>
            <li>Hizmet kalitesinin iyileştirilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          </ul>
        </section>

        {/* Veri Güvenliği */}
        <section>
          <h3 className="text-lg font-semibold mb-3">4. Veri Güvenliği</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Güvenlik Önlemleri</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Veriler şifreli olarak saklanır</li>
                  <li>Düzenli güvenlik güncellemeleri yapılır</li>
                  <li>Erişim yetkilendirmesi uygulanır</li>
                  <li>SSL/TLS şifreleme kullanılır</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Veri Sahibi Hakları */}
        <section>
          <h3 className="text-lg font-semibold mb-3">5. Veri Sahibi Hakları</h3>
          <p className="text-gray-600 mb-4">
            KVKK'nın 11. maddesi uyarınca veri sahipleri aşağıdaki haklara sahiptir:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
          </ul>
        </section>

        {/* İletişim */}
        <section>
          <h3 className="text-lg font-semibold mb-3">6. İletişim</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">
              KVKK kapsamındaki haklarınızı kullanmak için veya sorularınız için:
              <br />
              E-posta: bilwininc@gmail.com
            </p>
          </div>
        </section>

        {/* Uyarı */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Önemli Not</h4>
            <p className="mt-1 text-sm text-yellow-700">
              Bu gizlilik politikası, sitemizin kullanımıyla birlikte geçerlidir. 
              Siteyi kullanarak bu politikayı kabul etmiş sayılırsınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}