'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RawMaterial,
  FinishedProductStock,
  InventoryStockLog,
  Account,
  AccountMovement,
  FinanceTransaction,
  AdminOrder,
  AdminInvoice,
  MarketingCoupon,
  CrossSellRule,
  AbandonedCartItem,
  AdminSettings,
  CmsPageData,
  OrderStage,
  StockLogType,
  KanbanColumn,
  OrderStagePhoto,
  CustomQuoteRequest,
  QuoteStatus,
  AdminProduct,
  AdminProductVariant,
  AdminBulkTier,
  AdminCategory,
  MarketingCampaign,
  AutomatedEmailTrigger,
  ConceptBannerItem,
  ConceptSlotKey,
  ConceptBannersMap,
} from '@/types/admin';
import { dispatchStageNotification } from '@/lib/notifications';


// Başlangıç Atölye Hammaddeleri (Demo veriler temizlendi - Gerçek stoklar eklenebilir)
const initialRawMaterials: RawMaterial[] = [];

// Başlangıç Atölye Katalogları / Kategorileri
export const initialCategories: AdminCategory[] = [
  {
    id: 'cat-mum',
    name: 'Doğal Mumlar',
    slug: 'dogal-mumlar',
    description: '%100 doğal soya vaksı, ahşap fitilli ve saf esansiyel yağlarla dökülen el yapımı atölye mumları.',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    icon: 'Flame',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-tas',
    name: 'Kokulu Taş & Seramik',
    slug: 'kokulu-tas',
    description: 'Özel formüllü taş tozu, heykelsi figürler ve kalıcı koku hapseden dekoratif objeler.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    icon: 'Gem',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-epoksi',
    name: 'Epoksi Tasarımlar',
    slug: 'epoksi-tasarimlar',
    description: 'Ultra şeffaf döküm reçine, kurutulmuş çiçekler ve doğal fırınlanmış ahşap sunumluklar.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    icon: 'Palette',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-miyuki',
    name: 'Miyuki Boncuk Takı',
    slug: 'miyuki-taki',
    description: 'Japon Miyuki Delica boncuklarıyla tek tek elde dokunan özel tasarım bileklik ve kolyeler.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-ozel',
    name: 'Özel Tasarım & Hediyelik',
    slug: 'ozel-hediyelik',
    description: 'Söz, nişan, düğün ve kurumsal etkinlikler için kişiselleştirilmiş hediyelik setler.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    icon: 'Tag',
    sortOrder: 5,
    isActive: true,
  },
];

// Bitmiş Ürün Kataloğu
export const initialProducts: AdminProduct[] = [
  {
    id: 'p-1',
    name: 'Doğal Kehribar Cam Kavanoz Soya Mumu (210g)',
    slug: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    sku: 'SFR-MUM-01',
    category: 'Doğal Mumlar',
    categoryId: 'cat-mum',
    shortDesc: 'Lavanta, sandal ağacı ve vanilya notaları ile huzur dolu el yapımı atölye esintisi.',
    description: '%100 doğal soya vaksı, ahşap fitilli ve saf esansiyel yağlarla Kadıköy atölyemizde özenle dökülmüştür. Ahşap fitili yanarken şömine çıtırtısı sesi çıkarır. Kimyasal parafin veya sentetik koku tutucular içermez.',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    ],
    price: 380.0,
    discountRate: 15,
    discountPrice: 323.0,
    preparationDays: 2,
    isCustomizable: true,
    inStock: true,
    stockQuantity: 42,
    minThreshold: 15,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    scentNotes: ['Lavanta', 'Sandal Ağacı', 'Vanilya', 'Kehribar'],
    colorOptions: ['Kehribar Amber', 'Fildişi Krem', 'Kömür Füme'],
    variants: [
      {
        id: 'var-1',
        title: '210g Kehribar Cam Kavanoz',
        sku: 'SFR-MUM-01-210G',
        price: 380.0,
        stockQuantity: 42,
        sizeOrVolume: '210g (Yaklaşık 45 Saat Yanma)',
        scentName: 'Lavanta & Sandal',
        isActive: true,
      },
      {
        id: 'var-2',
        title: '350g Safir Gece Seramik Kapaklı',
        sku: 'SFR-MUM-01-350G',
        price: 540.0,
        stockQuantity: 20,
        sizeOrVolume: '350g (Yaklaşık 70 Saat Yanma)',
        scentName: 'Vanilya & Kehribar',
        isActive: true,
      },
    ],
    bulkTiers: [
      {
        id: 'tier-1',
        minQuantity: 25,
        maxQuantity: 49,
        discountPercentage: 15,
        unitPrice: 323.0,
        description: '25-49 Adet Söz/Nişan Hediyelik Baremi (%15 İndirim)',
      },
      {
        id: 'tier-2',
        minQuantity: 50,
        maxQuantity: 99,
        discountPercentage: 25,
        unitPrice: 285.0,
        description: '50-99 Adet Toplu Sipariş Baremi (%25 İndirim)',
      },
      {
        id: 'tier-3',
        minQuantity: 100,
        maxQuantity: null,
        discountPercentage: 35,
        unitPrice: 247.0,
        description: '100+ Adet Kurumsal & Düğün Hediyeliği Baremi (%35 İndirim)',
      },
    ],
    rating: 4.9,
    reviewCount: 42,
    createdAt: '2026-10-01',
    updatedAt: '2026-10-14',
  },
  {
    id: 'p-2',
    name: 'Kişiye Özel İsimli Söz/Nişan Hediyelik Mumu',
    slug: 'kisiye-ozel-isimli-soz-nisan-hediyelik-mumu',
    sku: 'SFR-MUM-02',
    category: 'Doğal Mumlar',
    categoryId: 'cat-mum',
    shortDesc: 'Özel kraft etiketli, kuru çiçek ve keten ipli kişiselleştirilebilir nişan & söz hatırası.',
    description: 'Özel günleriniz için davetlilerinize unutulmaz bir hatıra bırakın. İsimleriniz ve tarihiniz kraft etikete özel tipografi ile basılır. Cam kavanoz üzeri doğal çiçeklerle süslenir.',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    ],
    price: 319.0,
    discountRate: 15,
    discountPrice: 271.0,
    preparationDays: 3,
    isCustomizable: true,
    inStock: true,
    stockQuantity: 110,
    minThreshold: 30,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    scentNotes: ['Lavanta', 'Madagaskar Vanilyası'],
    colorOptions: ['Fildişi Krem', 'Doğal Bej'],
    bulkTiers: [
      {
        id: 'tier-p2-1',
        minQuantity: 20,
        maxQuantity: 49,
        discountPercentage: 15,
        unitPrice: 271.0,
        description: '20-49 Adet Baremi',
      },
      {
        id: 'tier-p2-2',
        minQuantity: 50,
        maxQuantity: null,
        discountPercentage: 25,
        unitPrice: 239.0,
        description: '50+ Adet Baremi',
      },
    ],
    rating: 4.9,
    reviewCount: 56,
    createdAt: '2026-10-02',
    updatedAt: '2026-10-14',
  },
  {
    id: 'p-3',
    name: 'Ceviz Ağacı & Zümrüt Reçine Sunum Tepsisi',
    slug: 'ceviz-agaci-zumrut-recine-sunum-tepsisi',
    sku: 'SFR-EPOK-01',
    category: 'Epoksi Tasarımlar',
    categoryId: 'cat-epoksi',
    shortDesc: 'Doğal fırınlanmış ceviz ağacı ve zümrüt yeşili ultra şeffaf döküm reçinenin harmanı.',
    description: 'Safirya epoksi ustalarımızın katman katman döküm tekniğiyle hazırladığı, gıdaya uygun sertifikalı reçineli sunum tepsisi. Altın rengi metal kulplara sahiptir.',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    ],
    price: 950.0,
    discountRate: 6,
    discountPrice: 890.0,
    preparationDays: 5,
    isCustomizable: true,
    inStock: true,
    stockQuantity: 8,
    minThreshold: 10,
    isFeatured: true,
    isBestSeller: false,
    isActive: true,
    scentNotes: [],
    colorOptions: ['Zümrüt Yeşili Epoksi', 'Safir Mavisi Epoksi', 'Kehribar & Duman'],
    rating: 4.8,
    reviewCount: 19,
    createdAt: '2026-10-03',
    updatedAt: '2026-10-14',
  },
  {
    id: 'p-4',
    name: 'Geometrik Safir Mavisi Miyuki Delica Bileklik',
    slug: 'geometrik-safir-mavisi-miyuki-delica-bileklik',
    sku: 'SFR-MIY-01',
    category: 'Miyuki Boncuk Takı',
    categoryId: 'cat-miyuki',
    shortDesc: 'Orijinal Japon Delica boncuklarıyla mikron düzeyinde elde dokuma bileklik.',
    description: 'Orijinal Japon Miyuki Delica 11/0 boncukları ile ipek kordona elde ilmek ilmek işlenmiştir. Ayarlanabilir asansör kapaması sayesinde her bileğe uygundur. Solmaz, kararma yapmaz.',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    ],
    price: 420.0,
    discountRate: 0,
    discountPrice: 420.0,
    preparationDays: 2,
    isCustomizable: false,
    inStock: true,
    stockQuantity: 24,
    minThreshold: 10,
    isFeatured: false,
    isBestSeller: true,
    isActive: true,
    scentNotes: [],
    colorOptions: ['Safir Mavisi & 24K Altın', 'Zümrüt Yeşili & Platin'],
    rating: 4.9,
    reviewCount: 34,
    createdAt: '2026-10-04',
    updatedAt: '2026-10-14',
  },
];

const initialFinishedProducts: FinishedProductStock[] = initialProducts.map((p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  stockQuantity: p.stockQuantity,
  minThreshold: p.minThreshold,
  price: p.discountPrice || p.price,
  imageUrl: p.images[0] || '',
}));

// Stok Hareket Logları (Demo veriler temizlendi)
const initialStockLogs: InventoryStockLog[] = [];

// Cari Hesaplar
// Cari Hesaplar (Demo veriler temizlendi)
const initialAccounts: Account[] = [];

// Cari Hareketleri (Demo veriler temizlendi)
const initialAccountMovements: AccountMovement[] = [];

// Finansal İşlemler (Demo veriler temizlendi)
const initialFinanceTransactions: FinanceTransaction[] = [];

// Kanban Üretim Bandı Varsayılan Sütunları
const initialKanbanColumns: KanbanColumn[] = [
  { id: 'col-prep', title: 'Hammadde Hazırlık', color: 'amber', sortOrder: 1 },
  { id: 'col-casting', title: 'Kalıp / Döküm', color: 'blue', sortOrder: 2 },
  { id: 'col-curing', title: 'Kuruma / Dinlendirme', color: 'purple', sortOrder: 3 },
  { id: 'col-crafting', title: 'Süsleme & Kişiselleştirme', color: 'rose', sortOrder: 4 },
  { id: 'col-qc', title: 'Kalite Kontrol & Paketleme', color: 'emerald', sortOrder: 5 },
];

// Siparişler Listesi (Demo veriler temizlendi)
const initialOrders: AdminOrder[] = [];

// Özel Teklif / Toplu Talep Talepleri (Demo veriler temizlendi)
const initialQuoteRequests: CustomQuoteRequest[] = [];

// E-Faturalar (Demo veriler temizlendi)
const initialInvoices: AdminInvoice[] = [];

// Kuponlar
const initialCoupons: MarketingCoupon[] = [
  {
    id: 'cp-1',
    code: 'SAFIRYA10',
    label: '%10 Tanışma İndirimi',
    discountType: 'percentage',
    discountValue: 10,
    minCartTotal: 250,
    usageCount: 142,
    isActive: true,
  },
  {
    id: 'cp-2',
    code: 'ATOLYE50',
    label: '₺50 Atölye İndirimi',
    discountType: 'fixed',
    discountValue: 50,
    minCartTotal: 400,
    usageCount: 68,
    isActive: true,
  },
];

// Çapraz Satış Kuralları
const initialCrossSellRules: CrossSellRule[] = [
  {
    id: 'cs-1',
    title: 'Mum Alanlara Kibrit ve Beton Altlık Öner',
    triggerCategory: 'Doğal Mumlar',
    recommendedProductNames: [
      'El Yapımı Renkli Başlıklı Güvenlikli Ahşap Kibrit Şişesi',
      'Mermer Dokulu El Yapımı Beton/Alçı Mum Altlığı',
    ],
    discountPercentage: 10,
    bannerText: 'Mumunuzun yanına özel atölye kibrit ve altlık ekleyin, sepette %10 kazanın!',
    isActive: true,
  },
];

// Terkedilen Sepetler (Demo veriler temizlendi)
const initialAbandonedCarts: AbandonedCartItem[] = [];

// Otomatik E-Posta Tetikleyicileri
const initialAutomatedTriggers: AutomatedEmailTrigger[] = [
  {
    id: 'trg-welcome',
    title: 'Yeni Üye Hoş Geldin & Tanışma Kuponu',
    description: 'Yeni kayıt olan veya bültene abone olan müşteriye atölye hikayesi ve %10 tanışma kuponu iletilir.',
    event: 'WELCOME',
    delay: 'Anında',
    isEnabled: true,
    openRate: 64.2,
    sentCount: 418,
    templateType: 'lansman',
  },
  {
    id: 'trg-abandoned',
    title: 'Zanaatkar Sepet Kurtarma Hatırlatıcısı',
    description: 'Sepetinde el yapımı ürün bırakıp ayrılan kullanıcılara nazik bir atölye notu ve sepet bağlantısı gönderilir.',
    event: 'ABANDONED_CART',
    delay: '2 Saat Sonra',
    isEnabled: true,
    openRate: 49.5,
    sentCount: 182,
    templateType: 'sepet-kurtarma',
  },
  {
    id: 'trg-stage',
    title: 'Atölye Canlı Üretim & Aşama Fotoğrafı',
    description: 'Sipariş döküm veya fırınlama aşamasına geldiğinde ustaların çektiği canlı fotoğraf müşteriye e-posta ile ulaştırılır.',
    event: 'STAGE_UPDATE',
    delay: 'Bantta Güncellendiğinde',
    isEnabled: true,
    openRate: 82.4,
    sentCount: 630,
    templateType: 'bulten',
  },
  {
    id: 'trg-vip',
    title: 'VIP Sadakat Kulübü & Yeniden Sipariş Daveti',
    description: 'Son alışverişinden 30 gün geçen müşteriye özel atölye teşekkür çeki ve yeni koleksiyon önerileri sunulur.',
    event: 'VIP_LOYALTY',
    delay: '30 Gün Sonra',
    isEnabled: true,
    openRate: 38.7,
    sentCount: 295,
    templateType: 'indirim',
  },
  {
    id: 'trg-birthday',
    title: 'Özel Gün & Doğum Günü Kutlaması',
    description: 'Müşterinin doğum gününde el yapımı soya mumu hediye çeki ve özel kutlama kartı gönderilir.',
    event: 'BIRTHDAY',
    delay: 'Sabah 09:00',
    isEnabled: false,
    openRate: 58.1,
    sentCount: 112,
    templateType: 'indirim',
  },
];

// Geçmiş & Aktif E-Posta Kampanyaları (Demo veriler temizlendi)
const initialCampaigns: MarketingCampaign[] = [];

// Sistem Ayarları (WhatsApp ve SMTP Yapılandırması Dahil)
const initialSettings: AdminSettings = {
  announcementText: '₺500 ve Üzeri Siparişlerde Ücretsiz Kargo!',
  isAnnouncementActive: true,
  freeShippingThreshold: 500,
  giftWrapFee: 30,
  storeName: 'Safirya El Yapımı Tasarım Atölyesi',
  contactEmail: 'destek@safirya.tr',
  contactPhone: '+90 (212) 555 7234',
  whatsappNumber: '+90 532 555 7234',
  instagramHandle: '@safirya.craft',
  atelierAddress: 'Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul',
  exitIntentEnabled: true,
  exitIntentTitle: 'Atölyemizden Ayrılmadan Önce %10 Tanışma İndirimi!',
  exitIntentSubtitle: 'İlk siparişinize özel zanaatkar dokunuşlu el yapımı hediyeniz.',
  exitIntentCouponCode: 'SAFIRYA10',
  exitIntentDiscountRate: 10,
  exitIntentCountdownMinutes: 15,
  promoPopupEnabled: false,

  // WhatsApp Business Cloud API (Hazır Altyapı)
  whatsappNotificationsEnabled: false,
  whatsappPhoneId: '',
  whatsappAccessToken: '',
  whatsappTemplateName: 'safirya_stage_update',

  // E-Posta SMTP Ayarları
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: 'Safirya Atölyesi <bildirim@safirya.tr>',

  // Marka & Logo Yönetimi
  logoUrl: '',
  logoDarkUrl: '',
  logoText: 'SAFİRYA',
  brandTagline: 'El Yapımı Tasarım Atölyesi',
  logoScale: 100,
};

// Konsept Tasarım Bannerları (Kullanıcı sonradan ekleyebilmesi için varsayılan olarak boş şablon)
export const initialConceptBanners: ConceptBannersMap = {
  hero: {
    id: 'concept-hero',
    slotKey: 'hero',
    slotName: 'Ana Hero Banner (Üst Geniş Banner)',
    title: 'SON YAZ FIRSATLARI',
    subtitle: 'Seçili Ürünlerde %50\'ye Varan İndirim',
    tag: "%50'YE VARAN İNDİRİM",
    buttonText: 'ALIŞVERİŞE BAŞLA',
    buttonLink: '/cok-satanlar',
    imageUrl: '', // Kullanıcı sonradan ekleyecek, şuanlık boş
    recommendedDimensions: '1920 × 600 px (Geniş Ekran) / Mobil: 800 × 800 px',
    aspectRatioLabel: '16:5 (Geniş Ekran)',
    isActive: true,
  },
  category_1: {
    id: 'concept-cat-1',
    slotKey: 'category_1',
    slotName: '1. Koleksiyon Kartı (Sol)',
    title: 'Çay Fincanı Seti',
    subtitle: 'ÖZEL KOLEKSİYON',
    buttonText: 'KOLEKSİYONU KEŞFET',
    buttonLink: '/kategoriler/dogal-mumlar',
    imageUrl: '', // Şuanlık boş
    recommendedDimensions: '800 × 800 px (1:1 Kare)',
    aspectRatioLabel: '1:1 Kare',
    isActive: true,
  },
  category_2: {
    id: 'concept-cat-2',
    slotKey: 'category_2',
    slotName: '2. Koleksiyon Kartı (Orta)',
    title: 'Kahve Yanı Bardağı Seti',
    subtitle: 'ÖZEL KOLEKSİYON',
    buttonText: 'KOLEKSİYONU KEŞFET',
    buttonLink: '/kategoriler/miyuki-taki',
    imageUrl: '', // Şuanlık boş
    recommendedDimensions: '800 × 800 px (1:1 Kare)',
    aspectRatioLabel: '1:1 Kare',
    isActive: true,
  },
  category_3: {
    id: 'concept-cat-3',
    slotKey: 'category_3',
    slotName: '3. Koleksiyon Kartı (Sağ)',
    title: 'Tabak Setleri',
    subtitle: 'ÖZEL KOLEKSİYON',
    buttonText: 'KOLEKSİYONU KEŞFET',
    buttonLink: '/kategoriler/epoksi-tasarimlar',
    imageUrl: '', // Şuanlık boş
    recommendedDimensions: '800 × 800 px (1:1 Kare)',
    aspectRatioLabel: '1:1 Kare',
    isActive: true,
  },
  showcase_1: {
    id: 'concept-showcase-1',
    slotKey: 'showcase_1',
    slotName: 'Vitrin 1 - Split Banner (Sol Geniş Görsel)',
    title: 'Kavanoz Setleri',
    subtitle: 'MUTFAKLARDA YENİLİK ZAMANI!',
    buttonText: 'KEŞFEDİN',
    buttonLink: '/kategoriler/dogal-mumlar',
    imageUrl: '', // Şuanlık boş
    recommendedDimensions: '1200 × 800 px (4:3 veya 3:2)',
    aspectRatioLabel: '4:3 Yatay',
    categorySlug: 'dogal-mumlar',
    isActive: true,
  },
  showcase_2: {
    id: 'concept-showcase-2',
    slotKey: 'showcase_2',
    slotName: 'Vitrin 2 - Split Banner (Sol Geniş Görsel)',
    title: 'Kahvaltılık Setleri',
    subtitle: 'GÜNÜN EN GÜZEL BAŞLANGICI',
    buttonText: 'KEŞFEDİN',
    buttonLink: '/kategoriler/epoksi-tasarimlar',
    imageUrl: '', // Şuanlık boş
    recommendedDimensions: '1200 × 800 px (4:3 veya 3:2)',
    aspectRatioLabel: '4:3 Yatay',
    categorySlug: 'epoksi-tasarimlar',
    isActive: true,
  },
};

// CMS Sayfaları
const initialCmsPages: Record<string, CmsPageData> = {
  'hakkimizda': {
    slug: 'hakkimizda',
    title: 'Hakkımızda',
    subtitle: 'Safirya: El Emeğinin, Zarafetin ve Doğallığın Zanaati',
    content: `## Safirya: Seri Üretime İnat Zanaatkar Dokunuşu\n\nSafirya, her bir objeyi zanaatkar dokunuşuyla, sevgiyle ve özenle üreten bağımsız bir tasarım atölyesidir.`,
    updatedAt: '2026-10-10',
  },
  'iade-kosullari': {
    slug: 'iade-kosullari',
    title: 'İade ve Değişim Koşulları',
    subtitle: '14 Gün Koşulsuz İade ve Atölye Güvencesi',
    content: `## 14 Gün Koşulsuz İade Güvencesi\n\nStandart koleksiyon ürünlerimizde 14 gün iade hakkınız bulunmaktadır.`,
    updatedAt: '2026-10-10',
  },
  'gizlilik-ve-kvkk': {
    slug: 'gizlilik-ve-kvkk',
    title: 'Gizlilik ve KVKK Politikası',
    subtitle: 'Kişisel Verilerin Korunması Kanunu Aydınlatma Metni',
    content: `## Kişisel Verilerinizin Güvenliği\n\nKVKK uyarınca kişisel verileriniz en yüksek güvenlik standartlarıyla korunur.`,
    updatedAt: '2026-10-10',
  },
  'mesafeli-satis-sozlesmesi': {
    slug: 'mesafeli-satis-sozlesmesi',
    title: 'Mesafeli Satış Sözleşmesi',
    subtitle: 'T.C. Ticaret Bakanlığı Mevzuatına Uygun E-Ticaret Sözleşmesi',
    content: `## Mesafeli Satış Sözleşmesi\n\n6502 sayılı Tüketicinin Korunması Kanunu uyarınca düzenlenmiştir.`,
    updatedAt: '2026-10-10',
  },
  'iletisim': {
    slug: 'iletisim',
    title: 'İletişim & Atölye Ziyareti',
    subtitle: 'Bir Kahve Eşliğinde Atölyemizi Ziyaret Edin',
    content: `## Atölyemize Kahveye Bekleriz\n\nCaferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul`,
    updatedAt: '2026-10-10',
  },
};

interface AdminContextType {
  // 0. Ürün Kataloğu & Kategori / Koleksiyon Yönetimi
  categories: AdminCategory[];
  addCategory: (cat: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>) => AdminCategory;
  updateCategory: (id: string, updates: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryStatus: (id: string) => void;

  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) => AdminProduct;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string, field: 'isActive' | 'isFeatured' | 'isBestSeller' | 'inStock') => void;

  // 1. Hammadde & Envanter
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProductStock[];
  stockLogs: InventoryStockLog[];
  criticalStockCount: number;
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => void;
  updateRawMaterialStock: (
    id: string,
    delta: number,
    logType: StockLogType,
    reason?: string,
    unitPrice?: number
  ) => void;

  // 2. Cari Hesaplar
  accounts: Account[];
  accountMovements: AccountMovement[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  addAccountMovement: (
    accountId: string,
    type: 'BORC' | 'ALACAK',
    amount: number,
    description: string,
    referenceNo?: string
  ) => void;

  // 3. Finans
  financeTransactions: FinanceTransaction[];
  addFinanceTransaction: (
    tx: Omit<FinanceTransaction, 'id' | 'date'>
  ) => void;

  // 4. Siparişler & E-Fatura
  orders: AdminOrder[];
  invoices: AdminInvoice[];
  addManualOrder: (order: Omit<AdminOrder, 'id' | 'orderNumber' | 'createdAt'>) => AdminOrder;
  updateOrderStage: (id: string, stage: OrderStage) => void;
  generateInvoice: (orderId: string) => AdminInvoice;
  cancelInvoice: (invoiceId: string) => void;

  // 5. Atölye Üretim Bandı (Dinamik Kanban)
  kanbanColumns: KanbanColumn[];
  addKanbanColumn: (title: string, color: string) => void;
  updateKanbanColumn: (id: string, title: string, color: string) => void;
  deleteKanbanColumn: (id: string) => void;
  moveKanbanColumn: (id: string, direction: 'left' | 'right') => void;
  moveOrderToColumn: (orderId: string, targetColumnId: string, newSortOrder?: number) => void;
  updateOrderSortOrder: (orderId: string, newSortOrder: number) => void;
  addStagePhotoToOrder: (
    orderId: string,
    photoUrl: string,
    caption: string,
    stageName: string,
    notifyCustomer: boolean
  ) => Promise<void>;

  // 6. Özel Talepler & Teklifler
  quoteRequests: CustomQuoteRequest[];
  addQuoteRequest: (req: Omit<CustomQuoteRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateQuoteStatus: (
    id: string,
    status: QuoteStatus,
    quotedUnitPrice?: number,
    quotedTotalPrice?: number,
    adminNote?: string
  ) => void;
  convertQuoteToOrder: (
    quoteId: string,
    customUnitPrice: number,
    customTotalPrice: number
  ) => AdminOrder;

  // 7. Pazarlama & Çapraz Satış & Kuponlar
  coupons: MarketingCoupon[];
  crossSellRules: CrossSellRule[];
  abandonedCarts: AbandonedCartItem[];
  addCoupon: (coupon: Omit<MarketingCoupon, 'id' | 'usageCount'>) => void;
  toggleCoupon: (id: string) => void;
  deleteCoupon: (id: string) => void;
  addCrossSellRule: (rule: Omit<CrossSellRule, 'id'>) => void;
  toggleCrossSellRule: (id: string) => void;
  deleteCrossSellRule: (id: string) => void;
  sendCartReminder: (cartId: string) => void;

  // 7.1. E-Posta Pazarlama & Kampanyalar
  campaigns: MarketingCampaign[];
  automatedTriggers: AutomatedEmailTrigger[];
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => MarketingCampaign;
  updateCampaign: (id: string, campaign: Partial<MarketingCampaign>) => void;
  deleteCampaign: (id: string) => void;
  toggleAutomatedTrigger: (id: string) => void;
  sendCampaignEmail: (campaignId: string, testEmail?: string) => Promise<{ success: boolean; simulated: boolean; message: string }>;

  // 8. Sistem Ayarları & CMS
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  cmsPages: Record<string, CmsPageData>;
  updateCmsPage: (slug: string, data: Partial<CmsPageData>) => void;

  // 9. Konsept Tasarımları & Vitrin Bannerları
  conceptBanners: ConceptBannersMap;
  updateConceptBanner: (slotKey: ConceptSlotKey, data: Partial<ConceptBannerItem>) => void;
  resetConceptBanners: () => void;
  saveConceptBannersToCloud: (customBanners?: ConceptBannersMap) => Promise<{ success: boolean; message?: string; error?: string }>;

  // Demo verileri sıfırlama
  purgeAllDemoData: () => void;

  // Toast bildirimleri
  toastMessage: string | null;
  showToast: (message: string) => void;
}

function createUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function getFormattedDateTime(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

function getFormattedDate(): string {
  return new Date().toISOString().split('T')[0];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // State tanımları (LocalStorage fallback ile)
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_raw_materials');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialRawMaterials;
  });

  const [categories, setCategories] = useState<AdminCategory[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_admin_categories');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialCategories;
  });

  const [products, setProducts] = useState<AdminProduct[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_admin_products');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialProducts;
  });

  const finishedProducts: FinishedProductStock[] = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    stockQuantity: p.stockQuantity,
    minThreshold: p.minThreshold,
    price: p.discountPrice || p.price,
    imageUrl: p.images[0] || '',
  }));

  const [stockLogs, setStockLogs] = useState<InventoryStockLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_stock_logs');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialStockLogs;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_accounts');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialAccounts;
  });

  const [accountMovements, setAccountMovements] = useState<AccountMovement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_account_movements');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialAccountMovements;
  });

  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_finance_txs');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialFinanceTransactions;
  });

  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_orders');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialOrders;
  });

  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_kanban_columns');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialKanbanColumns;
  });

  const [quoteRequests, setQuoteRequests] = useState<CustomQuoteRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_quote_requests');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialQuoteRequests;
  });

  const [invoices, setInvoices] = useState<AdminInvoice[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_invoices');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialInvoices;
  });

  const [coupons, setCoupons] = useState<MarketingCoupon[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_coupons');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialCoupons;
  });

  const [crossSellRules, setCrossSellRules] = useState<CrossSellRule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_cross_sell');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialCrossSellRules;
  });

  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_abandoned_carts');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialAbandonedCarts;
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_admin_campaigns');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialCampaigns;
  });

  const [automatedTriggers, setAutomatedTriggers] = useState<AutomatedEmailTrigger[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_admin_email_triggers');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialAutomatedTriggers;
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_settings');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialSettings;
  });

  const [cmsPages, setCmsPages] = useState<Record<string, CmsPageData>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_cms_pages');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialCmsPages;
  });

  const [conceptBanners, setConceptBanners] = useState<ConceptBannersMap>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_concept_banners');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...initialConceptBanners, ...parsed };
        } catch {}
      }
    }
    return initialConceptBanners;
  });


  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // Eski demo verilerin tarayıcı önbelleğinden temizlenmesi (v2)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCleaned = localStorage.getItem('safirya_demo_cleaned_v2');
      if (!isCleaned) {
        localStorage.removeItem('safirya_orders');
        localStorage.removeItem('safirya_quote_requests');
        localStorage.removeItem('safirya_invoices');
        localStorage.removeItem('safirya_accounts');
        localStorage.removeItem('safirya_account_movements');
        localStorage.removeItem('safirya_finance_txs');
        localStorage.removeItem('safirya_stock_logs');
        localStorage.removeItem('safirya_raw_materials');
        localStorage.removeItem('safirya_abandoned_carts');
        localStorage.removeItem('safirya_admin_campaigns');
        localStorage.setItem('safirya_demo_cleaned_v2', 'true');

        setOrders([]);
        setQuoteRequests([]);
        setInvoices([]);
        setAccounts([]);
        setAccountMovements([]);
        setFinanceTransactions([]);
        setStockLogs([]);
        setRawMaterials([]);
        setAbandonedCarts([]);
        setCampaigns([]);
      }
    }
  }, []);

  // Buluttaki (Supabase Storage) Konsept Bannerlarını Çek ve İki Yönlü Eşitle
  useEffect(() => {
    let isMounted = true;

    async function syncCloudBanners() {
      try {
        const res = await fetch('/api/banners');
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.banners && Object.keys(data.banners).length > 0) {
          if (isMounted) {
            setConceptBanners((prev) => {
              const merged = { ...prev, ...data.banners };
              if (typeof window !== 'undefined') {
                localStorage.setItem('safirya_concept_banners', JSON.stringify(merged));
              }
              return merged;
            });
          }
        } else if (data.source === 'empty' && typeof window !== 'undefined') {
          // Bulutta henüz banner yoksa, bu tarayıcıda önceden eklenmiş görseller varsa buluta otomatik yedekle
          const localSaved = localStorage.getItem('safirya_concept_banners');
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              const hasImages = Object.values(parsed).some((b: any) => Boolean(b?.imageUrl));
              if (hasImages) {
                await fetch('/api/banners', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ banners: parsed }),
                });
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Bulut banner senkronizasyon uyarısı:', err);
      }
    }

    syncCloudBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const purgeAllDemoData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safirya_orders');
      localStorage.removeItem('safirya_quote_requests');
      localStorage.removeItem('safirya_invoices');
      localStorage.removeItem('safirya_accounts');
      localStorage.removeItem('safirya_account_movements');
      localStorage.removeItem('safirya_finance_txs');
      localStorage.removeItem('safirya_stock_logs');
      localStorage.removeItem('safirya_raw_materials');
      localStorage.removeItem('safirya_abandoned_carts');
      localStorage.removeItem('safirya_admin_campaigns');
      localStorage.setItem('safirya_demo_cleaned_v2', 'true');

      setOrders([]);
      setQuoteRequests([]);
      setInvoices([]);
      setAccounts([]);
      setAccountMovements([]);
      setFinanceTransactions([]);
      setStockLogs([]);
      setRawMaterials([]);
      setAbandonedCarts([]);
      setCampaigns([]);
      showToast('Tüm demo test verileri sıfırlandı ve temizlendi.');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 3500);
  };

  // LocalStorage Senkronizasyonları
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_raw_materials', JSON.stringify(rawMaterials));
    }
  }, [rawMaterials]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_stock_logs', JSON.stringify(stockLogs));
    }
  }, [stockLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_accounts', JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_finance_txs', JSON.stringify(financeTransactions));
    }
  }, [financeTransactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_kanban_columns', JSON.stringify(kanbanColumns));
    }
  }, [kanbanColumns]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_quote_requests', JSON.stringify(quoteRequests));
    }
  }, [quoteRequests]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_coupons', JSON.stringify(coupons));
    }
  }, [coupons]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_cms_pages', JSON.stringify(cmsPages));
    }
  }, [cmsPages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_admin_categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_admin_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_admin_campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_admin_email_triggers', JSON.stringify(automatedTriggers));
    }
  }, [automatedTriggers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_concept_banners', JSON.stringify(conceptBanners));
    }
  }, [conceptBanners]);


  // Kritik Stok Sayacı
  const criticalStockCount = rawMaterials.filter(
    (m) => m.currentStock <= m.minThreshold
  ).length;

  // 0. Katalog & Kategori Yönetimi
  const addCategory = (catData: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `cat-${Date.now()}`;
    const today = getFormattedDate();
    const newCat: AdminCategory = {
      ...catData,
      id: newId,
      createdAt: today,
      updatedAt: today,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`"${newCat.name}" kataloğu başarıyla eklendi.`);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<AdminCategory>) => {
    const today = getFormattedDate();
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: today } : c))
    );
    showToast('Katalog / Kategori bilgileri güncellendi.');
  };

  const deleteCategory = (id: string) => {
    const found = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast(`"${found?.name || 'Katalog'}" silindi.`);
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive, updatedAt: getFormattedDate() } : c))
    );
    showToast('Katalog yayın durumu güncellendi.');
  };

  // 0. Ürün Kataloğu İşlemleri
  const addProduct = (productData: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = createUniqueId('prod');
    const today = getFormattedDate();
    const discountPrice =
      productData.discountRate > 0
        ? Math.round(productData.price * (1 - productData.discountRate / 100))
        : productData.price;

    const newProd: AdminProduct = {
      ...productData,
      id: newId,
      discountPrice,
      createdAt: today,
      updatedAt: today,
    };

    setProducts((prev) => [newProd, ...prev]);
    showToast(`"${newProd.name}" başarıyla ürün kataloğuna eklendi.`);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<AdminProduct>) => {
    const today = getFormattedDate();
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const price = updates.price !== undefined ? updates.price : p.price;
        const discountRate = updates.discountRate !== undefined ? updates.discountRate : p.discountRate;
        const discountPrice =
          discountRate > 0 ? Math.round(price * (1 - discountRate / 100)) : price;
        return {
          ...p,
          ...updates,
          discountPrice,
          updatedAt: today,
        };
      })
    );
    showToast('Ürün bilgileri güncellendi.');
  };

  const deleteProduct = (id: string) => {
    const found = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`"${found?.name || 'Ürün'}" katalogdan kaldırıldı.`);
  };

  const toggleProductStatus = (
    id: string,
    field: 'isActive' | 'isFeatured' | 'isBestSeller' | 'inStock'
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: !p[field], updatedAt: getFormattedDate() } : p))
    );
    showToast('Ürün durumu güncellendi.');
  };

  // 1. Hammadde İşlemleri
  const addRawMaterial = (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => {
    const newId = createUniqueId('raw');
    const today = getFormattedDate();
    const newMat: RawMaterial = {
      ...material,
      id: newId,
      updatedAt: today,
    };
    setRawMaterials((prev) => [newMat, ...prev]);
    showToast(`"${newMat.name}" hammadde envanterine eklendi.`);
  };

  const updateRawMaterialStock = (
    id: string,
    delta: number,
    logType: StockLogType,
    reason?: string,
    unitPrice?: number
  ) => {
    const mat = rawMaterials.find((m) => m.id === id);
    if (!mat) return;

    const newStock = Math.max(0, Number((mat.currentStock + delta).toFixed(2)));
    const today = getFormattedDateTime();

    setRawMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, currentStock: newStock, updatedAt: today } : m))
    );

    const newLog: InventoryStockLog = {
      id: createUniqueId('log'),
      rawMaterialId: id,
      materialName: mat.name,
      type: logType,
      quantityDelta: delta,
      unit: mat.unit,
      unitPrice: unitPrice || mat.unitCost,
      date: today,
      reason: reason || 'Hızlı stok güncellemesi',
    };

    setStockLogs((prev) => [newLog, ...prev]);

    if (logType === 'GIRIS_SATIN_ALMA' && delta > 0) {
      const cost = delta * (unitPrice || mat.unitCost);
      addFinanceTransaction({
        type: 'GIDER',
        category: 'HAMMADDE_ALIMI',
        amount: cost,
        paymentMethod: 'HAVALE_EFT',
        description: `${mat.name} (${delta} ${mat.unit}) Satın Alma Girişi`,
        accountId: mat.supplierId,
        accountName: mat.supplierName,
      });
    }

    showToast(`${mat.name} stoğu güncellendi. Yeni miktar: ${newStock} ${mat.unit}`);
  };

  // 2. Cari Hesap İşlemleri
  const addAccount = (account: Omit<Account, 'id' | 'createdAt'>) => {
    const newId = createUniqueId('acc');
    const today = getFormattedDate();
    const newAcc: Account = {
      ...account,
      id: newId,
      createdAt: today,
    };
    setAccounts((prev) => [newAcc, ...prev]);
    showToast(`"${newAcc.name}" cari kartı oluşturuldu.`);
  };

  const updateAccount = (id: string, data: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...data } : acc))
    );
    showToast('Cari hesap bilgileri güncellendi.');
  };

  const addAccountMovement = (
    accountId: string,
    type: 'BORC' | 'ALACAK',
    amount: number,
    description: string,
    referenceNo?: string
  ) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;

    const today = getFormattedDate();
    const newMov: AccountMovement = {
      id: createUniqueId('mov'),
      accountId,
      date: today,
      type,
      amount,
      description,
      referenceNo,
    };

    setAccountMovements((prev) => [newMov, ...prev]);

    const delta = type === 'ALACAK' ? amount : -amount;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId ? { ...a, balance: a.balance + delta } : a
      )
    );

    showToast(`Cari hareket işlendi: ₺${amount.toLocaleString('tr-TR')}`);
  };

  // 3. Finans İşlemleri
  const addFinanceTransaction = (
    tx: Omit<FinanceTransaction, 'id' | 'date'>
  ) => {
    const today = getFormattedDateTime();
    const newTx: FinanceTransaction = {
      ...tx,
      id: createUniqueId('tx'),
      date: today,
    };
    setFinanceTransactions((prev) => [newTx, ...prev]);
    showToast(
      `₺${tx.amount.toLocaleString('tr-TR')} tutarında ${
        tx.type === 'GELIR' ? 'gelir tahsilatı' : 'gider harcaması'
      } kaydedildi.`
    );
  };

  // 4. Sipariş & E-Fatura İşlemleri
  const addManualOrder = (
    orderData: Omit<AdminOrder, 'id' | 'orderNumber' | 'createdAt'>
  ): AdminOrder => {
    const count = orders.length + 1045;
    const orderNumber = `SFR-2026-${count}`;
    const today = getFormattedDateTime();

    const newOrder: AdminOrder = {
      ...orderData,
      id: createUniqueId('ord'),
      orderNumber,
      kanbanColumnId: orderData.kanbanColumnId || 'col-prep',
      sortOrder: orderData.sortOrder || 1,
      createdAt: today,
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (newOrder.paymentStatus === 'ODENDI') {
      addFinanceTransaction({
        type: 'GELIR',
        category: 'SIPARIS_SATIS',
        amount: newOrder.totalAmount,
        paymentMethod:
          newOrder.paymentMethod === 'HAVALE_EFT'
            ? 'HAVALE_EFT'
            : newOrder.paymentMethod === 'NAKIT'
            ? 'NAKIT'
            : 'KREDI_KARTI',
        description: `Manuel Sipariş: ${orderNumber} (${newOrder.customerName} - ${newOrder.channel})`,
        orderNumber,
      });
    }

    showToast(`Yeni sipariş oluşturuldu: ${orderNumber}`);
    return newOrder;
  };

  const updateOrderStage = (id: string, stage: OrderStage) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, stage } : o))
    );
    showToast(`Sipariş aşaması güncellendi.`);
  };

  const generateInvoice = (orderId: string): AdminInvoice => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Sipariş bulunamadı.');

    const invoiceCount = invoices.length + 45;
    const invoiceNo = `SFR2026${String(invoiceCount).padStart(8, '0')}`;
    const today = getFormattedDateTime();

    const totalAmount = order.totalAmount;
    const subtotal = Number((totalAmount / 1.2).toFixed(2));
    const taxAmount = Number((totalAmount - subtotal).toFixed(2));

    const invoiceItems = order.items.map((i) => ({
      name: i.productName + (i.variantTitle ? ` (${i.variantTitle})` : ''),
      quantity: i.quantity,
      unitPrice: Number((i.unitPrice / 1.2).toFixed(2)),
      totalAmount: Number((i.totalAmount / 1.2).toFixed(2)),
    }));

    if (order.isGiftWrapped && order.giftWrapFee > 0) {
      invoiceItems.push({
        name: 'Özel Atölye Hediye Paketi & Notu',
        quantity: 1,
        unitPrice: Number((order.giftWrapFee / 1.2).toFixed(2)),
        totalAmount: Number((order.giftWrapFee / 1.2).toFixed(2)),
      });
    }

    const newInvoice: AdminInvoice = {
      id: createUniqueId('inv'),
      invoiceNo,
      orderId: order.id,
      orderNumber: order.orderNumber,
      type: 'SATIS',
      customerName: order.customerName,
      customerAddress: `${order.shippingAddress.address} ${order.shippingAddress.district} / ${order.shippingAddress.city}`,
      issueDate: today,
      subtotal,
      taxRate: 20,
      taxAmount,
      totalAmount,
      status: 'OLUSTURULDU',
      items: invoiceItems,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, invoiceStatus: 'OLUSTURULDU', invoiceNo }
          : o
      )
    );

    showToast(`E-Fatura oluşturuldu: ${invoiceNo}`);
    return newInvoice;
  };

  const cancelInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'IPTAL' } : inv
      )
    );
    showToast('Fatura iptal edildi.');
  };

  // 5. Atölye Üretim Bandı (Dinamik Kanban & Sıralama)
  const addKanbanColumn = (title: string, color: string) => {
    const newCol: KanbanColumn = {
      id: createUniqueId('col'),
      title,
      color,
      sortOrder: kanbanColumns.length + 1,
    };
    setKanbanColumns((prev) => [...prev, newCol]);
    showToast(`Yeni üretim aşaması "${title}" sütunu eklendi.`);
  };

  const updateKanbanColumn = (id: string, title: string, color: string) => {
    setKanbanColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title, color } : col))
    );
    showToast('Aşama sütunu güncellendi.');
  };

  const deleteKanbanColumn = (id: string) => {
    if (kanbanColumns.length <= 1) {
      showToast('En az bir üretim sütunu bulunmalıdır.');
      return;
    }
    setKanbanColumns((prev) => prev.filter((col) => col.id !== id));
    showToast('Aşama sütunu kaldırıldı.');
  };

  const moveKanbanColumn = (id: string, direction: 'left' | 'right') => {
    const idx = kanbanColumns.findIndex((c) => c.id === id);
    if (idx === -1) return;
    if (direction === 'left' && idx === 0) return;
    if (direction === 'right' && idx === kanbanColumns.length - 1) return;

    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    const newCols = [...kanbanColumns];
    const temp = newCols[idx];
    newCols[idx] = newCols[targetIdx];
    newCols[targetIdx] = temp;

    // sortOrder numaralarını güncelle
    newCols.forEach((col, i) => {
      col.sortOrder = i + 1;
    });

    setKanbanColumns(newCols);
  };

  const moveOrderToColumn = (
    orderId: string,
    targetColumnId: string,
    newSortOrder?: number
  ) => {
    setOrders((prev) => {
      const targetOrders = prev.filter(
        (o) => o.id !== orderId && o.kanbanColumnId === targetColumnId
      );
      const nextSortOrder =
        newSortOrder !== undefined ? newSortOrder : targetOrders.length + 1;

      // Sütuna göre sipariş aşamasını da senkronize et
      let stageMapping: OrderStage = 'ATOLYEDE_URETIMDE';
      if (targetColumnId === 'col-prep') stageMapping = 'SIPARIS_ALINDI';
      else if (targetColumnId === 'col-qc') stageMapping = 'KALITE_KONTROL_PAKETLEME';

      return prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              kanbanColumnId: targetColumnId,
              sortOrder: nextSortOrder,
              stage: stageMapping,
            }
          : o
      );
    });
  };

  const updateOrderSortOrder = (orderId: string, newSortOrder: number) => {
    setOrders((prev) => {
      const orderToMove = prev.find((o) => o.id === orderId);
      if (!orderToMove) return prev;

      const columnId = orderToMove.kanbanColumnId || 'col-prep';
      // Aynı sütundaki siparişleri al
      const columnOrders = prev
        .filter((o) => (o.kanbanColumnId || 'col-prep') === columnId)
        .sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));

      // Hedef sıraya yerleştir
      const remaining = columnOrders.filter((o) => o.id !== orderId);
      const insertIndex = Math.max(0, Math.min(newSortOrder - 1, remaining.length));
      remaining.splice(insertIndex, 0, orderToMove);

      // Yeni sıraları dağıt
      const rankMap = new Map<string, number>();
      remaining.forEach((o, idx) => {
        rankMap.set(o.id, idx + 1);
      });

      return prev.map((o) => {
        if (rankMap.has(o.id)) {
          return { ...o, sortOrder: rankMap.get(o.id) };
        }
        return o;
      });
    });

    showToast(`Sipariş sırası #${newSortOrder} olarak güncellendi.`);
  };

  const addStagePhotoToOrder = async (
    orderId: string,
    photoUrl: string,
    caption: string,
    stageName: string,
    notifyCustomer: boolean
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const today = getFormattedDateTime();
    const newPhoto: OrderStagePhoto = {
      id: createUniqueId('photo'),
      stageKey: order.stage,
      stageName,
      photoUrl,
      caption,
      takenAt: today,
    };

    const updatedStagePhotos = [...(order.stagePhotos || []), newPhoto];

    // Siparişi güncelle
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              stagePhotos: updatedStagePhotos,
            }
          : o
      )
    );

    showToast(`Aşama fotoğrafı yüklendi: "${stageName}"`);

    // Müşteriye bildirim gönder (E-posta + WhatsApp)
    if (notifyCustomer) {
      showToast(`Müşteriye aşama bildirimi gönderiliyor...`);
      try {
        const result = await dispatchStageNotification({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          stageName,
          photoUrl,
          caption,
          settings,
        });

        if (result.email.success) {
          showToast(`✅ E-posta iletildi: ${result.email.message}`);
        }
      } catch (err: any) {
        console.error('Bildirim gönderim hatası:', err);
      }
    }
  };

  // 6. Özel Talepler & Teklifler
  const addQuoteRequest = (
    req: Omit<CustomQuoteRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const newQuote: CustomQuoteRequest = {
      ...req,
      id: createUniqueId('quote'),
      status: 'BEKLEMEDE',
      createdAt: getFormattedDateTime(),
    };
    setQuoteRequests((prev) => [newQuote, ...prev]);
    showToast('Yeni özel tasarım/toplu teklif talebi kaydedildi.');
  };

  const updateQuoteStatus = (
    id: string,
    status: QuoteStatus,
    quotedUnitPrice?: number,
    quotedTotalPrice?: number,
    adminNote?: string
  ) => {
    setQuoteRequests((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status,
              quotedUnitPrice:
                quotedUnitPrice !== undefined ? quotedUnitPrice : q.quotedUnitPrice,
              quotedTotalPrice:
                quotedTotalPrice !== undefined ? quotedTotalPrice : q.quotedTotalPrice,
              adminNote: adminNote !== undefined ? adminNote : q.adminNote,
            }
          : q
      )
    );
    showToast(`Teklif durumu "${status}" olarak güncellendi.`);
  };

  const convertQuoteToOrder = (
    quoteId: string,
    customUnitPrice: number,
    customTotalPrice: number
  ): AdminOrder => {
    const quote = quoteRequests.find((q) => q.id === quoteId);
    if (!quote) throw new Error('Talep bulunamadı.');

    const orderNumber = `SFR-2026-${orders.length + 1045}`;
    const today = getFormattedDateTime();

    const newOrder: AdminOrder = {
      id: createUniqueId('ord'),
      orderNumber,
      channel: 'ATOLYE',
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerPhone: quote.customerPhone,
      shippingAddress: {
        fullName: quote.customerName,
        phone: quote.customerPhone,
        city: 'İstanbul',
        district: 'Kadıköy',
        address: 'Atölye Özel Üretim & Teslimat',
      },
      subtotal: customTotalPrice,
      discountTotal: 0,
      shippingFee: 0,
      isGiftWrapped: false,
      giftWrapFee: 0,
      totalAmount: customTotalPrice,
      stage: 'SIPARIS_ALINDI',
      kanbanColumnId: 'col-prep',
      sortOrder: 1,
      dueDate: quote.eventDate || '2026-11-20',
      paymentStatus: 'BEKLIYOR',
      paymentMethod: 'HAVALE_EFT',
      invoiceStatus: 'BEKLIYOR',
      cargoCompany: 'Yurtiçi Kargo (Toplu Sevkiyat)',
      createdAt: today,
      items: [
        {
          productName: `${quote.productType} (${quote.requestedQuantity} Adet Baremi)`,
          variantTitle: `${quote.eventType} Özel Üretim`,
          unitPrice: customUnitPrice,
          quantity: quote.requestedQuantity,
          totalAmount: customTotalPrice,
          customization: {
            customText: quote.customText,
            selectedScent: quote.selectedScent,
            extraNote: quote.customDetails,
          },
        },
      ],
    };

    // Siparişi ekle
    setOrders((prev) => [newOrder, ...prev]);

    // Talebi onaylandı olarak işaretle
    setQuoteRequests((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status: 'ONAYLANDI',
              quotedUnitPrice: customUnitPrice,
              quotedTotalPrice: customTotalPrice,
              convertedOrderId: newOrder.orderNumber,
            }
          : q
      )
    );

    showToast(`Teklif onaylandı ve üretim sırasına alındı: ${newOrder.orderNumber}`);
    return newOrder;
  };

  // 7. Pazarlama & Çapraz Satış
  const addCoupon = (coupon: Omit<MarketingCoupon, 'id' | 'usageCount'>) => {
    const newCoupon: MarketingCoupon = {
      ...coupon,
      id: createUniqueId('cp'),
      code: coupon.code.trim().toUpperCase(),
      usageCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`"${newCoupon.code}" kuponu başarıyla tanımlandı.`);
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Kupon silindi.');
  };

  const addCrossSellRule = (rule: Omit<CrossSellRule, 'id'>) => {
    const newRule: CrossSellRule = {
      ...rule,
      id: createUniqueId('cs'),
    };
    setCrossSellRules((prev) => [newRule, ...prev]);
    showToast('Yeni çapraz satış eşleştirmesi eklendi.');
  };

  const toggleCrossSellRule = (id: string) => {
    setCrossSellRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const deleteCrossSellRule = (id: string) => {
    setCrossSellRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Çapraz satış kuralı silindi.');
  };

  const sendCartReminder = (cartId: string) => {
    const cart = abandonedCarts.find((c) => c.id === cartId);
    if (!cart) return;

    const today = getFormattedDateTime();
    setAbandonedCarts((prev) =>
      prev.map((c) =>
        c.id === cartId
          ? { ...c, reminderSent: true, reminderSentAt: today }
          : c
      )
    );

    showToast(
      `${cart.customerEmail} adresine %10 indirimli hatırlatma e-postası başarıyla gönderildi!`
    );
  };

  // 7.1. E-Posta Pazarlama & Kampanya Yönetimi
  const addCampaign = (campaignData: Omit<MarketingCampaign, 'id'>) => {
    const newId = `cmp-${Date.now()}`;
    const newCampaign: MarketingCampaign = {
      ...campaignData,
      id: newId,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    showToast(`"${newCampaign.name}" kampanyası başarıyla oluşturuldu.`);
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<MarketingCampaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Kampanya güncellendi.');
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('Kampanya silindi.');
  };

  const toggleAutomatedTrigger = (id: string) => {
    setAutomatedTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isEnabled: !t.isEnabled } : t))
    );
    showToast('Otomatik e-posta kuralı güncellendi.');
  };

  const sendCampaignEmail = async (campaignId: string, testEmail?: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      showToast('Kampanya bulunamadı.');
      return { success: false, simulated: true, message: 'Kampanya bulunamadı.' };
    }

    try {
      const isTest = Boolean(testEmail);
      const res = await fetch('/api/marketing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTest,
          testEmail,
          recipients: isTest ? undefined : ['musteri@safirya.tr', 'vip@safirya.tr'],
          campaignProps: {
            campaignName: campaign.name,
            subject: campaign.subject,
            preheader: campaign.preheader,
            templateType: campaign.templateType,
            headline: campaign.headline,
            bodyText: campaign.bodyText,
            heroImageUrl: campaign.heroImageUrl,
            couponCode: campaign.couponCode,
            discountRate: campaign.discountRate,
            ctaLabel: campaign.ctaLabel,
            ctaUrl: campaign.ctaUrl,
            senderName: campaign.senderName || settings.storeName,
            logoUrl: settings.logoUrl,
            logoText: settings.logoText,
            brandTagline: settings.brandTagline,
            storeName: settings.storeName,
            contactEmail: settings.contactEmail,
            instagramHandle: settings.instagramHandle,
            address: settings.atelierAddress,
          },
          settings,
        }),
      });

      const data = await res.json();

      if (!isTest) {
        const today = getFormattedDateTime();
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  status: 'SENT',
                  sentAt: today,
                  openRate: c.openRate || 42.5,
                  clickRate: c.clickRate || 18.0,
                }
              : c
          )
        );
      }

      showToast(data.message || 'E-posta başarıyla iletildi.');
      return {
        success: data.success ?? true,
        simulated: data.simulated ?? false,
        message: data.message || 'E-posta başarıyla iletildi.',
      };
    } catch (err: any) {
      console.warn('E-posta gönderiminde simülasyona dönüldü:', err);
      showToast('E-posta simülasyon modunda iletildi.');
      return {
        success: true,
        simulated: true,
        message: 'E-posta simülasyon modunda iletildi.',
      };
    }
  };

  // 8. Ayarlar & CMS
  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        if (updated.logoUrl !== undefined) {
          localStorage.setItem('safirya_brand_logo', updated.logoUrl || '');
        }
        if (updated.logoText !== undefined) {
          localStorage.setItem('safirya_brand_logo_text', updated.logoText || 'SAFİRYA');
        }
        if (updated.brandTagline !== undefined) {
          localStorage.setItem('safirya_brand_tagline', updated.brandTagline || 'El Yapımı Tasarım Atölyesi');
        }
      }
      return updated;
    });
    showToast('Sistem ve vitrin ayarları güncellendi.');
  };

  const updateCmsPage = (slug: string, data: Partial<CmsPageData>) => {
    const today = getFormattedDate();
    setCmsPages((prev) => {
      const existing = prev[slug];
      if (!existing) return prev;
      return {
        ...prev,
        [slug]: {
          ...existing,
          ...data,
          updatedAt: today,
        },
      };
    });
    showToast(`"${slug}" kurumsal sayfası güncellendi ve vitrinde yayına alındı.`);
  };

  // 9. Konsept Tasarımları & Vitrin Bannerları (Bulut ve Yerel Eşitlemeli)
  const saveConceptBannersToCloud = async (customBanners?: ConceptBannersMap) => {
    try {
      const payload = customBanners || conceptBanners;
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: 'Vitrin afişleri buluta kaydedildi (Masaüstü ve Mobil anında aktif).' };
      }
      return { success: false, error: data.error || 'Bulut kaydı başarısız.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Bağlantı hatası.' };
    }
  };

  const updateConceptBanner = (slotKey: ConceptSlotKey, data: Partial<ConceptBannerItem>) => {
    setConceptBanners((prev) => {
      const existing = prev[slotKey] || initialConceptBanners[slotKey];
      const updated: ConceptBannersMap = {
        ...prev,
        [slotKey]: {
          ...existing,
          ...data,
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('safirya_concept_banners', JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent('safirya_concept_banners_updated', { detail: updated })
        );
      }
      // Buluta anında asenkron kaydet
      saveConceptBannersToCloud(updated).catch(() => {});
      return updated;
    });
    showToast(`"${data.title || slotKey}" konsept tasarımı güncellendi.`);
  };

  const resetConceptBanners = () => {
    setConceptBanners(initialConceptBanners);
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_concept_banners', JSON.stringify(initialConceptBanners));
      window.dispatchEvent(
        new CustomEvent('safirya_concept_banners_updated', { detail: initialConceptBanners })
      );
    }
    saveConceptBannersToCloud(initialConceptBanners).catch(() => {});
    showToast('Konsept tasarımları boş şablon durumuna sıfırlandı.');
  };

  return (

    <AdminContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        rawMaterials,
        finishedProducts,
        stockLogs,
        criticalStockCount,
        addRawMaterial,
        updateRawMaterialStock,
        accounts,
        accountMovements,
        addAccount,
        updateAccount,
        addAccountMovement,
        financeTransactions,
        addFinanceTransaction,
        orders,
        invoices,
        addManualOrder,
        updateOrderStage,
        generateInvoice,
        cancelInvoice,
        kanbanColumns,
        addKanbanColumn,
        updateKanbanColumn,
        deleteKanbanColumn,
        moveKanbanColumn,
        moveOrderToColumn,
        updateOrderSortOrder,
        addStagePhotoToOrder,
        quoteRequests,
        addQuoteRequest,
        updateQuoteStatus,
        convertQuoteToOrder,
        coupons,
        crossSellRules,
        abandonedCarts,
        addCoupon,
        toggleCoupon,
        deleteCoupon,
        addCrossSellRule,
        toggleCrossSellRule,
        deleteCrossSellRule,
        sendCartReminder,
        campaigns,
        automatedTriggers,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        toggleAutomatedTrigger,
        sendCampaignEmail,
        settings,
        updateSettings,
        cmsPages,
        updateCmsPage,
        conceptBanners,
        updateConceptBanner,
        resetConceptBanners,
        saveConceptBannersToCloud,
        toastMessage,
        purgeAllDemoData,
        showToast,
      }}
    >
      {children}

      {/* Global Admin Toast Bildirimi */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className="bg-[#1B2A4A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin, AdminProvider içinde kullanılmalıdır.');
  }
  return context;
}
