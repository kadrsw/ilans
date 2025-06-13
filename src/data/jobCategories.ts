export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export const jobCategories: Category[] = [
  {
    id: 'insaat',
    name: 'İnşaat',
    subCategories: [
      { id: 'insaat-muhendisi', name: 'İnşaat Mühendisi' },
      { id: 'mimar', name: 'Mimar' },
      { id: 'santiye-sefi', name: 'Şantiye Şefi' },
      { id: 'insaat-iscisi', name: 'İnşaat İşçisi' },
      { id: 'elektrik-ustasi', name: 'Elektrik Ustası' },
      { id: 'kalipci', name: 'Kalıpçı' },
      { id: 'demirci', name: 'Demirci' },
      { id: 'tesisatci', name: 'Tesisatçı' }
    ]
  },
  {
    id: 'egitim',
    name: 'Eğitim',
    subCategories: [
      { id: 'ogretmen', name: 'Öğretmen' },
      { id: 'akademisyen', name: 'Akademisyen' },
      { id: 'rehberlik', name: 'Rehberlik ve Psikolojik Danışman' },
      { id: 'ozel-ogretmen', name: 'Özel Ders Eğitmeni' },
      { id: 'kres-ogretmeni', name: 'Kreş Öğretmeni' },
      { id: 'kurs-egitmeni', name: 'Kurs Eğitmeni' }
    ]
  },
  {
    id: 'saglik',
    name: 'Sağlık',
    subCategories: [
      { id: 'doktor', name: 'Doktor' },
      { id: 'hemsire', name: 'Hemşire' },
      { id: 'eczaci', name: 'Eczacı' },
      { id: 'fizyoterapist', name: 'Fizyoterapist' },
      { id: 'dis-hekimi', name: 'Diş Hekimi' },
      { id: 'saglik-teknikeri', name: 'Sağlık Teknikeri' },
      { id: 'ambulans-soforu', name: 'Ambulans Şoförü' }
    ]
  },
  {
    id: 'teknoloji',
    name: 'Teknoloji',
    subCategories: [
      { id: 'yazilim-gelistirici', name: 'Yazılım Geliştirici' },
      { id: 'web-tasarimcisi', name: 'Web Tasarımcısı' },
      { id: 'veri-analisti', name: 'Veri Analisti' },
      { id: 'sistem-yoneticisi', name: 'Sistem Yöneticisi' },
      { id: 'siber-guvenlik', name: 'Siber Güvenlik Uzmanı' },
      { id: 'teknik-destek', name: 'Teknik Destek Uzmanı' }
    ]
  },
  {
    id: 'hizmet',
    name: 'Hizmet Sektörü',
    subCategories: [
      { id: 'garson', name: 'Garson' },
      { id: 'asci', name: 'Aşçı' },
      { id: 'barista', name: 'Barista' },
      { id: 'temizlik', name: 'Temizlik Görevlisi' },
      { id: 'resepsiyonist', name: 'Resepsiyonist' },
      { id: 'kuafor-berber', name: 'Kuaför/Berber' }
    ]
  },
  {
    id: 'sanayi',
    name: 'Sanayi ve Üretim',
    subCategories: [
      { id: 'uretim-operatoru', name: 'Üretim Operatörü' },
      { id: 'makine-muhendisi', name: 'Makine Mühendisi' },
      { id: 'elektrik-elektronik', name: 'Elektrik Elektronik Mühendisi' },
      { id: 'kaynakci', name: 'Kaynakçı' },
      { id: 'cnc-operatoru', name: 'CNC Operatörü' },
      { id: 'fabrika-iscisi', name: 'Fabrika İşçisi' }
    ]
  },
  {
    id: 'ticaret',
    name: 'Ticaret ve Satış',
    subCategories: [
      { id: 'satis-temsilcisi', name: 'Satış Temsilcisi' },
      { id: 'pazarlama-uzmani', name: 'Pazarlama Uzmanı' },
      { id: 'e-ticaret', name: 'E-Ticaret Uzmanı' },
      { id: 'magaza-muduru', name: 'Mağaza Müdürü' },
      { id: 'kasiyer', name: 'Kasiyer' }
    ]
  },
  {
    id: 'lojistik',
    name: 'Lojistik',
    subCategories: [
      { id: 'sofor', name: 'Şoför' },
      { id: 'depo-gorevlisi', name: 'Depo Görevlisi' },
      { id: 'forklift-operatoru', name: 'Forklift Operatörü' },
      { id: 'sevkiyat', name: 'Sevkiyat Sorumlusu' },
      { id: 'kargo-gorevlisi', name: 'Kargo Görevlisi' }
    ]
  },
  {
    id: 'finans',
    name: 'Finans ve Muhasebe',
    subCategories: [
      { id: 'muhasebeci', name: 'Muhasebeci' },
      { id: 'mali-musavir', name: 'Mali Müşavir' },
      { id: 'finansal-analist', name: 'Finansal Analist' },
      { id: 'krediler-uzmani', name: 'Krediler Uzmanı' },
      { id: 'banka-personeli', name: 'Banka Personeli' }
    ]
  },
  {
    id: 'medya',
    name: 'Medya ve Tasarım',
    subCategories: [
      { id: 'grafik-tasarimci', name: 'Grafik Tasarımcı' },
      { id: 'video-editor', name: 'Video Editörü' },
      { id: 'fotografci', name: 'Fotoğrafçı' },
      { id: 'sosyal-medya', name: 'Sosyal Medya Uzmanı' },
      { id: 'reklam-yazari', name: 'Reklam Metin Yazarı' },
      { id: 'icerik-editoru', name: 'İçerik Editörü' }
    ]
  },
  {
    id: 'tarim',
    name: 'Tarım ve Hayvancılık',
    subCategories: [
      { id: 'ziraat-muhendisi', name: 'Ziraat Mühendisi' },
      { id: 'veteriner', name: 'Veteriner Hekim' },
      { id: 'ciftlik-iscisi', name: 'Çiftlik İşçisi' },
      { id: 'seraci', name: 'Seracı' },
      { id: 'sulama-teknikeri', name: 'Sulama Teknikeri' }
    ]
  },
  {
    id: 'turizm',
    name: 'Turizm',
    subCategories: [
      { id: 'tur-rehberi', name: 'Tur Rehberi' },
      { id: 'otel-yoneticisi', name: 'Otel Yöneticisi' },
      { id: 'animator', name: 'Animatör' },
      { id: 'plaj-gorevlisi', name: 'Plaj Görevlisi' },
      { id: 'barmen', name: 'Barmen' }
    ]
  },
  {
    id: 'guvenlik',
    name: 'Güvenlik',
    subCategories: [
      { id: 'ozel-guvenlik', name: 'Özel Güvenlik Görevlisi' },
      { id: 'bekci', name: 'Bekçi' },
      { id: 'kamera-operatoru', name: 'Kamera Sistemleri Operatörü' }
    ]
  },
  {
    id: 'enerji',
    name: 'Enerji',
    subCategories: [
      { id: 'enerji-muhendisi', name: 'Enerji Mühendisi' },
      { id: 'ruzgar-teknisyeni', name: 'Rüzgar Enerjisi Teknisyeni' },
      { id: 'gunes-montajcisi', name: 'Güneş Paneli Montajcısı' }
    ]
  },
  {
    id: 'perakende',
    name: 'Perakende',
    subCategories: [
      { id: 'satis-danismani', name: 'Mağaza Satış Danışmanı' },
      { id: 'depo-elemani', name: 'Depo Elemanı' },
      { id: 'reyon-gorevlisi', name: 'Reyon Görevlisi' }
    ]
  },
  {
    id: 'kamu',
    name: 'Kamu ve Belediyecilik',
    subCategories: [
      { id: 'memur', name: 'Memur' },
      { id: 'zabita', name: 'Zabıta' },
      { id: 'itfaiye', name: 'İtfaiye Eri' },
      { id: 'sosyal-hizmet', name: 'Sosyal Hizmet Uzmanı' }
    ]
  },
  {
    id: 'yonetim',
    name: 'Yönetim',
    subCategories: [
      { id: 'insan-kaynaklari', name: 'İnsan Kaynakları Uzmanı' },
      { id: 'proje-yoneticisi', name: 'Proje Yöneticisi' },
      { id: 'is-gelistirme', name: 'İş Geliştirme Uzmanı' }
    ]
  },
  {
    id: 'havacilik',
    name: 'Havacılık',
    subCategories: [
      { id: 'pilot', name: 'Pilot' },
      { id: 'kabin-memuru', name: 'Kabin Memuru' },
      { id: 'hava-trafik', name: 'Hava Trafik Kontrolörü' },
      { id: 'teknik-bakim', name: 'Teknik Bakım Personeli' }
    ]
  },
  {
    id: 'denizcilik',
    name: 'Denizcilik',
    subCategories: [
      { id: 'gemi-kaptani', name: 'Gemi Kaptanı' },
      { id: 'guverte', name: 'Güverte Personeli' },
      { id: 'makineci', name: 'Makineci' }
    ]
  },
  {
    id: 'sanat',
    name: 'Sanat ve Eğlence',
    subCategories: [
      { id: 'muzisyen', name: 'Müzisyen' },
      { id: 'oyuncu', name: 'Oyuncu' },
      { id: 'dansci', name: 'Dansçı' },
      { id: 'seslendirme', name: 'Seslendirme Sanatçısı' }
    ]
  },
  {
    id: 'diger',
    name: 'Diğer',
    subCategories: [
      { id: 'custom', name: 'Özel Kategori' }
    ]
  }
];