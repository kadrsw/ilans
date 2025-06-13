#!/bin/bash

echo "İş İlanı Çekme ve Paylaşma Uygulaması başlatılıyor..."
echo

# Python yüklü mü kontrol et
if ! command -v python3 &> /dev/null; then
    echo "Python yüklü değil! Lütfen Python 3.6 veya üstünü yükleyin."
    echo "https://www.python.org/downloads/"
    exit 1
fi

# Gerekli paketleri kontrol et ve yükle
echo "Gerekli paketler kontrol ediliyor..."

python3 -c "import requests" &> /dev/null
if [ $? -ne 0 ]; then
    echo "requests paketi yükleniyor..."
    pip3 install requests
fi

python3 -c "import bs4" &> /dev/null
if [ $? -ne 0 ]; then
    echo "beautifulsoup4 paketi yükleniyor..."
    pip3 install beautifulsoup4
fi

python3 -c "import firebase_admin" &> /dev/null
if [ $? -ne 0 ]; then
    echo "firebase-admin paketi yükleniyor..."
    pip3 install firebase-admin
fi

python3 -c "import PIL" &> /dev/null
if [ $? -ne 0 ]; then
    echo "pillow paketi yükleniyor..."
    pip3 install pillow
fi

# Firebase kimlik bilgilerini kontrol et
if [ ! -f "firebase-credentials.json" ]; then
    echo "HATA: firebase-credentials.json dosyası bulunamadı!"
    echo "Lütfen Firebase kimlik bilgilerinizi içeren dosyayı bu dizine kopyalayın."
    exit 1
fi

# Çalıştırma izni ver
chmod +x job_scraper_app.py

# Uygulamayı başlat
echo
echo "Uygulama başlatılıyor..."
python3 job_scraper_app.py