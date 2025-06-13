import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db
import time
import re
from datetime import datetime
import random

# Firebase kimlik bilgileri
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
})

# Sabit değişkenler
ADMIN_EMAIL = "acikadir1@gmail.com"
USER_ID = "ADMIN_USER_ID"  # Admin kullanıcı ID'si

# Kategori eşleştirme fonksiyonu
def match_category(position, job_area):
    # Pozisyon ve iş alanına göre kategori ve alt kategori belirleme
    category_mapping = {
        "Lojistik & Taşıma": {
            "default": ["lojistik", "depo-gorevlisi"],
            "Gemi Personeli & Denizci": ["denizcilik", "gemi-kaptani"],
            "Şoför": ["lojistik", "sofor"],
            "Kurye": ["lojistik", "kargo-gorevlisi"]
        },
        "Bilişim & Teknoloji": {
            "default": ["teknoloji", "yazilim-gelistirici"],
            "Yazılım Geliştirici": ["teknoloji", "yazilim-gelistirici"],
            "Web Tasarımcısı": ["teknoloji", "web-tasarimcisi"]
        },
        "Eğitim": {
            "default": ["egitim", "ogretmen"],
            "Öğretmen": ["egitim", "ogretmen"]
        },
        "Sağlık": {
            "default": ["saglik", "doktor"],
            "Doktor": ["saglik", "doktor"],
            "Hemşire": ["saglik", "hemsire"]
        },
        "İnşaat": {
            "default": ["insaat", "insaat-iscisi"],
            "Mühendis": ["insaat", "insaat-muhendisi"]
        },
        "Turizm & Otelcilik": {
            "default": ["turizm", "resepsiyonist"],
            "Garson": ["hizmet", "garson"],
            "Aşçı": ["hizmet", "asci"]
        },
        "Satış & Pazarlama": {
            "default": ["ticaret", "satis-temsilcisi"],
            "Satış Temsilcisi": ["ticaret", "satis-temsilcisi"],
            "Pazarlama Uzmanı": ["ticaret", "pazarlama-uzmani"]
        }
    }
    
    # İş alanı eşleştirme
    if job_area in category_mapping:
        area_map = category_mapping[job_area]
        # Pozisyon eşleştirme
        if position in area_map:
            return area_map[position]
        else:
            return area_map["default"]
    
    # Eşleşme bulunamazsa
    return ["diger", "custom"]

# Çalışma şekli dönüştürme
def convert_work_type(work_type):
    mapping = {
        "Tam Zamanlı (Full Time)": "Tam Zamanlı",
        "Yarı Zamanlı (Part Time)": "Yarı Zamanlı",
        "Stajyer": "Stajyer",
        "Proje Bazlı": "Sözleşmeli",
        "Dönemsel": "Sözleşmeli",
        "Uzaktan": "Uzaktan"
    }
    return mapping.get(work_type, "Tam Zamanlı")

# Metni temizleme
def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = ' '.join(text.split())
    return text

# İş ilanı detaylarını çekme
def scrape_job_details(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # İlan başlığı
        title_element = soup.select_one('.classifiedDetailTitle h1')
        title = clean_text(title_element.text) if title_element else "İş İlanı"
        
        # İlan detayları
        info_list = soup.select('.classifiedInfoList li')
        job_info = {}
        
        for item in info_list:
            label = clean_text(item.select_one('strong').text) if item.select_one('strong') else ""
            value = clean_text(item.select_one('span').text) if item.select_one('span') else ""
            job_info[label] = value
        
        # İş tanımı
        description_element = soup.select_one('#classifiedDescription')
        description = clean_text(description_element.text) if description_element else ""
        
        # Kategori ve alt kategori belirleme
        job_area = job_info.get('İş Alanı', "")
        position = job_info.get('Pozisyon', "")
        category, sub_category = match_category(position, job_area)
        
        # Çalışma şekli
        work_type = convert_work_type(job_info.get('Çalışma Şekli', ""))
        
        # Lokasyon
        location = job_info.get('İl / İlçe', "").split('/')[0].strip() if '/' in job_info.get('İl / İlçe', "") else job_info.get('İl / İlçe', "")
        
        # Maaş bilgisi (varsayılan olarak boş)
        salary = ""
        
        # İlan tarihi
        created_at = int(time.time() * 1000)  # Şu anki zaman
        
        # İş ilanı verisi
        job_data = {
            'title': title,
            'company': "İş Veren",  # Şirket adı bilinmiyor
            'description': description,
            'location': location,
            'type': work_type,
            'category': category,
            'subCategory': sub_category,
            'salary': salary,
            'contactEmail': ADMIN_EMAIL,
            'userId': USER_ID,
            'createdAt': created_at,
            'status': 'active'
        }
        
        return job_data
    
    except Exception as e:
        print(f"İlan detayları çekilirken hata: {e}")
        return None

# İş ilanlarını çekme
def scrape_job_listings(base_url, num_pages=3):
    all_jobs = []
    
    for page in range(1, num_pages + 1):
        try:
            url = f"{base_url}?pg={page}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # İlan kartlarını bul
            job_cards = soup.select('.classified-list-item')
            
            for card in job_cards[:5]:  # Her sayfadan en fazla 5 ilan
                try:
                    # İlan detay URL'si
                    detail_link = card.select_one('a')
                    if not detail_link or not detail_link.get('href'):
                        continue
                    
                    detail_url = detail_link.get('href')
                    if not detail_url.startswith('http'):
                        # Bağıl URL'yi mutlak URL'ye çevir
                        if detail_url.startswith('/'):
                            domain = re.match(r'(https?://[^/]+)', base_url).group(1)
                            detail_url = domain + detail_url
                        else:
                            detail_url = base_url.rstrip('/') + '/' + detail_url
                    
                    # İlan detaylarını çek
                    job_data = scrape_job_details(detail_url)
                    
                    if job_data:
                        all_jobs.append(job_data)
                        print(f"İlan çekildi: {job_data['title']}")
                    
                    # Sunucuya yük bindirmemek için bekleme
                    time.sleep(random.uniform(1, 3))
                
                except Exception as e:
                    print(f"İlan kartı işlenirken hata: {e}")
                    continue
            
            print(f"Sayfa {page} tamamlandı.")
            
            # Sayfalar arası bekleme
            time.sleep(random.uniform(2, 4))
            
        except Exception as e:
            print(f"Sayfa {page} çekilirken hata: {e}")
            continue
    
    return all_jobs

# Firebase'e ilanları kaydetme
def save_jobs_to_firebase(jobs):
    jobs_ref = db.reference('jobs')
    
    for job in jobs:
        try:
            # Duplicate kontrolü
            query = jobs_ref.order_by_child('title').equal_to(job['title']).get()
            
            if not query:
                # Yeni ilan ekle
                jobs_ref.push(job)
                print(f"İlan kaydedildi: {job['title']}")
            else:
                print(f"İlan zaten mevcut: {job['title']}")
            
            # İşlemler arası bekleme
            time.sleep(0.5)
            
        except Exception as e:
            print(f"İlan kaydedilirken hata: {e}")
            continue

# Ana fonksiyon
def main():
    print(f"İş ilanları çekme işlemi başladı: {datetime.now()}")
    
    # İş ilanları sitesi URL'si
    base_url = "https://www.kariyer.net/is-ilanlari"
    
    # İlanları çek
    jobs = scrape_job_listings(base_url, num_pages=2)
    
    if jobs:
        print(f"Toplam {len(jobs)} ilan çekildi.")
        
        # Firebase'e kaydet
        save_jobs_to_firebase(jobs)
        print("İlanlar Firebase'e kaydedildi.")
    else:
        print("Hiç ilan çekilemedi.")
    
    print(f"İşlem tamamlandı: {datetime.now()}")

if __name__ == "__main__":
    main()