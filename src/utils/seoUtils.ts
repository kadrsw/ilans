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
  return `/ilan/${slug}/${job.id}`;
}

export function generatePageUrl(basePath: string, pageNumber: number): string {
  if (pageNumber <= 1) {
    return basePath;
  }
  return `${basePath}/sayfa/${pageNumber}`;
}

export function generateMetaTags(data: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url: string;
  jobData?: JobListing;
  pageNumber?: number;
}): void {
  // Sayfa numarası varsa title'a ekle
  const pageTitle = data.pageNumber && data.pageNumber > 1 
    ? `${data.title} - Sayfa ${data.pageNumber} | İş İlanları 2025 | İsilanlarim.org`
    : `${data.title} | İş İlanları 2025 | İsilanlarim.org`;
  
  // Update title and meta description
  document.title = pageTitle;
  
  const metaTags = {
    description: data.description.slice(0, 155) + '...',
    keywords: data.keywords?.join(', ') || '',
    'og:title': pageTitle,
    'og:description': data.description.slice(0, 155) + '...',
    'og:image': data.image || 'https://isilanlarim.org/default-og-image.jpg',
    'og:url': `https://isilanlarim.org${data.url}`,
    'og:type': data.jobData ? 'article' : 'website',
    'og:locale': 'tr_TR',
    'og:site_name': 'İsilanlarim.org',
    'twitter:card': 'summary_large_image',
    'twitter:title': pageTitle,
    'twitter:description': data.description.slice(0, 155) + '...',
    'twitter:image': data.image || 'https://isilanlarim.org/default-og-image.jpg',
    'twitter:site': '@isilanlarim',
    'robots': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    'googlebot': 'index, follow',
    'publisher': 'İsilanlarim.org',
    'revisit-after': '1 days',
    'author': 'İsilanlarim.org',
    'language': 'tr',
    'geo.region': 'TR',
    'geo.country': 'Turkey',
    'distribution': 'global',
    'rating': 'general',
    'copyright': 'İsilanlarim.org'
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

  // Add JobPosting schema for job listings
  if (data.jobData) {
    const jobSchema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": data.jobData.title,
      "description": data.jobData.description,
      "datePosted": new Date(data.jobData.createdAt).toISOString(),
      "validThrough": new Date(data.jobData.createdAt + (60 * 24 * 60 * 60 * 1000)).toISOString(), // 60 days
      "employmentType": data.jobData.type,
      "hiringOrganization": {
        "@type": "Organization",
        "name": data.jobData.company,
        "sameAs": "https://isilanlarim.org"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.jobData.location,
          "addressCountry": "TR"
        }
      },
      "baseSalary": data.jobData.salary ? {
        "@type": "MonetaryAmount",
        "currency": "TRY",
        "value": {
          "@type": "QuantitativeValue",
          "value": data.jobData.salary,
          "unitText": "MONTH"
        }
      } : undefined,
      "industry": data.jobData.category,
      "occupationalCategory": data.jobData.subCategory,
      "educationRequirements": data.jobData.educationLevel,
      "experienceRequirements": data.jobData.experience,
      "applicationContact": {
        "@type": "ContactPoint",
        "email": data.jobData.contactEmail,
        "telephone": data.jobData.contactPhone
      },
      "url": `https://isilanlarim.org${data.url}`,
      "identifier": {
        "@type": "PropertyValue",
        "name": "Job ID",
        "value": data.jobData.id
      }
    };

    let scriptElement = document.querySelector('script[type="application/ld+json"][data-job]');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-job', 'true');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(jobSchema);
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
  breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);

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
  websiteScript.textContent = JSON.stringify(websiteSchema);
}