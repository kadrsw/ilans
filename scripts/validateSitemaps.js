const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

function validateXML(filePath) {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    
    // XML parser options
    const options = {
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false
    };
    
    const parser = new XMLParser(options);
    const result = parser.parse(xmlContent);
    
    console.log(`✅ ${path.basename(filePath)} - Geçerli XML formatı`);
    
    // URL sayısını kontrol et
    if (result.urlset && result.urlset.url) {
      const urlCount = Array.isArray(result.urlset.url) ? result.urlset.url.length : 1;
      console.log(`   📊 ${urlCount} URL bulundu`);
    }
    
    if (result.sitemapindex && result.sitemapindex.sitemap) {
      const sitemapCount = Array.isArray(result.sitemapindex.sitemap) ? result.sitemapindex.sitemap.length : 1;
      console.log(`   📊 ${sitemapCount} sitemap referansı bulundu`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} - XML formatı hatası:`, error.message);
    return false;
  }
}

function validateSitemaps() {
  console.log('🔍 Sitemap dosyaları doğrulanıyor...\n');
  
  const sitemapFiles = [
    'public/sitemap.xml',
    'public/sitemap-static.xml', 
    'public/sitemap-pages.xml'
  ];
  
  let allValid = true;
  
  sitemapFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const isValid = validateXML(filePath);
      if (!isValid) allValid = false;
    } else {
      console.error(`❌ ${file} - Dosya bulunamadı`);
      allValid = false;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('✅ Tüm sitemap dosyaları geçerli XML formatında!');
    console.log('🚀 Google Search Console\'a güvenle gönderebilirsiniz.');
  } else {
    console.log('❌ Bazı sitemap dosyalarında hatalar var!');
    console.log('🔧 Hataları düzelttikten sonra tekrar deneyin.');
  }
}

// Script çalıştırıldığında doğrulama yap
if (require.main === module) {
  validateSitemaps();
}

module.exports = { validateSitemaps, validateXML };