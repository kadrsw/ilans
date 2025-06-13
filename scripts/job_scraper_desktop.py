import sys
import os
import time
import json
import requests
from bs4 import BeautifulSoup
import re
import firebase_admin
from firebase_admin import credentials, db
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import threading
from PIL import Image, ImageTk
import urllib.request
from io import BytesIO

# Firebase kimlik bilgileri
FIREBASE_CREDENTIALS_PATH = "firebase-credentials.json"

# Sabit değişkenler
ADMIN_EMAIL = "acikadir1@gmail.com"
USER_ID = "Zx9hFgzSDfPC7KEygWKx5S4k26G3"  # Admin kullanıcı ID'si

class JobScraperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("İş İlanı Çekme ve Paylaşma Uygulaması")
        self.root.geometry("1000x800")
        self.root.minsize(800, 600)
        self.root.configure(bg="#f5f5f5")
        
        # Stil ayarları
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure('TFrame', background='#f5f5f5')
        self.style.configure('TLabel', background='#f5f5f5', font=('Segoe UI', 10))
        self.style.configure('TButton', font=('Segoe UI', 10))
        self.style.configure('Header.TLabel', font=('Segoe UI', 14, 'bold'))
        self.style.configure('Title.TLabel', font=('Segoe UI', 12, 'bold'))
        
        # Ana çerçeve
        main_frame = ttk.Frame(root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # Başlık
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(header_frame, text="İş İlanı Çekme ve Paylaşma Uygulaması", style='Header.TLabel').pack(side=tk.LEFT)
        
        # Firebase bağlantısı
        self.init_firebase()
        
        # Alt kategorileri yükle
        self.load_subcategories()
        
        # Üst kısım - URL ve kontroller
        top_frame = ttk.Frame(main_frame)
        top_frame.pack(fill=tk.X, pady=(0, 15))
        
        # URL giriş alanı
        url_frame = ttk.Frame(top_frame)
        url_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(url_frame, text="İlan URL:").pack(side=tk.LEFT, padx=(0, 5))
        self.url_entry = ttk.Entry(url_frame, width=70, font=('Segoe UI', 10))
        self.url_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        # Örnek URL
        example_url = "https://www.sahibinden.com/ilan/is-ilanlari-tamir-bakim-arac-tamir-bakim-temizlik-egzoz-emisyon-olcum-personeli-ariyoruz-1231676647/detay"
        self.url_entry.insert(0, example_url)
        
        # Çekme butonu
        self.scrape_button = ttk.Button(url_frame, text="İlanı Çek", command=self.scrape_job)
        self.scrape_button.pack(side=tk.LEFT, padx=5)
        
        # Buton çerçevesi
        button_frame = ttk.Frame(top_frame)
        button_frame.pack(fill=tk.X, pady=(5, 0))
        
        # JSON kaydetme butonu
        self.save_json_button = ttk.Button(button_frame, text="JSON Olarak Kaydet", command=self.save_to_json)
        self.save_json_button.pack(side=tk.LEFT, padx=(0, 5))
        
        # JSON yükleme butonu
        self.load_json_button = ttk.Button(button_frame, text="JSON'dan Yükle", command=self.load_from_json)
        self.load_json_button.pack(side=tk.LEFT, padx=5)
        
        # Temizle butonu
        self.clear_button = ttk.Button(button_frame, text="Formu Temizle", command=self.clear_form)
        self.clear_button.pack(side=tk.LEFT, padx=5)
        
        # Firebase'e paylaşma butonu
        self.post_button = ttk.Button(button_frame, text="Firebase'e Paylaş", command=self.post_job)
        self.post_button.pack(side=tk.RIGHT, padx=5)
        
        # İçerik çerçevesi
        content_frame = ttk.Frame(main_frame)
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Sol taraf - Form alanları
        form_frame = ttk.LabelFrame(content_frame, text="İlan Bilgileri", padding=10)
        form_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        
        # Form içeriği
        form_content = ttk.Frame(form_frame)
        form_content.pack(fill=tk.BOTH, expand=True)
        
        # Başlık
        ttk.Label(form_content, text="Başlık:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.title_entry = ttk.Entry(form_content, width=50, font=('Segoe UI', 10))
        self.title_entry.grid(row=0, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        
        # Şirket
        ttk.Label(form_content, text="Şirket:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.company_entry = ttk.Entry(form_content, width=50, font=('Segoe UI', 10))
        self.company_entry.grid(row=1, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        self.company_entry.insert(0, "İş Veren")
        
        # Lokasyon
        ttk.Label(form_content, text="Lokasyon:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.location_entry = ttk.Entry(form_content, width=50, font=('Segoe UI', 10))
        self.location_entry.grid(row=2, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        
        # Çalışma şekli
        ttk.Label(form_content, text="Çalışma Şekli:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.work_type_combo = ttk.Combobox(form_content, values=["Tam Zamanlı", "Yarı Zamanlı", "Uzaktan", "Stajyer", "Sözleşmeli"], font=('Segoe UI', 10))
        self.work_type_combo.grid(row=3, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        self.work_type_combo.current(0)
        
        # Kategori
        ttk.Label(form_content, text="Kategori:").grid(row=4, column=0, sticky=tk.W, pady=5)
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
        self.category_combo = ttk.Combobox(form_content, values=list(self.categories.values()), font=('Segoe UI', 10))
        self.category_combo.grid(row=4, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        self.category_combo.current(0)
        self.category_combo.bind("<<ComboboxSelected>>", self.update_subcategories)
        
        # Alt kategori
        ttk.Label(form_content, text="Alt Kategori:").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.subcategory_combo = ttk.Combobox(form_content, font=('Segoe UI', 10))
        self.subcategory_combo.grid(row=5, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        
        # Maaş
        ttk.Label(form_content, text="Maaş:").grid(row=6, column=0, sticky=tk.W, pady=5)
        self.salary_entry = ttk.Entry(form_content, width=50, font=('Segoe UI', 10))
        self.salary_entry.grid(row=6, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        
        # İletişim e-posta
        ttk.Label(form_content, text="İletişim E-posta:").grid(row=7, column=0, sticky=tk.W, pady=5)
        self.email_entry = ttk.Entry(form_content, width=50, font=('Segoe UI', 10))
        self.email_entry.grid(row=7, column=1, sticky=tk.EW, pady=5, padx=(5, 0))
        self.email_entry.insert(0, ADMIN_EMAIL)
        
        # Sütun genişliklerini ayarla
        form_content.columnconfigure(1, weight=1)
        
        # Sağ taraf - Açıklama ve önizleme
        right_frame = ttk.Frame(content_frame)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Açıklama
        desc_frame = ttk.LabelFrame(right_frame, text="İş Tanımı", padding=10)
        desc_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        self.description_text = scrolledtext.ScrolledText(desc_frame, wrap=tk.WORD, height=10, font=('Segoe UI', 10))
        self.description_text.pack(fill=tk.BOTH, expand=True)
        
        # Önizleme
        preview_frame = ttk.LabelFrame(right_frame, text="Önizleme", padding=10)
        preview_frame.pack(fill=tk.BOTH, expand=True)
        
        self.preview_text = scrolledtext.ScrolledText(preview_frame, wrap=tk.WORD, height=8, font=('Segoe UI', 10))
        self.preview_text.pack(fill=tk.BOTH, expand=True)
        self.preview_text.config(state=tk.DISABLED)
        
        # Log alanı
        log_frame = ttk.LabelFrame(main_frame, text="İşlem Günlüğü", padding=10)
        log_frame.pack(fill=tk.X, pady=(15, 0))
        
        self.log_text = scrolledtext.ScrolledText(log_frame, wrap=tk.WORD, height=6, font=('Segoe UI', 9))
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_text.config(state=tk.DISABLED)
        
        # Durum çubuğu
        self.status_var = tk.StringVar()
        self.status_var.set("Hazır")
        self.status_bar = ttk.Label(root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # İlk alt kategori listesini yükle
        self.update_subcategories(None)
        
        # Form değişikliklerini izle
        self.setup_form_tracking()
        
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

    def load_subcategories(self):
        """Kategori-alt kategori eşleştirmelerini yükler"""
        self.subcategories = {
            "Teknoloji": ["Yazılım Geliştirici", "Web Tasarımcısı", "Veri Analisti", "Sistem Yöneticisi", "Siber Güvenlik Uzmanı"],
            "Eğitim": ["Öğretmen", "Akademisyen", "Rehberlik ve Psikolojik Danışman", "Özel Ders Eğitmeni", "Kreş Öğretmeni"],
            "Sağlık": ["Doktor", "Hemşire", "Eczacı", "Fizyoterapist", "Diş Hekimi"],
            "İnşaat": ["İnşaat Mühendisi", "Mimar", "Şantiye Şefi", "İnşaat İşçisi", "Elektrik Ustası"],
            "Hizmet Sektörü": ["Garson", "Aşçı", "Barista", "Temizlik Görevlisi", "Resepsiyonist"],
            "Sanayi ve Üretim": ["Üretim Operatörü", "Makine Mühendisi", "Elektrik Elektronik Mühendisi", "Kaynakçı", "CNC Operatörü"],
            "Ticaret ve Satış": ["Satış Temsilcisi", "Pazarlama Uzmanı", "E-Ticaret Uzmanı", "Mağaza Müdürü", "Kasiyer"],
            "Lojistik": ["Şoför", "Depo Görevlisi", "Forklift Operatörü", "Sevkiyat Sorumlusu", "Kargo Görevlisi"],
            "Finans ve Muhasebe": ["Muhasebeci", "Mali Müşavir", "Finansal Analist", "Krediler Uzmanı", "Banka Personeli"],
            "Medya ve Tasarım": ["Grafik Tasarımcı", "Video Editörü", "Fotoğrafçı", "Sosyal Medya Uzmanı", "Reklam Metin Yazarı"],
            "Tarım ve Hayvancılık": ["Ziraat Mühendisi", "Veteriner Hekim", "Çiftlik İşçisi", "Seracı", "Sulama Teknikeri"],
            "Turizm": ["Tur Rehberi", "Otel Yöneticisi", "Animatör", "Plaj Görevlisi", "Barmen"],
            "Güvenlik": ["Özel Güvenlik Görevlisi", "Bekçi", "Kamera Sistemleri Operatörü"],
            "Enerji": ["Enerji Mühendisi", "Rüzgar Enerjisi Teknisyeni", "Güneş Paneli Montajcısı"],
            "Perakende": ["Mağaza Satış Danışmanı", "Depo Elemanı", "Reyon Görevlisi"],
            "Kamu ve Belediyecilik": ["Memur", "Zabıta", "İtfaiye Eri", "Sosyal Hizmet Uzmanı"],
            "Yönetim": ["İnsan Kaynakları Uzmanı", "Proje Yöneticisi", "İş Geliştirme Uzmanı"],
            "Havacılık": ["Pilot", "Kabin Memuru", "Hava Trafik Kontrolörü", "Teknik Bakım Personeli"],
            "Denizcilik": ["Gemi Kaptanı", "Güverte Personeli", "Makineci"],
            "Sanat ve Eğlence": ["Müzisyen", "Oyuncu", "Dansçı", "Seslendirme Sanatçısı"],
            "Diğer": ["Özel Kategori"]
        }
        
        # Kategori ID'leri
        self.category_ids = {
            "Teknoloji": "teknoloji",
            "Eğitim": "egitim",
            "Sağlık": "saglik",
            "İnşaat": "insaat",
            "Hizmet Sektörü": "hizmet",
            "Sanayi ve Üretim": "sanayi",
            "Ticaret ve Satış": "ticaret",
            "Lojistik": "lojistik",
            "Finans ve Muhasebe": "finans",
            "Medya ve Tasarım": "medya",
            "Tarım ve Hayvancılık": "tarim",
            "Turizm": "turizm",
            "Güvenlik": "guvenlik",
            "Enerji": "enerji",
            "Perakende": "perakende",
            "Kamu ve Belediyecilik": "kamu",
            "Yönetim": "yonetim",
            "Havacılık": "havacilik",
            "Denizcilik": "denizcilik",
            "Sanat ve Eğlence": "sanat",
            "Diğer": "diger"
        }
        
        # Alt kategori ID'leri
        self.subcategory_ids = {
            "Yazılım Geliştirici": "yazilim-gelistirici",
            "Web Tasarımcısı": "web-tasarimcisi",
            "Veri Analisti": "veri-analisti",
            "Sistem Yöneticisi": "sistem-yoneticisi",
            "Siber Güvenlik Uzmanı": "siber-guvenlik",
            "Öğretmen": "ogretmen",
            "Akademisyen": "akademisyen",
            "Rehberlik ve Psikolojik Danışman": "rehberlik",
            "Özel Ders Eğitmeni": "ozel-ogretmen",
            "Kreş Öğretmeni": "kres-ogretmeni",
            "Doktor": "doktor",
            "Hemşire": "hemsire",
            "Eczacı": "eczaci",
            "Fizyoterapist": "fizyoterapist",
            "Diş Hekimi": "dis-hekimi",
            "İnşaat Mühendisi": "insaat-muhendisi",
            "Mimar": "mimar",
            "Şantiye Şefi": "santiye-sefi",
            "İnşaat İşçisi": "insaat-iscisi",
            "Elektrik Ustası": "elektrik-ustasi",
            "Garson": "garson",
            "Aşçı": "asci",
            "Barista": "barista",
            "Temizlik Görevlisi": "temizlik",
            "Resepsiyonist": "resepsiyonist",
            "Üretim Operatörü": "uretim-operatoru",
            "Makine Mühendisi": "makine-muhendisi",
            "Elektrik Elektronik Mühendisi": "elektrik-elektronik",
            "Kaynakçı": "kaynakci",
            "CNC Operatörü": "cnc-operatoru",
            "Satış Temsilcisi": "satis-temsilcisi",
            "Pazarlama Uzmanı": "pazarlama-uzmani",
            "E-Ticaret Uzmanı": "e-ticaret",
            "Mağaza Müdürü": "magaza-muduru",
            "Kasiyer": "kasiyer",
            "Şoför": "sofor",
            "Depo Görevlisi": "depo-gorevlisi",
            "Forklift Operatörü": "forklift-operatoru",
            "Sevkiyat Sorumlusu": "sevkiyat",
            "Kargo Görevlisi": "kargo-gorevlisi",
            "Muhasebeci": "muhasebeci",
            "Mali Müşavir": "mali-musavir",
            "Finansal Analist": "finansal-analist",
            "Krediler Uzmanı": "krediler-uzmani",
            "Banka Personeli": "banka-personeli",
            "Grafik Tasarımcı": "grafik-tasarimci",
            "Video Editörü": "video-editor",
            "Fotoğrafçı": "fotografci",
            "Sosyal Medya Uzmanı": "sosyal-medya",
            "Reklam Metin Yazarı": "reklam-yazari",
            "Ziraat Mühendisi": "ziraat-muhendisi",
            "Veteriner Hekim": "veteriner",
            "Çiftlik İşçisi": "ciftlik-iscisi",
            "Seracı": "seraci",
            "Sulama Teknikeri": "sulama-teknikeri",
            "Tur Rehberi": "tur-rehberi",
            "Otel Yöneticisi": "otel-yoneticisi",
            "Animatör": "animator",
            "Plaj Görevlisi": "plaj-gorevlisi",
            "Barmen": "barmen",
            "Özel Güvenlik Görevlisi": "ozel-guvenlik",
            "Bekçi": "bekci",
            "Kamera Sistemleri Operatörü": "kamera-operatoru",
            "Enerji Mühendisi": "enerji-muhendisi",
            "Rüzgar Enerjisi Teknisyeni": "ruzgar-teknisyeni",
            "Güneş Paneli Montajcısı": "gunes-montajcisi",
            "Mağaza Satış Danışmanı": "satis-danismani",
            "Depo Elemanı": "depo-elemani",
            "Reyon Görevlisi": "reyon-gorevlisi",
            "Memur": "memur",
            "Zabıta": "zabita",
            "İtfaiye Eri": "itfaiye",
            "Sosyal Hizmet Uzmanı": "sosyal-hizmet",
            "İnsan Kaynakları Uzmanı": "insan-kaynaklari",
            "Proje Yöneticisi": "proje-yoneticisi",
            "İş Geliştirme Uzmanı": "is-gelistirme",
            "Pilot": "pilot",
            "Kabin Memuru": "kabin-memuru",
            "Hava Trafik Kontrolörü": "hava-trafik",
            "Teknik Bakım Personeli": "teknik-bakim",
            "Gemi Kaptanı": "gemi-kaptani",
            "Güverte Personeli": "guverte",
            "Makineci": "makineci",
            "Müzisyen": "muzisyen",
            "Oyuncu": "oyuncu",
            "Dansçı": "dansci",
            "Seslendirme Sanatçısı": "seslendirme",
            "Özel Kategori": "custom"
        }

    def update_subcategories(self, event):
        """Seçilen kategoriye göre alt kategorileri günceller"""
        selected_category = self.category_combo.get()
        if selected_category in self.subcategories:
            self.subcategory_combo['values'] = self.subcategories[selected_category]
            if self.subcategories[selected_category]:
                self.subcategory_combo.current(0)
                self.update_preview()

    def setup_form_tracking(self):
        """Form değişikliklerini izlemek için bağlantıları kurar"""
        self.title_entry.bind("<KeyRelease>", self.update_preview)
        self.company_entry.bind("<KeyRelease>", self.update_preview)
        self.location_entry.bind("<KeyRelease>", self.update_preview)
        self.work_type_combo.bind("<<ComboboxSelected>>", self.update_preview)
        self.category_combo.bind("<<ComboboxSelected>>", self.update_preview)
        self.subcategory_combo.bind("<<ComboboxSelected>>", self.update_preview)
        self.salary_entry.bind("<KeyRelease>", self.update_preview)
        self.email_entry.bind("<KeyRelease>", self.update_preview)
        self.description_text.bind("<KeyRelease>", self.update_preview)

    def update_preview(self, event=None):
        """Önizleme alanını günceller"""
        try:
            title = self.title_entry.get().strip()
            company = self.company_entry.get().strip()
            location = self.location_entry.get().strip()
            work_type = self.work_type_combo.get()
            category_display = self.category_combo.get()
            subcategory_display = self.subcategory_combo.get()
            salary = self.salary_entry.get().strip()
            email = self.email_entry.get().strip()
            description = self.description_text.get(1.0, tk.END).strip()
            
            # Kategori ve alt kategori ID'lerini al
            category = self.category_ids.get(category_display, "diger")
            subcategory = self.subcategory_ids.get(subcategory_display, "custom")
            
            # Önizleme metni
            preview_text = f"Başlık: {title}\n"
            preview_text += f"Şirket: {company}\n"
            preview_text += f"Lokasyon: {location}\n"
            preview_text += f"Çalışma Şekli: {work_type}\n"
            preview_text += f"Kategori: {category_display} ({category})\n"
            preview_text += f"Alt Kategori: {subcategory_display} ({subcategory})\n"
            preview_text += f"Maaş: {salary}\n"
            preview_text += f"İletişim: {email}\n\n"
            
            # Açıklama önizlemesi (ilk 100 karakter)
            if description:
                preview_text += f"Açıklama: {description[:100]}{'...' if len(description) > 100 else ''}"
            
            # Önizleme alanını güncelle
            self.preview_text.config(state=tk.NORMAL)
            self.preview_text.delete(1.0, tk.END)
            self.preview_text.insert(tk.END, preview_text)
            self.preview_text.config(state=tk.DISABLED)
            
        except Exception as e:
            self.log(f"Önizleme güncellenirken hata: {e}")

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
        self.update_subcategories(None)
        self.salary_entry.delete(0, tk.END)
        self.email_entry.delete(0, tk.END)
        self.email_entry.insert(0, ADMIN_EMAIL)
        self.description_text.delete(1.0, tk.END)
        
        self.update_preview()
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
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
            
            # Kategori belirleme
            job_area = job_info.get('İş Alanı', "")
            position = job_info.get('Pozisyon', "")
            
            # Kategori ve alt kategori eşleştirme
            category, subcategory = self.determine_category(job_area, position)
            
            # Çalışma şekli
            work_type = self.convert_work_type(job_info.get('Çalışma Şekli', ""))
            
            # Lokasyon
            location = job_info.get('İl / İlçe', "").split('/')[0].strip() if '/' in job_info.get('İl / İlçe', "") else job_info.get('İl / İlçe', "")
            
            # Form alanlarını doldur
            self.root.after(0, lambda: self.title_entry.delete(0, tk.END))
            self.root.after(0, lambda: self.title_entry.insert(0, title))
            
            self.root.after(0, lambda: self.location_entry.delete(0, tk.END))
            self.root.after(0, lambda: self.location_entry.insert(0, location))
            
            # Çalışma şekli
            work_type_index = 0
            work_types = ["Tam Zamanlı", "Yarı Zamanlı", "Uzaktan", "Stajyer", "Sözleşmeli"]
            if work_type in work_types:
                work_type_index = work_types.index(work_type)
            self.root.after(0, lambda: self.work_type_combo.current(work_type_index))
            
            # Kategori
            category_display = self.categories.get(category, "Diğer")
            category_index = 0
            category_values = list(self.categories.values())
            if category_display in category_values:
                category_index = category_values.index(category_display)
            self.root.after(0, lambda: self.category_combo.current(category_index))
            
            # Alt kategori güncelleme
            self.root.after(0, self.update_subcategories, None)
            
            # Açıklama
            self.root.after(0, lambda: self.description_text.delete(1.0, tk.END))
            self.root.after(0, lambda: self.description_text.insert(1.0, description))
            
            # Önizlemeyi güncelle
            self.root.after(0, self.update_preview)
            
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

    def determine_category(self, job_area, position):
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
        
        return "Tam Zamanlı"  # Varsayılan değer

    def get_job_data(self):
        """Form verilerinden iş ilanı verisi oluşturur"""
        title = self.title_entry.get().strip()
        company = self.company_entry.get().strip()
        location = self.location_entry.get().strip()
        work_type = self.work_type_combo.get()
        category_display = self.category_combo.get()
        subcategory_display = self.subcategory_combo.get()
        salary = self.salary_entry.get().strip()
        email = self.email_entry.get().strip()
        description = self.description_text.get(1.0, tk.END).strip()
        
        # Kategori ve alt kategori ID'lerini al
        category = self.category_ids.get(category_display, "diger")
        subcategory = self.subcategory_ids.get(subcategory_display, "custom")
        
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
            'userId': USER_ID,
            'createdAt': int(time.time() * 1000),
            'status': 'active'
        }
        
        return job_data

    def validate_job_data(self, job_data):
        """İş ilanı verisini doğrular"""
        if not job_data['title']:
            messagebox.showerror("Hata", "Lütfen bir başlık girin")
            return False
        
        if not job_data['location']:
            messagebox.showerror("Hata", "Lütfen bir lokasyon girin")
            return False
        
        if not job_data['description']:
            messagebox.showerror("Hata", "Lütfen bir açıklama girin")
            return False
        
        return True

    def save_to_json(self):
        """İş ilanını JSON dosyasına kaydeder"""
        job_data = self.get_job_data()
        
        if not self.validate_job_data(job_data):
            return
        
        try:
            # Dosya kaydetme diyaloğu
            file_path = filedialog.asksaveasfilename(
                defaultextension=".json",
                filetypes=[("JSON Dosyaları", "*.json"), ("Tüm Dosyalar", "*.*")],
                title="JSON Dosyasını Kaydet"
            )
            
            if not file_path:
                return
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(job_data, f, ensure_ascii=False, indent=4)
            
            self.log(f"İlan JSON dosyasına kaydedildi: {file_path}")
            messagebox.showinfo("Başarılı", "İlan JSON dosyasına kaydedildi")
            
        except Exception as e:
            self.log(f"JSON dosyasına kaydedilirken hata: {e}")
            messagebox.showerror("Hata", f"JSON dosyasına kaydedilirken hata: {e}")

    def load_from_json(self):
        """JSON dosyasından iş ilanı yükler"""
        try:
            # Dosya açma diyaloğu
            file_path = filedialog.askopenfilename(
                filetypes=[("JSON Dosyaları", "*.json"), ("Tüm Dosyalar", "*.*")],
                title="JSON Dosyasını Aç"
            )
            
            if not file_path:
                return
            
            with open(file_path, 'r', encoding='utf-8') as f:
                job_data = json.load(f)
            
            # Form alanlarını doldur
            self.title_entry.delete(0, tk.END)
            self.title_entry.insert(0, job_data.get('title', ''))
            
            self.company_entry.delete(0, tk.END)
            self.company_entry.insert( 0, job_data.get('company', 'İş Veren'))
            
            self.location_entry.delete(0, tk.END)
            self.location_entry.insert(0, job_data.get('location', ''))
            
            # Çalışma şekli
            work_type = job_data.get('type', 'Tam Zamanlı')
            work_type_index = 0
            work_types = ["Tam Zamanlı", "Yarı Zamanlı", "Uzaktan", "Stajyer", "Sözleşmeli"]
            if work_type in work_types:
                work_type_index = work_types.index(work_type)
            self.work_type_combo.current(work_type_index)
            
            # Kategori
            category = job_data.get('category', 'diger')
            category_display = next((k for k, v in self.category_ids.items() if v == category), "Diğer")
            category_index = 0
            category_values = list(self.categories.values())
            if category_display in category_values:
                category_index = category_values.index(category_display)
            self.category_combo.current(category_index)
            
            # Alt kategori güncelleme
            self.update_subcategories(None)
            
            # Alt kategori seçimi
            subcategory = job_data.get('subCategory', 'custom')
            subcategory_display = next((k for k, v in self.subcategory_ids.items() if v == subcategory), "Özel Kategori")
            subcategory_values = self.subcategory_combo['values']
            if subcategory_display in subcategory_values:
                subcategory_index = subcategory_values.index(subcategory_display)
                self.subcategory_combo.current(subcategory_index)
            
            # Maaş
            self.salary_entry.delete(0, tk.END)
            self.salary_entry.insert(0, job_data.get('salary', ''))
            
            # İletişim e-posta
            self.email_entry.delete(0, tk.END)
            self.email_entry.insert(0, job_data.get('contactEmail', ADMIN_EMAIL))
            
            # Açıklama
            self.description_text.delete(1.0, tk.END)
            self.description_text.insert(1.0, job_data.get('description', ''))
            
            # Önizlemeyi güncelle
            self.update_preview()
            
            self.log(f"İlan JSON dosyasından yüklendi: {file_path}")
            
        except Exception as e:
            self.log(f"JSON dosyasından yüklenirken hata: {e}")
            messagebox.showerror("Hata", f"JSON dosyasından yüklenirken hata: {e}")

    def post_job(self):
        """İş ilanını Firebase'e kaydeder"""
        if not self.firebase_connected:
            messagebox.showerror("Hata", "Firebase bağlantısı kurulamadı")
            return
        
        job_data = self.get_job_data()
        
        if not self.validate_job_data(job_data):
            return
        
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