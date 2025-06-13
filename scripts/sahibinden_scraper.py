import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db
import time
import re
import random
from fake_useragent import UserAgent
import cloudscraper

# Firebase kimlik bilgileri
cred = credentials.Certificate("firebase-credentials.json")
try:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
    })
except ValueError:
    # Uygulama zaten başlatılmış
    pass

# Sabit değişkenler
ADMIN_EMAIL = "acikadir1@gmail.com"
USER_ID = "Zx9hFgzSDfPC7KEygWKx5S4k26G3"

def get_random_headers():
    """Rastgele User-Agent ve diğer header'ları oluşturur"""
    ua = UserAgent()
    return {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.sahibinden.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1'
    }

def clean_text(text):
    """HTML etiketlerini ve fazla boşlukları temizler"""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = ' '.join(text.split())
    return text

def scrape_job_from_url(url, custom_phone=None):
    """Sahibinden.com'dan iş ilanı detaylarını çeker"""
    try:
        print(f"İlan çekiliyor: {url}")
        
        # CloudScraper kullan (Cloudflare bypass)
        scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'mobile': False
            }
        )
        
        # Oturum başlat
        scraper.headers.update(get_random_headers())
        
        # Ana sayfaya istek at
        scraper.get("https://www.sahibinden.com")
        time.sleep(random.uniform(2, 4))
        
        # İlan sayfasına istek at
        response = scraper.get(url)
        
        if response.status_code != 200:
            print(f"Hata: Sayfa yüklenemedi. Durum kodu: {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # İlan başlığı
        title_element = soup.select_one('.classifiedDetailTitle h1')
        title = clean_text(title_element.text) if title_element else ""
        
        # İş tanımı
        description_element = soup.select_one('#classifiedDescription')
        description = clean_text(description_element.text) if description_element else ""
        
        # İlan detayları
        info_list = soup.select('.classifiedInfoList li')
        job_info = {}
        
        for item in info_list:
            label = clean_text(item.select_one('strong').text) if item.select_one('strong') else ""
            value = clean_text(item.select_one('span').text) if item.select_one('span') else ""
            job_info[label] = value
            print(f"Bilgi: {label} = {value}")
        
        # Şirket adı
        company_element = soup.select_one('.storeBox.storeNoLogo p')
        company = clean_text(company_element.text) if company_element else "İş Veren"
        
        # İletişim numarası (özel numara veya siteden çekilen)
        phone = custom_phone if custom_phone else ""
        if not phone:
            phone_element = soup.select_one('#phoneInfoPart span.pretty-phone-part.show-part span')
            phone = clean_text(phone_element.text) if phone_element else ""
        
        # Kategori belirleme
        job_area = job_info.get('İş Alanı', "")
        position = job_info.get('Pozisyon', "")
        category, sub_category = determine_category(job_area, position)
        
        # Çalışma şekli
        work_type = convert_work_type(job_info.get('Çalışma Şekli', ""))
        
        # Lokasyon
        location = job_info.get('İl / İlçe', "").split('/')[0].strip() if '/' in job_info.get('İl / İlçe', "") else job_info.get('İl / İlçe', "")
        
        # Maaş bilgisi
        salary = ""
        if "TL" in title:
            salary_match = re.search(r'(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*TL', title)
            if salary_match:
                salary = f"{salary_match.group(1)} TL"
        
        # İş ilanı verisi
        job_data = {
            'title': title,
            'company': company,
            'description': description,
            'location': location,
            'type': work_type,
            'category': category,
            'subCategory': sub_category,
            'salary': salary,
            'contactEmail': ADMIN_EMAIL,
            'contactPhone': phone,
            'userId': USER_ID,
            'createdAt': int(time.time() * 1000),
            'status': 'active'
        }
        
        print(f"İlan başarıyla çekildi: {title}")
        return job_data
    
    except Exception as e:
        print(f"İlan çekilirken hata oluştu: {e}")
        return None

def determine_category(job_area, position):
    """İş alanı ve pozisyona göre kategori ve alt kategori belirler"""
    # Kategori eşleştirme
    category_mapping = {
        "Lojistik": ["lojistik", "depo-gorevlisi"],
        "Taşıma": ["lojistik", "sofor"],
        "Bilişim": ["teknoloji", "yazilim-gelistirici"],
        "Teknoloji": ["teknoloji", "yazilim-gelistirici"],
        "Eğitim": ["egitim", "ogretmen"],
        "Sağlık": ["saglik", "doktor"],
        "İnşaat": ["insaat", "insaat-iscisi"],
        "Turizm": ["turizm", "resepsiyonist"],
        "Otelcilik": ["turizm", "resepsiyonist"],
        "Satış": ["ticaret", "satis-temsilcisi"],
        "Pazarlama": ["ticaret", "pazarlama-uzmani"],
        "Gemi": ["denizcilik", "gemi-kaptani"],
        "Denizci": ["denizcilik", "guverte"],
        "Tamir": ["insaat", "insaat-iscisi"],
        "Bakım": ["insaat", "insaat-iscisi"],
        "Temizlik": ["hizmet", "temizlik"],
        "Egzoz": ["lojistik", "sofor"],
        "Mağaza": ["perakende", "satis-danismani"],
        "Kasiyer": ["perakende", "kasiyer"]
    }
    
    # Önce iş alanına göre kontrol
    for key, value in category_mapping.items():
        if key.lower() in job_area.lower():
            return value
    
    # Sonra pozisyona göre kontrol
    for key, value in category_mapping.items():
        if key.lower() in position.lower():
            return value
    
    # Eşleşme bulunamazsa
    return ["diger", "custom"]

def convert_work_type(work_type):
    """Çalışma şeklini standart formata dönüştürür"""
    mapping = {
        "Tam Zamanlı": "Tam Zamanlı",
        "Full Time": "Tam Zamanlı",
        "Yarı Zamanlı": "Yarı Zamanlı",
        "Part Time": "Yarı Zamanlı",
        "Stajyer": "Stajyer",
        "Proje Bazlı": "Sözleşmeli",
        "Dönemsel": "Sözleşmeli",
        "Uzaktan": "Uzaktan"
    }
    
    for key, value in mapping.items():
        if key in work_type:
            return value
    
    return "Tam Zamanlı"  # Varsayılan değer

def save_to_firebase(job_data):
    """İş ilanını Firebase'e kaydeder"""
    try:
        jobs_ref = db.reference('jobs')
        
        # Duplicate kontrolü
        query = jobs_ref.order_by_child('title').equal_to(job_data['title']).get()
        
        if not query:
            # Yeni ilan ekle
            new_job_ref = jobs_ref.push(job_data)
            print(f"İlan başarıyla kaydedildi: {job_data['title']}")
            return new_job_ref.key
        else:
            print(f"Bu ilan zaten mevcut: {job_data['title']}")
            return None
        
    except Exception as e:
        print(f"İlan kaydedilirken hata: {e}")
        return None

def main():
    # Sahibinden.com iş ilanı URL'si
    url = input("İlan URL'sini girin: ")
    
    # İsteğe bağlı telefon numarası
    custom_phone = input("İletişim telefon numarası (isteğe bağlı, 5XX XXX XX XX formatında): ").strip()
    
    # Telefon numarası formatını kontrol et
    if custom_phone and not re.match(r'^5[0-9]{9}$', custom_phone):
        print("Hata: Geçersiz telefon numarası formatı. 5XX XXX XX XX formatında girin")
        return
    
    # İlanı çek
    job_data = scrape_job_from_url(url, custom_phone)
    
    if job_data:
        # Firebase'e kaydet
        job_id = save_to_firebase(job_data)
        
        if job_id:
            print(f"İlan başarıyla eklendi. İlan ID: {job_id}")
        else:
            print("İlan eklenemedi veya zaten mevcut.")
    else:
        print("İlan çekilemedi.")

if __name__ == "__main__":
    main()