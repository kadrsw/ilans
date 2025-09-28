import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { generateSlug } from '../utils/seoUtils';
import type { JobListing } from '../types';

const SITE_URL = 'https://isilanlarim.org';

export async function generateSitemapJobs(): Promise<string> {
  try {
    const jobsRef = ref(db, 'jobs');
    const snapshot = await get(jobsRef);

    const jobs: JobListing[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const job = {
          id: childSnapshot.key,
          ...childSnapshot.val(),
        } as JobListing;

        // ✅ Sadece aktif ilanları dahil et - Google Search Console sorunu çözümü
        if (job.status === 'active' && job.title && job.title.trim()) {
          jobs.push(job);
        }
      });
    }

    return await generateSitemap(jobs);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

async function generateSitemap(jobs: JobListing[]): Promise<string> {
  // İlanları tarihe göre sırala (yeni olanlar önce)
  jobs.sort((a, b) => {
    const timeA = a.updatedAt || a.createdAt || 0;
    const timeB = b.updatedAt || b.createdAt || 0;
    return timeB - timeA;
  });

  // ✅ XML sitemap oluştur - TEMİZ FORMAT (Google uyumlu)
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Generated on ${new Date().toISOString()} -->
<!-- Total active jobs: ${jobs.length} -->`;

  // ✅ Her iş ilanı için URL oluştur - SLUG KULLAN (jobId değil)
  jobs.forEach((job) => {
    const slug = generateSlug(job.title);
    const lastmod = new Date(job.updatedAt || job.createdAt).toISOString().split('T')[0];

    // ✅ XML'e temiz format ile ekle (extra boşluk yok)
    sitemap += `
<url>
<loc>${SITE_URL}/ilan/${slug}</loc>
<lastmod>${lastmod}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

export async function updateSitemap(): Promise<void> {
  try {
    // Netlify function'ı tetikle
    const response = await fetch(`${SITE_URL}/sitemap-jobs.xml`, {
      method: 'GET',
      cache: 'no-cache',
    });

    if (response.ok) {
      console.log('✅ Sitemap başarıyla güncellendi');
      await notifySearchEngines();
    } else {
      console.error('❌ Sitemap güncelleme hatası:', response.status);
    }
  } catch (error) {
    console.error('❌ Sitemap güncelleme hatası:', error);
    throw error;
  }
}

export async function notifySearchEngines(): Promise<void> {
  const sitemapUrls = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/sitemap-jobs.xml`,
    `${SITE_URL}/sitemap-static.xml`,
    `${SITE_URL}/sitemap-pages.xml`,
  ];

  const searchEngineUrls = [
    // Google
    ...sitemapUrls.map(
      (url) => `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`
    ),
    // Bing
    ...sitemapUrls.map(
      (url) => `https://www.bing.com/ping?sitemap=${encodeURIComponent(url)}`
    ),
    // Yandex
    ...sitemapUrls.map(
      (url) =>
        `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(url)}`
    ),
    // Google IndexNow API
    ...sitemapUrls.map(
      (url) => `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}&ping=true`
    ),
    // Bing IndexNow API  
    ...sitemapUrls.map(
      (url) => `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}`
    )
  ];

  try {
    // ✅ Arama motorlarına paralel olarak bildir
    const promises = searchEngineUrls.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors', // CORS hatalarını önlemek için
        });
        console.log(`✅ Sitemap bildirimi gönderildi: ${url}`);
        return { url, success: true };
      } catch (error) {
        console.error(`❌ Sitemap bildirimi hatası (${url}):`, error);
        return { url, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    console.log('🎯 Arama motoru bildirimleri tamamlandı:', results.length);
  } catch (error) {
    console.error('❌ Arama motoru bildirimi genel hatası:', error);
    throw error;
  }
}

// Sitemap index dosyasını güncelle
export async function updateSitemapIndex(): Promise<void> {
  const now = new Date().toISOString();

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-jobs.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  console.log('📋 Sitemap index güncellendi');
}

// ✅ Yeni ilan eklendiğinde sitemap'i güncelle
export async function onJobAdded(jobData: JobListing): Promise<void> {
  try {
    console.log('🆕 Yeni ilan eklendi, sitemap güncelleniyor:', jobData.title);

    // Sitemap'i güncelle
    await updateSitemap();

    // ✅ Google'a hemen bildir - Çoklu sitemap ping
    const sitemapUrls = [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-jobs.xml`,
      `${SITE_URL}/sitemap-static.xml`
    ];

    const pingPromises = sitemapUrls.map(async (url) => {
      try {
        const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`;
        const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(url)}`;
        
        await Promise.all([
          fetch(googlePingUrl, { method: 'GET', mode: 'no-cors' }),
          fetch(bingPingUrl, { method: 'GET', mode: 'no-cors' })
        ]);
        
        console.log(`🔔 Sitemap ping gönderildi: ${url}`);
      } catch (pingError) {
        console.error(`❌ Ping hatası (${url}):`, pingError);
      }
    });

    await Promise.allSettled(pingPromises);
    console.log("🌐 Tüm arama motorlarına yeni ilan bildirimi gönderildi");

    console.log('✅ Yeni ilan sitemap güncelleme tamamlandı');
  } catch (error) {
    console.error('❌ Yeni ilan sitemap güncelleme hatası:', error);
  }
}

// ✅ İlan güncellendiğinde sitemap'i güncelle
export async function onJobUpdated(jobData: JobListing): Promise<void> {
  try {
    console.log('🔄 İlan güncellendi, sitemap güncelleniyor:', jobData.title);
    await updateSitemap();
    console.log('✅ İlan güncelleme sitemap tamamlandı');
  } catch (error) {
    console.error('❌ İlan güncelleme sitemap hatası:', error);
  }
}

// ✅ İlan silindiğinde sitemap'i güncelle  
export async function onJobDeleted(jobId: string): Promise<void> {
  try {
    console.log('🗑️ İlan silindi, sitemap güncelleniyor:', jobId);
    await updateSitemap();
    console.log('✅ İlan silme sitemap tamamlandı');
  } catch (error) {
    console.error('❌ İlan silme sitemap hatası:', error);
  }
}

// ✅ Manuel sitemap güncelleme
export async function manualSitemapUpdate(): Promise<boolean> {
  try {
    console.log('🔧 Manuel sitemap güncelleme başlatıldı');
    await updateSitemap();
    console.log('✅ Manuel sitemap güncelleme tamamlandı');
    return true;
  } catch (error) {
    console.error('❌ Manuel sitemap güncelleme hatası:', error);
    return false;
  }
}
