import firebase_admin
from firebase_admin import credentials, auth, db
import json
import os

# Firebase kimlik bilgileri
cred = credentials.Certificate("firebase-credentials.json")
try:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
    })
except ValueError:
    # Uygulama zaten başlatılmış
    pass

def get_user_id_by_email(email):
    """
    E-posta adresine göre kullanıcı ID'sini bulur
    """
    try:
        # Önce veritabanından kontrol et
        users_ref = db.reference('users')
        users = users_ref.get()
        
        if users:
            for uid, user_data in users.items():
                if user_data.get('email') == email:
                    print(f"Kullanıcı ID'si bulundu (veritabanından): {uid}")
                    return uid
        
        # Veritabanında bulunamazsa Auth'dan kontrol et
        try:
            user = auth.get_user_by_email(email)
            print(f"Kullanıcı ID'si bulundu (Auth'dan): {user.uid}")
            return user.uid
        except Exception as e:
            print(f"Auth'dan kullanıcı bulunamadı: {e}")
            return None
            
    except Exception as e:
        print(f"Kullanıcı ID'si alınırken hata: {e}")
        return None

def update_script_with_user_id(script_file, user_id):
    """
    Belirtilen betik dosyasındaki USER_ID değişkenini günceller
    """
    try:
        with open(script_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # USER_ID değişkenini güncelle
        if 'USER_ID = "ADMIN_USER_ID"' in content:
            updated_content = content.replace('USER_ID = "ADMIN_USER_ID"', f'USER_ID = "{user_id}"')
            
            with open(script_file, 'w', encoding='utf-8') as file:
                file.write(updated_content)
            
            print(f"{script_file} dosyasındaki USER_ID güncellendi.")
            return True
        else:
            print(f"{script_file} dosyasında USER_ID = \"ADMIN_USER_ID\" bulunamadı.")
            return False
        
    except Exception as e:
        print(f"{script_file} güncellenirken hata: {e}")
        return False

def main():
    # Admin e-posta adresi
    admin_email = "acikadir1@gmail.com"
    
    # Kullanıcı ID'sini al
    user_id = get_user_id_by_email(admin_email)
    
    if user_id:
        print(f"Kullanıcı ID: {user_id}")
        
        # Güncellenecek betik dosyaları
        script_files = [
            "job_scraper_app.py",
            "sahibinden_scraper.py",
            "sahibinden_multi_scraper.py",
            "specific_job_scraper.py",
            "job_scraper_with_html.py",
            "login_and_post.py",
            "web_scraper.py"
        ]
        
        # Mevcut dizindeki tüm betik dosyalarını kontrol et
        for script_file in script_files:
            if os.path.exists(script_file):
                update_script_with_user_id(script_file, user_id)
            else:
                print(f"{script_file} dosyası bulunamadı.")
        
        print("İşlem tamamlandı.")
    else:
        print("Kullanıcı ID bulunamadı. Betikler güncellenemedi.")

if __name__ == "__main__":
    main()