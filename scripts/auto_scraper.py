import time
import json
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db
import re
import logging
from datetime import datetime

# Logging ayarları
logging.basicConfig(
    filename=f'scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Firebase kimlik bilgileri
FIREBASE_CREDENTIALS_PATH = "firebase-credentials.json"
ADMIN_EMAIL = "acikadir1@gmail.com"
USER_ID = "Zx9hFgzSDfPC7KEygWKx5S4k26G3"

class JobScraper:
    def __init__(self):
        self.init_firebase()
        self.setup_driver()
        self.jobs = []
        
    def init_firebase(self):
        """Firebase bağlantısını başlatır"""
        try:
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
            try:
                firebase_admin.initialize_app(cred, {
                    'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
                })
            except ValueError:
                pass
            logging.info("Firebase bağlantısı başarılı")
        except Exception as e:
            logging.error(f"Firebase bağlantı hatası: {e}")
            raise

    def setup_driver(self):
        """Selenium WebDriver'ı yapılandırır"""
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')  # Arka planda çalıştır
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        # ChromeDriver'ı otomatik olarak yönet
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def clean_text(self, text):
        """Metni temizler"""
        if not text:
            return ""
        text = re.sub(r'<[^>]+>', '', text)
        text = ' '.join(text.split())
        return text

    def get_job_links(self, page_count=5):
        """Ana sayfadan iş ilanı linklerini toplar"""
        job_links = []
        base_url = "https://www.sahibinden.com/is-ilanlari"
        
        for page in range(1, page_count + 1):
            try:
                url = f"{base_url}?pagingOffset={20 * (page - 1)}" if page > 1 else base_url
                logging.info(f"Sayfa yükleniyor: {url}")
                
                self.driver.get(url)
                time.sleep(2)  # Sayfanın yüklenmesi için bekle
                
                # İlan linklerini topla
                links = self.driver.find_elements(By.CSS_SELECTOR, "tr.searchResultsItem td.searchResultsTitleValue a")
                
                for link in links:
                    href = link.get_attribute('href')
                    if href and '/ilan/' in href:
                        job_links.append(href)
                        logging.info(f"Link bulundu: {href}")
                
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                logging.error(f"Sayfa {page} işlenirken hata: {e}")
                continue
        
        return job_links

    def scrape_job_details(self, url):
        """İş ilanı detaylarını çeker"""
        try:
            logging.info(f"İlan detayları çekiliyor: {url}")
            self.driver.get(url)
            time.sleep(2)
            
            # Başlık
            title = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".classifiedDetailTitle h1"))
            ).text
            
            # İlan detayları
            info_elements = self.driver.find_elements(By.CSS_SELECTOR, ".classifiedInfoList li")
            job_info = {}
            
            for element in info_elements:
                try:
                    label = element.find_element(By.CSS_SELECTOR, "strong").text.strip()
                    value = element.find_element(By.CSS_SELECTOR, "span").text.strip()
                    job_info[label] = value
                except:
                    continue
            
            # İş tanımı
            description = self.wait.until(
                EC.presence_of_element_located((By.ID, "classifiedDescription"))
            ).text
            
            # İletişim bilgileri
            contact_info = {}
            try:
                contact_elements = self.driver.find_elements(By.CSS_SELECTOR, ".userContactInfo li")
                for element in contact_elements:
                    try:
                        contact_type = element.find_element(By.CSS_SELECTOR, "strong").text.strip()
                        contact_value = element.find_element(By.CSS_SELECTOR, "span").text.strip()
                        contact_info[contact_type] = contact_value
                    except:
                        continue
            except:
                logging.warning(f"İletişim bilgileri alınamadı: {url}")
            
            # Kategori belirleme
            category, subcategory = self.determine_category(
                job_info.get('İş Alanı', ''),
                job_info.get('Pozisyon', '')
            )
            
            # İş ilanı verisi
            job_data = {
                'title': title,
                'company': "İş Veren",
                'description': description,
                'location': job_info.get('İl / İlçe', '').split('/')[0].strip(),
                'type': self.convert_work_type(job_info.get('Çalışma Şekli', '')),
                'category': category,
                'subCategory': subcategory,
                'contactEmail': ADMIN_EMAIL,
                'userId': USER_ID,
                'createdAt': int(time.time() * 1000),
                'status': 'active',
                'originalUrl': url
            }
            
            return job_data
            
        except Exception as e:
            logging.error(f"İlan detayları çekilirken hata: {url} - {e}")
            return None

    def determine_category(self, job_area, position):
        """İş alanı ve pozisyona göre kategori belirler"""
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
        
        for key, value in category_mapping.items():
            if key in job_area or key in position:
                return value
        
        return ["diger", "custom"]

    def convert_work_type(self, work_type):
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
        
        return "Tam Zamanlı"

    def save_to_firebase(self, job_data):
        """İş ilanını Firebase'e kaydeder"""
        try:
            jobs_ref = db.reference('jobs')
            
            # Duplicate kontrolü
            query = jobs_ref.order_by_child('title').equal_to(job_data['title']).get()
            
            if not query:
                new_job_ref = jobs_ref.push(job_data)
                logging.info(f"İlan kaydedildi: {job_data['title']}")
                return True
            else:
                logging.info(f"İlan zaten mevcut: {job_data['title']}")
                return False
                
        except Exception as e:
            logging.error(f"Firebase kayıt hatası: {e}")
            return False

    def save_to_csv(self, filename="ilanlar.csv"):
        """İlanları CSV dosyasına kaydeder"""
        if self.jobs:
            df = pd.DataFrame(self.jobs)
            df.to_csv(filename, index=False, encoding='utf-8-sig')
            logging.info(f"İlanlar CSV dosyasına kaydedildi: {filename}")

    def run(self, page_count=5):
        """Scraper'ı çalıştırır"""
        try:
            # İlan linklerini topla
            job_links = self.get_job_links(page_count)
            logging.info(f"Toplam {len(job_links)} ilan linki bulundu")
            
            # Her link için detayları çek
            for url in job_links:
                try:
                    job_data = self.scrape_job_details(url)
                    if job_data:
                        self.jobs.append(job_data)
                        # Firebase'e kaydet
                        self.save_to_firebase(job_data)
                        time.sleep(1)  # Rate limiting
                except Exception as e:
                    logging.error(f"İlan işlenirken hata: {url} - {e}")
                    continue
            
            # CSV'ye kaydet
            self.save_to_csv()
            
        except Exception as e:
            logging.error(f"Scraper çalışırken hata: {e}")
        finally:
            self.driver.quit()

if __name__ == "__main__":
    scraper = JobScraper()
    scraper.run(page_count=5)  # İlk 5 sayfadaki ilanları çek