import type { Category } from './types'

/** Ürün kategorileri ağacı (navbar, admin ve ürün sayfaları için) */
export const productCategories: Category[] = [
  {
    title: 'Body Kit Ürünleri',
    slug: 'body-kit-urunleri',
    children: [
      { title: 'Body Kit Setler', slug: 'body-kit-setler' },
      { title: 'Panjur & Böbrek', slug: 'panjur-bobrek' },
      { title: 'Ön Tampon', slug: 'on-tampon' },
      { title: 'Ön Tampon Diğer Ürünler', slug: 'on-tampon-diger-urunler' },
      { title: 'Ön Lip ve Flap', slug: 'on-lip-ve-flap' },
      { title: 'Ön Tampon Ekleri', slug: 'on-tampon-ekleri' },
      {
        title: 'Çamurluk ve Çamurluk Ürünleri',
        slug: 'camurluk-ve-camurluk-urunleri',
        children: [
          { title: 'Çamurluk Kabartma', slug: 'camurluk-kabartma' },
          { title: 'Çamurluk Seti', slug: 'camurluk-seti' },
          { title: 'Çamurluk Sinyali', slug: 'camurluk-sinyali' },
          { title: 'Çamurluk Venti', slug: 'camurluk-venti' },
        ],
      },
      {
        title: 'Kaput ve Kaput Aksesuarları',
        slug: 'kaput-ve-kaput-aksesuarlari',
        children: [
          { title: 'Kaput', slug: 'kaput' },
          { title: 'Kaput Amortisörü', slug: 'kaput-amortisor' },
          { title: 'Kaput İzolasyon', slug: 'kaput-izolasyon' },
          { title: 'Kaput Kaplama ve Havalandırma', slug: 'kaput-kaplama-ve-havalandirma' },
        ],
      },
      { title: 'Arka Tampon Diğer Ürünler', slug: 'arka-tampon-diger-urunler' },
      { title: 'Dönüşüm Kiti', slug: 'donusum-kiti' },
      { title: 'Arka Tampon Ekleri', slug: 'arka-tampon-ekleri' },
      { title: 'Difüzör', slug: 'difuzor' },
      { title: 'Spoiler', slug: 'spoiler' },
      { title: 'Bıçaklar', slug: 'bicaklar' },
      { title: 'Universal Difüzör', slug: 'universal-difuzor' },
      { title: 'Fiber Ürünler', slug: 'fiber-urunler' },
      { title: 'Hayalet Ekran', slug: 'hayalet-ekran' },
      { title: 'Panjur Aksesuarları', slug: 'panjur-aksesuarlari' },
    ],
  },
  {
    title: 'Dış Aksesuarlar',
    slug: 'dis-aksesuarlar',
    children: [
      { title: 'Antenler', slug: 'antenler' },
      { title: 'Arka Basamak', slug: 'arka-basamak' },
      {
        title: 'Ayna ve Cam Ürünleri',
        slug: 'ayna-ve-cam-urunleri',
        children: [
          { title: 'Cam Rüzgarlığı', slug: 'cam-ruzgarligi' },
          { title: 'Diğer Cam Rüzgarlıkları', slug: 'diger-cam-ruzgarliklari' },
          { title: 'Ön Cam Güneşliği', slug: 'on-cam-gunesligi' },
          { title: 'Ayna Rüzgarlığı', slug: 'ayna-ruzgarligi' },
        ],
      },
      {
        title: 'Bagaj Ürünleri',
        slug: 'bagaj-urunleri',
        children: [
          { title: 'Bagaj Çıtası', slug: 'bagaj-citasi' },
          { title: 'Bagaj Eşik Koruma', slug: 'bagaj-esik-koruma' },
          { title: 'Bagaj Kaplama', slug: 'bagaj-kaplama' },
          { title: 'Diğer Bagaj Ürünleri', slug: 'diger-bagaj-urunleri' },
        ],
      },
      { title: 'Bantlar', slug: 'bantlar' },
      { title: 'Batman Ayna Kapağı', slug: 'batman-ayna-kapagi' },
      {
        title: 'Tuning Shop',
        slug: 'tuning-shop',
        children: [
          { title: 'Boru ve Boru Malzemeleri', slug: 'boru-ve-boru-malzemeleri' },
          { title: 'Amortisör', slug: 'amortisor' },
        ],
      },
      {
        title: 'Egzoz ve Egzoz Uçları',
        slug: 'egzoz-ve-egzoz-uclari',
        children: [
          { title: 'Egzoz Ucu', slug: 'egzoz-ucu' },
          { title: 'Egzozlar', slug: 'egzozlar' },
        ],
      },
      {
        title: 'Plaka Ürünleri',
        slug: 'plaka-urunleri',
        children: [
          { title: 'Plaka Kalemi', slug: 'plaka-kalemi' },
          { title: 'Plakalık', slug: 'plakalik' },
        ],
      },
      {
        title: 'Emniyet ve Güvenlik',
        slug: 'emniyet-ve-guvenlik',
        children: [
          { title: 'İlk Yardım ve Trafik Setleri', slug: 'ilk-yardim-ve-trafik-setleri' },
          { title: 'Kilit Sistemi', slug: 'kilit-sistemi' },
        ],
      },
      { title: 'Oto Bidon', slug: 'oto-bidon' },
      { title: 'Kriko', slug: 'kriko' },
      {
        title: 'Far - Stop - Sis Ürünleri',
        slug: 'far-stop-sis-urunleri',
        children: [
          { title: 'Far Kaşı', slug: 'far-kasi' },
          { title: 'Far ve Stop Çerçevesi', slug: 'far-ve-stop-cercevesi' },
          { title: 'Far ve Stop Kaplama', slug: 'far-ve-stop-kaplama' },
          { title: 'Sis Kaplama', slug: 'sis-kaplama' },
        ],
      },
      { title: 'Paçalık', slug: 'pacalik' },
      { title: 'Panjur Çıta ve Kaplama', slug: 'panjur-cita-ve-kaplama' },
      { title: 'Ara Atkı', slug: 'ara-atki' },
      { title: 'ATV Brandası', slug: 'atv-brandasi' },
      { title: 'Kaput Rüzgarlığı', slug: 'kaput-ruzgarligi' },
      { title: 'Motosiklet Brandası', slug: 'motosiklet-brandasi' },
      { title: 'Plastik Yan Kapı Çıtası', slug: 'plastik-yan-kapi-citasi' },
      { title: 'Reflektör', slug: 'reflektor' },
      { title: 'Tavan Çıtası', slug: 'tavan-citasi' },
      {
        title: 'Universal Basamaklıklar',
        slug: 'universal-basamakliklar',
        children: [
          { title: 'Basamak Ayakları (Braket)', slug: 'basamak-ayaklari-braket' },
          { title: 'Basamak Profilleri', slug: 'basamak-profilleri' },
        ],
      },
      { title: 'Yağlama Temizlik ve Bakım Ürünleri', slug: 'yaglama-temizlik-ve-bakim-urunleri' },
    ],
  },
  {
    title: 'İç Aksesuarlar',
    slug: 'ic-aksesuarlar',
    children: [
      {
        title: 'Oto Paspas ve Bagaj Ürünleri',
        slug: 'oto-paspas-ve-bagaj-urunleri',
        children: [
          { title: '5D Havuzlu Araca Özel Paspas', slug: '5d-havuzlu-araca-ozel-paspas' },
          { title: 'Araca Özel Halı Paspas', slug: 'araca-ozel-hali-paspas' },
          { title: '3D Araç Özel Bagaj Havuzu', slug: '3d-arac-ozel-bagaj-havuzu' },
          { title: '3D Havuzlu Araca Özel Paspas', slug: '3d-havuzlu-araca-ozel-paspas' },
        ],
      },
      {
        title: 'Oto Koltuk ve Branda',
        slug: 'oto-koltuk-ve-branda',
        children: [
          { title: 'Koltuk Minderi', slug: 'koltuk-minderi' },
          { title: 'Boyun Yastıkları', slug: 'boyun-yastiklari' },
          { title: 'Oto Branda', slug: 'oto-branda' },
          { title: 'Emniyet Kemer Kılıfı', slug: 'emniyet-kemer-kilifi' },
        ],
      },
      {
        title: 'Tavan ve Konsol Aksesuarları',
        slug: 'tavan-ve-konsol-aksesuarlari',
        children: [
          { title: 'Tavan Konsol İç Kaplama', slug: 'tavan-konsol-ic-kaplama' },
          { title: '4x4 Tavan Aksesuarları', slug: '4x4-tavan-aksesuarlari' },
          { title: 'Konsol Aksesuarları', slug: 'konsol-aksesuarlari' },
          { title: 'Kapı Açma Aksesuarları', slug: 'kapi-acma-aksesuarlari' },
        ],
      },
      { title: 'Direksiyon Ürünleri', slug: 'direksiyon-urunleri' },
      {
        title: 'Araç İçi ve Torpido Aksesuarları',
        slug: 'arac-ici-ve-torpido-aksesuarlari',
        children: [
          { title: 'Kaydırmaz Pedler', slug: 'kaydirmaz-pedler' },
          { title: 'Vantilatör', slug: 'vantilator' },
          { title: 'Araç Saatleri', slug: 'arac-saatleri' },
          { title: 'Burmester Tavan', slug: 'burmester-tavan' },
        ],
      },
      {
        title: 'Ses ve Görüntü Sistemleri',
        slug: 'ses-ve-goruntu-sistemleri',
        children: [
          { title: '4x4 Geri Görüş Kamerası', slug: '4x4-geri-gorus-kamerasi' },
        ],
      },
      {
        title: 'Vites Aksesuar',
        slug: 'vites-aksesuar',
        children: [
          { title: 'Vites Kenar Kaplama', slug: 'vites-kenar-kaplama' },
          { title: 'Vites Konsol Kaplama', slug: 'vites-konsol-kaplama' },
          { title: 'Vites Topuzu Kaplama', slug: 'vites-topuzu-kaplama' },
        ],
      },
    ],
  },
  {
    title: 'Elektronik ve Aydınlatma',
    slug: 'elektronik-ve-aydinlatma',
    children: [
      {
        title: 'Oto Dış Aydınlatma',
        slug: 'oto-dis-aydinlatma',
        children: [
          { title: 'Angel Ledler', slug: 'angel-ledler' },
          { title: 'Gündüz Ledleri', slug: 'gunduz-ledleri' },
          { title: 'Ayna Altı Ledler', slug: 'ayna-alti-ledler' },
          { title: 'Çakar Lamba', slug: 'cakar-lamba' },
        ],
      },
      {
        title: 'Far ve Diğer Ampüller',
        slug: 'far-ve-diger-ampuller',
        children: [
          { title: 'Halojen Far Ampulü', slug: 'halojen-far-ampulu' },
          { title: 'Led Xenonlar', slug: 'led-xenonlar' },
          { title: 'Led Ampüller', slug: 'led-ampuller' },
          { title: 'Xenon Kitleri', slug: 'xenon-kitleri' },
        ],
      },
      {
        title: 'Far ve Stop Ürünleri',
        slug: 'far-ve-stop-urunleri',
        children: [
          { title: 'RGB Far Aydınlatma', slug: 'rgb-far-aydinlatma' },
          { title: 'Arka Far Stop', slug: 'arka-far-stop' },
          { title: 'Sis Farları', slug: 'sis-farlari' },
          { title: 'Ön Farlar', slug: 'on-farlar' },
        ],
      },
      {
        title: 'Oto İç Aydınlatma',
        slug: 'oto-ic-aydinlatma',
        children: [
          { title: 'Tavan İç Aydınlatma', slug: 'tavan-ic-aydinlatma' },
        ],
      },
      { title: 'Stop Lambası', slug: 'stop-lambasi' },
    ],
  },
  {
    title: 'Krom Aksesuarlar',
    slug: 'krom-aksesuarlar',
    children: [
      { title: 'Yan Kapı Çıtaları', slug: 'yan-kapi-citalari' },
      { title: 'Cam Çerçevesi', slug: 'cam-cercevesi' },
      { title: 'Arka Tampon Aksesuarı', slug: 'arka-tampon-aksesuari' },
      { title: 'Arka Tampon Koruma', slug: 'arka-tampon-koruma' },
      { title: 'Ayna Alt Çıta Kaplama', slug: 'ayna-alti-cita-kaplama' },
      { title: 'Ayna Kapağı', slug: 'ayna-kapagi' },
      { title: 'Bagaj Açma Kaplama', slug: 'bagaj-acma-kaplama' },
      { title: 'Bagaj Çıtası Kaplama', slug: 'bagaj-citasi-kaplama' },
      { title: 'Cam Çıtası Kaplama', slug: 'cam-citasi-kaplama' },
      { title: 'Depo Kapağı Kaplama', slug: 'depo-kapagi-kaplama' },
      { title: 'Far Çerçevesi', slug: 'far-cercevesi' },
      { title: 'Kapı İç Eşiği', slug: 'kapi-ic-esigi' },
      { title: 'Kapı Kolu Kaplama', slug: 'kapi-kolu-kaplama' },
      { title: 'Kaput Çıtası', slug: 'kaput-citasi' },
      { title: 'Krom Aksesuar Seti', slug: 'krom-aksesuar-seti' },
      { title: 'Krom Ayna Kapakları', slug: 'krom-ayna-kapaklari' },
      { title: 'Krom Egzoz Kaplama', slug: 'krom-egzoz-kaplama' },
      { title: 'Ön Panjur Kaplama', slug: 'on-panjur-kaplama' },
      { title: 'Ön Tampon Çıtası', slug: 'on-tampon-citasi' },
      { title: 'Sis Farı Çerçeveleri', slug: 'sis-fari-cerceveleri' },
      { title: 'Sis Farı Kapağı', slug: 'sis-fari-kapagi' },
      { title: 'Stop Çerçeveleri', slug: 'stop-cerceveleri' },
      { title: 'Sürgülü Kapı Çıtası', slug: 'surgulu-kapi-citasi' },
      { title: 'Reflektör Çerçevesi', slug: 'reflektor-cercevesi' },
      { title: 'Sinyal Çerçeveleri', slug: 'sinyal-cerceveleri' },
    ],
  },
  {
    title: 'Yedek Parça',
    slug: 'yedek-parca',
    children: [
      { title: 'Ayna Camları', slug: 'ayna-camlari' },
      { title: 'Yan Aynalar', slug: 'yan-aynalar' },
      { title: 'Çamurluk Davlumbaz', slug: 'camurluk-davlumbaz' },
      { title: 'Çeki Demiri ve Aksesuarları', slug: 'ceki-demiri-ve-aksesuarlari' },
      { title: 'Far - Stop - Sis Ürünleri', slug: 'far-stop-sis-urunleri' },
      { title: 'Kapı Kolu', slug: 'kapi-kolu' },
      { title: 'Marşpiyel Kaplaması ve Aksesuarları', slug: 'marspiyel-kaplamasi-ve-aksesuarlari' },
      { title: 'Ön Arka Tampon Braket - Bakalit', slug: 'on-arka-tampon-braket-bakalit' },
      { title: 'Panjur & Izgara Aksesuarları', slug: 'panjur-izgara-aksesuarlari' },
      { title: 'Stepne Kapağı', slug: 'stepne-kapagi' },
      { title: 'Tampon Alt Muhafaza Ürünleri', slug: 'tampon-alt-muhafaza-urunleri' },
    ],
  },
  {
    title: 'Pick Up - Off Road',
    slug: 'pick-up-off-road',
    children: [
      { title: 'Amortisör', slug: 'amortisor' },
      { title: 'Ayna Seti', slug: 'ayna-seti' },
      { title: 'Bagaj - Kabin - Kasa', slug: 'bagaj-kabin-kasa' },
      { title: 'Cam Rüzgarlığı', slug: 'cam-ruzgarligi' },
      {
        title: 'SUV Ürünleri',
        slug: 'suv-urunleri',
        children: [
          { title: 'Ön Arka Koruma Difüzör', slug: 'on-arka-koruma-difuzor' },
          { title: 'Araç İçi ve Torpido Aksesuarları', slug: 'arac-ici-ve-torpido-aksesuarlari' },
          { title: 'Ayna ve Cam Ürünleri', slug: 'ayna-ve-cam-urunleri' },
          { title: 'Batman Ayna Kapağı', slug: 'batman-ayna-kapagi' },
        ],
      },
    ],
  },
  {
    title: 'Müzik Sistemleri',
    slug: 'muzik-sistemleri',
    children: [
      { title: 'Amfi Çeşitleri', slug: 'amfi-cesitleri' },
      { title: 'Araç İzolasyon', slug: 'arac-izolasyon' },
      { title: 'Diğer Ürünler', slug: 'diger-urunler' },
      { title: 'Hoparlör Takımları', slug: 'hoparlor-takimlari' },
      { title: 'Mid Takımları', slug: 'mid-takimlari' },
      { title: 'Multimedia ve Teyp', slug: 'multimedia-ve-teyp' },
      { title: 'Subwoofer', slug: 'subwoofer' },
      { title: 'Tak Çalıştır Soketler', slug: 'tak-calistir-soketler' },
      { title: 'Tweeter', slug: 'tweeter' },
      { title: 'Woofer', slug: 'woofer' },
    ],
  },
  { title: 'Oto Aksesuar Ürünleri', slug: 'oto-aksesuar-urunleri', children: [] },
]

export type { Category }

/** Tüm kategori path'lerini (slug zinciri) gruplu option listesine çevirir */
export function getCategoryPathsGrouped(categories: Category[]): { group: string; options: { path: string; label: string }[] }[] {
  const result: { group: string; options: { path: string; label: string }[] }[] = []

  function collect(cats: Category[], pathPrefix: string, labelPrefix: string) {
    for (const cat of cats) {
      const path = pathPrefix ? `${pathPrefix}/${cat.slug}` : cat.slug
      const label = labelPrefix ? `${labelPrefix} > ${cat.title}` : cat.title
      result[result.length - 1].options.push({ path, label })
      if (cat.children && cat.children.length > 0) {
        collect(cat.children, path, label)
      }
    }
  }

  for (const top of categories) {
    result.push({ group: top.title, options: [] })
    collect([top], '', '')
  }

  return result
}

/** Path veya slug'ı okunabilir kategori yoluna çevirir (örn. "body-kits/body-kit-setler" → "Body Kits > Body Kit Setler") */
export function getReadableCategoryPath(pathOrSlug: string, categories: Category[]): string {
  if (!pathOrSlug || !pathOrSlug.trim()) return pathOrSlug
  const parts = pathOrSlug.split('/').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return pathOrSlug

  const titles: string[] = []
  let current: Category[] = categories

  for (const slug of parts) {
    const found = current.find((c) => c.slug === slug)
    if (!found) {
      return pathOrSlug
    }
    titles.push(found.title)
    current = found.children ?? []
  }

  return titles.join(' > ')
}
