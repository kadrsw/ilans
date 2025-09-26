import { GoogleGenerativeAI } from '@google/generative-ai';
import { jobCategories } from '../data/jobCategories';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAyqcZq_8x7BhmTcjnP3qRt5J9jMtzp27w';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface SEOSuggestion {
  originalText: string;
  optimizedText: string;
  improvements: string[];
  keywords: string[];
  score: number;
}

export interface CategorySuggestion {
  category: string;
  subCategory: string;
  categoryName: string;
  subCategoryName: string;
  confidence: number;
  isNewCategory: boolean;
  isNewSubCategory: boolean;
  title?: string;
  description?: string;
}

export interface JobAnalysis {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  categoryName: string;
  subCategoryName: string;
  confidence: number;
  isNewCategory: boolean;
  isNewSubCategory: boolean;
}

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  private cleanJsonResponse(response: string): string {
    try {
      // Remove markdown code block delimiters
      let cleaned = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // Attempt to parse to validate it's proper JSON
      JSON.parse(cleaned);
      return cleaned;
    } catch (error) {
      console.error('JSON temizleme hatası:', error);
      console.log('Orijinal yanıt:', response);
      
      // Try to extract JSON from the response using regex
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = jsonMatch[0];
          // Validate it's proper JSON
          JSON.parse(extracted);
          return extracted;
        } catch (e) {
          console.error('JSON çıkarma hatası:', e);
        }
      }
      
      // If all else fails, return a default JSON
      return JSON.stringify({
        category: 'diger',
        subCategory: 'custom',
        categoryName: 'Diğer',
        subCategoryName: 'Özel Kategori',
        confidence: 50,
        isNewCategory: false,
        isNewSubCategory: false,
        title: "İş İlanı",
        description: "İş ilanı detayları için lütfen iletişime geçin."
      });
    }
  }

  async analyzeJobAndSuggestCategory(
    title: string, 
    description: string, 
    company: string
  ): Promise<CategorySuggestion> {
    // Mevcut kategorileri listele
    const existingCategories = jobCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      subCategories: cat.subCategories.map(sub => ({
        id: sub.id,
        name: sub.name
      }))
    }));

    const prompt = `
İş ilanını analiz et ve en uygun kategoriyi belirle:

Başlık: "${title}"
Açıklama: "${description}"
Şirket: "${company}"

Mevcut Kategoriler:
${JSON.stringify(existingCategories, null, 2)}

Kurallar:
1. Önce mevcut kategorilerden en uygun olanını bul
2. Eğer hiçbiri uygun değilse, yeni kategori öner
3. Alt kategori de aynı şekilde kontrol et
4. Güven skoru 0-100 arası olmalı
5. Yeni kategori önerirken Türkçe ve anlamlı isimler kullan

JSON formatında yanıt ver:
{
  "category": "kategori_id",
  "subCategory": "alt_kategori_id", 
  "categoryName": "Kategori Adı",
  "subCategoryName": "Alt Kategori Adı",
  "confidence": 95,
  "isNewCategory": false,
  "isNewSubCategory": false,
  "title": "optimize edilmiş başlık (isteğe bağlı)",
  "description": "optimize edilmiş açıklama (isteğe bağlı)"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      return parsed;
    } catch (error) {
      console.error('AI category analysis error:', error);
      // Fallback to default category
      return {
        category: 'diger',
        subCategory: 'custom',
        categoryName: 'Diğer',
        subCategoryName: 'Özel Kategori',
        confidence: 50,
        isNewCategory: false,
        isNewSubCategory: false
      };
    }
  }

  async generateJobContent(
    basicInfo: {
      company: string;
      jobDescription?: string;
      salary?: string;
      contactPhone?: string;
      contactEmail?: string;
      location?: string;
    }
  ): Promise<JobAnalysis> {
    // Mevcut kategorileri listele
    const existingCategories = jobCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      subCategories: cat.subCategories.map(sub => ({
        id: sub.id,
        name: sub.name
      }))
    }));

    const prompt = `
Verilen temel bilgilerden profesyonel bir iş ilanı oluştur:

Şirket: "${basicInfo.company}"
İş Tanımı: "${basicInfo.jobDescription || 'Belirtilmemiş'}"
Maaş: "${basicInfo.salary || 'Belirtilmemiş'}"
Lokasyon: "${basicInfo.location || 'Türkiye'}"

Mevcut Kategoriler:
${JSON.stringify(existingCategories, null, 2)}

Kurallar:
1. Şirket adı ve iş tanımından iş türünü tahmin et
2. Profesyonel ve SEO uyumlu bir başlık oluştur (50-60 karakter)
3. Detaylı ve çekici bir iş açıklaması yaz (200-400 kelime)
4. Mevcut kategorilerden en uygun olanını seç
5. Eğer uygun kategori yoksa yeni kategori öner
6. Madde işaretleri kullanarak düzenli format oluştur
7. Türkçe dilbilgisi kurallarına uy
8. İş tanımını genişletip profesyonel hale getir

JSON formatında yanıt ver:
{
  "title": "Profesyonel İş Başlığı",
  "description": "Detaylı iş açıklaması...",
  "category": "kategori_id",
  "subCategory": "alt_kategori_id",
  "categoryName": "Kategori Adı", 
  "subCategoryName": "Alt Kategori Adı",
  "confidence": 85,
  "isNewCategory": false,
  "isNewSubCategory": false
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      return parsed;
    } catch (error) {
      console.error('AI job generation error:', error);
      // Fallback
      return {
        title: `${basicInfo.company} - İş İlanı`,
        description: `${basicInfo.company} şirketinde çalışma fırsatı. ${basicInfo.jobDescription || 'Detaylar için iletişime geçin.'}`,
        category: 'diger',
        subCategory: 'custom',
        categoryName: 'Diğer',
        subCategoryName: 'Özel Kategori',
        confidence: 50,
        isNewCategory: false,
        isNewSubCategory: false
      };
    }
  }

  async optimizeJobTitle(title: string, category: string, location: string): Promise<SEOSuggestion> {
    const prompt = `
İş ilanı başlığını SEO uyumlu hale getir:

Orijinal Başlık: "${title}"
Kategori: ${category}
Lokasyon: ${location}

Kurallar:
1. Başlık 50-60 karakter arası olmalı
2. Lokasyon ve kategori anahtar kelimelerini içermeli
3. Türkçe SEO kurallarına uygun olmalı
4. Doğal ve çekici olmalı
5. Gereksiz büyük harflerden kaçın

JSON formatında yanıt ver:
{
  "optimizedText": "optimize edilmiş başlık",
  "improvements": ["yapılan iyileştirmeler listesi"],
  "keywords": ["eklenen anahtar kelimeler"],
  "score": 85
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      return {
        originalText: title,
        ...parsed
      };
    } catch (error) {
      console.error('AI title optimization error:', error);
      throw new Error('Başlık optimizasyonu sırasında hata oluştu');
    }
  }

  async optimizeJobDescription(description: string, title: string, category: string): Promise<SEOSuggestion> {
    const prompt = `
İş ilanı açıklamasını SEO uyumlu hale getir:

Başlık: "${title}"
Kategori: ${category}
Açıklama: "${description}"

Kurallar:
1. 150-300 kelime arası olmalı
2. İş başlığı ve kategori anahtar kelimelerini doğal şekilde kullan
3. Madde işaretleri ve yapılandırılmış format kullan
4. Gereksiz tekrarlardan kaçın
5. Çekici ve bilgilendirici olmalı
6. Türkçe dilbilgisi kurallarına uygun olmalı

JSON formatında yanıt ver:
{
  "optimizedText": "optimize edilmiş açıklama",
  "improvements": ["yapılan iyileştirmeler"],
  "keywords": ["eklenen anahtar kelimeler"],
  "score": 90
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      return {
        originalText: description,
        ...parsed
      };
    } catch (error) {
      console.error('AI description optimization error:', error);
      throw new Error('Açıklama optimizasyonu sırasında hata oluştu');
    }
  }

  async generateJobKeywords(title: string, description: string, category: string): Promise<string[]> {
    const prompt = `
Bu iş ilanı için SEO anahtar kelimeleri öner:

Başlık: "${title}"
Açıklama: "${description}"
Kategori: ${category}

En fazla 10 anahtar kelime öner. Sadece kelimeler listesi olarak yanıt ver, virgülle ayır.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return response.split(',').map(keyword => keyword.trim()).filter(Boolean);
    } catch (error) {
      console.error('AI keywords generation error:', error);
      return [];
    }
  }

  async generateCVContent(
    jobData: {
      title: string;
      company: string;
      description: string;
      location: string;
      type: string;
    },
    candidateData: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      summary: string;
      education: string;
      experience: string;
      skills: string;
      languages: string;
      achievements: string;
    }
  ): Promise<{ cv: string; coverLetter: string }> {
    const cvPrompt = `
Bu iş ilanı için profesyonel bir CV oluştur:

İş İlanı:
- Başlık: ${jobData.title}
- Şirket: ${jobData.company}
- Açıklama: ${jobData.description}
- Lokasyon: ${jobData.location}
- Çalışma Şekli: ${jobData.type}

Aday Bilgileri:
- Ad Soyad: ${candidateData.fullName}
- Email: ${candidateData.email}
- Telefon: ${candidateData.phone}
- Adres: ${candidateData.address}
- Özet: ${candidateData.summary}
- Eğitim: ${candidateData.education}
- Deneyim: ${candidateData.experience}
- Yetenekler: ${candidateData.skills}
- Diller: ${candidateData.languages}
- Başarılar: ${candidateData.achievements}

HTML formatında, modern ve profesyonel bir CV oluştur. İş ilanına uygun anahtar kelimeleri kullan.
Sadece HTML içeriğini döndür, açıklama yapma.
`;

    const coverLetterPrompt = `
Bu iş ilanı için profesyonel bir ön yazı (cover letter) oluştur:

İş İlanı:
- Başlık: ${jobData.title}
- Şirket: ${jobData.company}
- Açıklama: ${jobData.description}

Aday Bilgileri:
- Ad Soyad: ${candidateData.fullName}
- Deneyim: ${candidateData.experience}
- Yetenekler: ${candidateData.skills}

Türkçe, profesyonel ve ikna edici bir ön yazı yaz. 200-300 kelime arası olsun.
Sadece ön yazı metnini döndür, açıklama yapma.
`;

    try {
      const [cvResult, coverLetterResult] = await Promise.all([
        this.model.generateContent(cvPrompt),
        this.model.generateContent(coverLetterPrompt)
      ]);

      const cv = cvResult.response.text();
      const coverLetter = coverLetterResult.response.text();

      return { cv, coverLetter };
    } catch (error) {
      console.error('AI CV generation error:', error);
      throw new Error('CV ve ön yazı oluşturma sırasında hata oluştu');
    }
  }

  async analyzeSEOScore(title: string, description: string, category: string, location: string): Promise<{
    score: number;
    suggestions: string[];
    strengths: string[];
  }> {
    const prompt = `
Bu iş ilanının SEO skorunu analiz et (0-100):

Başlık: "${title}"
Açıklama: "${description}"
Kategori: ${category}
Lokasyon: ${location}

JSON formatında yanıt ver:
{
  "score": 75,
  "suggestions": ["iyileştirme önerileri"],
  "strengths": ["güçlü yönler"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('AI SEO analysis error:', error);
      return {
        score: 50,
        suggestions: ['AI analizi şu anda kullanılamıyor'],
        strengths: []
      };
    }
  }
}

export const aiService = new AIService();