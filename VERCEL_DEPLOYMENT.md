# Vercel ile Canlıya Alma – Adım Adım Rehber

Her adımı tek tek, nereye tıklayacağınızı yazarak anlatıyorum.

---

## BÖLÜM 1: Vercel Hesabı ve GitHub Bağlama

### Adım 1.1 – Vercel’e girin

1. Tarayıcıda **https://vercel.com** adresini açın.
2. Sağ üstte **"Log In"** (Giriş Yap) yazıyorsa tıklayın.  
   Zaten giriş yaptıysanız bu adımı atlayın.

---

### Adım 1.2 – GitHub ile giriş yapın (veya kayıt olun)

1. Giriş sayfasında **"Continue with GitHub"** (GitHub ile devam et) butonuna tıklayın.
2. GitHub’da giriş yapmadıysanız önce GitHub sizi giriş sayfasına götürür; kullanıcı adı/şifrenizi girin.
3. GitHub, Vercel’e “Bu uygulama depolarınıza erişmek istiyor” gibi bir izin sayfası açar.  
   **"Authorize Vercel"** (Vercel’i yetkilendir) veya **"Install"** / **"Authorize"** butonuna tıklayın.  
   Böylece Vercel, GitHub hesabınıza bağlanmış olur.
4. İşlem bitince sizi tekrar Vercel’e yönlendirir; Vercel ana sayfasında olmalısınız.

**Not:** Daha önce “Continue with GitHub” yapıp hesabı bağladıysanız, sadece **Log In** → **Continue with GitHub** yeterli; tekrar izin vermeniz gerekmez.

---

### Adım 1.3 – GitHub henüz bağlı değilse (zaten Vercel’desiniz ama repo gelmiyorsa)

1. Vercel’de sağ üstte **profil fotoğunuz** veya **avatar** simgesine tıklayın.
2. Açılan menüden **"Settings"** (Ayarlar) seçin.
3. Sol menüde **"Git Integrations"** (Git Entegrasyonları) veya **"Connected Accounts"** benzeri bir bağlantı varsa tıklayın.
4. **GitHub** satırında **"Connect"** veya **"Configure"** varsa tıklayın.
5. Açılan GitHub sayfasında **"Authorize Vercel"** (veya benzeri) butonuna tıklayın.  
   İsterseniz “Only select repositories” deyip sadece **emir** (veya projenizin adı) reposunu seçebilirsiniz.
6. Onayladıktan sonra Vercel’e dönün; GitHub artık bağlı olmalı.

---

## BÖLÜM 2: Projeyi GitHub’a Atmak (Kodunuz Bilgisayardaysa)

Projeniz zaten GitHub’da bir repoda ise bu bölümü atlayın.

1. Bilgisayarınızda proje klasöründe **Terminal** veya **PowerShell** açın.
2. Şu komutları sırayla yazın (eğer daha önce yapmadıysanız):

   ```bash
   git init
   git add .
   git commit -m "İlk commit - Vercel deploy için"
   ```

3. GitHub’da yeni bir repo oluşturun: https://github.com/new  
   - Repository name: örneğin **emir** veya **emir-tuning**.  
   - Public seçin, “Add a README” işaretlemeden **Create repository** deyin.
4. GitHub’ın size gösterdiği “push an existing repository” komutlarını kullanın; genelde şöyle olur:

   ```bash
   git remote add origin https://github.com/KULLANICI_ADINIZ/emir.git
   git branch -M main
   git push -u origin main
   ```

   `KULLANICI_ADINIZ` ve `emir` kısmını kendi GitHub kullanıcı adınız ve repo adınızla değiştirin.

Bundan sonra kodunuz GitHub’da olacak; Vercel bu repoyu bağlayacak.

---

## BÖLÜM 3: Vercel’de Yeni Proje ve Repo Seçimi

### Adım 3.1 – Yeni proje ekle

1. Vercel ana sayfasında (Dashboard) **"Add New…"** (Yeni Ekle) butonuna tıklayın.  
   Genelde sağ üstte veya ortada büyük bir buton olur.
2. Açılan menüden **"Project"** (Proje) seçin.

---

### Adım 3.2 – GitHub reposunu seçin

1. **"Import Git Repository"** ekranında **GitHub** sekmesinin seçili olduğundan emin olun.
2. **"Import third-party Git repository"** yazıyorsa, bunu kullanmayın; doğrudan listeden repo seçin.
3. Listede **emir** (veya projenizin repo adı) görünmüyorsa:
   - **"Adjust GitHub App Permissions"** veya **"Configure GitHub App"** gibi bir bağlantı varsa tıklayın.
   - GitHub’da Vercel uygulamasına “All repositories” veya en azından bu repoya erişim verin, kaydedin.
   - Vercel sayfasını yenileyin (F5); repo listede çıkmalı.
4. Reponuzun yanındaki **"Import"** butonuna tıklayın.

---

### Adım 3.3 – Proje ayarları (genelde dokunmayın)

1. **Configure Project** sayfası açılır.
2. **Framework Preset:** **Next.js** yazıyorsa dokunmayın.
3. **Root Directory:** Boş bırakın.
4. **Build and Output Settings:** Varsayılan kalsın (**Build Command:** `npm run build`).
5. Bu sayfada **"Environment Variables"** bölümü var; bir sonraki bölümde oraya değerleri gireceğiz.  
   İsterseniz önce **Deploy**’a basmadan aşağıdaki Adım 4’e geçin ve env değişkenlerini ekleyin; sonra **Deploy** yapın.

---

## BÖLÜM 4: Ortam Değişkenlerini (Environment Variables) Eklemek

Bu adım çok önemli; yoksa site açılsa bile Firebase (ve admin girişi) çalışmaz.

### Adım 4.1 – Environment Variables bölümünü açın

1. **Configure Project** ekranındaysanız, **"Environment Variables"** başlığının altında bir kutu görürsünüz.  
   **Name** ve **Value** yazan yerler vardır.
2. Eğer projeyi zaten oluşturduysanız: Vercel’de projeye tıklayın → üstte **"Settings"** → soldan **"Environment Variables"** seçin.

---

### Adım 4.2 – Firebase değişkenlerini tek tek ekleyin

Her satır için: **Name** kutusuna aşağıdaki ismi, **Value** kutusuna değeri yapıştırın.  
Değerleri bilgisayarınızdaki **.env.local** dosyasından veya Firebase Console’dan alabilirsiniz.

**Firebase değerlerini bulmak için:**  
https://console.firebase.google.com → Projenizi seçin → Dişli ikon **Project Settings** → **General** sekmesi → aşağı kaydırın, **"Your apps"** altında web uygulamanız (</> ikonu). Orada **apiKey**, **authDomain**, **projectId** vb. yazar.

Sırayla ekleyin (her biri için **Name** ve **Value** doldurup **Save** veya **Add** deyin):

| Name (tam bu şekilde yazın) | Value nereden |
|-----------------------------|----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase’deki `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` (örn. emir-tuning-xxx.firebaseapp.com) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `measurementId` (Analytics kullanıyorsanız) |

- **Environment** kısmında **Production**, **Preview**, **Development** hepsini işaretleyin (veya en azından **Production** işaretli olsun).
- Her değişkeni ekledikten sonra **Save** veya **Add** deyin; sonra sıradaki değişkene geçin.

---

### Adım 4.3 – Google Drive kullanıyorsanız (opsiyonel)

Logo veya görseller Drive’dan geliyorsa şunları da ekleyin:

| Name | Value |
|------|--------|
| `GOOGLE_DRIVE_FOLDER_ID` | Drive klasör ID’si |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account e-postası |
| `GOOGLE_PRIVATE_KEY` | Private key (tek satırda, satır sonları `\n` olacak şekilde) |

Bunları da ekleyip **Save** deyin.

---

## BÖLÜM 5: Deploy Etmek

1. **Configure Project** sayfasındaysanız, en altta **"Deploy"** butonuna tıklayın.
2. Build başlar; 1–3 dakika sürebilir.  
   **"Building"** / **"Deploying"** yazısını görürsünüz.
3. **"Congratulations"** veya **"Visit"** gibi bir mesaj ve yanında bir link çıkarsa deploy tamamlanmış demektir.  
   Örnek link: **https://emir-xxxx.vercel.app** (sizde proje adına göre değişir).
4. Bu linke tıklayarak sitenizi canlıda görebilirsiniz.

---

## BÖLÜM 6: Admin Girişinin Çalışması İçin (Firebase Authorized Domains)

Admin paneline (`/admin/login`) Vercel’den giriş yapabilmek için Firebase’in Vercel adresinizi tanıması gerekir.

1. **https://console.firebase.google.com** → Projenizi seçin.
2. Sol menüden **"Authentication"** (Build altında) tıklayın.
3. Üstte **"Settings"** (Ayarlar) sekmesine geçin.
4. Aşağı kaydırın; **"Authorized domains"** bölümünü bulun.
5. **"Add domain"** butonuna tıklayın.
6. Vercel’in verdiği adresi **sadece domain kısmıyla** yazın, örneğin:  
   `emir-xxxx.vercel.app`  
   (https:// yazmayın, sadece `emir-xxxx.vercel.app`)
7. **"Add"** deyin.
8. Artık bu adresten admin girişi yapabilirsiniz: `https://emir-xxxx.vercel.app/admin/login`

---

## Özet Checklist

- [ ] Vercel’e GitHub ile giriş yaptım.
- [ ] GitHub’da repo var ve Vercel’de bu repoyu Import ettim.
- [ ] Environment Variables’a tüm Firebase değişkenlerini (NEXT_PUBLIC_*) ekledim.
- [ ] Deploy’a tıkladım ve build bitti.
- [ ] Firebase → Authentication → Authorized domains’e Vercel domain’imi ekledim.

Takıldığınız adımı not edip tekrar bu rehbere göre ilerleyebilirsiniz. Bir adımda takılırsanız, “Vercel’de GitHub bağlı değil” gibi tam olarak nerede kaldığınızı yazarsanız, o adımı daha da detaylandırabilirim.
