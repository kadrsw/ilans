import json
import google.generativeai as genai
import time
import os
import re
import uuid
from datetime import datetime

# Google Gemini API anahtarınızı buraya girin.
API_KEY = "AIzaSyBeaq3AVf5FDGORNwF_ls2osRqEja2N_UU"  # Buraya kendi API anahtarınızı yapıştırın.
genai.configure(api_key=API_KEY)

def format_text_with_gemini(text_to_format, job_title, job_category, location):
    """
    Verilen metni Gemini API'si kullanarak SEO uyumlu ve insancıl bir formata dönüştürür.
    """
    prompt = f"""
Sen uzman bir **UGC (Kullanıcı İçeriği) SEO Uzmanı** ve content writer'sın. Amacın, kullanıcılar tarafından girilen ham ve potansiyel olarak kopya/spam içerikli iş ilanlarını, Google'da yüksek sıralama alacak **benzersiz** ve **profesyonel** ilanlara dönüştürmek.

## BAŞLIK OPTİMİZASYONU KURALLARI (Meta Title için):
- **Karakter Sınırı:** Tam olarak 50-60 karakter arasında kal.
- **Odak:** İş unvanını (Örn: 'Senior Yazılımcı', 'Muhasebe Uzmanı') her zaman başa koy.
- **Konum:** Lokasyonu mutlaka ekle. (Örn: 'İstanbul', 'Uzaktan')
- **Çekici Kanca:** Tıklama oranını (TO) artırmak için deneyim seviyesi, prim, aciliyet, yüksek maaş gibi kelimeler ekle (örn: 'Hemen Başvur', 'Deneyimli').
- **Örnek Başlık:** "Senior Full Stack Developer - İstanbul Avrupa | Hibrit Çalışma İmkanı"

## AÇIKLAMA OPTİMİZASYONU KURALLARI (Meta Description / İlan İçeriği için):
- **Uzunluk ve Benzersizlik:** 150 kelime veya **1000-1500 karakter** uzunluğunda detaylı bir metin oluştur. Bu, **yinelenen içerik (duplicate content)** riskini azaltır.
- **Giriş:** İlk cümlede ilanın ana vaadini ve konumunu belirt (Örn: "Ankara'da bulunan XYZ firması için...", "Esnek çalışma saatleriyle...", "Yeni mezunlara yönelik...").
- **Değer Odaklı Metin:** İlanı doldurmak yerine, iş arayanın sorusuna odaklan: "Bu iş benim için neden önemli?". Maaş aralığı, sosyal haklar (SGK, özel sağlık, prim, yemek kartı) gibi detayları zenginleştir.
- **Yapı:** Metni maddeler halinde değil, akıcı bir yazı olarak formatla. Paragraflar kullan.
- **Çağrı (CTA):** Son kısma mutlaka bir harekete geçirici cümle ekle. (Örn: "Kariyerinize yön vermek için hemen başvurun!", "Detayları görmek ve başvurmak için tıklayın.")

## UGC GÜVENLİK FİLTRESİ:
- **SPAM KONTROLÜ:** Eğer orijinal ilan metni (Orijinal Açıklama) bir iş ilanı değilse (Örn: restoran menüsü, siyasi içerik, alakasız kişisel ilanlar), yeni başlık ve açıklamaya **"İçerik Kalitesi Yetersiz/Spam - Manuel İnceleme Gerekiyor"** yaz. Bu, sitenizin kalitesini korur.

## GİRDİ BİLGİLERİ:
- Orijinal Başlık (Title): {job_title}
- Orijinal Açıklama (Description): {text_to_format}
- İş Kategorisi (Category): {job_category}
- Konum (Location): {location}

## ÇIKTI FORMATI:
Sadece JSON formatında yanıt ver:
{{
  "yeni_baslik": "SEO optimize başlık (50-60 karakter)",
  "yeni_aciklama": "SEO optimize edilmiş, benzersiz iş ilanı açıklaması (1000-1500 karakter)"
}}

ÖNEMLİ: Başlık ve açıklamada sadece doğal Türkçe kullan. Spam filtre kuralını en üst öncelik olarak uygula.
    """
    
    try:
        # gemini-2.5-flash-preview-05-20, API için önerilen modeldir.
        model = genai.GenerativeModel('gemini-2.5-flash-preview-05-20')
        response = model.generate_content(prompt)
        
        # API yanıtındaki JSON'ı ayrıştır
        try:
            generated_json_string = response.text.replace('```json', '').replace('```', '').strip()
            
            # JSON formatı kontrolü
            if not generated_json_string.startswith("{"):
                print("Hata: Geçersiz JSON formatı. Tekrar deneniyor...")
                time.sleep(2)
                return format_text_with_gemini(text_to_format, job_title, job_category, location)
            
            generated_data = json.loads(generated_json_string)
            
            # Karakter limiti kontrolü (Prompt'ta belirtilen limitler dışında uyarı vermek için)
            new_title = generated_data.get('yeni_baslik', '')
            new_description = generated_data.get('yeni_aciklama', '')
            
            # Spam kontrolü için anahtar kelime denetimi
            spam_keyword = "Manuel İnceleme Gerekiyor"
            if spam_keyword in new_title or spam_keyword in new_description:
                 print(f"❌ SPAM/ALAKASIZ İÇERİK TESPİT EDİLDİ: '{job_title}' manuel onaya yönlendirildi.")
                 # Orijinal metinleri koruyarak sadece spam uyarısı ekliyoruz
                 return new_title, new_description 
            
            # Başlık çok uzunsa uyarı
            if len(new_title) > 65:
                print(f"⚠️ Başlık çok uzun ({len(new_title)} karakter): {new_title[:50]}...")
            
            # Açıklama çok uzunsa uyarı
            if len(new_description) > 1700: # 1500 karakter hedef, 1700 üst sınır
                print(f"⚠️ Açıklama çok uzun ({len(new_description)} karakter): {new_description[:50]}...")
            
            return new_title, new_description
            
        except json.JSONDecodeError as e:
            print(f"JSON ayrıştırma hatası: {e}")
            print(f"API yanıtı: {response.text[:200]}...")
            return None, None
        
    except Exception as e:
        print(f"API çağrısı hatası: {e}. 5 saniye sonra tekrar deneniyor...")
        time.sleep(5)
        return format_text_with_gemini(text_to_format, job_title, job_category, location)

def find_company_name_from_description(description):
    """
    İlan açıklamasından şirket adını tespit etmeye çalışır.
    """
    if not description:
        return "İşveren"

    # Yaygın şirket adı kalıpları
    patterns = [
        r'(?:firma|şirket|kurye|transfer|lojistik)(?:\s+adı)?[:\s]+([A-ZÜĞÖŞÇI][A-ZÜĞÖŞÇIa-züğöşçı\s]{2,30})',
        r'([A-ZÜĞÖŞÇI][A-ZÜĞÖŞÇIa-züğöşçı\s]{2,30})(?:\s+(?:firması|şirketi|kurye|transfer|lojistik))',
        r'(?:iletişim|başvuru)[:\s]+([A-ZÜĞÖŞÇI][A-ZÜĞÖŞÇIa-züğöşçı\s]{2,30})',
    ]

    for pattern in patterns:
        match = re.search(pattern, description, re.IGNORECASE)
        if match:
            company_name = match.group(1).strip()
            # Çok kısa veya çok uzun isimleri filtrele
            if 3 <= len(company_name) <= 50:
                return company_name

    # Eğer hiç eşleşme yoksa, açıklamanın ilk cümlesindeki büyük harfli kelimeleri kontrol et
    first_sentence = description.split('.')[0] if '.' in description else description[:100]
    capital_words = re.findall(r'\b[A-ZÜĞÖŞÇI]{2,}(?:\s+[A-ZÜĞÖŞÇI]{2,})*\b', first_sentence)

    if capital_words:
        # En uzun büyük harfli kelime grubunu al
        longest = max(capital_words, key=len)
        if 3 <= len(longest) <= 50:
            return longest

    return "İşveren"

def find_salary_from_description(description):
    """
    İlan açıklamasından maaş bilgisini çıkarmaya çalışır.
    """
    if not description:
        return "0"

    # Maaş kalıpları
    salary_patterns = [
        r'(?:maaş|ücret|gelir)[:\s]*(\d{1,3}(?:\.\d{3})*(?:\s*-\s*\d{1,3}(?:\.\d{3})*)?)\s*(?:TL|₺|lira)',
        r'(\d{1,3}(?:\.\d{3})*(?:\s*-\s*\d{1,3}(?:\.\d{3})*)?)\s*(?:TL|₺|lira)',
        r'(?:aylık|brüt|net)[:\s]*(\d{1,3}(?:\.\d{3})*)\s*(?:TL|₺)',
        r'(\d{2,3}\.?\d{3})\s*(?:TL|₺)',
    ]

    for pattern in salary_patterns:
        match = re.search(pattern, description, re.IGNORECASE)
        if match:
            salary_str = match.group(1).strip()
            # Tutarlılık kontrolü - makul bir maaş aralığında mı?
            try:
                # Sayıya dönüştür ve kontrol et
                salary_num = int(salary_str.replace('.', '').replace(' ', ''))
                if 5000 <= salary_num <= 500000:  # Makul bir aralık
                    return f"{salary_str}₺"
            except:
                pass

    # Saatlik ücret kontrolü
    hourly_pattern = r'(?:saatlik|saat\s+başı)[:\s]*(\d{1,4})\s*(?:TL|₺)'
    match = re.search(hourly_pattern, description, re.IGNORECASE)
    if match:
        return f"Saatlik {match.group(1)}₺"

    # Paket başı ücret kontrolü
    package_pattern = r'(?:paket\s+başı|paket)[:\s]*(\d{1,4})\s*(?:TL|₺)'
    match = re.search(package_pattern, description, re.IGNORECASE)
    if match:
        return f"Paket başı {match.group(1)}₺"

    return "0"

def generate_unique_id(created_at=None):
    """
    Benzersiz bir iş ilanı ID'si oluşturur.
    Firebase tarzı (-XXXXXXXXXXXX) format kullanır.
    """
    if created_at:
        # createdAt timestamp'ini kullanarak deterministic bir ID oluştur
        timestamp_part = str(created_at)[-8:]
        random_part = uuid.uuid4().hex[:12]
        return f"-{timestamp_part}{random_part}"
    else:
        # Tamamen rastgele bir ID oluştur
        return f"-{uuid.uuid4().hex[:20]}"

def convert_employment_type_to_english(type_turkish):
    """
    Türkçe çalışma tipini İngilizce standart değere dönüştürür.
    """
    type_map = {
        'Tam Zamanlı': 'FULL_TIME',
        'Part-time': 'PART_TIME',
        'Part Time': 'PART_TIME',
        'Yarı Zamanlı': 'PART_TIME',
        'Uzaktan': 'REMOTE',
        'Remote': 'REMOTE',
        'Freelance': 'CONTRACTOR',
        'Sözleşmeli': 'CONTRACTOR',
        'Staj': 'INTERN',
        'İntörnlük': 'INTERN'
    }

    return type_map.get(type_turkish, 'FULL_TIME')

def clean_and_enrich_job_data(item, new_title, new_description):
    """
    İş ilanı verisini temizler ve zenginleştirir.
    """
    # 1. Title ve Description güncelle
    item['title'] = new_title
    item['description'] = new_description

    # 2. Şirket adı temizliği/doldurulması
    if not item.get('company') or item['company'] == "" or item['company'] == "Şirket Belirtilmemiş":
        detected_company = find_company_name_from_description(new_description)
        item['company'] = detected_company
        print(f"  🏢 Şirket adı tespit edildi: {detected_company}")

    # 3. Maaş temizliği/doldurulması
    if not item.get('salary') or item['salary'] == "0" or item['salary'] == "":
        detected_salary = find_salary_from_description(new_description)
        if detected_salary != "0":
            item['salary'] = detected_salary
            print(f"  💰 Maaş bilgisi tespit edildi: {detected_salary}")

    # 4. Benzersiz jobId oluştur
    if not item.get('jobId') or item['jobId'] == "":
        created_at = item.get('createdAt')
        unique_id = generate_unique_id(created_at)
        item['jobId'] = unique_id
        print(f"  🆔 Benzersiz ID oluşturuldu: {unique_id}")

    # 5. Employment type'ı İngilizce'ye çevir (opsiyonel - yorum satırından çıkarabilirsiniz)
    # if item.get('type'):
    #     english_type = convert_employment_type_to_english(item['type'])
    #     item['type_en'] = english_type

    # 6. createdAt yoksa ekle
    if not item.get('createdAt'):
        item['createdAt'] = int(datetime.now().timestamp() * 1000)

    # 7. status yoksa ekle
    if not item.get('status'):
        item['status'] = 'active'

    return item

def validate_optimization(original_title, new_title, original_desc, new_desc):
    """
    Optimizasyon kalitesini değerlendir
    """
    issues = []
    
    # Başlık kontrolü
    if len(new_title) < 30:
        issues.append("Başlık çok kısa")
    elif len(new_title) > 65:
        issues.append("Başlık çok uzun")
    
    # Açıklama kontrolü  
    if len(new_desc) < 800:
        issues.append("Açıklama çok kısa")
    elif len(new_desc) > 1700: # 1700 üst sınır
        issues.append("Açıklama çok uzun")
    
    # İçerik korunmuş mu kontrol et (Orijinal açıklamanın yarısından az olmamalı)
    if len(new_desc) < len(original_desc) * 0.5 and len(original_desc) > 100:
        issues.append("Açıklama çok fazla kısaltılmış")
    
    return issues

def main():
    # JSON dosyasını yükle
    try:
        # 'gemini.json' dosyasını yüklemeye çalış
        with open('gemini.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Hata: 'gemini.json' dosyası bulunamadı. Lütfen dosyanın aynı klasörde olduğundan emin olun.")
        return
    except json.JSONDecodeError:
        print("Hata: JSON dosyası bozuk. Lütfen dosya formatını kontrol edin.")
        return

    updated_data = []
    processed_count = 0
    total_count = len(data)
    success_count = 0
    error_count = 0
    
    print(f"🚀 SEO optimizasyonu başlıyor. Toplam {total_count} ilan işlenecek.")
    print("-" * 60)

    for item in data:
        processed_count += 1
        original_title = item.get('title', 'Başlık Yok')
        
        print(f"\n[{processed_count}/{total_count}] İşleniyor: '{original_title}'")
        
        # Gemini ile optimize et
        new_title, new_description = format_text_with_gemini(
            item.get('description', ''), 
            item.get('title', ''),
            item.get('category', ''),
            item.get('location', '')
        )
        
        if new_title and new_description:
            # Kalite kontrolü
            issues = validate_optimization(
                item.get('title', ''), new_title,
                item.get('description', ''), new_description
            )
            
            # Spam etiketi kontrolü
            if "Manuel İnceleme Gerekiyor" in new_title:
                 # Spam olarak işaretlenen içeriği kaydet, ancak başarı sayacını artırma.
                 item['title'] = new_title
                 item['description'] = new_description
                 print("⚠️ Manuel incelemeye yönlendirildi.")
            else:
                if issues:
                    print(f"⚠️ Kalite uyarıları: {', '.join(issues)}")

                # VERİ TEMİZLEME VE ZENGİNLEŞTİRME
                item = clean_and_enrich_job_data(item, new_title, new_description)

                success_count += 1
                print(f"✅ Optimize edildi")
                print(f"  Yeni başlık ({len(new_title)} kar): {new_title}")
                print(f"  Yeni açıklama ({len(new_description)} kar): {new_description[:80]}...")
            
        else:
            error_count += 1
            print("❌ Optimizasyon başarısız")
        
        # API rate limiting için güvenli aralık
        time.sleep(1.5)
        
        updated_data.append(item)
        
        # İlerleme göstergesi
        if processed_count % 10 == 0:
            print(f"\n📊 İlerleme: {processed_count}/{total_count} (%{(processed_count/total_count)*100:.1f})")

    # Sonuçları kaydet
    output_filename = 'seo_optimized_jobs.json'
    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=2)
        
        # Başarı raporu
        print("\n" + "="*60)
        print("🎉 SEO OPTİMİZASYON RAPORU")
        print("="*60)
        print(f"📊 Toplam işlenen ilan: {total_count}")
        print(f"✅ Başarılı optimize edilen: {success_count}")
        print(f"❌ Başarısız optimizasyon: {error_count}")
        print(f"📈 Başarı oranı: %{(success_count/total_count)*100:.1f}")
        print(f"💾 Sonuçlar kaydedildi: {output_filename}")
        print("\n🚀 İşlem tamamlandı! SEO optimize edilmiş ilanlarınız hazır.")
        
    except Exception as e:
        print(f"❌ Dosya kaydetme hatası: {e}")

if __name__ == "__main__":
    main()
