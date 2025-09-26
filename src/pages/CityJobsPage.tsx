import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, TrendingUp, Users, Building2, Clock, Star, CheckCircle, ArrowRight, Target, Award, Globe, Zap, Heart, Shield, Lightbulb, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobList } from '../components/home/JobList';
import { JobFilters } from '../components/home/JobFilters';
import { useJobs } from '../hooks/useJobs';
import { useJobFilters } from '../hooks/useJobFilters';
import { generateMetaTags } from '../utils/seoUtils';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export function CityJobsPage() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const { jobs, categories, loading, error, refetchJobs } = useJobs();
  const { filters, updateFilters, filteredJobs } = useJobFilters(jobs);

  // Şehir adını formatla
  const cityName = city?.split('-')[0]?.charAt(0).toUpperCase() + city?.split('-')[0]?.slice(1) || '';
  
  // Şehir bazlı filtreleme
  const cityJobs = filteredJobs.filter(job => 
    job.location.toLowerCase().includes(cityName.toLowerCase())
  );

  useEffect(() => {
    // SEO meta tags
    generateMetaTags({
      title: `${cityName} İş İlanları - 2025 Güncel ${cityName} İş Fırsatları`,
      description: `${cityName}'da iş arıyorsanız doğru yerdesiniz! 50.000+ güncel iş ilanı arasından ${cityName} pozisyonları. Mühendis, garson, kurye, resepsiyon görevlisi, aşçı yardımcısı, özel güvenlik iş ilanları. Hemen başvuru yapın!`,
      keywords: [
        `${cityName.toLowerCase()} iş ilanları`,
        `${cityName.toLowerCase()} iş ilanları 2025`,
        `${cityName.toLowerCase()} iş fırsatları`,
        `${cityName.toLowerCase()} kariyer`,
        `${cityName.toLowerCase()} güncel iş ilanları`,
        `${cityName.toLowerCase()} yeni iş ilanları`,
        `${cityName.toLowerCase()} mühendis iş ilanları`,
        `${cityName.toLowerCase()} garson iş ilanları`,
        `${cityName.toLowerCase()} kurye iş ilanları`,
        `${cityName.toLowerCase()} resepsiyon görevlisi iş ilanları`,
        `${cityName.toLowerCase()} aşçı yardımcısı iş ilanları`,
        `${cityName.toLowerCase()} özel güvenlik iş ilanları`,
        `${cityName.toLowerCase()} part time iş ilanları`,
        `${cityName.toLowerCase()} tam zamanlı iş ilanları`,
        `${cityName.toLowerCase()} remote iş ilanları`,
        'iş ara',
        'kariyer fırsatları',
        'güncel iş ilanları',
        'iş ilanları 2025'
      ],
      url: window.location.pathname,
      cityName: cityName
    });
  }, [cityName]);

  const breadcrumbItems = [
    { label: 'İş İlanları', href: '/' },
    { label: `${cityName} İş İlanları` }
  ];

  // Şehir bilgileri
  const getCityInfo = () => {
    switch (cityName.toLowerCase()) {
      case 'istanbul':
        return {
          description: 'Türkiye\'nin ekonomik başkenti İstanbul\'da binlerce iş fırsatı sizi bekliyor. Finans merkezinden teknoloji şirketlerine, turizm sektöründen sağlık alanına kadar her sektörde kariyer imkanları.',
          population: '15.5 Milyon',
          sectors: ['Finans', 'Teknoloji', 'Turizm', 'Sağlık', 'Eğitim', 'İnşaat'],
          averageSalary: '18.000₺ - 35.000₺',
          topJobs: ['Yazılım Geliştirici', 'Satış Temsilcisi', 'Muhasebeci', 'Garson', 'Kurye']
        };
      case 'ankara':
        return {
          description: 'Türkiye\'nin başkenti Ankara\'da kamu ve özel sektörde çok sayıda iş imkanı. Devlet kurumlarından teknoloji şirketlerine, eğitim sektöründen sağlık alanına kadar geniş kariyer yelpazesi.',
          population: '5.7 Milyon',
          sectors: ['Kamu', 'Eğitim', 'Sağlık', 'Teknoloji', 'Savunma', 'Tarım'],
          averageSalary: '15.000₺ - 28.000₺',
          topJobs: ['Memur', 'Öğretmen', 'Mühendis', 'Doktor', 'Teknisyen']
        };
      case 'izmir':
        return {
          description: 'Ege\'nin incisi İzmir\'de sanayi, turizm ve teknoloji sektörlerinde çok sayıda iş fırsatı. Liman kenti olmasının avantajıyla lojistik ve dış ticaret alanında da güçlü kariyer imkanları.',
          population: '4.4 Milyon',
          sectors: ['Sanayi', 'Turizm', 'Lojistik', 'Teknoloji', 'Tarım', 'Tekstil'],
          averageSalary: '14.000₺ - 25.000₺',
          topJobs: ['Sanayi İşçisi', 'Lojistik Uzmanı', 'Turizm Personeli', 'Tekniker', 'Satış Temsilcisi']
        };
      default:
        return {
          description: `${cityName}'da çeşitli sektörlerde iş fırsatları. Yerel ekonominin dinamikleriyle uyumlu kariyer imkanları ve gelişim fırsatları.`,
          population: 'Veri Yok',
          sectors: ['Çeşitli Sektörler'],
          averageSalary: 'Sektöre Göre Değişir',
          topJobs: ['Çeşitli Pozisyonlar']
        };
    }
  };

  const cityInfo = getCityInfo();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">İlanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              {cityName} İş İlanları - 2025 Güncel {cityName} İş Fırsatları
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
              {cityInfo.description}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{cityJobs.length}</div>
                <div className="text-xs sm:text-sm text-blue-200">Aktif İlan</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{cityInfo.sectors.length}+</div>
                <div className="text-xs sm:text-sm text-blue-200">Farklı Sektör</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{cityInfo.population}</div>
                <div className="text-xs sm:text-sm text-blue-200">Nüfus</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">7/24</div>
                <div className="text-xs sm:text-sm text-blue-200">Güncel Akış</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* City Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  {cityName} Hakkında
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nüfus:</span>
                    <span className="text-gray-600 ml-2">{cityInfo.population}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ortalama Maaş:</span>
                    <span className="text-green-600 ml-2 font-medium">{cityInfo.averageSalary}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Güçlü Sektörler:</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cityInfo.sectors.map((sector, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Jobs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  En Çok Aranan Pozisyonlar
                </h3>
                
                <ul className="space-y-2">
                  {cityInfo.topJobs.map((job, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      {job}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Filters */}
              <JobFilters
                filters={filters}
                onFilterChange={updateFilters}
                availableCategories={categories}
              />
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            {error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
              <JobList jobs={cityJobs} onJobDeleted={refetchJobs} />
            )}
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            
            {/* City Job Market Analysis */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Building2 className="h-7 w-7 text-blue-600" />
                {cityName} İş Piyasası Analizi ve Kariyer Fırsatları
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Sektörel Dağılım</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {cityName}'da en güçlü sektörler ve iş imkanları analizi.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {cityInfo.sectors.map((sector, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {sector} Sektörü
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Maaş Analizi</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {cityName}'da ortalama maaş seviyeleri ve sektörel karşılaştırma.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ortalama Maaş:</span>
                      <span className="font-semibold text-green-600">{cityInfo.averageSalary}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500">Türkiye ortalamasının üzerinde</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">İş Arama İpuçları</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {cityName}'da başarılı iş arama stratejileri.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Yerel şirketleri araştırın</li>
                    <li>• Sektörel etkinliklere katılın</li>
                    <li>• Network oluşturun</li>
                    <li>• CV'nizi şehre özel optimize edin</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Popular Job Categories in City */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Briefcase className="h-7 w-7 text-blue-600" />
                {cityName}'da Popüler İş Kategorileri
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Teknoloji', icon: '💻', count: '250+' },
                  { name: 'Sağlık', icon: '🏥', count: '180+' },
                  { name: 'Eğitim', icon: '📚', count: '150+' },
                  { name: 'Satış', icon: '💼', count: '300+' },
                  { name: 'Hizmet', icon: '🍽️', count: '200+' },
                  { name: 'Lojistik', icon: '🚚', count: '120+' }
                ].map((category, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{category.count} ilan</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Transportation and Living */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MapPin className="h-7 w-7 text-blue-600" />
                {cityName}'da Yaşam ve Ulaşım
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Ulaşım İmkanları</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {cityName}'da işe ulaşım seçenekleri ve toplu taşıma bilgileri.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Metro ve tramvay hatları
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Otobüs ağı
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Taksi ve ride-sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bisiklet yolları
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Yaşam Kalitesi</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {cityName}'da çalışanlar için yaşam kalitesi ve sosyal imkanlar.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Kültürel etkinlikler
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Sosyal tesisler
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Eğitim imkanları
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Sağlık hizmetleri
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">{cityName}'da Kariyerinizi Başlatın!</h3>
              <p className="text-lg mb-6 opacity-90">
                {cityName}'daki en güncel iş fırsatlarını kaçırmayın. Hemen başvuru yapın ve kariyerinizi ileriye taşıyın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Tüm İlanları Görüntüle
                </Link>
                <Link 
                  to="/cv-olustur" 
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  CV Oluştur
                </Link>
              </div>
            </section>

            {/* SEO Text */}
            <section className="text-center text-sm text-gray-600 leading-relaxed bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{cityName} İş İlanları Hakkında</h2>
              <p className="mb-4">
                <strong>{cityName} iş ilanları</strong> kategorimizde {cityName}'da çalışmak isteyen adaylar için 
                binlerce güncel iş fırsatı bulunmaktadır. <strong>{cityName} iş ara</strong> seçeneğiyle 
                filtreleme yapabilir, <strong>{cityName} kariyer fırsatları</strong> arasından size en uygun 
                pozisyonu seçebilirsiniz. <strong>{cityName} iş başvurusu</strong> yapmak için sadece 
                ilan detaylarına tıklayın ve iletişim bilgilerini kullanın.
              </p>
              <p className="mb-4">
                <strong>{cityName} mühendis iş ilanları</strong>, <strong>{cityName} garson iş ilanları</strong>, 
                <strong>{cityName} kurye iş ilanları</strong>, <strong>{cityName} resepsiyon görevlisi iş ilanları</strong>, 
                <strong>{cityName} aşçı yardımcısı iş ilanları</strong> ve <strong>{cityName} özel güvenlik iş ilanları</strong> 
                başta olmak üzere her sektörden pozisyonlar bulabilirsiniz. <strong>{cityName} part time iş</strong>, 
                <strong>{cityName} tam zamanlı iş</strong>, <strong>{cityName} uzaktan çalışma</strong> seçenekleriyle 
                çalışma şeklinize uygun ilanları keşfedin.
              </p>
              <p>
                <strong>{cityName} iş piyasası</strong> sürekli gelişmekte ve yeni fırsatlar sunmaktadır. 
                <strong>{cityName} iş imkanları</strong> hakkında detaylı bilgi almak, 
                <strong>{cityName} maaş seviyeleri</strong> hakkında bilgi edinmek ve 
                <strong>{cityName} kariyer rehberi</strong> için platformumuzu takip edin. 
                İş arayanlar için <strong>{cityName} CV hazırlama</strong> ve 
                <strong>{cityName} mülakat hazırlığı</strong> ipuçlarımızı da inceleyebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}