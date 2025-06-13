import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db
import time
import re
import random
import sys

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
USER_ID = "ADMIN_USER_ID"  # Admin kullanıcı ID'si

def clean_text(text):
    """HTML etiketlerini ve fazla boşlukları temizler"""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = ' '.join(text.split())
    return text

def scrape_job_from_sahibinden(url):
    """
    Sahibinden.com'dan iş ilanı detaylarını çeker
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print(f"Hata: Sayfa yüklenemedi. Durum kodu: {response.status_code}")
            return None
        
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
        
        # Kategori belirleme
        job_area = job_info.get('İş Alanı', "")
        position = job_info.get('Pozisyon', "")
        
        # Kategori ve alt kategori eşleştirme
        category, sub_category = determine_category(job_area, position)
        
        # Çalışma şekli
        work_type = convert_work_type(job_info.get('Çalışma Şekli', ""))
        
        # Lokasyon
        location = job_info.get('İl / İlçe', "").split('/')[0].strip() if '/' in job_info.get('İl / İlçe', "") else job_info.get('İl / İlçe', "")
        
        # İş ilanı verisi
        job_data = {
            'title': title,
            'company': "İş Veren",  # Şirket adı bilinmiyor
            'description': description,
            'location': location,
            'type': work_type,
            'category': category,
            'subCategory': sub_category,
            'salary': "",  # Maaş bilgisi yok
            'contactEmail': ADMIN_EMAIL,
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
        "Egzoz": ["lojistik", "sofor"]
    }
    
    # Pozisyon eşleştirme
    position_mapping = {
        "Yazılım": ["teknoloji", "yazilim-gelistirici"],
        "Geliştirici": ["teknoloji", "yazilim-gelistirici"],
        "Öğretmen": ["egitim", "ogretmen"],
        "Doktor": ["saglik", "doktor"],
        "Hemşire": ["saglik", "hemsire"],
        "Mühendis": ["muhendislik", "muhendis"],
        "Şoför": ["lojistik", "sofor"],
        "Garson": ["hizmet", "garson"],
        "Aşçı": ["hizmet", "asci"],
        "Satış": ["ticaret", "satis-temsilcisi"],
        "Gemi": ["denizcilik", "gemi-kaptani"],
        "Kaptan": ["denizcilik", "gemi-kaptani"],
        "Temizlik": ["hizmet", "temizlik"],
        "Bakım": ["insaat", "insaat-iscisi"],
        "Tamir": ["insaat", "insaat-iscisi"]
    }
    
    # Önce iş alanına göre kontrol
    for key, value in category_mapping.items():
        if key in job_area:
            return value
    
    # Sonra pozisyona göre kontrol
    for key, value in position_mapping.items():
        if key in position:
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

def get_job_listings_from_sahibinden(category_url, max_pages=3, max_jobs_per_page=5):
    """
    Sahibinden.com'dan iş ilanlarını listeler ve URL'lerini döndürür
    """
    job_urls = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
    }
    
    for page in range(1, max_pages + 1):
        try:
            page_url = f"{category_url}?pagingOffset={20 * (page - 1)}"
            print(f"Sayfa çekiliyor: {page_url}")
            
            response = requests.get(page_url, headers=headers)
            
            if response.status_code != 200:
                print(f"Hata: Sayfa yüklenemedi. Durum kodu: {response.status_code}")
                continue
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # İlan kartlarını bul
            job_cards = soup.select('.searchResultsItem')
            
            for card in job_cards[:max_jobs_per_page]:
                try:
                    # İlan detay URL'si
                    detail_link = card.select_one('a.classifiedTitle')
                    if not detail_link or not detail_link.get('href'):
                        continue
                    
                    detail_url = detail_link.get('href')
                    if not detail_url.startswith('http'):
                        # Bağıl URL'yi mutlak URL'ye çevir
                        detail_url = f"https://www.sahibinden.com{detail_url}"
                    
                    job_urls.append(detail_url)
                    print(f"İlan URL'si bulundu: {detail_url}")
                
                except Exception as e:
                    print(f"İlan kartı işlenirken hata: {e}")
                    continue
            
            print(f"Sayfa {page} tamamlandı.")
            
            # Sayfalar arası bekleme
            time.sleep(random.uniform(2, 4))
            
        except Exception as e:
            print(f"Sayfa {page} çekilirken hata: {e}")
            continue
    
    return job_urls

def main():
    # Komut satırı argümanlarını kontrol et
    if len(sys.argv) > 1:
        # Tek bir URL için
        url = sys.argv[1]
        print(f"İlan çekiliyor: {url}")
        
        # İlanı çek
        job_data = scrape_job_from_sahibinden(url)
        
        if job_data:
            # Firebase'e kaydet
            job_id = save_to_firebase(job_data)
            
            if job_id:
                print(f"İlan başarıyla eklendi. İlan ID: {job_id}")
            else:
                print("İlan eklenemedi veya zaten mevcut.")
        else:
            print("İlan çekilemedi.")
    else:
        # Kategori sayfasından çoklu ilan çekme
        category_url = "https://www.sahibinden.com/is-ilanlari"
        
        print(f"İlanlar çekiliyor: {category_url}")
        
        # İlan URL'lerini al
        job_urls = get_job_listings_from_sahibinden(category_url, max_pages=2, max_jobs_per_page=3)
        
        if not job_urls:
            print("Hiç ilan URL'si bulunamadı.")
            return
        
        print(f"Toplam {len(job_urls)} ilan URL'si bulundu.")
        
        # Her URL için ilanı çek ve kaydet
        successful_jobs = 0
        
        for url in job_urls:
            try:
                print(f"\nİlan çekiliyor: {url}")
                
                # İlanı çek
                job_data = scrape_job_from_sahibinden(url)
                
                if job_data:
                    # Firebase'e kaydet
                    job_id = save_to_firebase(job_data)
                    
                    if job_id:
                        print(f"İlan başarıyla eklendi. İlan ID: {job_id}")
                        successful_jobs += 1
                    else:
                        print("İlan eklenemedi veya zaten mevcut.")
                else:
                    print("İlan çekilemedi.")
                
                # İlanlar arası bekleme
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                print(f"İlan işlenirken hata: {e}")
                continue
        
        print(f"\nİşlem tamamlandı. {successful_jobs}/{len(job_urls)} ilan başarıyla eklendi.")

if __name__ == "__main__":
    main()