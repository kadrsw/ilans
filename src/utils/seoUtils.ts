import { JobListing } from '../types';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateJobUrl(job: { title: string; id: string }): string {
  const slug = generateSlug(job.title);
  return `/ilan/${slug}`;
}

export function generatePageUrl(basePath: string, pageNumber: number): string {
  if (pageNumber <= 1) {
    return basePath;
  }
  return `${basePath}/sayfa/${pageNumber}`;
}

// Türkiye şehirlerini il kodlarıyla eşleştir
const turkishCityMapping: Record<string, { region: string; postalCode: string }> = {
  'İstanbul': { region: 'İstanbul', postalCode: '34000' },
  'Ankara': { region: 'Ankara', postalCode: '06000' },
  'İzmir': { region: 'İzmir', postalCode: '35000' },
  'Bursa': { region: 'Bursa', postalCode: '16000' },
  'Antalya': { region: 'Antalya', postalCode: '07000' },
  'Adana': { region: 'Adana', postalCode: '01000' },
  'Konya': { region: 'Konya', postalCode: '42000' },
  'Gaziantep': { region: 'Gaziantep', postalCode: '27000' },
  'Mersin': { region: 'Mersin', postalCode: '33000' },
  'Kayseri': { region: 'Kayseri', postalCode: '38000' },
  'Eskişehir': { region: 'Eskişehir', postalCode: '26000' },
  'Diyarbakır': { region: 'Diyarbakır', postalCode: '21000' },
  'Samsun': { region: 'Samsun', postalCode: '55000' },
  'Denizli': { region: 'Denizli', postalCode: '20000' },
  'Şanlıurfa': { region: 'Şanlıurfa', postalCode: '63000' },
  'Adapazarı': { region: 'Sakarya', postalCode: '54000' },
  'Malatya': { region: 'Malatya', postalCode: '44000' },
  'Kahramanmaraş': { region: 'Kahramanmaraş', postalCode: '46000' },
  'Erzurum': { region: 'Erzurum', postalCode: '25000' },
  'Van': { region: 'Van', postalCode: '65000' },
  'Batman': { region: 'Batman', postalCode: '72000' },
  'Elazığ': { region: 'Elazığ', postalCode: '23000' },
  'İzmit': { region: 'Kocaeli', postalCode: '41000' },
  'Manisa': { region: 'Manisa', postalCode: '45000' },
  'Sivas': { region: 'Sivas', postalCode: '58000' },
  'Gebze': { region: 'Kocaeli', postalCode: '41400' },
  'Balıkesir': { region: 'Balıkesir', postalCode: '10000' },
  'Tarsus': { region: 'Mersin', postalCode: '33400' },
  'Çorum': { region: 'Çorum', postalCode: '19000' },
  'Türkiye': { region: 'Türkiye', postalCode: '00000' }
};

function getCityInfo(location: string): { region: string; postalCode: string } {
  // Şehir adını temizle ve normalize et
  const cleanLocation = location.trim();
  
  // Direkt eşleşme ara
  if (turkishCityMapping[cleanLocation]) {
    return turkishCityMapping[cleanLocation];
  }
  
  // Kısmi eşleşme ara
  for (const [city, info] of Object.entries(turkishCityMapping)) {
    if (cleanLocation.includes(city) || city.includes(cleanLocation)) {
      return info;
    }
  }
  
  // Varsayılan değer
  return { region: 'Türkiye', postalCode: '00000' };
}

export function parseISO8601Date(timestamp: any): string {
  // Handle invalid or non-numeric timestamps
  if (timestamp === null || timestamp === undefined) {
    return new Date().toISOString();
  }
  
  // If timestamp is not a number, try to convert it
  let numericTimestamp: number;
  
  if (typeof timestamp === 'number') {
    numericTimestamp = timestamp;
  } else if (typeof timestamp === 'string') {
    numericTimestamp = parseInt(timestamp, 10);
  } else if (typeof timestamp === 'object' && timestamp !== null) {
    // Handle Firebase ServerValue.TIMESTAMP objects or other objects
    if (timestamp.seconds && typeof timestamp.seconds === 'number') {
      // Firestore Timestamp object
      numericTimestamp = timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
    } else if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
      // Firebase Timestamp with toMillis method
      numericTimestamp = timestamp.toMillis();
    } else {
      // Fallback to current time for unknown objects
      numericTimestamp = Date.now();
    }
  } else {
    // Fallback to current time for any other type
    numericTimestamp = Date.now();
  }
  
  // Validate the numeric timestamp
  if (isNaN(numericTimestamp) || !isFinite(numericTimestamp)) {
    numericTimestamp = Date.now();
  }
  
  // Create date and validate it
  const date = new Date(numericTimestamp);
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  
  return date.toISOString();
}

function parseSalary(salaryString?: string): { minValue?: number; maxValue?: number; currency: string } {
  if (!salaryString) {
    return { currency: 'TRY' };
  }

  // Türk Lirası işaretlerini temizle
  const cleanSalary = salaryString.replace(/[₺TL]/g, '').trim();
  
  // Aralık kontrolü (örn: "15.000 - 25.000")
  const rangeMatch = cleanSalary.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const minValue = parseFloat(rangeMatch[1].replace(/\./g, ''));
    const maxValue = parseFloat(rangeMatch[2].replace(/\./g, ''));
    return {
      minValue,
      maxValue,
      currency: 'TRY'
    };
  }
  
  // Tek değer kontrolü
  const singleMatch = cleanSalary.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1].replace(/\./g, ''));
    return {
      minValue: value,
      currency: 'TRY'
    };
  }
  
  return { currency: 'TRY' };
}

export function generateMetaTags(data: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url: string;
  jobData?: JobListing;
  pageNumber?: number;
  cityName?: string;
  categoryName?: string;
}): void {
  // CTR artırıcı title formatları - Google Search Console verilerine göre optimize
  let pageTitle: string;
  
  if (data.jobData) {
    // CTR artırıcı format: Maaş + Pozisyon + Şehir + Aciliyet
    const jobTitle = data.jobData.title || 'İş İlanı';
    const company = data.jobData.company || 'Şirket';
    const location = data.jobData.location || 'Türkiye';
    const salary = data.jobData.salary ? ` - ${data.jobData.salary}` : '';
    const urgency = ' - HEMEN BAŞVUR';
    pageTitle = `${jobTitle}${salary} | ${location}${urgency} | İşBuldum`;
  } else if (data.cityName) {
    // Şehir sayfaları için CTR artırıcı format
    pageTitle = `${data.cityName} İş İlanları 2025 ⚡ 1000+ Güncel Fırsat | HEMEN BAŞVUR | İşBuldum`;
  } else if (data.categoryName) {
    // Kategori sayfaları için CTR artırıcı format
    pageTitle = `${data.categoryName} İş İlanları 2025 ⚡ Yüksek Maaş + Hızlı İşe Alım | İşBuldum`;
  } else if (data.pageNumber && data.pageNumber > 1) {
    // Sayfalama için CTR artırıcı format
    pageTitle = `${data.title} - Sayfa ${data.pageNumber} ⚡ Daha Fazla Fırsat | İşBuldum`;
  } else {
    // Ana sayfa için CTR artırıcı format
    pageTitle = `İş İlanları 2025 ⚡ 50.000+ Güncel Fırsat | Dakikada 5 Yeni İlan | İşBuldum`;
  }
  
  // Update title and meta description
  document.title = pageTitle;
  
  // CTR artırıcı meta description - Google Search Console verilerine göre optimize
  let metaDescription: string;
  if (data.jobData) {
    const salary = data.jobData.salary ? ` 💰 Maaş: ${data.jobData.salary}` : '';
    const urgency = ' ⚡ HEMEN BAŞVUR!';
    const benefits = ' ✅ SGK + Yemek + Prim';
    metaDescription = `${data.jobData.title} - ${data.jobData.company}, ${data.jobData.location}.${salary}${benefits}${urgency} ${data.jobData.description.substring(0, 50)}...`;
    metaDescription = metaDescription.length > 155 ? metaDescription.substring(0, 152) + '...' : metaDescription;
  } else {
    // Ana sayfa için CTR artırıcı description
    metaDescription = `⚡ Türkiye'nin En Hızlı İş Bulma Platformu! 50.000+ Güncel İlan 💼 Dakikada 5 Yeni Fırsat 🚀 %100 Ücretsiz 💰 Yüksek Maaşlı Pozisyonlar ✅ HEMEN BAŞVUR!`;
  }
  
  const metaTags = {
    description: metaDescription,
    keywords: data.keywords?.join(', ') || 'iş ilanları, güncel iş ilanları, iş fırsatları, eleman ilanları, kariyer, istanbul iş ilanları, ankara iş ilanları, izmir iş ilanları, part time iş ilanları, remote iş ilanları, iş ilanları 2025, yeni mezun iş ilanları, deneyimsiz iş ilanları, mühendis iş ilanları, garson iş ilanları, kurye iş ilanları, resepsiyon görevlisi iş ilanları, aşçı yardımcısı iş ilanları, özel güvenlik iş ilanları, dme group çağrı merkezi, getir kurye, dominos pizza, burger king iş ilanları, yüksek maaşlı iş ilanları, dolgun maaşlı iş ilanları, yatılı iş ilanları, home office iş ilanları, çağrı merkezi iş ilanları, evde paketleme iş ilanları, bahçelievler kurye iş ilanları, akkuyu nükleer santral iş ilanları',
    'og:title': pageTitle,
    'og:description': metaDescription,
    'og:image': data.image || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=630&fit=crop&crop=center',
    'og:url': `https://isilanlarim.org${data.url}`,
    'og:type': data.jobData ? 'article' : 'website',
    'og:locale': 'tr_TR',
    'og:site_name': 'İşBuldum - Hızlı İş Bulma Platformu',
    'twitter:card': 'summary_large_image',
    'twitter:title': pageTitle,
    'twitter:description': metaDescription,
    'twitter:image': data.image || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=630&fit=crop&crop=center',
    'twitter:site': '@isbuldum',
    'robots': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1, max-image-preview:standard',
    'googlebot': 'index, follow',
    'publisher': 'İşBuldum - Hızlı İş Bulma Platformu',
    'revisit-after': '1 day',
    'author': 'İşBuldum Editör Ekibi',
    'language': 'tr',
    'geo.region': 'TR',
    'geo.country': 'Turkey',
    'distribution': 'global',
    'rating': 'general',
    'copyright': 'İşBuldum - Hızlı İş Bulma Platformu',
    'news_keywords': data.keywords?.slice(0, 10).join(', ') || 'iş ilanları, kariyer, istihdam, güncel iş fırsatları, yüksek maaşlı işler',
    'article:publisher': 'İşBuldum - Hızlı İş Bulma Platformu',
    'article:author': 'İşBuldum Editör Ekibi',
    'article:section': data.jobData?.category || 'İş İlanları',
    'article:tag': data.keywords?.join(', ') || 'iş, kariyer, istihdam, güncel fırsatlar, yüksek maaş'
  };

  // Update meta tags
  Object.entries(metaTags).forEach(([name, content]) => {
    let element = document.querySelector(`meta[property="${name}"]`) || 
                  document.querySelector(`meta[name="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        element.setAttribute('property', name);
      } else {
        element.setAttribute('name', name);
      }
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  });

  // Add canonical link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = `https://isilanlarim.org${data.url}`;

  // Add alternate links for mobile
  let mobileAlternate = document.querySelector('link[rel="alternate"][media]');
  if (!mobileAlternate) {
    mobileAlternate = document.createElement('link');
    mobileAlternate.rel = 'alternate';
    mobileAlternate.setAttribute('media', 'only screen and (max-width: 640px)');
    document.head.appendChild(mobileAlternate);
  }
  mobileAlternate.href = `https://isilanlarim.org${data.url}`;

  // Add prev/next links for pagination
  if (data.pageNumber && data.pageNumber > 1) {
    // Previous page link
    let prevLink = document.querySelector('link[rel="prev"]');
    if (!prevLink) {
      prevLink = document.createElement('link');
      prevLink.rel = 'prev';
      document.head.appendChild(prevLink);
    }
    const prevUrl = data.pageNumber === 2 
      ? data.url.replace(/\/sayfa\/\d+/, '')
      : data.url.replace(/\/sayfa\/\d+/, `/sayfa/${data.pageNumber - 1}`);
    prevLink.href = `https://isilanlarim.org${prevUrl}`;
  }

  // Add next page link if applicable
  if (data.pageNumber) {
    let nextLink = document.querySelector('link[rel="next"]');
    if (!nextLink) {
      nextLink = document.createElement('link');
      nextLink.rel = 'next';
      document.head.appendChild(nextLink);
    }
    const nextUrl = data.url.includes('/sayfa/') 
      ? data.url.replace(/\/sayfa\/\d+/, `/sayfa/${data.pageNumber + 1}`)
      : `${data.url}/sayfa/${data.pageNumber + 1}`;
    nextLink.href = `https://isilanlarim.org${nextUrl}`;
  }

  // Add JobPosting schema for job listings - GOOGLE ZENGIN SONUÇLAR İÇİN
  if (data.jobData) {
    const cityInfo = getCityInfo(data.jobData.location);
    const salaryInfo = parseSalary(data.jobData.salary);
    
    // ISO 8601 formatında tarih - güvenli tarih dönüşümü
    const datePosted = parseISO8601Date(data.jobData.createdAt);
    const validThrough = parseISO8601Date(data.jobData.createdAt + (60 * 24 * 60 * 60 * 1000)); // 60 gün geçerli

    const jobSchema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": data.jobData.title,
      "description": data.jobData.description,
      "datePosted": datePosted, // ISO 8601 formatında
      "validThrough": validThrough, // Geçerlilik süresi eklendi
      "employmentType": data.jobData.type === 'Tam Zamanlı' ? 'FULL_TIME' : 
                       data.jobData.type === 'Yarı Zamanlı' ? 'PART_TIME' : 'OTHER',
      "hiringOrganization": {
        "@type": "Organization",
        "name": data.jobData.company,
        "sameAs": "https://isilanlarim.org"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "İş İlanı Adresi", // Eksik alan eklendi
          "addressLocality": data.jobData.location,
          "addressRegion": cityInfo.region, // Eksik alan eklendi
          "postalCode": cityInfo.postalCode, // Eksik alan eklendi
          "addressCountry": "TR"
        }
      },
      "workHours": data.jobData.type === "Tam Zamanlı" ? "40 saat/hafta" : "Esnek çalışma saatleri",
      "jobBenefits": "Sosyal güvence, performans primi, kariyer gelişimi",
      "qualifications": data.jobData.educationLevel || "Belirtilmemiş",
      "responsibilities": data.jobData.description.substring(0, 200) + "...",
      // Maaş bilgisi düzeltildi - geçersiz nesne türü sorunu çözüldü
      "baseSalary": salaryInfo.minValue ? {
        "@type": "MonetaryAmount",
        "currency": salaryInfo.currency,
        "value": {
          "@type": "QuantitativeValue",
          "minValue": salaryInfo.minValue,
          "maxValue": salaryInfo.maxValue || salaryInfo.minValue,
          "unitText": "MONTH"
        }
      } : undefined,
      "industry": data.jobData.category,
      "occupationalCategory": data.jobData.subCategory,
      "educationRequirements": data.jobData.educationLevel || "Belirtilmemiş",
      "experienceRequirements": data.jobData.experience || "Deneyim seviyesi belirtilmemiş",
      "url": `https://isilanlarim.org${data.url}`,
      "identifier": {
        "@type": "PropertyValue",
        "name": "Job ID",
        "value": data.jobData.id
      },
      "applicationContact": data.jobData.contactEmail || data.jobData.contactPhone ? {
        "@type": "ContactPoint",
        "email": data.jobData.contactEmail,
        "telephone": data.jobData.contactPhone
      } : undefined,
      "skills": data.jobData.subCategory,
      "salaryCurrency": "TRY",
      "jobLocationType": data.jobData.type === 'Uzaktan' ? 'TELECOMMUTE' : 'PHYSICAL',
      "applicantLocationRequirements": {
        "@type": "Country",
        "name": "Turkey"
      }
    };

    // Maaş bilgisi yoksa baseSalary alanını kaldır
    if (!salaryInfo.minValue) {
      delete jobSchema.baseSalary;
    }

    // İletişim bilgisi yoksa applicationContact alanını kaldır
    if (!jobSchema.applicationContact) {
      delete jobSchema.applicationContact;
    }

    let scriptElement = document.querySelector('script[type="application/ld+json"][data-job]');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-job', 'true');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(jobSchema, null, 2);
  }

  // Add FAQ schema for homepage
  if (data.url === '/' || data.url === '') {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "İş ilanları nasıl aranır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "İsilanlarim.org'da iş aramak çok kolay. Arama kutusuna pozisyon adı yazın, şehir seçin ve filtrelerle sonuçları daraltın. 50.000+ güncel iş ilanı arasından size uygun olanı bulabilirsiniz."
          }
        },
        {
          "@type": "Question",
          "name": "Ücretsiz iş ilanı nasıl verilir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "İsilanlarim.org'da iş ilanı vermek tamamen ücretsizdir. Kayıt olduktan sonra 'İlan Ver' butonuna tıklayın, ilan bilgilerinizi doldurun ve yayınlayın. İlanınız anında yayına girer."
          }
        },
        {
          "@type": "Question",
          "name": "En güncel iş ilanları hangileri?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Platformumuzda günlük olarak güncellenen binlerce ilan bulunur. 'Bugün' ve 'Yeni' etiketli ilanlar son 24-48 saat içinde yayınlanan en güncel iş fırsatlarıdır."
          }
        },
        {
          "@type": "Question",
          "name": "Remote iş bulabilir miyim?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Evet, uzaktan çalışma imkanı sunan 1000+ iş ilanımız var. 'Remote' filtresini kullanarak evden çalışabileceğiniz pozisyonları bulabilirsiniz."
          }
        },
        {
          "@type": "Question",
          "name": "CV nasıl oluşturabilirim?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ücretsiz CV oluşturma aracımızla profesyonel CV hazırlayabilirsiniz. 'CV Oluştur' sayfasında bilgilerinizi girin, önizleme yapın ve PDF olarak indirin."
          }
        }
      ]
    };

    let faqScript = document.querySelector('script[type="application/ld+json"][data-faq]');
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.setAttribute('data-faq', 'true');
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = JSON.stringify(faqSchema, null, 2);
  }

  // Add BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://isilanlarim.org"
      }
    ]
  };

  if (data.jobData) {
    breadcrumbSchema.itemListElement.push(
      {
        "@type": "ListItem",
        "position": 2,
        "name": "İş İlanları",
        "item": "https://isilanlarim.org/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": data.jobData.category,
        "item": `https://isilanlarim.org/is-ilanlari/${data.jobData.category}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": data.jobData.title,
        "item": `https://isilanlarim.org${data.url}`
      }
    );
  }

  let breadcrumbScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb]');
  if (!breadcrumbScript) {
    breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-breadcrumb', 'true');
    document.head.appendChild(breadcrumbScript);
  }
  breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema, null, 2);

  // Add WebSite schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "İsilanlarim.org",
    "url": "https://isilanlarim.org",
    "description": "Türkiye'nin en güncel iş ilanları sitesi ve ücretsiz CV oluşturma platformu",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://isilanlarim.org/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "İsilanlarim.org",
      "url": "https://isilanlarim.org"
    }
  };

  let websiteScript = document.querySelector('script[type="application/ld+json"][data-website]');
  if (!websiteScript) {
    websiteScript = document.createElement('script');
    websiteScript.type = 'application/ld+json';
    websiteScript.setAttribute('data-website', 'true');
    document.head.appendChild(websiteScript);
  }
  websiteScript.textContent = JSON.stringify(websiteSchema, null, 2);
}