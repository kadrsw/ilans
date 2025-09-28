// netlify/functions/sitemap-jobs.js
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

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

// ✅ XML escape fonksiyonu - Özel karakterleri encode et
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

exports.handler = async (event, context) => {
  try {
    console.log('🗺️ Sitemap function başlatıldı...');
    
    const jobsRef = ref(database, 'jobs');
    console.log('📊 Firebase\'den veri çekiliyor...');
    
    const snapshot = await get(jobsRef);
    
    if (!snapshot.exists()) {
      console.log('⚠️ Hiç iş ilanı bulunamadı');
      
      // ✅ TEMİZ XML - Encoding sorunu olmayacak
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Total active jobs: 0 -->
</urlset>`;

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        },
        body: emptyXml.trim() // ✅ Extra boşlukları temizle
      };
    }

    const jobs = snapshot.val();
    console.log(`📋 Toplam ilan sayısı: ${Object.keys(jobs).length}`);
    
    // Aktif ilanları filtrele ve sırala
    const activeJobs = Object.entries(jobs)
      .filter(([_, job]) => {
        return job && 
               job.status === 'active' && 
               job.title && 
               job.title.trim() &&
               job.title.length > 0;
      })
      .sort(([,a], [,b]) => {
        const timeA = a.updatedAt || a.createdAt || 0;
        const timeB = b.updatedAt || b.createdAt || 0;
        return timeB - timeA; // Yeni ilanlar önce
      });
    
    console.log(`✅ Aktif ilan sayısı: ${activeJobs.length}`);

    if (activeJobs.length === 0) {
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Total jobs: ${Object.keys(jobs).length} -->
<!-- Active jobs: 0 -->
</urlset>`;

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        },
        body: emptyXml.trim()
      };
    }

    // ✅ XML sitemap oluştur - ENCODING SORUNU ÇÖZÜMÜ
    const xmlParts = [];
    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlParts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    xmlParts.push(`<!-- Generated on ${new Date().toISOString()} -->`);
    xmlParts.push(`<!-- Total active jobs: ${activeJobs.length} -->`);

    // Her aktif ilan için URL ekle
    activeJobs.forEach(([jobId, job]) => {
      // ✅ Slug oluştur ve XML escape et
      const slug = createSlug(job.title);
      const lastModDate = job.updatedAt || job.createdAt 
        ? new Date(job.updatedAt || job.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      // ✅ XML güvenli URL oluştur
      const url = `https://isilanlarim.org/ilan/${escapeXml(slug)}`;
      
      xmlParts.push('<url>');
      xmlParts.push(`<loc>${url}</loc>`);
      xmlParts.push(`<lastmod>${lastModDate}</lastmod>`);
      xmlParts.push('<changefreq>weekly</changefreq>');
      xmlParts.push('<priority>0.8</priority>');
      xmlParts.push('</url>');
    });

    xmlParts.push('</urlset>');

    // ✅ Final XML - Temiz birleştirme
    const finalXml = xmlParts.join('\n');

    console.log(`🎉 Sitemap oluşturuldu: ${activeJobs.length} ilan eklendi`);
    console.log(`📏 XML uzunluğu: ${finalXml.length} karakter`);

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
      body: finalXml
    };

  } catch (error) {
    console.error('❌ Sitemap function hatası:', error);
    
    // ✅ Hata durumunda bile geçerli XML döndür
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Error: ${escapeXml(error.message)} -->
<!-- Total active jobs: 0 -->
</urlset>`;
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      },
      body: errorXml
    };
  }
};
