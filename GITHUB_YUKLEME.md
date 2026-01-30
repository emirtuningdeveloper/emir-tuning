# Projeyi GitHub'a Yükleme – Adım Adım

Bu rehber, bilgisayarınızdaki **Emir Tuning** projesini tamamen GitHub’a yüklemenizi anlatır. Sadece bu işleme odaklanıyoruz.

---

## Önce Bilmeniz Gerekenler

- **GitHub hesabı** gerekir. Yoksa: https://github.com/signup adresinden ücretsiz kayıt olun.
- **Git** bilgisayarınızda yüklü olmalı. Kontrol etmek için aşağıdaki “Adım 0”a bakın.
- Proje klasörü: örneğin `C:\Users\abdrh\Desktop\Cursor\emir` (sizde farklı olabilir).

---

## Adım 0: Git Kurulu mu Kontrol Edin

1. **PowerShell** veya **Terminal** açın (Windows’ta: Win + R → `powershell` yazıp Enter).
2. Şunu yazın ve Enter’a basın:

   ```bash
   git --version
   ```

3. `git version 2.x.x` gibi bir satır görüyorsanız Git kurulu demektir.  
   “Komut bulunamadı” gibi bir hata alırsanız önce Git’i kurun: https://git-scm.com/download/win

---

## Adım 1: GitHub’da Yeni Repo Oluşturun

1. Tarayıcıda **https://github.com** adresine gidin.
2. Sağ üstten **giriş yapın** (Sign in).
3. Sağ üstte **+** işaretine tıklayın → **"New repository"** seçin.
4. **Repository name** kutusuna bir isim yazın. Örnek: **emir** veya **emir-tuning**.
5. **Description** (açıklama) isteğe bağlı; boş bırakabilirsiniz.
6. **Public** seçili olsun.
7. **"Add a README file"** kutusunu **işaretlemeyin** (proje zaten var, boş repo istiyoruz).
8. **"Create repository"** butonuna tıklayın.
9. Açılan sayfada yeşil kutu içinde **"…or push an existing repository from the command line"** bölümünü bulun.  
   Oradaki 3 komutu kopyalayıp saklayın; biraz sonra kullanacağız. Örnek:

   ```text
   git remote add origin https://github.com/KULLANICI_ADINIZ/emir.git
   git branch -M main
   git push -u origin main
   ```

   `KULLANICI_ADINIZ` ve `emir` sizin GitHub kullanıcı adınız ve repo adınız olacak.

---

## Adım 2: Proje Klasörünü Açın

1. Bilgisayarınızda projenin bulunduğu klasöre gidin.  
   Örnek: `C:\Users\abdrh\Desktop\Cursor\emir`
2. Bu klasörün **içindeyken** PowerShell veya Terminal açın:
   - Klasörde **Shift + Sağ tık** yapın → **"PowerShell penceresini burada aç"** veya **"Open in Terminal"** seçin.  
   **veya**
   - PowerShell’i açıp şu komutla klasöre gidin (yol sizdekiyle aynı olmalı):

     ```bash
     cd C:\Users\abdrh\Desktop\Cursor\emir
     ```

3. Şunu yazıp Enter’a basın; proje klasöründe olduğunuzu doğrulayın:

   ```bash
   dir
   ```

   `package.json`, `app`, `lib` gibi dosya/klasörleri görüyorsanız doğru yerdeysiniz.

---

## Adım 3: Git Deposu Başlatın (İlk Kez İse)

Projede daha önce `git init` yapmadıysanız:

1. Aynı klasörde (PowerShell/Terminal açık) şunu yazın:

   ```bash
   git init
   ```

2. Enter’a basın. `Initialized empty Git repository...` benzeri bir mesaj görürsünüz.

**Not:** Zaten `git init` yaptıysanız bu adımı atlayın; "reinit" uyarısı alırsanız da sorun yok, devam edin.

---

## Adım 4: Tüm Projeyi Staging’e Ekleyin

1. Şu komutu yazın ve Enter’a basın:

   ```bash
   git add .
   ```

2. Nokta (`.`) “bu klasördeki tüm değişiklikler” anlamına gelir.  
   `.gitignore` sayesinde `node_modules`, `.env.local` gibi dosyalar **yüklenmez** (güvenlik için doğru).

---

## Adım 5: İlk Commit’i Oluşturun

1. Şunu yazın ve Enter’a basın:

   ```bash
   git commit -m "İlk yükleme - proje GitHub'a eklendi"
   ```

2. İlk seferde Git sizi “user.name” ve “user.email” için uyarmış olabilir. Uyarı çıkarsa şunları kendi bilgilerinizle yazın (bir kez yeterli):

   ```bash
   git config --global user.name "Adınız Soyadınız"
   git config --global user.email "github@email.com"
   ```

   Sonra tekrar:

   ```bash
   git commit -m "İlk yükleme - proje GitHub'a eklendi"
   ```

3. `X files changed` gibi bir çıktı görürseniz commit başarılı demektir.

---

## Adım 6: GitHub Repo’yu “Remote” Olarak Ekleyin

1. GitHub’da oluşturduğunuz repo sayfasındaki **"…or push an existing repository from the command line"** bölümündeki **ilk komutu** kopyalayın. Örnek:

   ```bash
   git remote add origin https://github.com/KULLANICI_ADINIZ/emir.git
   ```

2. `KULLANICI_ADINIZ` ve `emir` kısımlarını kendi GitHub kullanıcı adınız ve repo adınızla değiştirin.
3. Bu komutu PowerShell/Terminal’e yapıştırıp Enter’a basın.
4. Hata vermezse bir şey yazmayabilir; bu normaldir.

**Eğer "remote origin already exists" derseniz:** Önce `git remote remove origin` yazın, Enter’a basın; sonra yukarıdaki `git remote add origin ...` komutunu tekrar çalıştırın.

---

## Adım 7: Ana Dalı “main” Yapıp GitHub’a Gönderin

1. Dal adını `main` yapın:

   ```bash
   git branch -M main
   ```

2. Projeyi GitHub’a yükleyin:

   ```bash
   git push -u origin main
   ```

3. İlk kez yapıyorsanız GitHub **giriş** isteyebilir:
   - Tarayıcı açılır; GitHub’da **Sign in** / **Authorize** deyin.
   - Veya kullanıcı adı + **Personal Access Token** (şifre yerine) isteyebilir. Token oluşturmak için: GitHub → Settings → Developer settings → Personal access tokens → Generate new token. “repo” yetkisini işaretleyin, token’ı kopyalayıp şifre yerine yapıştırın.
4. İşlem bitince `Writing objects: 100%` benzeri bir çıktı görürsünüz.

---

## Adım 8: Kontrol Edin

1. Tarayıcıda GitHub’daki repo sayfanızı açın:  
   **https://github.com/KULLANICI_ADINIZ/emir** (kendi kullanıcı adınız ve repo adınızla).
2. `app`, `lib`, `components`, `package.json` vb. dosya ve klasörleri görüyorsanız **proje GitHub’a yüklenmiş demektir.**

---

## Özet – Tek Tek Komutlar (Proje klasöründe)

Sırayla:

```bash
git init
git add .
git commit -m "İlk yükleme - proje GitHub'a eklendi"
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADI.git
git branch -M main
git push -u origin main
```

`KULLANICI_ADINIZ` ve `REPO_ADI` yerine kendi GitHub kullanıcı adınız ve repo adınızı yazın.

---

## Ne Yüklenmez? (Güvenlik)

`.gitignore` dosyası sayesinde şunlar **GitHub’a gitmez**:

- `node_modules` (paketler)
- `.env`, `.env.local` (şifreler, API anahtarları)
- `.next` (build çıktısı)
- Diğer gereksiz/geçici dosyalar

Yani sadece **kaynak kod** ve proje dosyaları yüklenir; güvenli taraftasınız.

---

Takıldığınız adımı (örn. “Adım 5’te commit hatası”) yazarsanız, o adımı birlikte netleştirebiliriz.
