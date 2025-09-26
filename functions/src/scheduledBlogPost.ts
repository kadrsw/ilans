import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Firebase Admin SDK zaten index.ts'de initialize edilmiş
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAyqcZq_8x7BhmTcjnP3qRt5J9jMtzp27w';
const genAI = new GoogleGenerativeAI(API_KEY);

// Her gün saat 09:00'da çalışacak
exports.scheduledBlogPost = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Europe/Istanbul')
  .onRun(async (context) => {
    const db = admin.database();
    
    try {
      console.log('📝 Günlük blog yazısı oluşturuluyor...');

      // Son blog yazılarını kontrol et
      const recentPostsRef = db.ref('blog_posts').orderByChild('createdAt').limitToLast(7);
      const recentSnapshot = await recentPostsRef.once('value');
      
      let recentTitles = '';
      if (recentSnapshot.exists()) {
        const posts = Object.values(recentSnapshot.val());
        recentTitles = posts.map((post: any) => post.title).join(', ');
      }

      // Güncel iş ilanı istatistiklerini al
      const jobsRef = db.ref('jobs').orderByChild('status').equalTo('active').limitToLast(100);
      const jobsSnapshot = await jobsRef.once('value');
      
      let jobStats = {
        totalJobs: 0,
        topCategories: [] as string[],
        topCities: [] as string[],
        newJobsToday: 0
      };

      if (jobsSnapshot.exists()) {
        const jobs = Object.values(jobsSnapshot.val());
        jobStats.totalJobs = jobs.length;
        
        const categoryCount: Record<string, number> = {};
        const cityCount: Record<string, number> = {};
        const today = new Date().toDateString();
        
        jobs.forEach((job: any) => {
          categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
          cityCount[job.location] = (cityCount[job.location] || 0) + 1;
          
          if (new Date(job.createdAt).toDateString() === today) {
            jobStats.newJobsToday++;
          }
        });

        jobStats.topCategories = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category]) => category);

        jobStats.topCities = Object.entries(cityCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([city]) => city);
      }

      // AI ile blog yazısı oluştur
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `
Sen İşBuldum platformunun AI editörüsün. Günlük blog yazısı oluştur.

GÜNCEL VERİLER:
- Toplam aktif ilan: ${jobStats.totalJobs}
- Bugün eklenen yeni ilan: ${jobStats.newJobsToday}
- En popüler kategoriler: ${jobStats.topCategories.join(', ')}
- En aktif şehirler: ${jobStats.topCities.join(', ')}

SON 7 GÜNÜN YAZILARI (Tekrar etme):
${recentTitles}

YAZMA KURALLARI:
1. Tamamen özgün içerik (kopya değil)
2. SEO uyumlu başlık (50-60 karakter)
3. 800-1200 kelime arası
4. Güncel iş piyasası trendleri
5. Pratik kariyer tavsiyeleri
6. Türkçe, samimi ve bilgilendirici ton
7. HTML formatında içerik
8. Okuma süresi 4-6 dakika

KONU ÖNERİLERİ:
- "2025 İş Piyasası Trendleri ve Fırsatlar"
- "CV Hazırlama: Modern İpuçları"
- "Mülakat Başarı Stratejileri"
- "Uzaktan Çalışma Rehberi"
- "Kariyer Değişimi: Adım Adım Rehber"
- "İş Arama Stratejileri 2025"
- "Sektör Analizi: Hangi Alanlarda Fırsat Var?"

JSON formatında yanıt ver:
{
  "title": "SEO uyumlu başlık",
  "content": "Tam blog yazısı içeriği (HTML formatında)",
  "excerpt": "150 karakter özet",
  "category": "kariyer-rehberi",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": 5
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // JSON temizle
      let cleaned = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      const blogData = JSON.parse(cleaned);

      // Slug oluştur
      const generateSlug = (text: string): string => {
        return text
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      };

      // Blog yazısını kaydet
      const blogPost = {
        title: blogData.title,
        content: blogData.content,
        excerpt: blogData.excerpt,
        slug: generateSlug(blogData.title),
        category: blogData.category,
        tags: blogData.tags,
        author: 'AI Assistant',
        createdAt: admin.database.ServerValue.TIMESTAMP,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        isAIGenerated: true,
        readTime: blogData.readTime,
        views: 0,
        likes: 0,
        comments: []
      };

      const blogRef = db.ref('blog_posts');
      await blogRef.push(blogPost);

      console.log('✅ Günlük blog yazısı oluşturuldu:', blogData.title);
      
      return null;

    } catch (error) {
      console.error('❌ Günlük blog yazısı hatası:', error);
      return null;
    }
  });