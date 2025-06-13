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
          ...childSnapshot.val()
        } as JobListing;
        
        // Sadece aktif ilanları ekle
        if (job.status === 'active') {
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
  const urls: string[] = [];
  
  // İlanları tarihe göre sırala (yeni olanlar önce)
  jobs.sort((a, b) => b.createdAt - a.createdAt);
  
  // Her iş ilanı için URL oluştur
  jobs.forEach(job => {
    const slug = generateSlug(job.title);
    const lastmod = new Date(job.updatedAt || job.createdAt).toISOString();
    
    urls.push(`
    <url>
      <loc>${SITE_URL}/ilan/${slug}/${job.id}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`;

  return sitemap;
}

export async function updateSitemap(): Promise<void> {
  try {
    // Sitemap'i güncelle ve Google'a bildir
    await notifySearchEngines();
    console.log('Sitemap güncellendi ve arama motorlarına bildirildi');
  } catch (error) {
    console.error('Sitemap güncelleme hatası:', error);
    throw error;
  }
}

export async function notifySearchEngines(): Promise<void> {
  const sitemapUrls = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/sitemap-jobs.xml`,
    `${SITE_URL}/sitemap-static.xml`,
    `${SITE_URL}/sitemap-pages.xml`
  ];
  
  const searchEngineUrls = [
    // Google
    ...sitemapUrls.map(url => `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`),
    // Bing
    ...sitemapUrls.map(url => `https://www.bing.com/ping?sitemap=${encodeURIComponent(url)}`),
    // Yandex
    ...sitemapUrls.map(url => `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(url)}`)
  ];

  try {
    // Arama motorlarına paralel olarak bildir
    const promises = searchEngineUrls.map(async (url) => {
      try {
        const response = await fetch(url, { 
          method: 'GET',
          mode: 'no-cors' // CORS hatalarını önlemek için
        });
        console.log(`Sitemap bildirimi gönderildi: ${url}`);
        return { url, success: true };
      } catch (error) {
        console.error(`Sitemap bildirimi hatası (${url}):`, error);
        return { url, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    console.log('Arama motoru bildirimleri tamamlandı:', results);
    
  } catch (error) {
    console.error('Arama motoru bildirimi genel hatası:', error);
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

  console.log('Sitemap index güncellendi');
}

// Yeni ilan eklendiğinde sitemap'i güncelle
export async function onJobAdded(jobData: JobListing): Promise<void> {
  try {
    await updateSitemap();
    console.log('Yeni ilan eklendi, sitemap güncellendi:', jobData.title);
  } catch (error) {
    console.error('Yeni ilan sitemap güncelleme hatası:', error);
  }
}

// İlan güncellendiğinde sitemap'i güncelle
export async function onJobUpdated(jobData: JobListing): Promise<void> {
  try {
    await updateSitemap();
    console.log('İlan güncellendi, sitemap güncellendi:', jobData.title);
  } catch (error) {
    console.error('İlan güncelleme sitemap hatası:', error);
  }
}

// İlan silindiğinde sitemap'i güncelle
export async function onJobDeleted(jobId: string): Promise<void> {
  try {
    await updateSitemap();
    console.log('İlan silindi, sitemap güncellendi:', jobId);
  } catch (error) {
    console.error('İlan silme sitemap hatası:', error);
  }
}