import { ref, get } from 'firebase/database';
import { db } from '../src/lib/firebase';
import { generateSlug } from '../src/utils/seoUtils';
import fs from 'fs';
import path from 'path';
import { XMLBuilder } from 'fast-xml-parser';
import type { JobListing } from '../src/types';

const SITE_URL = 'https://isilanlarim.org';

async function generateSitemap() {
  try {
    // Fetch all active jobs
    const jobsRef = ref(db, 'jobs');
    const snapshot = await get(jobsRef);
    
    const urls = [];
    
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
      snapshot.forEach((childSnapshot) => {
        const job = childSnapshot.val() as JobListing;
        const jobId = childSnapshot.key;
        
        if (job.status === 'active') {
          const slug = generateSlug(job.title);
          urls.push({
            loc: `${SITE_URL}/ilan/${slug}/${jobId}`,
            lastmod: new Date(job.updatedAt || job.createdAt).toISOString(),
            changefreq: 'daily',
            priority: '0.8'
          });
        }
      });
    }

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
    fs.writeFileSync(sitemapPath, '<?xml version="1.0" encoding="UTF-8"?>\n' + sitemap);

    console.log('✅ sitemap-jobs.xml generated successfully');

    // Update sitemap index
    const sitemapIndex = builder.build({
      sitemapindex: {
        '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        sitemap: [
          {
            loc: `${SITE_URL}/sitemap-static.xml`,
            lastmod: new Date().toISOString()
          },
          {
            loc: `${SITE_URL}/sitemap-jobs.xml`,
            lastmod: new Date().toISOString()
          }
        ]
      }
    });

    const indexPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(indexPath, '<?xml version="1.0" encoding="UTF-8"?>\n' + sitemapIndex);

    console.log('✅ sitemap.xml updated successfully');

  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();