# Emir Tuning - Otomotiv Tuning Web Sitesi

Modern ve profesyonel bir otomotiv tuning web sitesi. Next.js 14, TypeScript, Tailwind CSS ve Google Cloud Firestore kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Modern UI/UX**: Responsive ve kullanıcı dostu arayüz
- **Ürün Listeleme**: Tuning ürünlerini kategorilere göre listeleme
- **Hizmet Listeleme**: Tuning hizmetlerini kategorilere göre listeleme
- **Google Cloud Firestore**: Güvenli ve ölçeklenebilir veritabanı
- **Vercel Deploy**: Kolay ve hızlı deployment
- **TypeScript**: Tip güvenliği ile geliştirme
- **Tailwind CSS**: Modern ve özelleştirilebilir tasarım

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Google Cloud Firebase hesabı

## 🛠️ Kurulum

1. **Projeyi klonlayın veya indirin**

```bash
cd emir-tuning
```

2. **Bağımlılıkları yükleyin**

```bash
npm install
```

3. **Firebase Konfigürasyonu**

- [Firebase Console](https://console.firebase.google.com/) üzerinden yeni bir proje oluşturun
- Firestore Database'i etkinleştirin
- Web uygulaması ekleyin ve konfigürasyon bilgilerini alın

4. **Google Drive API Konfigürasyonu**

- [Google Cloud Console](https://console.cloud.google.com/) üzerinden bir Service Account oluşturun
- Service Account'a Drive API erişimi verin
- Private Key'i indirin ve JSON formatından email ve private key'i alın
- Google Drive'da görselleri saklayacağınız bir klasör oluşturun ve klasör ID'sini alın

5. **Environment Variables**

`.env.local` dosyası oluşturun ve aşağıdaki bilgileri ekleyin:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCeIWQMuVfXI5CnBmBGqGGHbxKT80u24vM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=emir-tuning.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=emir-tuning
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=emir-tuning.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=991446420644
NEXT_PUBLIC_FIREBASE_APP_ID=1:991446420644:web:64400054067aa2e77cea31
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BVBNB6J4Z3

# Google Drive API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

**Not:** `GOOGLE_PRIVATE_KEY` değerinde `\n` karakterlerini koruyun. Private key'i JSON'dan kopyalarken tüm satırları dahil edin.

6. **Firestore Veritabanı Yapısı**

Firestore'da aşağıdaki koleksiyonları oluşturun:

### `products` Koleksiyonu
Her ürün için:
- `name` (string): Ürün adı
- `description` (string): Ürün açıklaması
- `category` (string): Ürün kategorisi
- `imageUrl` (string, optional): Ürün görseli URL'i
- `features` (array, optional): Ürün özellikleri listesi
- `createdAt` (timestamp): Oluşturulma tarihi

### `services` Koleksiyonu
Her hizmet için:
- `name` (string): Hizmet adı
- `description` (string): Hizmet açıklaması
- `category` (string): Hizmet kategorisi
- `imageUrl` (string, optional): Hizmet görseli URL'i
- `features` (array, optional): Hizmet özellikleri listesi
- `createdAt` (timestamp): Oluşturulma tarihi

7. **Geliştirme sunucusunu başlatın**

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📦 Build ve Deploy

### Vercel'e Deploy

1. **Vercel hesabı oluşturun** (eğer yoksa): [vercel.com](https://vercel.com)

2. **Projeyi Vercel'e bağlayın**

```bash
npm i -g vercel
vercel
```

Veya GitHub üzerinden otomatik deploy için:
- GitHub repository'nizi Vercel'e bağlayın
- Environment variables'ları Vercel dashboard'dan ekleyin

3. **Environment Variables**

Vercel dashboard'da aşağıdaki environment variables'ları ekleyin:

**Firebase:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Google Drive:**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (tüm satırları dahil edin, `\n` karakterlerini koruyun)
- `GOOGLE_DRIVE_FOLDER_ID`

4. **Firebase Authentication Kurulumu**

- Firebase Console'da Authentication'ı etkinleştirin
- Email/Password provider'ı açın
- Admin kullanıcısı oluşturun (email: admin@emirtuning.com veya istediğiniz email)
- `lib/auth.ts` dosyasındaki `ADMIN_EMAILS` listesine admin email'lerinizi ekleyin

5. **Firestore Güvenlik Kuralları** ⚠️ **ZORUNLU**

Firebase Console'da Firestore Database → Rules sekmesine gidin ve aşağıdaki kuralları yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Herkes okuyabilir, sadece admin yazabilir
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Admin panelinden yazılacak
    }
    
    match /services/{document=**} {
      allow read: if true;
      allow write: if false; // Admin panelinden yazılacak
    }
    
    // Ürün arama index'i - herkes okuyabilir, admin yazabilir
    match /productSearchIndex/{document=**} {
      allow read: if true;
      allow write: if true; // Geliştirme için açık, production'da admin kontrolü eklenebilir
    }
    
    // Product overrides - herkes okuyabilir, admin yazabilir
    match /productOverrides/{document=**} {
      allow read: if true;
      allow write: if true; // Geliştirme için açık
    }
    
    // Category URL mappings - herkes okuyabilir, admin yazabilir
    match /categoryUrlMappings/{document=**} {
      allow read: if true;
      allow write: if true; // Geliştirme için açık
    }
    
    // Announcements - herkes okuyabilir, admin yazabilir
    match /announcements/{document=**} {
      allow read: if true;
      allow write: if true; // Geliştirme için açık
    }
    
    // Reviews/References - herkes okuyabilir, admin yazabilir
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if true; // Geliştirme için açık
    }
    
    // Site settings - herkes okuyabilir, admin yazabilir
    match /siteSettings/{document=**} {
      allow read: if true;
      allow write: if true; // Geliştirme için açık
    }
  }
}
```

**Kuralları Uygulama:**
1. Firebase Console: https://console.firebase.google.com/
2. Projenizi seçin: `emir-tuning`
3. **Firestore Database** → **Rules** sekmesine gidin
4. Yukarıdaki kuralları yapıştırın
5. **Publish** butonuna tıklayın

**Not:** Bu kuralları uygulamadan "Missing or insufficient permissions" hatası alırsınız!

## 📁 Proje Yapısı

```
emir-tuning/
├── app/                    # Next.js App Router sayfaları
│   ├── layout.tsx         # Ana layout
│   ├── page.tsx           # Ana sayfa
│   ├── urunler/           # Ürünler sayfası
│   ├── hizmetler/         # Hizmetler sayfası
│   ├── admin/             # Admin paneli
│   │   ├── login/         # Admin giriş sayfası
│   │   ├── page.tsx       # Admin dashboard
│   │   └── urunler/       # Ürün yönetimi
│   └── globals.css        # Global stiller
├── components/            # React bileşenleri
│   ├── Navbar.tsx         # Navigasyon çubuğu
│   ├── Footer.tsx         # Footer
│   ├── ProductCard.tsx    # Ürün kartı
│   ├── ServiceCard.tsx    # Hizmet kartı
│   └── AdminRoute.tsx     # Admin route protection
├── lib/                   # Yardımcı fonksiyonlar
│   ├── firebase.ts        # Firebase konfigürasyonu
│   ├── firestore.ts       # Firestore okuma işlemleri
│   ├── firestore-admin.ts # Firestore yazma işlemleri
│   ├── auth.ts            # Authentication işlemleri
│   ├── google-drive.ts    # Google Drive API
│   ├── drive-client.ts    # Drive client helper
│   └── types.ts           # TypeScript tipleri
├── public/                # Statik dosyalar
└── package.json           # Proje bağımlılıkları
```

## 🎨 Özelleştirme

### Renkler

Renkleri değiştirmek için `tailwind.config.ts` dosyasındaki `primary` renk paletini düzenleyebilirsiniz.

### İçerik

- Ana sayfa içeriği: `app/page.tsx`
- Ürünler sayfası: `app/urunler/page.tsx`
- Hizmetler sayfası: `app/hizmetler/page.tsx`

## 📝 Notlar

- Ürün ve hizmetler Firestore'dan dinamik olarak çekilmektedir
- Görseller Google Drive'dan çekilmektedir (`/api/drive/images` endpoint'i üzerinden)
- Google Drive görselleri otomatik olarak public yapılır ve URL'leri alınır
- Sayfalar client-side rendering kullanmaktadır
- Admin paneli: `/admin` - Ürün ekleme, düzenleme, silme ve fiyat güncelleme
- Admin girişi: `/admin/login` - Firebase Authentication ile giriş

## 🔧 Google Drive API Kullanımı

Görselleri Google Drive'dan çekmek için:

```typescript
import { fetchDriveImages } from '@/lib/drive-client'

// Tüm görselleri çek
const images = await fetchDriveImages()

// Belirli bir görseli bul
import { getImageByName } from '@/lib/drive-client'
const image = await getImageByName('product-image.jpg')
```

API endpoint'i: `GET /api/drive/images`

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel bir projedir.

## 📞 İletişim

Sorularınız için: info@emirtuning.com

---

**Emir Tuning** - Otomotiv Tuning Dünyasında Profesyonel Çözümler 🚗
# emir-tuning
