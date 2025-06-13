import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import firebase_admin
from firebase_admin import credentials, db
import requests
from bs4 import BeautifulSoup
import re
import time
import threading

# Firebase kimlik bilgileri
FIREBASE_CREDENTIALS_PATH = "firebase-credentials.json"

# Sabit değişkenler
ADMIN_EMAIL = "acikadir1@gmail.com"
USER_ID = "Zx9hFgzSDfPC7KEygWKx5S4k26G3"

class JobScraperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("İş İlanı Çekme ve Paylaşma Uygulaması")
        self.root.geometry("900x700")
        
        # Firebase bağlantısı
        self.init_firebase()
        
        # Ana çerçeve
        main_frame = ttk.Frame(root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # URL giriş alanı
        url_frame = ttk.Frame(main_frame)
        url_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(url_frame, text="İlan URL:").pack(side=tk.LEFT, padx=5)
        self.url_entry = ttk.Entry(url_frame, width=70)
        self.url_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        # Örnek URL
        example_url = "https://www.sahibinden.com/ilan/is-ilanlari-tamir-bakim-arac-tamir-bakim-temizlik-egzoz-emisyon-olcum-personeli-ariyoruz-1231676647/detay"
        self.url_entry.insert(0, example_url)
        
        # Çekme butonu
        self.scrape_button = ttk.Button(url_frame, text="İlanı Çek", command=self.scrape_job)
        self.scrape_button.pack(side=tk.LEFT, padx=5)
        
        # İlan önizleme alanı
        preview_frame = ttk.LabelFrame(main_frame, text="İlan Önizleme", padding="10")
        preview_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # İlan detayları
        details_frame = ttk.Frame(preview_frame)
        details_frame.pack(fill=tk.BOTH, expand=True)
        
        # Sol taraf - Form alanları
        form_frame = ttk.Frame(details_frame)
        form_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        
        # Başlık
        ttk.Label(form_frame, text="Başlık:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.title_entry = ttk.Entry(form_frame, width=50)
        self.title_entry.grid(row=0, column=1, sticky=tk.EW, pady=2)
        
        # Şirket
        ttk.Label(form_frame, text="Şirket:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.company_entry = ttk.Entry(form_frame, width=50)
        self.company_entry.grid(row=1, column=1, sticky=tk.EW, pady=2)
        self.company_entry.insert(0, "İş Veren")
        
        # Lokasyon
        ttk.Label(form_frame, text="Lokasyon:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.location_entry = ttk.Entry(form_frame, width=50)
        self.location_entry.grid(row=2, column=1, sticky=tk.EW, pady=2)
        
        # Çalışma şekli
        ttk.Label(form_frame, text="Çalışma Şekli:").grid(row=3, column=0, sticky=tk.W, pady=2)
        self.work_type_combo = ttk.Combobox(form_frame, values=["Tam Zamanlı", "Yarı Zamanlı", "Uzaktan", "Stajyer", "Sözleşmeli"])
        self.work_type_combo.grid(row=3, column=1, sticky=tk.EW, pady=2)
        self.work_type_combo.current(0)
        
        # Kategori
        ttk.Label(form_frame, text="Kategori:").grid(row=4, column=0, sticky=tk.W, pady=2)
        self.categories = {
            "teknoloji": "Teknoloji",
            "egitim": "Eğitim",
            "saglik": "Sağlık",
            "insaat": "İnşaat",
            "hizmet": "Hizmet Sektörü",
            "sanayi": "Sanayi ve Üretim",
            "ticaret": "Ticaret ve Satış",
            "lojistik": "Lojistik",
            "finans": "Finans ve Muhasebe",
            "medya": "Medya ve Tasarım",
            "tarim": "Tarım ve Hayvancılık",
            "turizm": "Turizm",
            "guvenlik": "Güvenlik",
            "enerji": "Enerji",
            "perakende": "Perakende",
            "kamu": "Kamu ve Belediyecilik",
            "yonetim": "Yönetim",
            "havacilik": "Havacılık",
            "denizcilik": "Denizcilik",
            "sanat": "Sanat ve Eğlence",
            "diger": "Diğer"
        }
        self.category_combo = ttk.Combobox(form_frame, values=list(self.categories.values()))
        self.category_combo.grid(row=4, column=1, sticky=tk.EW, pady=2)
        self.category_combo.current(0)
        
        # Alt kategori
        ttk.Label(form_frame, text="Alt Kategori:").grid(row=5, column=0, sticky=tk.W, pady=2)
        self.subcategory_combo = ttk.Combobox(form_frame)
        self.subcategory_combo.grid(row=5, column=1, sticky=tk.EW, pady=2)
        
        # Maaş
        ttk.Label(form_frame, text="Maaş:").grid(row=6, column=0, sticky=tk.W, pady=2)
        self.salary_entry = ttk.Entry(form_frame, width=50)
        self.salary_entry.grid(row=6, column=1, sticky=tk.EW, pady=2)
        
        # İletişim e-posta
        ttk.Label(form_frame, text="İletişim E-posta:").grid(row=7, column=0, sticky=tk.W, pady=2)
        self.email_entry = ttk.Entry(form_frame, width=50)
        self.email_entry.grid(row=7, column=1, sticky=tk.EW, pady=2)
        self.email_entry.insert(0, ADMIN_EMAIL)

        # İletişim telefon
        ttk.Label(form_frame, text="İletişim Telefon:").grid(row=8, column=0, sticky=tk.W, pady=2)
        self.phone_entry = ttk.Entry(form_frame, width=50)
        self.phone_entry.grid(row=8, column=1, sticky=tk.EW, pady=2)

        # Telefon numarası için yardım metni
        phone_help = ttk.Label(form_frame, text="Örn: 5XX XXX XX XX", foreground="gray")
        phone_help.grid(row=9, column=1, sticky=tk.W, pady=(0, 2))
        
        # Sağ taraf - Açıklama
        desc_frame = ttk.Frame(details_frame)
        desc_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        ttk.Label(desc_frame, text="Açıklama:").pack(anchor=tk.W)
        self.description_text = scrolledtext.ScrolledText(desc_frame, wrap=tk.WORD, height=15)
        self.description_text.pack(fill=tk.BOTH, expand=True)
        
        # Butonlar
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=10)
        
        self.clear_button = ttk.Button(button_frame, text="Temizle", command=self.clear_form)
        self.clear_button.pack(side=tk.LEFT, padx=5)
        
        self.post_button = ttk.Button(button_frame, text="İlanı Paylaş", command=self.post_job)
        self.post_button.pack(side=tk.RIGHT, padx=5)
        
        # Log alanı
        log_frame = ttk.LabelFrame(main_frame, text="İşlem Günlüğü")
        log_frame.pack(fill=tk.X, pady=5)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, wrap=tk.WORD, height=6)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_text.config(state=tk.DISABLED)
        
        # Durum çubuğu
        self.status_var = tk.StringVar()
        self.status_var.set("Hazır")
        self.status_bar = ttk.Label(root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Log ekle
        self.log("Uygulama başlatıldı")
        self.log(f"Firebase bağlantısı kuruldu: {self.firebase_connected}")

    def init_firebase(self):
        """Firebase bağlantısını başlatır"""
        self.firebase_connected = False
        try:
            # Firebase kimlik bilgileri
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
            try:
                firebase_admin.initialize_app(cred, {
                    'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
                })
            except ValueError:
                # Uygulama zaten başlatılmış
                pass
            
            self.firebase_connected = True
            
        except Exception as e:
            self.log(f"Firebase bağlantı hatası: {e}")

    def log(self, message):
        """Log mesajı ekler"""
        timestamp = time.strftime("%H:%M:%S", time.localtime())
        log_message = f"[{timestamp}] {message}\n"
        
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, log_message)
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

    def set_status(self, message):
        """Durum çubuğunu günceller"""
        self.status_var.set(message)
        self.root.update_idletasks()

    def clear_form(self):
        """Form alanlarını temizler"""
        self.title_entry.delete(0, tk.END)
        self.company_entry.delete(0, tk.END)
        self.company_entry.insert(0, "İş Veren")
        self.location_entry.delete(0, tk.END)
        self.work_type_combo.current(0)
        self.category_combo.current(0)
        self.salary_entry.delete(0, tk.END)
        self.email_entry.delete(0, tk.END)
        self.email_entry.insert(0, ADMIN_EMAIL)
        self.phone_entry.delete(0, tk.END)
        self.description_text.delete(1.0, tk.END)
        
        self.log("Form temizlendi")

    def clean_text(self, text):
        """HTML etiketlerini ve fazla boşlukları temizler"""
        if not text:
            return ""
        text = re.sub(r'<[^>]+>', '', text)
        text = ' '.join(text.split())
        return text

    def scrape_job(self):
        """URL'den iş ilanı detaylarını çeker"""
        url = self.url_entry.get().strip()
        
        if not url:
            messagebox.showerror("Hata", "Lütfen bir URL girin")
            return
        
        self.set_status("İlan çekiliyor...")
        self.log(f"İlan çekiliyor: {url}")
        
        # Butonları devre dışı bırak
        self.scrape_button.config(state=tk.DISABLED)
        self.post_button.config(state=tk.DISABLED)
        
        # Arka planda çalıştır
        threading.Thread(target=self._scrape_job_thread, args=(url,), daemon=True).start()

    def _scrape_job_thread(self, url):
        """Arka planda iş ilanı çekme işlemi"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            self.log("Sayfa yükleniyor...")
            response = requests.get(url, headers=headers)
            
            if response.status_code != 200:
                self.log(f"Hata: Sayfa yüklenemedi. Durum kodu: {response.status_code}")
                messagebox.showerror("Hata", f"Sayfa yüklenemedi. Durum kodu: {response.status_code}")
                self.set_status("Hazır")
                self.scrape_button.config(state=tk.NORMAL)
                self.post_button.config(state=tk.NORMAL)
                return
            
            self.log("Sayfa yüklendi, içerik ayrıştırılıyor...")
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # İlan başlığı
            title_element = soup.select_one('.classifiedDetailTitle h1')
            title = self.clean_text(title_element.text) if title_element else ""
            
            # İlan detayları
            info_list = soup.select('.classifiedInfoList li')
            job_info = {}
            
            for item in info_list:
                label = self.clean_text(item.select_one('strong').text) if item.select_one('strong') else ""
                value = self.clean_text(item.select_one('span').text) if item.select_one('span') else ""
                job_info[label] = value
                self.log(f"Bilgi: {label} = {value}")
            
            # İş tanımı
            description_element = soup.select_one('#classifiedDescription')
            description = self.clean_text(description_element.text) if description_element else ""
            
            # Form alanlarını doldur
            self.root.after(0, lambda: self.title_entry.delete(0, tk.END))
            self.root.after(0, lambda: self.title_entry.insert(0, title))
            
            self.root.after(0, lambda: self.location_entry.delete(0, tk.END))
            self.root.after(0, lambda: self.location_entry.insert(0, job_info.get('İl / İlçe', '').split('/')[0].strip()))
            
            # Çalışma şekli
            work_type = job_info.get('Çalışma Şekli', '')
            work_type_index = 0
            if 'Tam Zamanlı' in work_type:
                work_type_index = 0
            elif 'Yarı Zamanlı' in work_type:
                work_type_index = 1
            elif 'Uzaktan' in work_type:
                work_type_index = 2
            elif 'Stajyer' in work_type:
                work_type_index = 3
            elif 'Sözleşmeli' in work_type:
                work_type_index = 4
            self.root.after(0, lambda: self.work_type_combo.current(work_type_index))
            
            # Açıklama
            self.root.after(0, lambda: self.description_text.delete(1.0, tk.END))
            self.root.after(0, lambda: self.description_text.insert(1.0, description))
            
            self.log("İlan başarıyla çekildi")
            self.set_status("İlan çekildi")
            
        except Exception as e:
            self.log(f"İlan çekilirken hata oluştu: {e}")
            messagebox.showerror("Hata", f"İlan çekilirken hata oluştu: {e}")
            self.set_status("Hata")
        
        finally:
            # Butonları tekrar aktif et
            self.root.after(0, lambda: self.scrape_button.config(state=tk.NORMAL))
            self.root.after(0, lambda: self.post_button.config(state=tk.NORMAL))

    def post_job(self):
        """İş ilanını Firebase'e kaydeder"""
        if not self.firebase_connected:
            messagebox.showerror("Hata", "Firebase bağlantısı kurulamadı")
            return
        
        # Form verilerini al
        title = self.title_entry.get().strip()
        company = self.company_entry.get().strip()
        location = self.location_entry.get().strip()
        work_type = self.work_type_combo.get()
        category = self.category_combo.get()
        subcategory = self.subcategory_combo.get()
        salary = self.salary_entry.get().strip()
        email = self.email_entry.get().strip()
        phone = self.phone_entry.get().strip()
        description = self.description_text.get(1.0, tk.END).strip()
        
        # Doğrulama
        if not title:
            messagebox.showerror("Hata", "Lütfen bir başlık girin")
            return
        
        if not location:
            messagebox.showerror("Hata", "Lütfen bir lokasyon girin")
            return
        
        if not description:
            messagebox.showerror("Hata", "Lütfen bir açıklama girin")
            return

        # Telefon numarası formatını kontrol et
        if phone and not re.match(r'^5[0-9]{9}$', phone):
            messagebox.showerror("Hata", "Geçerli bir telefon numarası girin (5XX XXX XX XX)")
            return
        
        # En az bir iletişim yöntemi gerekli
        if not email and not phone:
            messagebox.showerror("Hata", "Lütfen en az bir iletişim yöntemi (e-posta veya telefon) girin")
            return
        
        # İş ilanı verisi
        job_data = {
            'title': title,
            'company': company,
            'description': description,
            'location': location,
            'type': work_type,
            'category': category,
            'subCategory': subcategory,
            'salary': salary,
            'contactEmail': email,
            'contactPhone': phone,
            'userId': USER_ID,
            'createdAt': int(time.time() * 1000),
            'status': 'active'
        }
        
        self.set_status("İlan paylaşılıyor...")
        self.log("İlan paylaşılıyor...")
        
        # Butonları devre dışı bırak
        self.scrape_button.config(state=tk.DISABLED)
        self.post_button.config(state=tk.DISABLED)
        
        # Arka planda çalıştır
        threading.Thread(target=self._post_job_thread, args=(job_data,), daemon=True).start()

    def _post_job_thread(self, job_data):
        """Arka planda iş ilanı paylaşma işlemi"""
        try:
            jobs_ref = db.reference('jobs')
            
            # Duplicate kontrolü
            query = jobs_ref.order_by_child('title').equal_to(job_data['title']).get()
            
            if query:
                self.log(f"Bu ilan zaten mevcut: {job_data['title']}")
                messagebox.showwarning("Uyarı", "Bu başlıkta bir ilan zaten mevcut")
            else:
                # Yeni ilan ekle
                new_job_ref = jobs_ref.push(job_data)
                self.log(f"İlan başarıyla paylaşıldı: {job_data['title']}")
                messagebox.showinfo("Başarılı", "İlan başarıyla paylaşıldı")
            
            self.set_status("Hazır")
            
        except Exception as e:
            self.log(f"İlan paylaşılırken hata oluştu: {e}")
            messagebox.showerror("Hata", f"İlan paylaşılırken hata oluştu: {e}")
            self.set_status("Hata")
        
        finally:
            # Butonları tekrar aktif et
            self.root.after(0, lambda: self.scrape_button.config(state=tk.NORMAL))
            self.root.after(0, lambda: self.post_button.config(state=tk.NORMAL))

def main():
    root = tk.Tk()
    app = JobScraperApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()