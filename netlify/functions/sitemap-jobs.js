// netlify/functions/sitemap-jobs.js - DEBUG VERSION
// Bu versiyonu önce test edin, çalışırsa Firebase kodunu ekleyin

exports.handler = async (event, context) => {
  console.log('🔧 DEBUG: Sitemap function called');
  console.log('🔧 DEBUG: Method:', event.httpMethod);
  console.log('🔧 DEBUG: Headers:', JSON.stringify(event.headers, null, 2));
  
  try {
    // ✅ EN BASİT XML TEST
    const testXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://isilanlarim.org/</loc>
<lastmod>2025-01-07</lastmod>
<changefreq>daily</changefreq>
<priority>1.0</priority>
</url>
<url>
<loc>https://isilanlarim.org/ilan/test-ilan</loc>
<lastmod>2025-01-07</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>
</urlset>`;

    console.log('🔧 DEBUG: XML Length:', testXml.length);
    console.log('🔧 DEBUG: XML Preview:', testXml.substring(0, 100));
    
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      },
      body: testXml
    };
    
    console.log('🔧 DEBUG: Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('🔧 DEBUG: Response status:', response.statusCode);
    
    return response;
    
  } catch (error) {
    console.error('🔧 DEBUG: Error occurred:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: `DEBUG ERROR: ${error.message}`
    };
  }
};
