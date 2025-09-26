import { ref, get } from 'firebase/database';
import { db } from '../src/lib/firebase';
import { generateSlug } from '../src/utils/seoUtils';
import fs from 'fs';
import path from 'path';
import { XMLBuilder } from 'fast-xml-parser';
import type { JobListing } from '../src/types';

const SITE_URL = 'https://isilanlarim.org';

// Güvenli tarih dönüştürme fonksiyonu
function safeTimestampToISO(timestamp: any): string {
  try {
    // Null veya undefined kontrolü
    if (timestamp === null || timestamp === undefined) {
      return new Date().toISOString();
    }

    let numericTimestamp: number;

    // Timestamp türünü kontrol et ve dönüştür
    if (typeof timestamp === 'number') {
      numericTimestamp = timestamp;
    } else if (typeof timestamp === 'string') {
      numericTimestamp = parseInt(timestamp, 10);
    } else if (typeof timestamp === 'object' && timestamp !== null) {
      // Firebase ServerValue.TIMESTAMP veya Firestore Timestamp
      if (timestamp.seconds && typeof timestamp.seconds === 'number') {
        numericTimestamp = timestamp.seconds * 1000;
      } else if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
        numericTimestamp = timestamp.toMillis();
      } else {
        // Bilinmeyen obje türü için varsayılan değer
        return new Date().toISOString();
      }
    } else {
      // Diğer tüm türler için varsayılan değer
      return new Date().toISOString();
    }

    // Sayısal değeri doğrula
    if (isNaN(numericTimestamp) || !isFinite(numericTimestamp) || numericTimestamp <= 0) {
      return new Date().toISOString();
    }

    // Çok büyük veya çok küçük değerleri kontrol et
    if (numericTimestamp > Date.now() + (365 * 24 * 60 * 60 * 1000)) {
      // Gelecekte 1 yıldan fazla ise şu anki zamanı kullan
      return new Date().toISOString();
    }

    if (numericTimestamp < new Date('2020-01-01').getTime()) {
      // 2020'den önce ise şu anki zamanı kullan
      return new Date().toISOString();
    }

    // Date objesi oluştur ve doğrula
    const date = new Date(numericTimestamp);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }

    return date.toISOString();
  } catch (error) {
    console.error('Tarih dönüştürme hatası:', error);
    return new Date().toISOString();
  }
}

async function generateSitemap() {
  try {
    console.log('Sitemap oluşturma başladı...');
    
    // Fetch all active jobs
    const jobsRef = ref(db, 'jobs');
    const snapshot = await get(jobsRef);
    
    const urls = [];
    let totalJobs = 0;
    let activeJobs = 0;
    
    // Add static URLs
    urls.push({
      loc: SITE_URL,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    });
    
    urls.push({
      loc: `${SITE_URL}/cv-olustur`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    });

    // Add job listings
    if (snapshot.exists()) {
      console.log('İş ilanları işleniyor...');
      
      snapshot.forEach((childSnapshot) => {
        try {
          const job = childSnapshot.val() as JobListing;
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
            
            // Slug oluştur
            const slug = generateSlug(jobData.title);
            
            // Güvenli tarih dönüştürme
            const lastmod = safeTimestampToISO(jobData.updatedAt || jobData.createdAt);
            
            urls.push({
              loc: `${SITE_URL}/ilan/${slug}`,
              lastmod: lastmod,
              changefreq: 'daily',
              priority: '0.9'
            });
          }
        } catch (jobError) {
          console.error(`İlan işlenirken hata (${childSnapshot.key}):`, jobError);
          // Hatalı ilanı atla ve devam et
        }
      });
    }

    console.log(`Toplam ${totalJobs} ilan bulundu, ${activeJobs} aktif ilan işlendi`);
    console.log(`Toplam ${urls.length} URL sitemap'e eklendi`);

    // Generate XML
    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false
    });

    const sitemap = builder.build({
      urlset: {
        '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        url: urls
      }
    });

    // Write to file
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-jobs.xml');
    const xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + sitemap;
    
    fs.writeFileSync(sitemapPath, xmlContent);
    console.log('✅ sitemap-jobs.xml başarıyla oluşturuldu');

    // Update sitemap index
    const currentDate = new Date().toISOString();
    const sitemapIndex = builder.build({
      sitemapindex: {
        '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        sitemap: [
          {
            loc: `${SITE_URL}/sitemap-static.xml`,
            lastmod: currentDate
          },
          {
            loc: `${SITE_URL}/sitemap-jobs.xml`,
            lastmod: currentDate
          },
          {
            loc: `${SITE_URL}/sitemap-pages.xml`,
            lastmod: currentDate
          }
        ]
      }
    });

    const indexPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const indexContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + sitemapIndex;
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ sitemap.xml index dosyası güncellendi');

    console.log('🎉 Sitemap oluşturma tamamlandı!');

  } catch (error) {
    console.error('❌ Sitemap oluşturma hatası:', error);
    
    // Hata durumunda boş bir sitemap oluştur
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/cv-olustur</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-jobs.xml');
    fs.writeFileSync(sitemapPath, fallbackSitemap);
    
    console.log('⚠️ Fallback sitemap oluşturuldu');
    process.exit(1);
  }
}

generateSitemap();