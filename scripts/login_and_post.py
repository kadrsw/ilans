import requests
import json
import time
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db

# Firebase kimlik bilgileri
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
})

# Giriş bilgileri
EMAIL = "acikadir1@gmail.com"
PASSWORD = "acikadir1@gmail.com"  # Şifre aynı e-posta olarak belirtilmiş

def login_to_site():
    """
    Siteye giriş yapar ve oturum çerezlerini döndürür
    """
    session = requests.Session()
    
    # Giriş sayfasını yükle
    login_url = "https://isilanlarim.netlify.app/giris"
    response = session.get(login_url)
    
    # Giriş isteği gönder
    login_data = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    # Firebase Authentication API endpoint'i
    auth_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAUmnb0K1M6-U8uzSsYVpTxAAdXdU8I--o"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    auth_data = {
        "email": EMAIL,
        "password": PASSWORD,
        "returnSecureToken": True
    }
    
    response = session.post(auth_url, headers=headers, data=json.dumps(auth_data))
    
    if response.status_code == 200:
        print("Giriş başarılı!")
        auth_result = response.json()
        # Firebase ID token'ı al
        id_token = auth_result.get("idToken")
        # Kullanıcı ID'sini al
        user_id = auth_result.get("localId")
        return session, id_token, user_id
    else:
        print(f"Giriş başarısız! Hata kodu: {response.status_code}")
        print(response.text)
        return None, None, None

def post_job_to_firebase(job_data, user_id):
    """
    İş ilanını Firebase'e ekler
    """
    try:
        # Kullanıcı ID'sini ekle
        job_data["userId"] = user_id
        job_data["createdAt"] = int(time.time() * 1000)
        job_data["status"] = "active"
        
        # Firebase'e ekle
        jobs_ref = db.reference('jobs')
        
        # Duplicate kontrolü
        query = jobs_ref.order_by_child('title').equal_to(job_data['title']).get()
        
        if not query:
            # Yeni ilan ekle
            new_job_ref = jobs_ref.push(job_data)
            print(f"İlan başarıyla eklendi: {job_data['title']}")
            return new_job_ref.key
        else:
            print(f"Bu ilan zaten mevcut: {job_data['title']}")
            return None
        
    except Exception as e:
        print(f"İlan eklenirken hata oluştu: {e}")
        return None

def parse_job_from_html(html_content):
    """
    HTML içeriğinden iş ilanı bilgilerini çıkarır
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # İlan başlığı
    title_element = soup.select_one('.classifiedDetailTitle h1')
    title = title_element.text.strip() if title_element else "İş İlanı"
    
    # İlan detayları
    info_list = soup.select('.classifiedInfoList li')
    job_info = {}
    
    for item in info_list:
        label = item.select_one('strong').text.strip() if item.select_one('strong') else ""
        value = item.select_one('span').text.strip() if item.select_one('span') else ""
        job_info[label] = value
    
    # İş tanımı
    description_element = soup.select_one('#classifiedDescription')
    description = description_element.text.strip() if description_element else ""
    
    # Kategori belirleme
    job_area = job_info.get('İş Alanı', "")
    position = job_info.get('Pozisyon', "")
    
    # Kategori eşleştirme
    category_mapping = {
        "Lojistik": "lojistik",
        "Bilişim": "teknoloji",
        "Eğitim": "egitim",
        "Sağlık": "saglik",
        "İnşaat": "insaat",
        "Turizm": "turizm",
        "Satış": "ticaret"
    }
    
    category = "diger"
    for key, value in category_mapping.items():
        if key in job_area:
            category = value
            break
    
    # Alt kategori belirleme
    sub_category = "custom"
    
    # Çalışma şekli
    work_type_mapping = {
        "Tam Zamanlı": "Tam Zamanlı",
        "Yarı Zamanlı": "Yarı Zamanlı",
        "Stajyer": "Stajyer",
        "Proje Bazlı": "Sözleşmeli"
    }
    
    work_type = job_info.get('Çalışma Şekli', "Tam Zamanlı")
    for key, value in work_type_mapping.items():
        if key in work_type:
            work_type = value
            break
    
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
        'contactEmail': EMAIL
    }
    
    return job_data

def main():
    # Siteye giriş yap
    session, id_token, user_id = login_to_site()
    
    if not session or not id_token or not user_id:
        print("Giriş yapılamadı, işlem sonlandırılıyor.")
        return
    
    # HTML içeriğini al (örnek olarak)
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
    
    # HTML içeriğinden iş ilanı bilgilerini çıkar
    job_data = parse_job_from_html(html_content)
    
    # İlanı Firebase'e ekle
    job_id = post_job_to_firebase(job_data, user_id)
    
    if job_id:
        print(f"İlan başarıyla eklendi. İlan ID: {job_id}")
    else:
        print("İlan eklenemedi.")

if __name__ == "__main__":
    main()