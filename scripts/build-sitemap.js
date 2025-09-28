// scripts/build-sitemap.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAUmnb0K1M6-U8uzSsYVpTxAAdXdU8I--o",
  authDomain: "btc3-d7d9b.firebaseapp.com",
  databaseURL: "https://btc3-d7d9b-default-rtdb.firebaseio.com",
  projectId: "btc3-d7d9b",
  storageBucket: "btc3-d7d9b.firebasestorage.app",
  messagingSenderId: "444798129246",
  appId: "1:444798129246:web:b5c9c03ab05c4303e310cf",
  measurementId: "G-RKW8HDW9EL"
};

async function generateJobsSitemap() {
  try {
    console.log('🔥 Firebase bağlantısı kuruluyor...');
    
    // Firebase'i başlat
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    
    // Tüm iş ilanlarını al ve client-side'da filtrele
    const jobsRef = ref(database, 'jobs');
    
    console.log('📊 İş ilanları getiriliyor...');
    const snapshot = await get(jobsRef);
    
    if (!snapshot.exists()) {
      console.log('⚠️  Aktif iş ilanı bulunamadı');
      
      // Boş sitemap oluştur
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${new Date().toISOString()} -->
  <!-- Total active jobs: 0 -->
</urlset>`;
      
      saveSitemap(emptyXml);
      return;
    }
    
    const jobs = snapshot.val();
    
    if (!jobs) {
      console.log('⚠️  Hiç iş ilanı bulunamadı');
      
      // Boş sitemap oluştur
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${new Date().toISOString()} -->
  <!-- Total active jobs: 0 -->
</urlset>`;
      
      saveSitemap(emptyXml);
      return;
    }
    
    // Aktif ilanları filtrele
    const jobEntries = Object.entries(jobs).filter(([_, job]) => job.status === 'active');
    
    console.log(`✅ ${jobEntries.length} aktif ilan bulundu`);
    
    // XML header
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${new Date().toISOString()} -->
  <!-- Total active jobs: ${jobEntries.length} -->
  
  <!-- İş İlanları -->`;

    // Her iş ilanı için URL ekle
    jobEntries.forEach(([jobId, job]) => {
      const slug = createSlug(job.title);
      const lastModDate = job.createdAt 
        ? new Date(job.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      xml += `
  <url>
    <loc>https://isilanlarim.org/ilan/${jobId}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    saveSitemap(xml);
    console.log(`🎉 Sitemap başarıyla oluşturuldu! ${jobEntries.length} ilan eklendi.`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Hata durumunda boş sitemap oluştur
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${new Date().toISOString()} -->
  <!-- Total active jobs: 0 -->
  <!-- Error: ${error.message} -->
</urlset>`;
    
    saveSitemap(errorXml);
    process.exit(1);
  }
}

function createSlug(title) {
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

function saveSitemap(xmlContent) {
  const distDir = join(process.cwd(), 'dist');
  const publicDir = join(process.cwd(), 'public');
  
  // public klasörüne kaydet (geliştirme için)
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
  writeFileSync(join(publicDir, 'sitemap-jobs.xml'), xmlContent, 'utf8');
  
  // dist klasörüne kaydet (production için)
  if (existsSync(distDir)) {
    writeFileSync(join(distDir, 'sitemap-jobs.xml'), xmlContent, 'utf8');
  }
}

// Script'i çalıştır
generateJobsSitemap();
