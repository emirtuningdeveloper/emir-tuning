# Firestore Güvenlik Kuralları

Firebase Console'da Firestore Database → Rules sekmesine gidin ve aşağıdaki kuralları yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Herkes okuyabilir, sadece admin yazabilir
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Admin panelinden yazılacak (Firebase Admin SDK veya authenticated user)
    }
    
    match /services/{document=**} {
      allow read: if true;
      allow write: if false; // Admin panelinden yazılacak
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

Bu kuralları uyguladıktan sonra "Missing or insufficient permissions" hatası çözülecektir.
