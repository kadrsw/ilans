import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db
import time
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

def extract_job_data_from_html(html_content):
    """Verilen HTML içeriğinden iş ilanı verilerini çıkarır"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # İlan başlığı
    title_element = soup.select_one('.classifiedDetailTitle h1')
    title = clean_text(title_element.text) if title_element else "İş İlanı"
    
    # İş tanımı
    description_element = soup.select_one('#classifiedDescription')
    description = clean_text(description_element.text) if description_element else ""
    
    # Pozisyon
    position_element = soup.select_one('#classifiedDetail > div > div.classifiedDetailContent > div.classifiedInfo.career > ul > li:nth-child(5) > span')
    position = clean_text(position_element.text) if position_element else ""
    
    # Çalışma şekli
    work_type_element = soup.select_one('#classifiedDetail > div > div.classifiedDetailContent > div.classifiedInfo.career > ul > li:nth-child(6) > span')
    work_type = clean_text(work_type_element.text) if work_type_element else ""
    
    # Şirket adı
    company_element = soup.select_one('#classifiedDetail > div > div.classifiedDetailContent > div.classifiedOtherBoxes > div > div.classifiedUserBox.classified-owner-info.common-design > div > div.storeBox.storeNoLogo > p')
    company = clean_text(company_element.text) if company_element else "İş Veren"
    
    # İletişim numarası
    phone_element = soup.select_one('#phoneInfoPart > li > span.pretty-phone-part.show-part > span')
    phone = clean_text(phone_element.text) if phone_element else ""
    
    # Lokasyon
    location_element = soup.select_one('.classifiedInfo.career ul li:contains("İl / İlçe") span')
    location = clean_text(location_element.text).split('/')[0].strip() if location_element else ""
    
    # İş ilanı verisi
    job_data = {
        'title': title,
        'company': company,
        'description': description,
        'location': location,
        'type': work_type,
        'category': 'diger',  # Varsayılan kategori
        'subCategory': 'custom',  # Varsayılan alt kategori
        'contactEmail': ADMIN_EMAIL,
        'contactPhone': phone,
        'userId': USER_ID,
        'createdAt': int(time.time() * 1000),
        'status': 'active'
    }
    
    return job_data

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
    </div>
    
    <div id="classifiedDescription">
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
    
    <div class="classifiedInfo career">
        <ul>
            <li><strong>İl / İlçe</strong><span>İstanbul / Bağcılar</span></li>
            <li><strong>Pozisyon</strong><span>Gemi Personeli & Denizci</span></li>
            <li><strong>Çalışma Şekli</strong><span>Tam Zamanlı (Full Time)</span></li>
        </ul>
    </div>
    
    <div class="classifiedUserBox">
        <div class="storeBox storeNoLogo">
            <p>Deniz Taşımacılık</p>
        </div>
    </div>
    
    <div id="phoneInfoPart">
        <li><span class="pretty-phone-part show-part"><span>0532 123 45 67</span></span></li>
    </div>
    """
    
    # HTML içeriğinden iş ilanı verilerini çıkar
    job_data = extract_job_data_from_html(html_content)
    
    # Firebase'e kaydet
    job_id = save_to_firebase(job_data)
    
    if job_id:
        print(f"İlan başarıyla eklendi. İlan ID: {job_id}")
    else:
        print("İlan eklenemedi veya zaten mevcut.")

if __name__ == "__main__":
    main()