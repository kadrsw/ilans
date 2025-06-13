@echo off
echo İş İlanı Çekme ve Paylaşma Uygulaması başlatılıyor...
echo.

REM Python yüklü mü kontrol et
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python yüklü değil! Lütfen Python 3.6 veya üstünü yükleyin.
    echo https://www.python.org/downloads/
    pause
    exit /b
)

REM Gerekli paketleri kontrol et ve yükle
echo Gerekli paketler kontrol ediliyor...
python -c "import requests" >nul 2>&1
if %errorlevel% neq 0 (
    echo requests paketi yükleniyor...
    pip install requests
)

python -c "import bs4" >nul 2>&1
if %errorlevel% neq 0 (
    echo beautifulsoup4 paketi yükleniyor...
    pip install beautifulsoup4
)

python -c "import firebase_admin" >nul 2>&1
if %errorlevel% neq 0 (
    echo firebase-admin paketi yükleniyor...
    pip install firebase-admin
)

python -c "import PIL" >nul 2>&1
if %errorlevel% neq 0 (
    echo pillow paketi yükleniyor...
    pip install pillow
)

REM Firebase kimlik bilgilerini kontrol et
if not exist firebase-credentials.json (
    echo HATA: firebase-credentials.json dosyası bulunamadı!
    echo Lütfen Firebase kimlik bilgilerinizi içeren dosyayı bu dizine kopyalayın.
    pause
    exit /b
)

REM Uygulamayı başlat
echo.
echo Uygulama başlatılıyor...
python job_scraper_app.py

pause