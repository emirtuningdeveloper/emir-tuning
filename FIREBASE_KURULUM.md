# Firebase Yeni Hesap Bağlama – Adım Adım Rehber

Bu rehber, yeni açtığınız Firebase hesabını projenize bağlamanız için tek tek adımları anlatır.

---

## 1. Firebase Console’a giriş

1. Tarayıcıda **https://console.firebase.google.com/** adresine gidin.
2. Google hesabınızla giriş yapın (yeni açtığınız hesap).
3. Açılan sayfada **“Proje oluştur”** veya **“Create a project”** butonuna tıklayın.

---

## 2. Yeni proje oluşturma

1. **Proje adı:** Örneğin `emir-tuning` veya `emirtuning` yazın. İsterseniz farklı bir isim de verebilirsiniz (sonra kodda `projectId` bu isimle eşleşecek).
2. **Google Analytics:** İsterseniz “Şimdilik devre dışı bırak” diyebilirsiniz; zorunlu değil.
3. **Proje oluştur**’a tıklayın ve işlem bitene kadar bekleyin.
4. Proje hazır olunca **“Projeye devam et”** / **“Continue”** ile proje paneline girin.

---

## 3. Web uygulaması ekleyip config değerlerini almak

1. Proje ana sayfasında (veya sol menüden **Proje genel bakış**’ta) **“</>” (Web)** ikonuna tıklayın – “Uygulamanızı Firebase’e ekleyin” bölümünde.
2. **Uygulama takma adı:** Örneğin `emir-tuning-web` yazın. “Uygulama kaydet”e tıklayın.
3. **Firebase SDK** ekranında **“Config”** (Yapılandırma) objesini göreceksiniz. Aşağıdaki gibi bir kutu içinde yazıyor:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "xxx.firebaseapp.com",
     projectId: "xxx",
     storageBucket: "xxx.appspot.com",
     messagingSenderId: "123...",
     appId: "1:123:web:abc..."
   };
   ```

4. Bu değerleri **bir yere not alın** (sonraki adımda `.env.local` dosyasına yazacağız).  
   İsterseniz **“Ayrıca Firebase Hosting’i yapılandır”** kutusunu şimdilik işaretlemeden **“Console’a devam et”** deyin.

---

## 4. Authentication (Kimlik Doğrulama) açma ve admin kullanıcı

1. Sol menüden **“Build”** altında **“Authentication”** (Kimlik Doğrulama) seçin.
2. **“Başlayın”** / **“Get started”** butonuna tıklayın.
3. **“Sign-in method”** (Oturum açma yöntemi) sekmesine gidin.
4. Listeden **“E-posta/Parola”** (Email/Password) satırına tıklayın.
5. **“E-posta/Parola”**’yı **Etkinleştir** (Enable) yapın. **Kaydet**’e basın.
6. **“Users”** (Kullanıcılar) sekmesine gidin.
7. **“Kullanıcı ekle”** / **“Add user”** butonuna tıklayın.
8. **E-posta:** Admin panelinde giriş yapacağınız e-postayı yazın (örn. `admin@emirtuning.com`).
9. **Parola:** En az 6 karakterlik bir şifre girin. Bu şifreyi güvenli bir yerde saklayın.
10. **“Kullanıcı ekle”**’ye tıklayın.

**Önemli:** Bu e-posta adresini projede admin olarak tanımlamamız gerekiyor. Bunu **Adım 7**’de `.env` ile birlikte `lib/auth.ts` içinde yapacağız.

---

## 5. Firestore Database oluşturma

1. Sol menüden **“Build”** altında **“Firestore Database”** seçin.
2. **“Veritabanı oluştur”** / **“Create database”** butonuna tıklayın.
3. **Güvenlik modu:**
   - **“Üretim modunda başlat”** (Start in production mode) seçin. Kuralları bir sonraki adımda kendimiz yapıştıracağız.
4. **Konum:** Size en yakın bölgeyi seçin (örn. `europe-west1`). **“Etkinleştir”** / **“Enable”** deyin.
5. Veritabanı oluştuktan sonra Firestore sayfasında **“Koleksiyonlar”** (Collections) boş görünecek. Bu normal; uygulama çalıştıkça gerekli koleksiyonlar otomatik oluşacak.

---

## 6. Projede config ve admin e-postasını ayarlama

### 6.1 `.env.local` dosyası

Proje kök klasöründe (package.json’ın olduğu yerde) **`.env.local`** dosyası olmalı. Yoksa oluşturun. İçine aşağıdaki satırları, **Adım 3**’te not aldığınız değerlerle doldurun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=buraya_apiKey_değeri
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=buraya_authDomain_değeri
NEXT_PUBLIC_FIREBASE_PROJECT_ID=buraya_projectId_değeri
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=buraya_storageBucket_değeri
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=buraya_messagingSenderId_değeri
NEXT_PUBLIC_FIREBASE_APP_ID=buraya_appId_değeri
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=buraya_measurementId_değeri
```

**Örnek (kendi değerlerinizle değiştirin):**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=emir-tuning-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=emir-tuning-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=emir-tuning-xxxxx.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

- Tırnak koymayın, eşittir işaretinden sonra doğrudan değeri yazın.
- `measurementId` Analytics kullanmıyorsanız boş bırakılabilir; kodda opsiyonel.

### 6.2 Admin e-postasını ekleme

**`lib/auth.ts`** dosyasını açın. `ADMIN_EMAILS` dizisine, Firebase Authentication’da eklediğiniz admin e-postasını ekleyin:

```ts
const ADMIN_EMAILS = [
  'admin@emirtuning.com',   // Firebase’de oluşturduğunuz kullanıcının e-postası
  // İsterseniz başka admin e-postaları da ekleyebilirsiniz
]
```

Kaydedin. Artık sadece bu listedeki e-postalarla admin panele giriş yapılabilir.

### 6.3 Sunucuyu yeniden başlatma

`.env.local` değiştiği için geliştirme sunucusunu yeniden başlatın:

- Terminalde çalışan `npm run dev` (veya `yarn dev`) işlemini durdurun (Ctrl+C).
- Tekrar `npm run dev` (veya `yarn dev`) çalıştırın.

---

## 7. Firestore güvenlik kurallarını ekleme

1. Firebase Console’da sol menüden **“Firestore Database”**’e girin.
2. Üstte **“Rules”** (Kurallar) sekmesine tıklayın.
3. Açılan metin kutusundaki **tüm mevcut kuralları silin**.
4. Aşağıdaki **tam metni** olduğu gibi kopyalayıp Rules kutusuna **yapıştırın**.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /services/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /productSearchIndex/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    match /productOverrides/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    match /categoryUrlMappings/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    match /categoryExternalSources/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    match /announcements/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    match /siteSettings/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

5. **“Yayınla”** / **“Publish”** butonuna tıklayın.
6. Kurallar kaydedildikten sonra admin panelinden hizmet/referans kaydetme “Missing or insufficient permissions” hatası vermemelidir.

**Kuralların anlamı (kısaca):**

- **`read: if true`** → Herkes (giriş yapmadan) okuyabilir; site veriyi herkese gösterebilir.
- **`write: if request.auth != null`** → Sadece **giriş yapmış** kullanıcılar (Authentication’da oluşturduğunuz admin) yazabilir. `products` ve `services` böyle.
- Diğer koleksiyonlarda `write: if true` var; ileride isterseniz bunları da `request.auth != null` yapabilirsiniz.

---

## Özet kontrol listesi

- [ ] Firebase Console’da yeni proje oluşturuldu.
- [ ] Web uygulaması eklendi ve config değerleri alındı.
- [ ] `.env.local` dosyasına tüm `NEXT_PUBLIC_FIREBASE_*` değerleri yazıldı.
- [ ] Authentication açıldı, E-posta/Parola etkin.
- [ ] Authentication’da en az bir kullanıcı (admin e-postası ve şifre) oluşturuldu.
- [ ] `lib/auth.ts` içinde `ADMIN_EMAILS`’a bu e-posta eklendi.
- [ ] Firestore Database oluşturuldu (production modunda).
- [ ] Firestore Rules sekmesine yukarıdaki kurallar tamamen kopyala-yapıştır yapıldı ve **Yayınla** tıklandı.
- [ ] `npm run dev` yeniden başlatıldı.
- [ ] Tarayıcıda `/admin/login` sayfasına gidip yeni e-posta ve şifre ile giriş denendi.

Bu adımları tamamladıktan sonra yeni Firebase hesabınız projeye bağlı olur ve admin paneli çalışır.
