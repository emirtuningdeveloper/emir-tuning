/**
 * DRS Tuning (drstuning.com) kategori slug eşlemesi.
 * Bizim kategori path/slug -> DRS'nin /kategori/{slug} URL'i.
 */
const DRS_BASE = 'https://www.drstuning.com'

/** Bizim slug -> DRS kategori slug (DRS sayfası /kategori/body-kitler gibi) */
const OUR_SLUG_TO_DRS_SLUG: Record<string, string> = {
  'body-kit-setler': 'body-kitler',
  'body-kit-urunleri': 'body-kitler',
  // Link uyumsuzlukları: bizim slug -> DRS'deki gerçek slug
  'on-tampon-diger-urunler': 'on-tampon-cita',
  'spoiler': 'spoyler',
  'on-lip-ve-flap': 'on-lip',
  'kaput-ve-kaput-aksesuarlari': 'kaput-kaput-aksesuarlari',
  'kaput-amortisor': 'kaput-amortisoru',
  'kaput-kaplama-ve-havalandirma': 'kaput-havalandirma',
  // Dış Aksesuarlar ve alt kategoriler
  'tuning-shop': 'tuning-performans',
  'emniyet-ve-guvenlik': 'emniyet-guvenlik',
  'far-ve-stop-cercevesi': 'far-cercevesi',
  'motosiklet-brandasi': 'motorsiklet-brandasi',
  'egzoz-ve-egzoz-uclari': 'egzoz-egzoz-uclari',
  'pacalik': 'pacalik-1',
  'atv-brandasi': 'atv-brandasi-modelleri-cesitleri',
  'universal-basamakliklar': 'universal-basamaklar',
  // İç Aksesuarlar
  'oto-paspas-ve-bagaj-urunleri': 'oto-paspas-bagaj-urunleri',
  'araca-ozel-hali-paspas': 'hali-paspaslar',
  '3d-arac-ozel-bagaj-havuzu': 'bagaj-havuzu',
  'vites-topuzu-kaplama': 'vites-topuzu',
  'oto-koltuk-ve-branda': 'oto-koltuk-branda',
  // Elektronik ve Aydınlatma
  'far-ve-diger-ampuller': 'far-ampulleri',
  // Krom Aksesuarlar
  'kapi-kolu-kaplama': 'kapi-kolu',
  'ayna-alti-cita-kaplama': 'ayna-alt-cita',
  'bagaj-citasi-kaplama': 'bagaj-citasi',
  // Yedek Parça
  'ceki-demiri-ve-aksesuarlari': 'ceki-demiri-1',
  'marspiyel-kaplamasi-ve-aksesuarlari': 'marspiyel-kaplamasi',
  'on-arka-tampon-braket-bakalit': 'on-tampon-braket',
  'tampon-alt-muhafaza-urunleri': 'tampon-alt-muhafaza-kapagi',
  // Pick Up / Off Road - SUV Ürünleri
  'on-arka-koruma-difuzor': 'on-arka-koruma',
  // Müzik Sistemleri (slug aynı; sayfa boş olabilir)
  'amfi-cesitleri': 'amfi-cesitleri',
  'subwoofer': 'subwoofer',
  'woofer': 'woofer',
  'arac-izolasyon': 'arac-izolasyon',
  'mid-takimlari': 'mid-takimlari',
}

/**
 * Kategori path'ini (örn. body-kit-urunleri veya body-kit-urunleri/body-kit-setler) DRS kategori URL'ine çevirir.
 * page > 1 ise ?tp=2, ?tp=3 eklenir (DRS sayfalama).
 */
export function getDrstuningCategoryUrl(categoryPath: string, page: number = 1): string {
  const trimmed = (categoryPath || '').trim()
  const base = !trimmed
    ? `${DRS_BASE}/kategori/body-kitler`
    : (() => {
        const lastSegment = trimmed.includes('/') ? trimmed.split('/').pop()! : trimmed
        const drsSlug = OUR_SLUG_TO_DRS_SLUG[lastSegment] ?? lastSegment
        return `${DRS_BASE}/kategori/${drsSlug}`
      })()
  if (page > 1) return `${base}?tp=${page}`
  return base
}

export { DRS_BASE }
