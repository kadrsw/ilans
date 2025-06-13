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

exports.handler = async (event, context) => {
  try {
    const jobsRef = ref(db, 'jobs');
    const snapshot = await get(jobsRef);

    const urls = [];
    const SITE_URL = 'https://isilanlarim.org';

    if (snapshot.exists()) {
      const jobs = [];
      snapshot.forEach((childSnapshot) => {
        const job = childSnapshot.val();
        const jobId = childSnapshot.key;

        if (job.status === 'active') {
          jobs.push({
            id: jobId,
            ...job
          });
        }
      });

      // İlanları tarihe göre sırala (yeni olanlar önce)
      jobs.sort((a, b) => {
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt;
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt;
        return bTime - aTime;
      });

      // Her ilan için URL oluştur
      jobs.forEach(job => {
        let lastmodDate;
        if (job.updatedAt && job.updatedAt.seconds) {
          lastmodDate = new Date(job.updatedAt.seconds * 1000);
        } else if (job.updatedAt) {
          lastmodDate = new Date(job.updatedAt);
        } else if (job.createdAt && job.createdAt.seconds) {
          lastmodDate = new Date(job.createdAt.seconds * 1000);
        } else {
          lastmodDate = new Date(job.createdAt || Date.now());
        }
        const lastmod = lastmodDate.toISOString();

        const slug = generateSlug(job.title);

        urls.push(`
    <url>
      <loc>${SITE_URL}/ilan/${slug}/${job.id}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`);
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // 1 saat cache
        'X-Robots-Tag': 'noindex' // Sitemap'in kendisini indexleme
      },
      body: sitemap
    };

  } catch (error) {
    console.error('Sitemap generation error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap -->
</urlset>`
    };
  }
};