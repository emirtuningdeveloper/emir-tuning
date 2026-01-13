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
- `.env.local` dosyası oluşturun ve Firebase bilgilerinizi ekleyin:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin ve Firebase bilgilerinizi girin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Firestore Veritabanı Yapısı**

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

5. **Geliştirme sunucusunu başlatın**

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
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

4. **Firestore Güvenlik Kuralları**

Firestore'da aşağıdaki güvenlik kurallarını ayarlayın (sadece okuma için):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Sadece admin panelinden eklenebilir
    }
    match /services/{document=**} {
      allow read: if true;
      allow write: if false; // Sadece admin panelinden eklenebilir
    }
  }
}
```

## 📁 Proje Yapısı

```
emir-tuning/
├── app/                    # Next.js App Router sayfaları
│   ├── layout.tsx         # Ana layout
│   ├── page.tsx           # Ana sayfa
│   ├── urunler/           # Ürünler sayfası
│   ├── hizmetler/         # Hizmetler sayfası
│   └── globals.css        # Global stiller
├── components/            # React bileşenleri
│   ├── Navbar.tsx         # Navigasyon çubuğu
│   ├── Footer.tsx         # Footer
│   ├── ProductCard.tsx    # Ürün kartı
│   └── ServiceCard.tsx    # Hizmet kartı
├── lib/                   # Yardımcı fonksiyonlar
│   ├── firebase.ts        # Firebase konfigürasyonu
│   ├── firestore.ts       # Firestore işlemleri
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

- Fiyat bilgisi gösterilmemektedir (tasarım gereği)
- Ürün ve hizmetler Firestore'dan dinamik olarak çekilmektedir
- Görseller için Firebase Storage kullanılabilir
- Sayfalar 60 saniyede bir otomatik olarak yenilenir (ISR)

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
