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

      return null;
    } catch (error) {
      console.error('İş ilanları çekilirken hata:', error);
      return null;
    }
  });