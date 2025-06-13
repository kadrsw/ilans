import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db
import time
import random
import re

# Firebase kimlik bilgileri
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
})

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

def extract_job_data(html_content):
    """Verilen HTML içeriğinden iş ilanı verilerini çıkarır"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
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
    
    return job_data

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
        "Denizci": ["denizcilik", "guverte"]
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
        "Kaptan": ["denizcilik", "gemi-kaptani"]
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

def main():
    # Örnek HTML içeriği
    html_content = """
    <div class="classifiedDetailTitle">
        <h1>VASIFSIZ BAY/BAYAN GEMİ PERSONELLERİ</h1>
        <ul class="classifiedEvents">
        </ul>
    </div>
    
    <ul class="classifiedInfoList">
        <li>
            <strong>İlan No</strong>&nbsp;
            <span class="classifiedId" id="classifiedId" data-classifiedid="1219349200">1219349200</span>
        </li>
        <li>
            <strong>İlan Tarihi</strong>&nbsp;
            <span>27 Şubat 2025</span>
        </li>
        <li>
            <strong>İl / İlçe</strong>
            <span><a href="/lojistik-tasima-gemi-personeli-denizci-is-ilanlari/istanbul">İstanbul</a> / <a href="/lojistik-tasima-gemi-personeli-denizci-is-ilanlari/istanbul-bagcilar">Bağcılar</a></span>
        </li>
        <li>
            <strong>İş Alanı</strong>&nbsp;
            <span>Lojistik &amp; Taşıma&nbsp;</span>
        </li>
        <li>
            <strong>Pozisyon</strong>&nbsp;
            <span>Gemi Personeli &amp; Denizci&nbsp;</span>
        </li>
        <li>
            <strong>Çalışma Şekli</strong>&nbsp;
            <span class="">Tam Zamanlı (Full Time)</span>
        </li>
        <li>
            <strong>Eğitim Durumu</strong>&nbsp;
            <span class="">En Az Lise Mezunu</span>
        </li>
        <li>
            <strong>Deneyim</strong>&nbsp;
            <span class="">Aranmıyor</span>
        </li>
        <li>
            <strong>Engelliye Uygun</strong>&nbsp;
            <span class="">Hayır</span>
        </li>
    </ul>
    
    <div id="classifiedDescription" class="uiBoxContainer">
        <p>Uluslararası yük ve yolcu gemilerimizde çalışacak;</p>
        <p>- Vasıflı veya vasıfsız,</p>
        <p>- Bay/Bayan,</p>
        <p>- 18-40 yaş arası,</p>
        <p>- Sabıka kaydı olmayan,</p>
        <p>- Seyahat engeli olmayan,</p>
        <p>- En az ilkokul mezunu,</p>
        <p>- Denizcilik sektöründe kariyer hedefleyen,</p>
        <p>Personeller alınacaktır.</p>
    </div>
    """
    
    # HTML içeriğinden iş ilanı verilerini çıkar
    job_data = extract_job_data(html_content)
    
    # Firebase'e kaydet
    job_id = save_to_firebase(job_data)
    
    if job_id:
        print(f"İlan başarıyla eklendi. İlan ID: {job_id}")
    else:
        print("İlan eklenemedi veya zaten mevcut.")

if __name__ == "__main__":
    main()