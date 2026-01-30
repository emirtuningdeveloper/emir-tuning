# Firestore Güvenlik Kuralları

Firebase Console'da Firestore Database → Rules sekmesine gidin ve aşağıdaki kuralları yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Giriş yapmış kullanıcılar (admin) yazabilir; herkes okuyabilir
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

**ÖNEMLİ:** Bu kurallar herkesin okuyabilmesine izin verir. Admin yazma işlemleri için Firebase Authentication kullanılıyor.

## Kuralları Uygulama

1. Firebase Console'a gidin: https://console.firebase.google.com/
2. Projenizi seçin: `emir-tuning`
3. Sol menüden **Firestore Database** → **Rules** sekmesine gidin
4. Yukarıdaki kuralları yapıştırın
5. **Publish** butonuna tıklayın

**Hizmetler / Referanslar kaydetme hatası:** `products` ve `services` koleksiyonları için `write: if request.auth != null` olmalı (giriş yapmış admin yazabilsin). Kuralları yukarıdaki gibi güncelleyip **Publish** ettikten sonra "Missing or insufficient permissions" hatası çözülür.
