import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

admin.initializeApp();

const ADMIN_EMAIL = "acikadir1@gmail.com";
const USER_ID = "ADMIN_USER_ID";

// Kategori tespiti
function detectCategory(text: string): [string, string] {
  const categories: Record<string, [string, string]> = {
    'yazılım': ['teknoloji', 'yazilim-gelistirici'],
    'developer': ['teknoloji', 'yazilim-gelistirici'],
    'mühendis': ['muhendislik', 'muhendis'],
    'satış': ['ticaret', 'satis-temsilcisi'],
    'pazarlama': ['ticaret', 'pazarlama-uzmani'],
    'muhasebe': ['finans', 'muhasebeci'],
    'öğretmen': ['egitim', 'ogretmen'],
    'şoför': ['lojistik', 'sofor'],
    'garson': ['hizmet', 'garson'],
    'aşçı': ['hizmet', 'asci'],
    'temizlik': ['hizmet', 'temizlik'],
    'güvenlik': ['guvenlik', 'ozel-guvenlik'],
  };
  
  const textLower = text.toLowerCase();
  for (const [keyword, [cat, subcat]] of Object.entries(categories)) {
    if (textLower.includes(keyword)) {
      return [cat, subcat];
    }
  }
  return ['diger', 'custom'];
}

// Her gün sabah 9:00 ve akşam 17:00'de çalışacak
exports.scheduledJobScraping = functions.pubsub
  .schedule('0 9,17 * * *')
  .timeZone('Europe/Istanbul')
  .onRun(async (context) => {
    const db = admin.database();
    const jobsRef = db.ref('jobs');
    
    try {
      const sources = [
        'https://www.kariyer.net/is-ilanlari',
        'https://www.yenibiris.com/is-ilanlari',
        'https://www.secretcv.com/is-ilanlari'
      ];
      
      for (const url of sources) {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Her kaynaktan 2 ilan al
        $('.job-listing, .job-item, .listing-item').slice(0, 2).each(async (i, el) => {
          const title = $(el).find('h2, h3, .job-title').text().trim();
          const description = $(el).find('p, .job-description').text().trim();
          const company = $(el).find('.company, .company-name').text().trim();
          
          if (!title || !description || !company) return;
          
          const [category, subCategory] = detectCategory(title + ' ' + description);
          
          const job = {
            title: title.substring(0, 100),
            description: description.substring(0, 1000),
            company,
            location: 'Türkiye',
            type: 'Tam Zamanlı',
            category,
            subCategory,
            contactEmail: ADMIN_EMAIL,
            userId: USER_ID,
            createdAt: admin.database.ServerValue.TIMESTAMP,
            status: 'active'
          };
          
          // Duplicate kontrolü
          const snapshot = await jobsRef
            .orderByChild('title')
            .equalTo(job.title)
            .once('value');
            
          if (!snapshot.exists()) {
            await jobsRef.push(job);
            console.log(`Yeni ilan eklendi: ${job.title}`);
          }
        });
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // İlanlar eklendikten sonra sitemap'i otomatik güncelle
      await updateJobsSitemap();
      
      return null;
    } catch (error) {
      console.error('İş ilanları çekilirken hata:', error);
      return null;
    }
  });

// Netlify Build Hook URL'nizi buraya ekleyin
const NETLIFY_BUILD_HOOK = 'https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK_ID';

// Sitemap güncelleme fonksiyonu (yardımcı)
async function updateJobsSitemap(): Promise<void> {
  try {
    const db = admin.database();
    const jobsRef = db.ref('jobs');
    
    // Aktif iş ilanlarını al
    const snapshot = await jobsRef
      .orderByChild('status')
      .equalTo('active')
      .once('value');
    
    const jobs = snapshot.val() || {};
    const jobKeys = Object.keys(jobs);
    
    // Netlify build tetikle (sitemap güncellemesi için)
    if (jobKeys.length > 0) {
      try {
        await fetch(NETLIFY_BUILD_HOOK, {
          method: 'POST'
        });
        console.log('Netlify build tetiklendi - sitemap güncellenecek');
      } catch (error) {
        console.error('Netlify build tetiklenemedi:', error);
      }
    }
    
    console.log(`Sitemap güncelleme işlemi başlatıldı. ${jobKeys.length} ilan var.`);
    
  } catch (error) {
    console.error('Sitemap güncellenirken hata:', error);
    throw error;
  }
}

// Manuel sitemap oluşturma fonksiyonu
exports.generateJobsSitemap = functions.https.onRequest(async (req, res) => {
  try {
    await updateJobsSitemap();
    
    const db = admin.database();
    const jobsRef = db.ref('jobs');
    const snapshot = await jobsRef
      .orderByChild('status')
      .equalTo('active')
      .once('value');
    
    const jobs = snapshot.val() || {};
    const jobCount = Object.keys(jobs).length;
    
    res.status(200).json({
      success: true,
      message: `Sitemap başarıyla oluşturuldu`,
      totalJobs: jobCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Sitemap oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Otomatik sitemap güncellemesi - her gün saat 10:00'da
exports.scheduledSitemapUpdate = functions.pubsub
  .schedule('0 10 * * *')
  .timeZone('Europe/Istanbul')
  .onRun(async (context) => {
    try {
      await updateJobsSitemap();
      console.log('Sitemap otomatik olarak güncellendi');
      return null;
    } catch (error) {
      console.error('Otomatik sitemap güncellemesi hatası:', error);
      return null;
    }
  });

// HTTP ile direkt sitemap servisi (alternatif)
exports.jobsSitemap = functions.https.onRequest(async (req, res) => {
  try {
    const db = admin.database();
    const jobsRef = db.ref('jobs');
    
    // Aktif iş ilanlarını al
    const snapshot = await jobsRef
      .orderByChild('status')
      .equalTo('active')
      .once('value');
    
    const jobs = snapshot.val() || {};
    const jobKeys = Object.keys(jobs);
    
    // XML oluştur
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${new Date().toISOString()} -->
  <!-- Total active jobs: ${jobKeys.length} -->`;

    jobKeys.forEach(jobId => {
      const job = jobs[jobId];
      const slug = job.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      const lastModDate = job.createdAt 
        ? new Date(job.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      xml += `
  <url>
    <loc>https://isilanlarim.org/job/${jobId}/${slug}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    // XML response
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
    
  } catch (error) {
    console.error('Sitemap servis hatası:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap oluşturulamadı</error>');
  }
});
