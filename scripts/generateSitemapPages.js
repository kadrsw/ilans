const fs = require('fs');
const path = require('path');

// 466 ilan için sayfa sayısını hesapla (sayfa başına 20 ilan)
const totalJobs = 466;
const jobsPerPage = 20;
const totalPages = Math.ceil(totalJobs / jobsPerPage);

const SITE_URL = 'https://isilanlarim.org';
const currentDate = new Date().toISOString();

function generateSitemapPages() {
  const urls = [];

  // Ana sayfa sayfalama URL'leri (2'den başla, 1. sayfa ana sayfa)
  for (let page = 2; page <= totalPages; page++) {
    urls.push(`
  <url>
    <loc>${SITE_URL}/sayfa/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${currentDate}</lastmod>
  </url>`);
  }

  // Kategori sayfalama URL'leri
  const categories = ['teknoloji', 'egitim', 'saglik', 'insaat', 'finans', 'ticaret', 'lojistik'];
  categories.forEach(category => {
    for (let page = 2; page <= 5; page++) { // Her kategori için 5 sayfa
      urls.push(`
  <url>
    <loc>${SITE_URL}/is-ilanlari/${category}/sayfa/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${currentDate}</lastmod>
  </url>`);
    }
  });

  // Şehir sayfalama URL'leri
  const cities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya'];
  cities.forEach(city => {
    for (let page = 2; page <= 5; page++) { // Her şehir için 5 sayfa
      urls.push(`
  <url>
    <loc>${SITE_URL}/${city}-is-ilanlari/sayfa/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${currentDate}</lastmod>
  </url>`);
    }
  });

  // Özel sayfa sayfalama URL'leri
  const specialPages = [
    'yeni-is-ilanlari',
    'guncel-is-ilanlari', 
    'part-time-is-ilanlari',
    'remote-is-ilanlari',
    'freelance-is-ilanlari',
    'home-office-is-ilanlari'
  ];
  
  specialPages.forEach(page => {
    for (let pageNum = 2; pageNum <= 3; pageNum++) { // Her özel sayfa için 3 sayfa
      urls.push(`
  <url>
    <loc>${SITE_URL}/${page}/sayfa/${pageNum}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${currentDate}</lastmod>
  </url>`);
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sayfalama URL'leri - Toplam ${totalPages} sayfa için -->
  ${urls.join('')}
</urlset>`;

  return sitemap;
}

// Sitemap dosyasını oluştur
const sitemapContent = generateSitemapPages();
const outputPath = path.join(__dirname, '..', 'public', 'sitemap-pages.xml');

fs.writeFileSync(outputPath, sitemapContent, 'utf8');
console.log(`✅ sitemap-pages.xml oluşturuldu: ${outputPath}`);
console.log(`📊 Toplam ${totalPages} sayfa için sayfalama URL'leri eklendi`);