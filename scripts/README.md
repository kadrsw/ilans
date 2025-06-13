# Sahibinden İş İlanı Çekme Uygulaması

Bu uygulama, sahibinden.com web sitesinden iş ilanlarını çekip, düzenleyip, Firebase veritabanına yüklemenizi sağlayan kullanıcı dostu bir masaüstü uygulamasıdır.

## Özellikler

- Sahibinden.com'dan tek bir iş ilanı çekme
- Toplu iş ilanı çekme (kategori sayfasından)
- İlan bilgilerini otomatik olarak doldurma
- İlan bilgilerini düzenleme imkanı
- JSON formatında kaydetme ve yükleme
- Firebase veritabanına doğrudan kaydetme
- Gerçek zamanlı önizleme
- Kullanıcı dostu arayüz

## Kurulum

1. Python 3.6 veya üstünü yükleyin:
   - Windows: https://www.python.org/downloads/
   - Linux: `sudo apt-get install python3 python3-pip` (Ubuntu/Debian)
   - macOS: `brew install python3` (Homebrew ile)

2. Gerekli Python paketlerini yükleyin:
   ```bash
   pip install requests beautifulsoup4 firebase-admin
   ```

3. Firebase kimlik bilgilerinin doğru olduğundan emin olun:
   - `firebase-credentials.json` dosyası uygulamanın ana dizininde olmalıdır.

## Kullanım

### Windows

```bash
cd scripts
sahibinden_job_scraper.bat
```

### Linux/macOS

```bash
cd scripts
chmod +x sahibinden_job_scraper.sh
./sahibinden_job_scraper.sh
```

Veya doğrudan Python ile:

```bash
cd scripts
python3 sahibinden_job_scraper.py
```

## Kullanım Kılavuzu

1. **Tek İlan Çekme**:
   - Sahibinden.com'dan bir iş ilanı URL'si girin ve "İlanı Çek" butonuna tıklayın.
   - Çekilen bilgileri kontrol edin ve gerekirse düzenleyin.
   - "Firebase'e Paylaş" butonuna tıklayarak ilanı veritabanına kaydedin.

2. **Toplu İlan Çekme**:
   - "Toplu İlan Çek" butonuna tıklayın.
   - Kategori URL'sini girin (örn. https://www.sahibinden.com/is-ilanlari).
   - Sayfa sayısı ve sayfa başına ilan sayısını belirleyin.
   - "Başlat" butonuna tıklayın ve işlemin tamamlanmasını bekleyin.

3. **JSON İşlemleri**:
   - "JSON Olarak Kaydet" butonu ile ilanı JSON formatında kaydedebilirsiniz.
   - "JSON'dan Yükle" butonu ile daha önce kaydettiğiniz ilanları yükleyebilirsiniz.

## Sorun Giderme

- Eğer Firebase bağlantı hatası alıyorsanız, `firebase-credentials.json` dosyasının doğru konumda olduğundan emin olun.
- İlan çekilemiyorsa, sitenin HTML yapısı değişmiş olabilir. Lütfen geliştiriciye bildirin.
- Tkinter hatası alıyorsanız, Python'un tkinter modülünü yüklediğinizden emin olun:
  - Linux: `sudo apt-get install python3-tk` (Ubuntu/Debian)
  - macOS: Python ile birlikte gelir, ancak sorun yaşarsanız Homebrew ile Python'u yeniden yükleyin.

## Notlar

- Sahibinden.com'un robot politikalarına saygı göstermek için, toplu çekme işlemlerinde sayfa başına ilan sayısını ve toplam sayfa sayısını makul değerlerde tutun.
- Çok sık ve yoğun istekler göndermeniz durumunda IP adresiniz geçici olarak engellenebilir.
- Çekilen ilanların telif hakkı ilgili ilan sahiplerine aittir.