import { ref, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database';
import { db } from '../lib/firebase';
import { generateSlug } from './seoUtils';
import { JobListing } from '../types';
import { XMLBuilder } from 'fast-xml-parser';

const SITE_URL = 'https://isilanlarim.org';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export async function generateSitemap(jobs: JobListing[]): Promise<string> {
  const urls: SitemapURL[] = [
    {
      loc: SITE_URL,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${SITE_URL}/cv-olustur`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    }
  ];

  // Add job listings
  jobs.forEach(job => {
    if (job.status === 'active') {
      const slug = generateSlug(job.title);
      urls.push({
        loc: `${SITE_URL}/ilan/${slug}/${job.id}`,
        lastmod: new Date(job.updatedAt || job.createdAt).toISOString(),
        changefreq: 'daily',
        priority: '0.9'
      });
    }
  });

  const builder = new XMLBuilder({
    arrayNodeName: 'url',
    format: true
  });

  const sitemap = builder.build({
    urlset: {
      '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      url: urls
    }
  });

  return '<?xml version="1.0" encoding="UTF-8"?>\n' + sitemap;
}

export async function initSitemapListener() {
  const jobsRef = ref(db, 'jobs');

  // Listen for new jobs
  onChildAdded(jobsRef, async (snapshot) => {
    const job = snapshot.val() as JobListing;
    if (job.status === 'active') {
      await notifySearchEngines();
    }
  });

  // Listen for job updates
  onChildChanged(jobsRef, async (snapshot) => {
    const job = snapshot.val() as JobListing;
    if (job.status === 'active') {
      await notifySearchEngines();
    }
  });

  // Listen for job removals
  onChildRemoved(jobsRef, async () => {
    await notifySearchEngines();
  });
}

async function notifySearchEngines() {
  const urls = [
    `https://www.google.com/ping?sitemap=${SITE_URL}/sitemap.xml`,
    `https://www.bing.com/ping?sitemap=${SITE_URL}/sitemap.xml`
  ];

  try {
    await Promise.all(urls.map(url => 
      fetch(url, { method: 'GET' })
    ));
    console.log('Search engines notified successfully');
  } catch (error) {
    console.error('Error notifying search engines:', error);
  }
}