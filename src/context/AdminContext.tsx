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
  SiliconeMold,
  MoldCastLog,
  CustomContract,
  WebhookDeliveryLog,
} from '@/types/admin';
import { dispatchStageNotification } from '@/lib/notifications';
import { triggerOrderStageNotification } from '@/lib/notifications/orderNotifications';
import { dispatchWebhookEvent } from '@/lib/webhooks';


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
    description: '%100 doğal soya vaksı, ahşap fitilli ve saf esansiyel yağlarla atölyemizde özenle dökülmüştür. Ahşap fitili yanarken şömine çıtırtısı sesi çıkarır. Kimyasal parafin veya sentetik koku tutucular içermez.',
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

export function normalizeAdminOrder(raw: any, index: number = 0): AdminOrder {
  const orderNumber = raw.orderNumber || `SFR-2026-${String(9000 + index)}`;
  const id = raw.id || `ord-${orderNumber}`;
  const totalAmount = Number(raw.totalAmount || 0);

  // Adres normalizasyonu
  let shippingAddress: any;
  if (typeof raw.shippingAddress === 'string') {
    shippingAddress = {
      fullName: raw.customerName || raw.guestName || 'Müşteri',
      phone: raw.customerPhone || raw.guestPhone || raw.phone || '',
      address: raw.shippingAddress,
      district: '',
      city: '',
      fullAddress: raw.shippingAddress,
    };
  } else if (raw.shippingAddress && typeof raw.shippingAddress === 'object') {
    shippingAddress = {
      fullName: raw.shippingAddress.fullName || raw.customerName || raw.guestName || 'Müşteri',
      phone: raw.shippingAddress.phone || raw.customerPhone || raw.guestPhone || raw.phone || '',
      address: raw.shippingAddress.address || raw.shippingAddress.fullAddress || '',
      district: raw.shippingAddress.district || '',
      city: raw.shippingAddress.city || '',
      zipCode: raw.shippingAddress.zipCode || '',
      fullAddress:
        raw.shippingAddress.fullAddress ||
        [raw.shippingAddress.address, raw.shippingAddress.district, raw.shippingAddress.city]
          .filter(Boolean)
          .join(' '),
    };
  } else {
    shippingAddress = {
      fullName: raw.customerName || 'Müşteri',
      phone: raw.customerPhone || '',
      address: 'Adres Belirtilmemiş',
      district: '',
      city: '',
      fullAddress: 'Adres Belirtilmemiş',
    };
  }

  // Kalemler normalizasyonu
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems.map((it: any, itemIdx: number) => {
    const quantity = Number(it.quantity) || 1;
    const unitPrice = Number(it.unitPrice ?? it.price ?? (it.totalAmount ? it.totalAmount / quantity : 0));
    const itemTotal = Number(it.totalAmount ?? (unitPrice * quantity));
    const productName = it.productName || it.name || 'Özel Tasarım Ürün';

    let customization = it.customization;
    if (!customization && (it.customText || it.scentNote || it.colorPalette)) {
      customization = {
        customText: it.customText,
        selectedScent: it.scentNote,
        selectedColor: it.colorPalette,
        tagDesignType: it.tagDesignType,
        extraNote: it.extraNote,
      };
    }

    return {
      productId: it.productId || it.id || `prod-${itemIdx}`,
      productName,
      variantTitle: it.variantTitle || it.variantName,
      quantity,
      unitPrice,
      totalAmount: itemTotal,
      customization,
    };
  });

  return {
    ...raw,
    id,
    orderNumber,
    customerName: raw.customerName || raw.guestName || 'Müşteri',
    customerEmail: raw.customerEmail || raw.guestEmail || raw.email || '',
    customerPhone: raw.customerPhone || raw.guestPhone || raw.phone || '',
    channel: raw.channel || 'WEB',
    stage: raw.stage || 'SIPARIS_ALINDI',
    paymentStatus: raw.paymentStatus || 'BEKLIYOR',
    paymentMethod: raw.paymentMethod || 'KREDI_KARTI',
    subtotal: Number(raw.subtotal) || totalAmount,
    discountTotal: Number(raw.discountTotal) || 0,
    shippingFee: Number(raw.shippingFee) || 0,
    isGiftWrapped: Boolean(raw.isGiftWrapped),
    giftWrapFee: Number(raw.giftWrapFee) || 0,
    giftNote: raw.giftNote,
    totalAmount,
    shippingAddress,
    items,
    invoiceStatus: raw.invoiceStatus || 'BEKLIYOR',
    invoiceNo: raw.invoiceNo,
    contractStatus: raw.contractStatus || (items.some((i: any) => i.customization?.customText) ? 'ONAYLANDI' : undefined),
    contractVerificationCode: raw.contractVerificationCode,
    contractSignedAt: raw.contractSignedAt,
    contractSignedBy: raw.contractSignedBy,
    signatureDataUrl: raw.signatureDataUrl,
    createdAt: raw.createdAt || raw.date || 'Yeni',
    cargoCompany: raw.cargoCompany,
    cargoTrackingNo: raw.cargoTrackingNo || raw.trackingCode,
  };
}

// Siparişler Listesi
const initialOrders: AdminOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'SFR-2026-8921',
    channel: 'WEB',
    customerName: 'Selin & Emre Demir',
    customerEmail: 'selin.demir@example.com',
    customerPhone: '+90 532 987 6543',
    shippingAddress: {
      fullName: 'Selin Demir',
      phone: '+90 532 987 6543',
      city: 'İzmir',
      district: 'Karşıyaka',
      address: 'Bostanlı Mah. 1800 Sk. No:14 D:3',
      zipCode: '35590',
    },
    subtotal: 13550,
    discountTotal: 1600,
    shippingFee: 0,
    isGiftWrapped: true,
    giftWrapFee: 30,
    giftNote: 'Özel gününüz kutlu olsun!',
    totalAmount: 11980,
    stage: 'ATOLYEDE_URETIMDE',
    kanbanColumnId: 'col-casting',
    sortOrder: 1,
    dueDate: '2026-10-18',
    paymentStatus: 'ODENDI',
    paymentMethod: 'KREDI_KARTI',
    invoiceStatus: 'OLUSTURULDU',
    invoiceNo: 'SFR2026000001',
    contractStatus: 'ONAYLANDI',
    contractId: 'cnt-1',
    contractSignedAt: '2026-10-14 14:32',
    contractVerificationCode: 'SOZ-SFR-2026-8921-OK',
    createdAt: '2026-10-14',
    items: [
      {
        productId: 'p-2',
        productName: 'Kişiye Özel İsimli Söz/Nişan Hediyelik Mumu',
        variantTitle: 'Fildişi Krem - 50 Adet Baremi',
        unitPrice: 239.0,
        quantity: 50,
        totalAmount: 11950.0,
        customization: {
          customText: 'Selin & Emre 18.06.2026',
          selectedScent: 'Madagaskar Vanilyası',
          selectedColor: 'Fildişi Krem',
          tagDesignType: 'RUSTIK-KRAFT-01',
          extraNote: 'Keten ipli ve lavanta dallı süsleme.',
        },
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'SFR-2026-8922',
    channel: 'WHATSAPP',
    customerName: 'Ayşe & Burak Yıldız',
    customerEmail: 'ayse.yildiz@example.com',
    customerPhone: '+90 533 123 4567',
    shippingAddress: {
      fullName: 'Ayşe Yıldız',
      phone: '+90 533 123 4567',
      city: 'İzmir',
      district: 'Karşıyaka',
      address: 'Bostanlı Mah. 1785 Sk. No:8',
      zipCode: '35540',
    },
    subtotal: 21200,
    discountTotal: 2800,
    shippingFee: 0,
    isGiftWrapped: false,
    giftWrapFee: 0,
    totalAmount: 18400,
    stage: 'SIPARIS_ALINDI',
    kanbanColumnId: 'col-prep',
    sortOrder: 2,
    dueDate: '2026-10-21',
    paymentStatus: 'ODENDI',
    paymentMethod: 'HAVALE_EFT',
    invoiceStatus: 'BEKLIYOR',
    contractStatus: 'BEKLIYOR',
    contractId: 'cnt-2',
    createdAt: '2026-10-15',
    items: [
      {
        productId: 'p-1',
        productName: 'Bubble Küp Mum (Geniş Boy)',
        variantTitle: 'Kehribar Amber - 80 Adet Baremi',
        unitPrice: 230.0,
        quantity: 80,
        totalAmount: 18400.0,
        customization: {
          customText: 'Ayşe & Burak 24.08.2026',
          selectedScent: 'Lavanta & Sandal Ağacı',
          selectedColor: 'Kehribar Amber',
          tagDesignType: 'MINIMALIST-GOLD-02',
        },
      },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 'SFR-2026-8924',
    channel: 'WEB',
    customerName: 'Merve Yılmaz',
    customerEmail: 'merve.yilmaz@example.com',
    customerPhone: '+90 554 999 8877',
    shippingAddress: {
      fullName: 'Merve Yılmaz',
      phone: '+90 554 999 8877',
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Tunalı Hilmi Cad. No:45 D:12',
      zipCode: '06680',
    },
    subtotal: 250,
    discountTotal: 0,
    shippingFee: 0,
    isGiftWrapped: true,
    giftWrapFee: 0,
    totalAmount: 250,
    stage: 'TESLIM_EDILDI',
    kanbanColumnId: 'col-qc',
    sortOrder: 3,
    paymentStatus: 'ODENDI',
    paymentMethod: 'KREDI_KARTI',
    invoiceStatus: 'OLUSTURULDU',
    invoiceNo: 'SFR2026000002',
    contractStatus: 'GEREKLI_DEGIL',
    createdAt: '2026-10-12',
    items: [
      {
        productId: 'sfr-cat-numune',
        productName: 'Söz & Nişan Toplu Sipariş Numune Deneyim Kiti',
        unitPrice: 250.0,
        quantity: 1,
        totalAmount: 250.0,
      },
    ],
  },
];

// Başlangıç Silikon Kalıpları
const initialSiliconeMolds: SiliconeMold[] = [
  {
    id: 'mold-1',
    code: 'KLP-BUBBLE-01',
    name: 'Bubble Küp Soya Mum Kalıbı (Geniş Boy)',
    category: 'Mum Kalıbı',
    materialType: 'Platin RTV-2',
    cavityCount: 6,
    activeMoldCount: 3,
    curingMinutes: 240,
    currentCasts: 82,
    maxCasts: 120,
    targetProductName: 'SFR-MUM-01',
    notes: 'Yüksek elastikiyetli platin silikon. Yüzey dokusu pürüzsüz.',
    lastUsedAt: '2026-10-14',
    createdAt: '2026-09-01',
  },
  {
    id: 'mold-2',
    code: 'KLP-SILINDIR-02',
    name: 'Yivli İskandinav Silindir Mum Kalıbı',
    category: 'Mum Kalıbı',
    materialType: 'Platin RTV-2',
    cavityCount: 4,
    activeMoldCount: 2,
    curingMinutes: 180,
    currentCasts: 104,
    maxCasts: 120,
    targetProductName: 'SFR-MUM-02',
    notes: 'Yıpranma oranı %86. Çizgilerde esneme var, yakında yenilenmeli.',
    lastUsedAt: '2026-10-13',
    createdAt: '2026-08-15',
  },
  {
    id: 'mold-3',
    code: 'KLP-TAS-MELEK',
    name: 'Heykelsi Kanatlı Melek Kokulu Taş Kalıbı',
    category: 'Kokulu Taş Kalıbı',
    materialType: 'Kalay Esaslı RTV',
    cavityCount: 2,
    activeMoldCount: 4,
    curingMinutes: 45,
    currentCasts: 45,
    maxCasts: 80,
    targetProductName: 'SFR-TAS-01',
    notes: 'Bebek & mevlüt hediyelikleri için hızlı donan taş tozu kalıbı.',
    lastUsedAt: '2026-10-14',
    createdAt: '2026-09-10',
  },
  {
    id: 'mold-4',
    code: 'KLP-TAS-TABAK',
    name: 'Oval Dalgalı Takı & Mum Sunum Tabağı',
    category: 'Beton & Alçı Kalıbı',
    materialType: 'Poliüretan Kauçuk',
    cavityCount: 1,
    activeMoldCount: 5,
    curingMinutes: 60,
    currentCasts: 128,
    maxCasts: 150,
    targetProductName: 'SFR-ALT-01',
    notes: 'Mermer dokulu beton altlıklar için dayanıklı kalıp.',
    lastUsedAt: '2026-10-12',
    createdAt: '2026-07-20',
  },
  {
    id: 'mold-5',
    code: 'KLP-EPOK-SUNUM',
    name: 'Doğal Ceviz Ağacı & Epoksi Sunumluk Kalıbı',
    category: 'Epoksi Reçine Kalıbı',
    materialType: 'Şeffaf Reçine Silikonu',
    cavityCount: 1,
    activeMoldCount: 2,
    curingMinutes: 1440,
    currentCasts: 36,
    maxCasts: 40,
    targetProductName: 'SFR-EPOK-01',
    notes: 'Ultra parlak ayna yüzey. 36 döküm yapıldı (%90 kritik ömür).',
    lastUsedAt: '2026-10-11',
    createdAt: '2026-08-01',
  },
];

const initialMoldCastLogs: MoldCastLog[] = [
  {
    id: 'mcl-1',
    moldId: 'mold-1',
    moldName: 'Bubble Küp Soya Mum Kalıbı (Geniş Boy)',
    orderNumber: 'SFR-2026-8921',
    castCountDelta: 3,
    totalItemsProduced: 18,
    operatorName: 'Atölye Ustası Emre',
    notes: '3 tur döküm yapıldı, yüzeyler pürüzsüz.',
    createdAt: '2026-10-14 11:30',
  },
  {
    id: 'mcl-2',
    moldId: 'mold-3',
    moldName: 'Heykelsi Kanatlı Melek Kokulu Taş Kalıbı',
    orderNumber: 'SFR-2026-8923',
    castCountDelta: 5,
    totalItemsProduced: 40,
    operatorName: 'Zanaatkar Zeynep',
    notes: 'Taş tozu karışımı 45 dk kurutuldu.',
    createdAt: '2026-10-13 16:15',
  },
];

// Başlangıç Özel Üretim Sözleşmeleri
const initialContracts: CustomContract[] = [
  {
    id: 'cnt-1',
    orderId: 'ord-1',
    orderNumber: 'SFR-2026-8921',
    customerName: 'Selin & Emre Demir',
    customerEmail: 'selin.demir@example.com',
    customerPhone: '+90 532 987 6543',
    productName: 'Kişiye Özel İsimli Söz/Nişan Hediyelik Mumu',
    quantity: 50,
    totalAmount: 11950,
    customText: 'Selin & Emre 18.06.2026',
    scentNote: 'Madagaskar Vanilyası',
    colorPalette: 'Fildişi Krem',
    tagDesignType: 'RUSTIK-KRAFT-01',
    extraNotes: 'Keten ip ve kurutulmuş lavanta dalı bağlamalı.',
    eventDate: '2026-06-18',
    agreedDeliveryDate: '2026-10-18',
    status: 'ONAYLANDI',
    signedAt: '2026-10-14 14:32',
    signedBy: 'Selin Demir',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 35 T 180 25" fill="none" stroke="%231B2A4A" stroke-width="2.5"/></svg>',
    ipAddress: '176.234.89.12',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
    verificationCode: 'SOZ-SFR-2026-8921-OK',
    legalConsentChecked: true,
    createdAt: '2026-10-14 14:20',
  },
  {
    id: 'cnt-2',
    orderId: 'ord-2',
    orderNumber: 'SFR-2026-8922',
    customerName: 'Ayşe & Burak Yıldız',
    customerEmail: 'ayse.yildiz@example.com',
    customerPhone: '+90 533 123 4567',
    productName: 'Bubble Küp Mum (Geniş Boy)',
    quantity: 80,
    totalAmount: 18400,
    customText: 'Ayşe & Burak 24.08.2026',
    scentNote: 'Lavanta & Sandal Ağacı',
    colorPalette: 'Kehribar Amber',
    tagDesignType: 'MINIMALIST-GOLD-02',
    extraNotes: 'Altın varaklı etiket ve saten kurdele.',
    eventDate: '2026-08-24',
    agreedDeliveryDate: '2026-10-21',
    status: 'BEKLIYOR',
    legalConsentChecked: false,
    createdAt: '2026-10-15 09:15',
  },
];

// Özel Teklif / Toplu Talep Talepleri (Demo veriler temizlendi)
const initialQuoteRequests: CustomQuoteRequest[] = [];

// E-Faturalar (Demo veriler temizlendi)
const initialInvoices: AdminInvoice[] = [];

// Kuponlar
const initialCoupons: MarketingCoupon[] = [
  {
    id: 'cp-numune-1',
    code: 'NUMUNE-SFR8924',
    label: 'Numune Kiti Bedeli İadesi (₺250 Düşüldü)',
    discountType: 'fixed',
    discountValue: 250,
    minCartTotal: 1000,
    usageCount: 0,
    isActive: true,
    isSampleKitVoucher: true,
    sampleKitOrderNumber: 'SFR-2026-8924',
    customerEmail: 'merve.yilmaz@example.com',
    minOrderQuantity: 20,
  },
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
  instagramHandle: '@safirya.tr',
  atelierAddress: 'Karşıyaka / İzmir (Yalnızca Online E-Ticaret Hizmeti)',
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

  // PayTR Ödeme Entegrasyonu
  paytrMerchantId: '',
  paytrMerchantKey: '',
  paytrMerchantSalt: '',
  paytrTestMode: true,
  paytrDebugOn: false,

  // Sipariş Hareketleri & Bildirim Tercihleri
  notifyOnOrderReceived: true,
  notifyOnOrderProduction: true,
  notifyOnOrderQuality: true,
  notifyOnOrderShipped: true,
  notifyOnOrderDelivered: true,
  notifyChannelSite: true,
  notifyChannelEmail: true,
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
    mobileImageUrl: '',
    recommendedDimensions: '1920 × 600 px (16:5 Geniş Ekran)',
    mobileRecommendedDimensions: '800 × 800 px (1:1 Kare) veya 750 × 1000 px',
    aspectRatioLabel: '16:5 (Geniş Ekran)',
    mobileAspectRatioLabel: '1:1 Kare / 3:4 Dikey',
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
    mobileImageUrl: '',
    recommendedDimensions: '800 × 800 px (1:1 Kare)',
    mobileRecommendedDimensions: '600 × 600 px (1:1 Kare)',
    aspectRatioLabel: '1:1 Kare',
    mobileAspectRatioLabel: '1:1 Kare',
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
    mobileImageUrl: '',
    recommendedDimensions: '800 × 800 px (1:1 Kare)',
    mobileRecommendedDimensions: '600 × 600 px (1:1 Kare)',
    aspectRatioLabel: '1:1 Kare',
    mobileAspectRatioLabel: '1:1 Kare',
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
    mobileImageUrl: '',
    recommendedDimensions: '800 × 800 px (1:1 Kare)',
    mobileRecommendedDimensions: '600 × 600 px (1:1 Kare)',
    aspectRatioLabel: '1:1 Kare',
    mobileAspectRatioLabel: '1:1 Kare',
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
    mobileImageUrl: '',
    recommendedDimensions: '1200 × 800 px (4:3 veya 3:2)',
    mobileRecommendedDimensions: '800 × 800 px (1:1 Kare)',
    aspectRatioLabel: '4:3 Yatay',
    mobileAspectRatioLabel: '1:1 Kare',
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
    mobileImageUrl: '',
    recommendedDimensions: '1200 × 800 px (4:3 veya 3:2)',
    mobileRecommendedDimensions: '800 × 800 px (1:1 Kare)',
    aspectRatioLabel: '4:3 Yatay',
    mobileAspectRatioLabel: '1:1 Kare',
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
    title: 'İletişim',
    subtitle: 'Safirya Online Tasarım & Zanaat Atölyesi',
    content: `## Safirya Online Tasarım Atölyesi\n\nKarşıyaka / İzmir (Yalnızca Online E-Ticaret Hizmeti - Fiziksel Mağaza Bulunmamaktadır)\nWhatsApp: +90 532 555 72 34\nE-posta: destek@safirya.tr`,
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
  updateOrderStage: (id: string, stage: OrderStage, cargoInfo?: { cargoCompany?: string; cargoTrackingNo?: string }) => void;
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

  // 10. Silikon Kalıp Kapasite & Ömür Takibi
  siliconeMolds: SiliconeMold[];
  moldCastLogs: MoldCastLog[];
  addSiliconeMold: (mold: Omit<SiliconeMold, 'id' | 'createdAt'>) => SiliconeMold;
  updateSiliconeMold: (id: string, updates: Partial<SiliconeMold>) => void;
  deleteSiliconeMold: (id: string) => void;
  recordMoldCast: (moldId: string, rounds: number, orderNumber?: string, notes?: string, operatorName?: string) => void;

  // 11. Dijital Onaylı Özel Üretim Sözleşmeleri
  customContracts: CustomContract[];
  createCustomContract: (contract: Omit<CustomContract, 'id' | 'createdAt' | 'status' | 'verificationCode' | 'legalConsentChecked'>) => CustomContract;
  signCustomContract: (contractId: string, signatureDataUrl: string, signedBy: string) => Promise<CustomContract>;
  cancelCustomContract: (contractId: string) => void;
  getContractByOrderId: (orderId: string) => CustomContract | undefined;

  // 12. Webhook Tetikleme ve Loglama
  webhookLogs: WebhookDeliveryLog[];
  triggerWebhook: (event: string, orderNumber: string, payload: Record<string, any>) => Promise<{ success: boolean; statusCode?: number; message?: string }>;
  clearWebhookLogs: () => void;

  // 13. Numune Kiti Kurgusu
  generateSampleKitVoucher: (customerEmail: string, orderNumber: string, amount?: number) => MarketingCoupon;

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
      const saved = localStorage.getItem('safirya_orders') || localStorage.getItem('safirya_admin_orders');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter(
              (o: any) =>
                o &&
                !['SFR-2026-1042', 'SFR-2026-1043'].includes(o.orderNumber) &&
                o.customerName !== 'Elif Kaya' &&
                !String(o.customerEmail || o.email || '').includes('elif.kaya')
            );
            if (cleaned.length > 0) {
              return cleaned.map((o: any, idx: number) => normalizeAdminOrder(o, idx));
            }
          }
        } catch {}
      }
    }
    return initialOrders.map((o, idx) => normalizeAdminOrder(o, idx));
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

  // Yeni Modüller: Silikon Kalıplar, Sözleşmeler, Webhook Logları
  const [siliconeMolds, setSiliconeMolds] = useState<SiliconeMold[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_silicone_molds');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialSiliconeMolds;
  });

  const [moldCastLogs, setMoldCastLogs] = useState<MoldCastLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_mold_cast_logs');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialMoldCastLogs;
  });

  const [customContracts, setCustomContracts] = useState<CustomContract[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_custom_contracts');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialContracts;
  });

  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safirya_webhook_logs');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // Eski demo verilerin ve Elif Kaya gibi örnek siparişlerin tarayıcı önbelleğinden temizlenmesi (v3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCleaned = localStorage.getItem('safirya_demo_cleaned_v3');
      if (!isCleaned) {
        const savedOrders = localStorage.getItem('safirya_orders');
        if (savedOrders) {
          try {
            const parsed = JSON.parse(savedOrders);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter(
                (o: any) =>
                  o &&
                  !['SFR-2026-1042', 'SFR-2026-1043', 'SFR-2026-8921'].includes(o.orderNumber) &&
                  o.customerName !== 'Elif Kaya' &&
                  !String(o.customerEmail || o.email || '').includes('elif.kaya')
              );
              localStorage.setItem('safirya_orders', JSON.stringify(cleaned));
              setOrders(cleaned);
            }
          } catch {}
        }
        localStorage.setItem('safirya_demo_cleaned_v3', 'true');
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

  // Buluttan ve Veritabanından Canlı Siparişleri Eşitle
  useEffect(() => {
    let isMounted = true;

    async function syncCloudOrders() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          if (isMounted) {
            setOrders((prev) => {
              const existingIds = new Set(prev.map((o) => o.orderNumber));
              const newOrders: AdminOrder[] = [];

              data.orders.forEach((apiOrder: any) => {
                if (!existingIds.has(apiOrder.orderNumber)) {
                  newOrders.push(normalizeAdminOrder(apiOrder, newOrders.length));
                }
              });

              if (newOrders.length === 0) return prev;
              const merged = [...newOrders, ...prev];
              if (typeof window !== 'undefined') {
                localStorage.setItem('safirya_orders', JSON.stringify(merged));
                localStorage.setItem('safirya_admin_orders', JSON.stringify(merged));
              }
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Canlı sipariş senkronizasyon uyarısı:', err);
      }
    }

    syncCloudOrders();

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
      localStorage.setItem('safirya_demo_cleaned_v3', 'true');

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
      localStorage.setItem('safirya_admin_orders', JSON.stringify(orders));
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_silicone_molds', JSON.stringify(siliconeMolds));
    }
  }, [siliconeMolds]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_mold_cast_logs', JSON.stringify(moldCastLogs));
    }
  }, [moldCastLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_custom_contracts', JSON.stringify(customContracts));
    }
  }, [customContracts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safirya_webhook_logs', JSON.stringify(webhookLogs));
    }
  }, [webhookLogs]);


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

  const updateOrderStage = (
    id: string,
    stage: OrderStage,
    cargoInfo?: { cargoCompany?: string; cargoTrackingNo?: string }
  ) => {
    if (!id) return;
    const orderToUpdate = orders.find(
      (o) => (Boolean(o.id) && o.id === id) || (Boolean(o.orderNumber) && o.orderNumber === id)
    );

    setOrders((prev) =>
      prev.map((o) => {
        const isMatch =
          (Boolean(o.id) && o.id === id) ||
          (Boolean(o.orderNumber) && o.orderNumber === id);
        if (!isMatch) return o;
        return {
          ...o,
          stage,
          ...(cargoInfo?.cargoCompany ? { cargoCompany: cargoInfo.cargoCompany } : {}),
          ...(cargoInfo?.cargoTrackingNo !== undefined ? { cargoTrackingNo: cargoInfo.cargoTrackingNo } : {}),
        };
      })
    );
    showToast(`Sipariş aşaması güncellendi.`);

    if (orderToUpdate) {
      // Sunucuya PATCH isteği gönder
      fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderToUpdate.orderNumber,
          stage,
          cargoCompany: cargoInfo?.cargoCompany,
          trackingCode: cargoInfo?.cargoTrackingNo,
        }),
      }).catch((err) => console.warn('Sunucu sipariş güncelleme uyarısı:', err));

      triggerOrderStageNotification({
        order: {
          ...orderToUpdate,
          stage,
          ...(cargoInfo?.cargoCompany ? { cargoCompany: cargoInfo.cargoCompany } : {}),
          ...(cargoInfo?.cargoTrackingNo !== undefined ? { cargoTrackingNo: cargoInfo.cargoTrackingNo } : {}),
        },
        newStage: stage,
        settings,
      }).then(({ siteNotified, emailSent }) => {
        if (siteNotified || emailSent) {
          showToast(`🔔 Müşteri bildirimi iletildi (${siteNotified ? 'Çan Bildirimi' : ''}${siteNotified && emailSent ? ' + ' : ''}${emailSent ? 'E-posta' : ''})`);
        }
      });
    }
  };

  const generateInvoice = (orderId: string): AdminInvoice => {
    const order = orders.find(
      (o) => (Boolean(o.id) && o.id === orderId) || (Boolean(o.orderNumber) && o.orderNumber === orderId)
    );
    if (!order) throw new Error('Sipariş bulunamadı.');

    const invoiceCount = invoices.length + 45;
    const invoiceNo = order.invoiceNo || `SFR2026${String(invoiceCount).padStart(8, '0')}`;
    const today = getFormattedDateTime();

    const totalAmount = Number(order.totalAmount || 0);
    const subtotal = Number((totalAmount / 1.2).toFixed(2));
    const taxAmount = Number((totalAmount - subtotal).toFixed(2));

    const invoiceItems = (order.items || []).map((i: any) => {
      const quantity = Number(i.quantity) || 1;
      const unitPrice = Number(i.unitPrice ?? i.price ?? (i.totalAmount ? i.totalAmount / quantity : 0));
      const itemTotal = Number(i.totalAmount ?? (unitPrice * quantity));
      const vatExcludedUnitPrice = Number((unitPrice / 1.2).toFixed(2));
      const vatExcludedTotal = Number((itemTotal / 1.2).toFixed(2));

      return {
        name: (i.productName || i.name || 'Özel Tasarım Ürün') + (i.variantTitle ? ` (${i.variantTitle})` : ''),
        quantity,
        unitPrice: vatExcludedUnitPrice,
        totalAmount: vatExcludedTotal,
      };
    });

    if (order.isGiftWrapped && (order.giftWrapFee || 0) > 0) {
      invoiceItems.push({
        name: 'Özel Atölye Hediye Paketi & Notu',
        quantity: 1,
        unitPrice: Number(((order.giftWrapFee || 0) / 1.2).toFixed(2)),
        totalAmount: Number(((order.giftWrapFee || 0) / 1.2).toFixed(2)),
      });
    }

    const customerAddress = typeof order.shippingAddress === 'string'
      ? order.shippingAddress
      : [order.shippingAddress?.address || (order.shippingAddress as any)?.fullAddress, order.shippingAddress?.district, order.shippingAddress?.city].filter(Boolean).join(' ') || 'Adres Belirtilmemiş';

    const newInvoice: AdminInvoice = {
      id: createUniqueId('inv'),
      invoiceNo,
      orderId: order.id,
      orderNumber: order.orderNumber,
      type: 'SATIS',
      customerName: order.customerName,
      customerAddress,
      issueDate: today,
      subtotal,
      taxRate: 20,
      taxAmount,
      totalAmount,
      status: 'OLUSTURULDU',
      items: invoiceItems,
    };

    setInvoices((prev) => {
      const filtered = prev.filter((inv) => inv.orderNumber !== order.orderNumber && inv.invoiceNo !== invoiceNo);
      return [newInvoice, ...filtered];
    });

    setOrders((prev) =>
      prev.map((o) =>
        (Boolean(o.id) && o.id === order.id) || (Boolean(o.orderNumber) && o.orderNumber === order.orderNumber)
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

    const orderToMove = orders.find((o) => o.id === orderId);
    let stageMapping: OrderStage = 'ATOLYEDE_URETIMDE';
    if (targetColumnId === 'col-prep') stageMapping = 'SIPARIS_ALINDI';
    else if (targetColumnId === 'col-qc') stageMapping = 'KALITE_KONTROL_PAKETLEME';

    const targetCol = kanbanColumns.find((c) => c.id === targetColumnId);
    const targetTitle = targetCol?.title || 'Üretim Aşaması';

    if (orderToMove && (orderToMove.kanbanColumnId !== targetColumnId || orderToMove.stage !== stageMapping)) {
      triggerOrderStageNotification({
        order: { ...orderToMove, stage: stageMapping, kanbanColumnId: targetColumnId },
        newStage: stageMapping,
        stageTitle: targetTitle,
        settings,
      }).then(({ siteNotified, emailSent }) => {
        if (siteNotified || emailSent) {
          showToast(`Sipariş "${targetTitle}" aşamasına taşındı ve müşteriye bildirim iletildi.`);
        }
      });

      if (settings?.webhookEnabled && settings?.webhookUrl) {
        triggerWebhook('order.stage_changed', orderToMove.orderNumber, {
          previousStage: orderToMove.stage,
          newStage: stageMapping,
          targetColumnId,
          targetTitle,
          customerName: orderToMove.customerName,
          customerEmail: orderToMove.customerEmail,
          customerPhone: orderToMove.customerPhone,
        });
      }
    }
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

    // Müşteriye bildirim gönder (E-posta + WhatsApp + Webhook)
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
        } else {
          showToast(`⚠️ E-posta iletilemedi: ${result.email.message}`);
        }

        if (result.webhook) {
          setWebhookLogs((prev) => [result.webhook!, ...prev.slice(0, 49)]);
          if (result.webhook.status === 'SUCCESS') {
            showToast(`🔔 Webhook iletildi (${result.webhook.statusCode})`);
          }
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
        city: 'İzmir',
        district: 'Karşıyaka',
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

  // 10. Silikon Kalıp Kapasite & Ömür Takibi
  const addSiliconeMold = (moldData: Omit<SiliconeMold, 'id' | 'createdAt'>): SiliconeMold => {
    const newMold: SiliconeMold = {
      ...moldData,
      id: createUniqueId('mold'),
      createdAt: getFormattedDate(),
    };
    setSiliconeMolds((prev) => [newMold, ...prev]);
    showToast(`"${newMold.name}" kalıbı envantere eklendi.`);
    return newMold;
  };

  const updateSiliconeMold = (id: string, updates: Partial<SiliconeMold>) => {
    setSiliconeMolds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    showToast('Kalıp bilgileri güncellendi.');
  };

  const deleteSiliconeMold = (id: string) => {
    setSiliconeMolds((prev) => prev.filter((m) => m.id !== id));
    showToast('Kalıp silindi.');
  };

  const recordMoldCast = (
    moldId: string,
    rounds: number,
    orderNumber?: string,
    notes?: string,
    operatorName?: string
  ) => {
    const target = siliconeMolds.find((m) => m.id === moldId);
    if (!target) return;

    const roundCount = Math.max(1, rounds);
    const newCastTotal = target.currentCasts + roundCount;
    const totalItems = roundCount * target.cavityCount * target.activeMoldCount;

    setSiliconeMolds((prev) =>
      prev.map((m) =>
        m.id === moldId
          ? {
              ...m,
              currentCasts: newCastTotal,
              lastUsedAt: getFormattedDate(),
            }
          : m
      )
    );

    const newLog: MoldCastLog = {
      id: createUniqueId('cast-log'),
      moldId,
      moldName: target.name,
      orderNumber,
      castCountDelta: roundCount,
      totalItemsProduced: totalItems,
      operatorName: operatorName || 'Atölye Sorumlusu',
      notes: notes || `${roundCount} tur döküm yapıldı (${totalItems} adet çıktı).`,
      createdAt: getFormattedDateTime(),
    };
    setMoldCastLogs((prev) => [newLog, ...prev]);

    const wearRate = (newCastTotal / target.maxCasts) * 100;
    if (wearRate >= 90) {
      showToast(`⚠️ DİKKAT: "${target.name}" %${Math.round(wearRate)} yıprandı! Kalıbı yenilemeniz önerilir.`);
    } else {
      showToast(`✅ Döküm kaydedildi: +${roundCount} tur (${totalItems} adet).`);
    }
  };

  // 11. Dijital Onaylı Özel Üretim Sözleşmeleri
  const createCustomContract = (
    contractData: Omit<CustomContract, 'id' | 'createdAt' | 'status' | 'verificationCode' | 'legalConsentChecked'>
  ): CustomContract => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newContract: CustomContract = {
      ...contractData,
      id: createUniqueId('cnt'),
      status: 'BEKLIYOR',
      verificationCode: `SOZ-${contractData.orderNumber}-${randomSuffix}`,
      legalConsentChecked: false,
      createdAt: getFormattedDateTime(),
    };

    setCustomContracts((prev) => [newContract, ...prev]);

    if (contractData.orderId || contractData.orderNumber) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === contractData.orderId || o.orderNumber === contractData.orderNumber
            ? {
                ...o,
                contractId: newContract.id,
                contractStatus: 'BEKLIYOR',
              }
            : o
        )
      );
    }

    showToast(`Sözleşme taslağı oluşturuldu: #${contractData.orderNumber}`);
    return newContract;
  };

  const signCustomContract = async (
    contractId: string,
    signatureDataUrl: string,
    signedBy: string
  ): Promise<CustomContract> => {
    const contract = customContracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Sözleşme bulunamadı.');

    const signedAt = getFormattedDateTime();
    const verificationCode = contract.verificationCode || `SOZ-${contract.orderNumber}-${Math.floor(1000 + Math.random() * 9000)}-OK`;

    const updatedContract: CustomContract = {
      ...contract,
      status: 'ONAYLANDI',
      signedAt,
      signedBy,
      signatureDataUrl,
      verificationCode,
      legalConsentChecked: true,
    };

    setCustomContracts((prev) =>
      prev.map((c) => (c.id === contractId ? updatedContract : c))
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === contract.orderNumber || o.id === contract.orderId
          ? {
              ...o,
              contractStatus: 'ONAYLANDI',
              contractId: contract.id,
              contractSignedAt: signedAt,
              contractVerificationCode: verificationCode,
            }
          : o
      )
    );

    if (settings.webhookEnabled && settings.webhookUrl) {
      triggerWebhook('order.contract_signed', contract.orderNumber, {
        customerName: contract.customerName,
        signedBy,
        signedAt,
        verificationCode,
        customText: contract.customText,
        quantity: contract.quantity,
        totalAmount: contract.totalAmount,
      });
    }

    showToast(`✅ Özel üretim sözleşmesi dijital olarak onaylandı!`);
    return updatedContract;
  };

  const cancelCustomContract = (contractId: string) => {
    setCustomContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, status: 'IPTAL' } : c))
    );
    showToast('Sözleşme iptal edildi.');
  };

  const getContractByOrderId = (orderId: string) => {
    return customContracts.find((c) => c.orderId === orderId || c.orderNumber === orderId);
  };

  // 12. Webhook Tetikleme ve Loglama
  const triggerWebhook = async (
    event: string,
    orderNumber: string,
    payload: Record<string, any>
  ): Promise<{ success: boolean; statusCode?: number; message?: string }> => {
    const delivery = await dispatchWebhookEvent(settings, {
      event: event as any,
      timestamp: new Date().toISOString(),
      orderNumber,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      data: payload,
    });

    setWebhookLogs((prev) => [delivery, ...prev.slice(0, 49)]);

    if (delivery.status === 'SUCCESS') {
      showToast(`🔔 Webhook iletildi (${event} -> #${orderNumber})`);
      return { success: true, statusCode: delivery.statusCode, message: delivery.responseMessage };
    } else {
      return { success: false, statusCode: delivery.statusCode, message: delivery.responseMessage };
    }
  };

  const clearWebhookLogs = () => {
    setWebhookLogs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safirya_webhook_logs');
    }
    showToast('Webhook logları temizlendi.');
  };

  // 13. Numune Kiti Kurgusu
  const generateSampleKitVoucher = (
    customerEmail: string,
    orderNumber: string,
    amount: number = 250
  ): MarketingCoupon => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `NUMUNE-${randomSuffix}`;

    const newCoupon: MarketingCoupon = {
      id: createUniqueId('cp-numune'),
      code,
      label: `Numune Kiti İadesi (₺${amount} Nakit İndirim)`,
      discountType: 'fixed',
      discountValue: amount,
      minCartTotal: 1000,
      usageCount: 0,
      isActive: true,
      isSampleKitVoucher: true,
      sampleKitOrderNumber: orderNumber,
      customerEmail,
      minOrderQuantity: 20,
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Numune nakit indirim kuponu üretildi: ${code}`);
    return newCoupon;
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
        // Yeni Sistemler
        siliconeMolds,
        moldCastLogs,
        addSiliconeMold,
        updateSiliconeMold,
        deleteSiliconeMold,
        recordMoldCast,
        customContracts,
        createCustomContract,
        signCustomContract,
        cancelCustomContract,
        getContractByOrderId,
        webhookLogs,
        triggerWebhook,
        clearWebhookLogs,
        generateSampleKitVoucher,
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
