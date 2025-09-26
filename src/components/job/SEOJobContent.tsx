import React from 'react';
import { Briefcase, Search, FileText, TrendingUp, Users, MapPin, Clock, Star, CheckCircle, ArrowRight, Target, Award, Building2, Globe, Zap, Heart, Shield, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SEOJobContentProps {
  jobData?: {
    category?: string;
    location?: string;
    type?: string;
    title?: string;
  };
}

export function SEOJobContent({ jobData }: SEOJobContentProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl">
      <div className="max-w-6xl mx-auto space-responsive">
        
        {/* Ana Başlık */}
        <div className="text-center">
          <h2 className="text-responsive-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            İşBuldum - İş İlanları ve Kariyer Fırsatları Rehberi {currentYear}
          </h2>
          <p className="text-responsive-sm text-gray-700 max-w-4xl mx-auto leading-relaxed">
            <strong>İşBuldum 2025</strong> - Türkiye'nin en hızlı iş bulma platformunda <strong>50.000+</strong> güncel iş fırsatı sizi bekliyor. 
            <strong>İş arama</strong> sürecinizden <strong>CV hazırlamaya</strong>, <strong>mülakat tekniklerinden</strong> <strong>kariyer planlamasına</strong> kadar 
            ihtiyacınız olan her şey burada. <strong>İstanbul iş ilanları</strong>, <strong>Ankara iş ilanları</strong>, <strong>İzmir iş ilanları</strong> ve 
            tüm Türkiye'de <strong>güncel iş fırsatları</strong>.
          </p>
        </div>

        {/* İş Arama Rehberi */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-responsive">
          <div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-6 w-6 text-blue-600" />
              <h3 className="text-responsive-base font-semibold text-gray-900">İş Arama Stratejileri 2025</h3>
            </div>
            <p className="text-responsive-sm text-gray-700 mb-4">
              <strong>Etkili iş arama stratejileri</strong> ile hayalinizdeki işi bulun. <strong>Doğru anahtar kelimeler</strong>, 
              <strong>filtreleme teknikleri</strong> ve <strong>başvuru süreçleri</strong> hakkında bilgi edinin. <strong>İş ilanları 2025</strong> 
              trendlerini takip edin.
            </p>
            <ul className="space-y-2 text-responsive-xs text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Anahtar kelime</strong> optimizasyonu
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Gelişmiş filtreleme</strong> seçenekleri
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Şirket araştırması</strong> teknikleri
              </li>
            </ul>
          </div>

          <div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-green-600" />
              <h3 className="text-responsive-base font-semibold text-gray-900">CV Hazırlama Rehberi 2025</h3>
            </div>
            <p className="text-responsive-sm text-gray-700 mb-4">
              <strong>Profesyonel CV hazırlama teknikleri</strong> ile öne çıkın. <strong>Modern CV formatları</strong>, 
              <strong>ATS uyumlu şablonlar</strong> ve <strong>dikkat çeken özgeçmiş örnekleri</strong>. <strong>Ücretsiz CV oluştur</strong> 
              araçlarımızla <strong>CV hazırlamak</strong> artık çok kolay.
            </p>
            <ul className="space-y-2 text-responsive-xs text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>ATS uyumlu</strong> CV formatları
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Sektöre özel</strong> CV örnekleri
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Ücretsiz CV oluşturma</strong> araçları
              </li>
            </ul>
            <Link 
              to="/cv-olustur" 
              className="inline-flex items-center gap-2 mt-4 text-green-600 hover:text-green-700 font-medium text-responsive-xs"
            >
              <strong>Ücretsiz CV Oluştur</strong> <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h3 className="text-responsive-base font-semibold text-gray-900">Kariyer Gelişimi ve Planlama</h3>
            </div>
            <p className="text-responsive-sm text-gray-700 mb-4">
              <strong>Kariyerinizi</strong> bir sonraki seviyeye taşıyacak <strong>stratejiler</strong>. <strong>Beceri geliştirme</strong>, 
              <strong>networking</strong> ve <strong>profesyonel gelişim fırsatları</strong>. <strong>Kariyer fırsatları 2025</strong> 
              trendlerini keşfedin.
            </p>
            <ul className="space-y-2 text-responsive-xs text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Beceri geliştirme</strong> programları
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Networking</strong> stratejileri
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <strong>Mülakat hazırlık</strong> teknikleri
              </li>
            </ul>
          </div>
          </div>
        </section>

        {/* Sektör Bazlı İş Fırsatları */}
        <section>
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            Sektör Bazlı İş İlanları ve Kariyer Fırsatları 2025
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-responsive">
            {[
              { 
                sector: 'Teknoloji İş İlanları 2025', 
                jobs: ['Yazılım Geliştirici İş İlanları', 'Veri Analisti İş İlanları', 'Siber Güvenlik İş İlanları', 'DevOps Mühendisi İş İlanları'],
                icon: <Zap className="h-5 w-5" />,
                color: 'blue'
              },
              { 
                sector: 'Sağlık İş İlanları 2025', 
                jobs: ['Doktor İş İlanları', 'Hemşire İş İlanları', 'Fizyoterapist İş İlanları', 'Eczacı İş İlanları'],
                icon: <Heart className="h-5 w-5" />,
                color: 'red'
              },
              { 
                sector: 'Eğitim İş İlanları 2025', 
                jobs: ['Öğretmen İş İlanları', 'Akademisyen İş İlanları', 'Eğitim Koordinatörü İş İlanları', 'Rehber Öğretmen İş İlanları'],
                icon: <Lightbulb className="h-5 w-5" />,
                color: 'yellow'
              },
              { 
                sector: 'Finans İş İlanları 2025', 
                jobs: ['Muhasebeci İş İlanları', 'Mali Müşavir İş İlanları', 'Finansal Analist İş İlanları', 'Banka Personeli İş İlanları'],
                icon: <TrendingUp className="h-5 w-5" />,
                color: 'green'
              },
              { 
                sector: 'İnşaat İş İlanları 2025', 
                jobs: ['İnşaat Mühendisi İş İlanları', 'Mimar İş İlanları', 'Şantiye Şefi İş İlanları', 'İnşaat İşçisi İş İlanları'],
                icon: <Building2 className="h-5 w-5" />,
                color: 'orange'
              },
              { 
                sector: 'Satış İş İlanları 2025', 
                jobs: ['Satış Temsilcisi İş İlanları', 'Pazarlama Uzmanı İş İlanları', 'Mağaza Müdürü İş İlanları', 'E-ticaret Uzmanı İş İlanları'],
                icon: <Target className="h-5 w-5" />,
                color: 'purple'
              },
              { 
                sector: 'Lojistik İş İlanları 2025', 
                jobs: ['Şoför İş İlanları', 'Depo Görevlisi İş İlanları', 'Kargo Personeli İş İlanları', 'Lojistik Uzmanı İş İlanları'],
                icon: <Globe className="h-5 w-5" />,
                color: 'indigo'
              },
              { 
                sector: 'Güvenlik İş İlanları 2025', 
                jobs: ['Güvenlik Görevlisi İş İlanları', 'Bekçi İş İlanları', 'Güvenlik Amiri İş İlanları', 'Kamera Operatörü İş İlanları'],
                icon: <Shield className="h-5 w-5" />,
                color: 'gray'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`flex items-center gap-2 mb-3 text-${item.color}-600`}>
                  {item.icon}
                  <h4 className="text-responsive-sm font-semibold text-gray-900">{item.sector}</h4>
                </div>
                <ul className="space-y-1">
                  {item.jobs.map((job, jobIndex) => (
                    <li key={jobIndex} className="text-responsive-xs text-gray-600 hover:text-blue-600 cursor-pointer transition-colors font-medium">
                      • {job}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Şehir Bazlı İş İlanları */}
        <section>
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
            <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            Şehir Bazlı İş İlanları ve Bölgesel Fırsatlar 2025
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              'İstanbul İş İlanları', 'Ankara İş İlanları', 'İzmir İş İlanları', 'Bursa İş İlanları', 
              'Antalya İş İlanları', 'Adana İş İlanları', 'Konya İş İlanları', 'Gaziantep İş İlanları',
              'Mersin İş İlanları', 'Kayseri İş İlanları', 'Eskişehir İş İlanları', 'Diyarbakır İş İlanları',
              'Samsun İş İlanları', 'Denizli İş İlanları', 'Şanlıurfa İş İlanları', 'Adapazarı İş İlanları',
              'Malatya İş İlanları', 'Kahramanmaraş İş İlanları', 'Erzurum İş İlanları', 'Van İş İlanları'
            ].map((city, index) => (
              <div key={index} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer touch-target">
                <div className="text-responsive-xs font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {city}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Güncel fırsatlar
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Çalışma Şekilleri */}
        <section>
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            Çalışma Şekillerine Göre İş İlanları 2025
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-responsive">
            {[
              {
                type: 'Tam Zamanlı İş İlanları 2025',
                description: 'Haftalık 40 saat çalışma ile tam zamanlı pozisyonlar. Sosyal güvence ve kariyer gelişimi.',
                features: ['Sosyal güvence', 'Ücretli izin', 'Performans primi', 'Kariyer gelişimi']
              },
              {
                type: 'Part Time İş İlanları 2025',
                description: 'Esnek çalışma saatleri ile yarı zamanlı fırsatlar. Öğrenciler ve ek gelir isteyenler için ideal.',
                features: ['Esnek saatler', 'Ek gelir', 'Deneyim kazanma', 'Öğrenci dostu']
              },
              {
                type: 'Remote İş İlanları 2025',
                description: 'Evden çalışma imkanı sunan uzaktan çalışma pozisyonları. İş-yaşam dengesi için mükemmel.',
                features: ['Evden çalışma', 'Zaman tasarrufu', 'Coğrafi özgürlük', 'İş-yaşam dengesi']
              },
              {
                type: 'Freelance İş İlanları 2025',
                description: 'Proje bazlı çalışma ile serbest meslek fırsatları. Özgür çalışma ve yüksek kazanç potansiyeli.',
                features: ['Proje bazlı', 'Özgür çalışma', 'Çoklu proje', 'Yüksek kazanç']
              }
            ].map((workType, index) => (
              <div key={index} className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-responsive-sm font-semibold text-gray-900 mb-2">{workType.type}</h3>
                <p className="text-responsive-xs text-gray-600 mb-4">{workType.description}</p>
                <ul className="space-y-1">
                  {workType.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-xs text-gray-500 flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* İş Arama İpuçları */}
        <section>
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            Başarılı İş Arama İpuçları ve Kariyer Tavsiyeleri 2025
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-responsive">
            <div className="space-responsive">
              <div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-responsive-sm font-semibold text-gray-900 mb-3">İş İlanı Başvuru Süreci</h4>
                <ol className="space-y-3 text-responsive-xs text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">1</span>
                    <span><strong>İlan detaylarını</strong> dikkatlice okuyun ve gereksinimlerle uyumunuzu değerlendirin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">2</span>
                    <span><strong>CV'nizi</strong> pozisyona özel olarak güncelleyin ve <strong>anahtar kelimeleri</strong> dahil edin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">3</span>
                    <span><strong>Ön yazı hazırlayın</strong> ve motivasyonunuzu net bir şekilde ifade edin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">4</span>
                    <span><strong>Başvurunuzu</strong> zamanında gönderin ve takip edin</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-responsive-sm font-semibold text-gray-900 mb-3">Mülakat Hazırlığı</h4>
                <ul className="space-y-2 text-responsive-xs text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>Şirket hakkında</strong> detaylı araştırma yapın
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Yaygın <strong>mülakat sorularına</strong> hazırlanın
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>Kıyafet seçiminizi</strong> şirket kültürüne uygun yapın
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>Sorularınızı</strong> önceden hazırlayın
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-responsive">
              <div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-responsive-sm font-semibold text-gray-900 mb-3">Kariyer Planlama</h4>
                <p className="text-responsive-xs text-gray-700 mb-4">
                  <strong>Uzun vadeli kariyer hedeflerinizi</strong> belirleyin ve bu doğrultuda adımlar atın. 
                  <strong>Sürekli öğrenme</strong> ve <strong>gelişim odaklı</strong> bir yaklaşım benimseyin. <strong>Kariyer fırsatları 2025</strong> 
                  trendlerini takip edin.
                </p>
                <ul className="space-y-2 text-responsive-xs text-gray-600">
                  <li>• Kısa ve uzun vadeli hedefler belirleyin</li>
                  <li>• Becerilerinizi sürekli geliştirin</li>
                  <li>• Sektör trendlerini takip edin</li>
                  <li>• Profesyonel network oluşturun</li>
                  <li>• Mentorluk fırsatlarını değerlendirin</li>
                </ul>
              </div>

              <div className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-responsive-sm font-semibold text-gray-900 mb-3">Dijital Varlık Yönetimi</h4>
                <p className="text-responsive-xs text-gray-700 mb-4">
                  Günümüzde <strong>işverenler</strong> adayları <strong>online platformlarda</strong> araştırıyor. 
                  <strong>Dijital varlığınızı</strong> profesyonel bir şekilde yönetin. <strong>LinkedIn profil optimizasyonu</strong> 
                  ve <strong>sosyal medya</strong> stratejileri önemli.
                </p>
                <ul className="space-y-2 text-responsive-xs text-gray-600">
                  <li>• LinkedIn profilinizi güncel tutun</li>
                  <li>• Sosyal medya hesaplarınızı gözden geçirin</li>
                  <li>• Profesyonel e-posta adresi kullanın</li>
                  <li>• Online portfolyo oluşturun</li>
                  <li>• Sektörel içerikleri takip edin ve paylaşın</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* İstatistikler ve Trendler */}
        <section className="bg-white p-responsive rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            İş Piyasası Trendleri ve İstatistikleri {currentYear}
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-responsive">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-responsive-xs text-gray-600">Günlük Yeni İlan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">81</div>
              <div className="text-responsive-xs text-gray-600">İl Genelinde Fırsat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">25+</div>
              <div className="text-responsive-xs text-gray-600">Farklı Sektör</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">7/24</div>
              <div className="text-responsive-xs text-gray-600">Güncel İlan Akışı</div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-responsive">
            <div>
              <h3 className="text-responsive-sm font-semibold text-gray-900 mb-3">En Çok Aranan Pozisyonlar 2025</h3>
              <ul className="space-y-1 text-responsive-xs text-gray-600">
                <li><strong>1. Yazılım Geliştirici İş İlanları</strong></li>
                <li><strong>2. Satış Temsilcisi İş İlanları</strong></li>
                <li><strong>3. Muhasebeci İş İlanları</strong></li>
                <li><strong>4. Öğretmen İş İlanları</strong></li>
                <li><strong>5. Hemşire İş İlanları</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="text-responsive-sm font-semibold text-gray-900 mb-3">Yükselen Sektörler 2025</h3>
              <ul className="space-y-1 text-responsive-xs text-gray-600">
                <li>• <strong>E-ticaret ve Dijital Pazarlama</strong></li>
                <li>• <strong>Sağlık Teknolojileri</strong></li>
                <li>• <strong>Yenilenebilir Enerji</strong></li>
                <li>• <strong>Fintech ve Blockchain</strong></li>
                <li>• <strong>Uzaktan Çalışma Çözümleri</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="text-responsive-sm font-semibold text-gray-900 mb-3">Gelecek Becerileri 2025</h3>
              <ul className="space-y-1 text-responsive-xs text-gray-600">
                <li>• <strong>Yapay Zeka ve Makine Öğrenmesi</strong></li>
                <li>• <strong>Veri Analizi ve Görselleştirme</strong></li>
                <li>• <strong>Dijital Pazarlama</strong></li>
                <li>• <strong>Proje Yönetimi</strong></li>
                <li>• <strong>Çok Dilli İletişim</strong></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Son Çağrı */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-responsive rounded-xl">
          <h2 className="text-responsive-lg font-bold mb-4">Hayalinizdeki İşe Bugün Başlayın!</h2>
          <p className="text-responsive-sm mb-6 opacity-90">
            <strong>50.000+</strong> güncel iş ilanı arasından size en uygun pozisyonu bulun. 
            <strong>İşBuldum</strong> ile hızlı iş bulun ve <strong>ücretsiz CV oluşturma</strong> araçlarımızla profesyonel özgeçmişinizi hazırlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2 touch-target"
            >
              <Search className="h-5 w-5" />
              İş İlanlarını İncele
            </Link>
            <Link 
              to="/cv-olustur" 
              className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center gap-2 touch-target"
            >
              <FileText className="h-5 w-5" />
              Ücretsiz CV Oluştur
            </Link>
          </div>
        </section>

        {/* Anahtar Kelime Yoğun Alt Metin */}
        <section className="text-center text-responsive-xs text-gray-600 leading-relaxed">
          <p className="mb-4">
            <strong>İşBuldum 2025</strong> - Türkiye'nin en hızlı <strong>iş bulma platformu</strong> olan İşBuldum'da 
            <strong> iş ara</strong>, <strong>iş bul</strong>, <strong>kariyer fırsatları</strong> keşfet ve <strong>ücretsiz iş ilanı ver istanbul</strong> seçeneğiyle hemen ilan yayınla. 
            <strong>İş ilanı ver</strong>, <strong>eleman ara</strong>, <strong>personel bul</strong> seçenekleriyle işverenler ve iş arayanları buluşturuyoruz. 
            <strong>Güncel iş ilanları</strong>, <strong>yeni iş fırsatları</strong>, <strong>part time iş ilanları</strong>, <strong>tam zamanlı iş ilanları</strong>, 
            <strong>uzaktan çalışma iş ilanları</strong>, <strong>freelance iş ilanları</strong> seçenekleriyle her ihtiyaca uygun pozisyonlar.
          </p>
          <p className="mb-4">
            <strong>İstanbul iş ilanları</strong>, <strong>Ankara iş ilanları</strong>, <strong>İzmir iş ilanları</strong> 
            başta olmak üzere 81 ilde <strong>iş imkanları</strong>. <strong>Teknoloji iş ilanları</strong>, <strong>sağlık iş ilanları</strong>, 
            <strong>eğitim iş ilanları</strong>, <strong>mühendis iş ilanları</strong> ve <strong>makine mühendisi iş ilanları</strong> pozisyonları, 
            <strong>garson iş ilanları</strong>, <strong>aşçı yardımcısı iş ilanları</strong>, <strong>resepsiyon görevlisi iş ilanları</strong>, 
            <strong>özel güvenlik iş ilanları</strong> ve daha birçok sektörde <strong>kariyer fırsatları</strong>. <strong>İş başvurusu</strong> yapmak, 
            <strong>CV hazırlamak</strong>, <strong>mülakat hazırlığı</strong> yapmak için gerekli tüm araçlar platformumuzda.
          </p>
          <p>
            <strong>İş arama motoru</strong> özelliğimizle filtreleme yapın, <strong>iş ilanı ara</strong>, <strong>pozisyon ara</strong>, 
            <strong>şirket ara</strong> seçenekleriyle aradığınızı kolayca bulun. <strong>Evde paketleme iş ilanları</strong>, 
            <strong>kurye iş ilanları</strong>, <strong>bahçelievler kurye iş ilanları</strong>, <strong>getir kurye iş ilanları</strong>, 
            <strong>müşteri hizmetleri temsilcisi iş ilanları</strong> gibi popüler aramalara uygun ilanlar bulabilirsiniz. 
            <strong>İş piyasası 2025</strong> trendlerini takip edin, <strong>maaş bilgileri</strong> edinin, <strong>kariyer rehberi</strong> 
            ile gelişiminizi sürdürün. <strong>İş ilanı sitesi</strong> olarak amacımız en kaliteli <strong>iş fırsatlarını</strong> 
            sizlerle buluşturmak ve <strong>kariyer yolculuğunuzda</strong> yanınızda olmaktır.
          </p>
          <p>
            <strong>Döner ustası iş ilanları</strong>, <strong>çağrı merkezi çalışanı iş ilanları</strong>, <strong>market personeli iş ilanları</strong>, 
            <strong>peyzaj mimarı iş ilanları</strong>, <strong>mekatronik mühendisi iş ilanları</strong> ve <strong>antalya uzaktan iş ilanları</strong> 
            gibi spesifik aramalara yönelik içeriklerimizle her sektörden iş arayanlar için çözümler sunuyoruz. 
            <strong>Dolgun maaşlı iş ilanları istanbul</strong>, <strong>düz işçi iş ilanları</strong>, <strong>yeni mezun iş ilanları</strong> 
            ve <strong>deneyimsiz iş ilanları</strong> kategorilerimizle her seviyeden iş arayana hitap ediyoruz.
          </p>
        </section>
      </div>
    </div>
  );
}