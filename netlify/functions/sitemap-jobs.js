// src/services/sitemapService.ts - Güncellenmiş

const firebaseConfig = {
  apiKey: "AIzaSyAUmnb0K1M6-U8uzSsYVpTxAAdXdU8I--o",
  authDomain: "btc3-d7d9b.firebaseapp.com",
  databaseURL: "https://btc3-d7d9b-default-rtdb.firebaseio.com",
  projectId: "btc3-d7d9b",
  storageBucket: "btc3-d7d9b.firebasestorage.app",
  messagingSenderId: "444798129246",
  appId: "1:444798129246:web:b5c9c03ab05c4303e310cf"
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const database = getDatabase(app);

function createSlug(title) {
  if (!title) return 'ilan';
  
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 100);
}

exports.handler = async (event, context) => {
  try {
    console.log('🗺️ Sitemap function başlatıldı...');
    
    const jobsRef = ref(database, 'jobs');
    console.log('📊 Firebase\'den veri çekiliyor...');
    
    const snapshot = await get(jobsRef);
    
    if (!snapshot.exists()) {
      console.log('⚠️ Hiç iş ilanı bulunamadı');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Total active jobs: 0 -->
</urlset>`
      };
    }

    const jobs = snapshot.val();
    console.log(`📋 Toplam ilan sayısı: ${Object.keys(jobs).length}`);
    
    // Aktif ilanları filtrele ve sırala
    const activeJobs = Object.entries(jobs)
      .filter(([_, job]) => job && job.status === 'active' && job.title && job.title.trim())
      .sort(([,a], [,b]) => {
        const timeA = a.updatedAt || a.createdAt || 0;
        const timeB = b.updatedAt || b.createdAt || 0;
        return timeB - timeA; // Yeni ilanlar önce
      });
    
    console.log(`✅ Aktif ilan sayısı: ${activeJobs.length}`);

    if (activeJobs.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Total jobs: ${Object.keys(jobs).length} -->
<!-- Active jobs: 0 -->
</urlset>`
      };
    }

    // XML sitemap oluştur - TEMİZ FORMAT
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Total active jobs: ${activeJobs.length} -->`;

    // Her aktif ilan için URL ekle - SLUG KULLAN
    activeJobs.forEach(([jobId, job]) => {
      const slug = createSlug(job.title);
      const lastModDate = job.updatedAt || job.createdAt 
        ? new Date(job.updatedAt || job.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      // XML'e temiz format ile ekle (extra boşluk yok)
      xml += `
<url>
<loc>https://isilanlarim.org/ilan/${slug}</loc>
<lastmod>${lastModDate}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>`;
    });

    xml += `
</urlset>`;

    console.log(`🎉 Sitemap oluşturuldu: ${activeJobs.length} ilan eklendi`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'index, follow',
        'Access-Control-Allow-Origin': '*',
        'X-Total-Jobs': Object.keys(jobs).length.toString(),
        'X-Active-Jobs': activeJobs.length.toString(),
        'X-Generated-At': new Date().toISOString()
      },
      body: xml
    };

  } catch (error) {
    console.error('❌ Sitemap function hatası:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Error: ${error.message} -->
<!-- Total active jobs: 0 -->
</urlset>`
    };
  }
};
