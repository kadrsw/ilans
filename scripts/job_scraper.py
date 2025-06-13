import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, db
import time
import random
import re
from datetime import datetime
import openai

# API Anahtarları ve Kimlik Bilgileri
OPENAI_API_KEY = "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"
FIREBASE_EMAIL = "acikadir1@gmail.com"
USER_ID = "ADMIN_USER_ID"

openai.api_key = OPENAI_API_KEY

def init_firebase():
    cred = credentials.Certificate("firebase-credentials.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
    })

def analyze_job_with_gpt(title, description):
    try:
        prompt = f"""
        İş ilanı başlığı: {title}
        İş ilanı açıklaması: {description}
        
        Bu iş ilanını analiz et ve aşağıdaki bilgileri JSON formatında döndür:
        1. Kategori (teknoloji, finans, eğitim, sağlık vb.)
        2. Alt kategori (yazılım geliştirici, muhasebeci, öğretmen vb.)
        3. Çalışma şekli (tam zamanlı, yarı zamanlı, uzaktan vb.)
        4. Lokasyon
        5. İlanın uygunluğu (uygun/uygunsuz)
        6. Düzenlenmiş başlık
        7. Düzenlenmiş açıklama (önemli noktaları içeren özet)
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        result = response.choices[0].message.content
        return eval(result)  # JSON string'i dict'e çevir

    except Exception as e:
        print(f"GPT analiz hatası: {e}")
        return None

def clean_text(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = ' '.join(text.split())
    return text

def scrape_jobs():
    sources = [
        'https://www.kariyer.net/is-ilanlari',
        'https://www.yenibiris.com/is-ilanlari',
        'https://www.secretcv.com/is-ilanlari',
    ]
    
    jobs = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    for url in sources:
        try:
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            job_listings = soup.find_all('div', class_=['job-listing', 'job-item'])
            
            for job in job_listings[:2]:
                title = clean_text(job.find(['h2', 'h3']).text)
                description = clean_text(job.find('p').text)
                
                # ChatGPT ile analiz
                analysis = analyze_job_with_gpt(title, description)
                
                if analysis and analysis['uygunluk'] == 'uygun':
                    jobs.append({
                        'title': analysis['düzenlenmiş_başlık'],
                        'description': analysis['düzenlenmiş_açıklama'],
                        'company': job.find(class_='company').text.strip(),
                        'location': analysis['lokasyon'],
                        'type': analysis['çalışma_şekli'],
                        'category': analysis['kategori'],
                        'subCategory': analysis['alt_kategori'],
                        'contactEmail': FIREBASE_EMAIL,
                        'userId': USER_ID,
                        'createdAt': int(time.time() * 1000),
                        'status': 'active'
                    })
            
            time.sleep(random.uniform(2, 4))
            
        except Exception as e:
            print(f"Scraping hatası ({url}): {e}")
            continue
    
    return jobs

def post_jobs_to_firebase(jobs):
    ref = db.reference('jobs')
    
    for job in jobs:
        # Duplicate kontrolü
        existing = list(ref.order_by_child('title')
                       .equal_to(job['title'])
                       .get().values())
        
        if not existing:
            ref.push(job)
            print(f"Yeni ilan eklendi: {job['title']}")
            time.sleep(1)

def main():
    print(f"İş ilanları taranıyor... {datetime.now()}")
    
    init_firebase()
    jobs = scrape_jobs()
    post_jobs_to_firebase(jobs)
    
    print(f"İşlem tamamlandı. {len(jobs)} ilan bulundu.")

if __name__ == "__main__":
    main()