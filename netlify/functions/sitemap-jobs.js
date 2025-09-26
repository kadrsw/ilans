const { ref, get } = require('firebase/database');
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyAUmnb0K1M6-U8uzSsYVpTxAAdXdU8I--o",
  authDomain: "btc3-d7d9b.firebaseapp.com",
  databaseURL: "https://btc3-d7d9b-default-rtdb.firebaseio.com",
  projectId: "btc3-d7d9b",
  storageBucket: "btc3-d7d9b.firebasestorage.app",
  messagingSenderId: "444798129246",
  appId: "1:444798129246:web:b5c9c03ab05c4303e310cf"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function generateSlug(text) {
  if (!text) return 'ilan';
  
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

function parseTimestamp(timestamp) {
  if (!timestamp) return new Date();
  
  // Handle different timestamp formats
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  if (typeof timestamp === 'object' && timestamp !== null) {
    // Firebase ServerValue.TIMESTAMP or Firestore Timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
      return new Date(timestamp.toMillis());
    }
  }
  
  // Fallback
  return new Date(timestamp);
}

exports.handler = async (event, context) => {
  try {
    console.log('Sitemap jobs generation started...');
    
    const jobsRef = ref(db, 'jobs');
    const snapshot = await get(jobsRef);

    const urls = [];
    const SITE_URL = 'https://isilanlarim.org';
    let totalJobs = 0;
    let activeJobs = 0;

    if (snapshot.exists()) {
      const allJobs = [];
      
      // Tüm ilanları topla
      snapshot.forEach((childSnapshot) => {
        const job = childSnapshot.val();
        const jobId = childSnapshot.key;
        
        totalJobs++;
        
        // Sadece aktif ilanları işle
        if (job && job.status === 'active') {
          activeJobs++;
          
          // Eksik alanları kontrol et ve varsayılan değerler ata
          const jobData = {
            id: jobId,
            title: job.title || 'İş İlanı',
            company: job.company || 'Şirket',
            location: job.location || 'Türkiye',
            category: job.category || 'diger',
            createdAt: job.createdAt || Date.now(),
            updatedAt: job.updatedAt || job.createdAt || Date.now(),
            status: job.status
          };
          
          allJobs.push(jobData);
        }
      });

      console.log(`Total jobs found: ${totalJobs}, Active jobs: ${activeJobs}`);

      // İlanları tarihe göre sırala (yeni olanlar önce)
      allJobs.sort((a, b) => {
        const timeA = a.updatedAt || a.createdAt || 0;
        const timeB = b.updatedAt || b.createdAt || 0;
        return timeB - timeA;
      });

      // Her ilan için URL oluştur
      allJobs.forEach((job, index) => {
        try {
          const slug = generateSlug(job.title);
          const lastmodDate = parseTimestamp(job.updatedAt || job.createdAt);
          const lastmod = lastmodDate.toISOString();

          // URL'yi oluştur
          const jobUrl = `${SITE_URL}/ilan/${slug}`;
          
          urls.push(`
    <url>
      <loc>${jobUrl}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`);

          // İlk 10 ilanı logla
          if (index < 10) {
            console.log(`Job ${index + 1}: ${job.title} - ${jobUrl}`);
          }
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
        }
      });
    }

    console.log(`Generated ${urls.length} URLs for sitemap`);

    // Sitemap XML'ini oluştur
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${new Date().toISOString()} -->
  <!-- Total active jobs: ${activeJobs} -->
  ${urls.join('')}
</urlset>`;

    // Google'a sitemap güncellemesini bildir
    try {
      const pingUrls = [
        `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap-jobs.xml')}`,
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap-jobs.xml')}`
      ];

      // Ping işlemlerini paralel olarak yap
      const pingPromises = pingUrls.map(async (url) => {
        try {
          const response = await fetch(url, { 
            method: 'GET',
            timeout: 5000 
          });
          console.log(`Pinged search engine: ${url} - Status: ${response.status}`);
          return { url, success: true, status: response.status };
        } catch (error) {
          console.error(`Failed to ping: ${url}`, error);
          return { url, success: false, error: error.message };
        }
      });

      await Promise.allSettled(pingPromises);
    } catch (pingError) {
      console.error('Error pinging search engines:', pingError);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // 30 dakika cache
        'X-Robots-Tag': 'noindex',
        'Access-Control-Allow-Origin': '*',
        'X-Total-Jobs': totalJobs.toString(),
        'X-Active-Jobs': activeJobs.toString(),
        'X-Generated-At': new Date().toISOString()
      },
      body: sitemap
    };

  } catch (error) {
    console.error('Sitemap generation error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap: ${error.message} -->
  <!-- Generated on ${new Date().toISOString()} -->
</urlset>`
    };
  }
};