export type StockUnit = 'gr' | 'kg' | 'ml' | 'litre' | 'adet' | 'metre' | 'set';

export type RawCategory = 
  | 'Mum Hammaddesi' 
  | 'Epoksi Kimyasalları' 
  | 'Miyuki Boncuk' 
  | 'Ambalaj & Kutu' 
  | 'Ahşap & Doğal Malzeme'
  | 'Döşeme & Fitil';

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: RawCategory;
  unit: StockUnit;
  currentStock: number;
  minThreshold: number;
  unitCost: number;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
  updatedAt: string;
}

export interface FinishedProductStock {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockQuantity: number;
  minThreshold: number;
  price: number;
  imageUrl?: string;
}

export interface AdminProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  stockQuantity: number;
  sizeOrVolume?: string;
  colorName?: string;
  scentName?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface AdminBulkTier {
  id: string;
  minQuantity: number;
  maxQuantity?: number | null;
  discountPercentage?: number;
  unitPrice?: number;
  description?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  category: string;
  categoryId?: string;
  shortDesc?: string;
  description: string;
  images: string[];
  price: number;
  discountRate: number;
  discountPrice?: number;
  preparationDays: number;
  isCustomizable: boolean;
  inStock: boolean;
  stockQuantity: number;
  minThreshold: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  scentNotes: string[];
  colorOptions: string[];
  variants?: AdminProductVariant[];
  bulkTiers?: AdminBulkTier[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type StockLogType = 
  | 'GIRIS_SATIN_ALMA' 
  | 'URETIMDE_KULLANIM' 
  | 'FIRE_KAYIP' 
  | 'SAYIM_DUZELTME';

export interface InventoryStockLog {
  id: string;
  rawMaterialId: string;
  materialName: string;
  type: StockLogType;
  quantityDelta: number;
  unit: StockUnit;
  unitPrice?: number;
  date: string;
  reason?: string;
  referenceNo?: string;
}

export type AccountType = 'TEDARIKCI' | 'MUSTERI' | 'ATOLYE_PARTNER';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  taxId?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  address?: string;
  balance: number; // Pozitif: Alacaklıyız / Negatif: Borçluyuz
  notes?: string;
  createdAt: string;
}

export interface AccountMovement {
  id: string;
  accountId: string;
  date: string;
  type: 'BORC' | 'ALACAK';
  amount: number;
  description: string;
  referenceNo?: string;
}

export type TransactionType = 'GELIR' | 'GIDER';

export type TransactionCategory =
  | 'SIPARIS_SATIS'
  | 'HAMMADDE_ALIMI'
  | 'ATOLYE_KIRA_AIDAT'
  | 'ELEKTRIK_SU_GAZ'
  | 'KARGO_LOJISTIK'
  | 'PAZARLAMA_REKLAM'
  | 'MAAS_PERSONEL'
  | 'AMBALAJ_PAKETLEME'
  | 'DIGER';

export type PaymentMethod = 'KREDI_KARTI' | 'HAVALE_EFT' | 'NAKIT';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  description: string;
  referenceNo?: string;
  accountId?: string;
  accountName?: string;
  orderId?: string;
  orderNumber?: string;
}

export type OrderStage = 
  | 'SIPARIS_ALINDI'
  | 'ATOLYEDE_URETIMDE'
  | 'KALITE_KONTROL_PAKETLEME'
  | 'KARGOYA_VERILDI'
  | 'TESLIM_EDILDI';

export type PaymentStatus = 'ODENDI' | 'BEKLIYOR' | 'BASARISIZ' | 'IADE_EDILDI';

export type InvoiceStatus = 'BEKLIYOR' | 'OLUSTURULDU' | 'IPTAL';

export interface OrderStagePhoto {
  id: string;
  stageKey: string;
  stageName: string;
  title?: string;
  photoUrl: string;
  caption: string;
  takenAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: 'amber' | 'blue' | 'purple' | 'emerald' | 'rose' | 'indigo' | 'cyan' | string;
  sortOrder: number;
}

export interface AdminOrderItem {
  productId?: string;
  productName: string;
  variantTitle?: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  customization?: {
    customText?: string;
    selectedColor?: string;
    selectedScent?: string;
    extraNote?: string;
    tagDesignType?: string;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  channel: 'WEB' | 'INSTAGRAM' | 'WHATSAPP' | 'TELEFON' | 'ATOLYE';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    address: string;
    zipCode?: string;
  };
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  isGiftWrapped: boolean;
  giftWrapFee: number;
  giftNote?: string;
  totalAmount: number;
  stage: OrderStage;
  kanbanColumnId?: string;
  sortOrder?: number;
  dueDate?: string; // Teslim tarihi (geri sayım için, örn: "2026-10-18")
  stagePhotos?: OrderStagePhoto[];
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | string;
  invoiceStatus: InvoiceStatus;
  invoiceNo?: string;
  cargoCompany?: string;
  trackingCode?: string;
  createdAt: string;
  items: AdminOrderItem[];
}

export type QuoteStatus = 
  | 'BEKLEMEDE' 
  | 'INCELENIYOR' 
  | 'FIYAT_TEKLIFI_VERILDI' 
  | 'TEKLIF_VERILDI'
  | 'ONAYLANDI' 
  | 'IPTAL_EDILDI'
  | 'REDDEDILDI';

export interface CustomQuoteRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string; // "Söz/Nişan", "Düğün", "Baby Shower", "Kurumsal Hediye"
  productType: string; // "Doğal Botanik Mum", "Kokulu Taş Seti", "Epoksi Sunumluk", "Miyuki Takı"
  requestedQuantity: number;
  targetBudget?: number;
  eventDate?: string;
  customText?: string;
  selectedScent?: string;
  customDetails: string;
  referenceImages?: string[];
  status: QuoteStatus;
  quotedUnitPrice?: number;
  quotedTotalPrice?: number;
  adminNote?: string;
  convertedOrderId?: string;
  createdAt: string;
}

export interface AdminInvoice {
  id: string;
  invoiceNo: string;
  orderId?: string;
  orderNumber: string;
  type: 'SATIS' | 'IADE';
  customerName: string;
  customerTaxId?: string;
  customerTaxOffice?: string;
  customerAddress: string;
  issueDate: string;
  subtotal: number;
  taxRate: number; // 20
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }[];
}

export interface MarketingCoupon {
  id: string;
  code: string;
  label: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minCartTotal: number;
  usageCount: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface CrossSellRule {
  id: string;
  title: string;
  triggerCategory?: string;
  triggerProductName?: string;
  recommendedProductNames: string[];
  discountPercentage: number;
  bannerText: string;
  isActive: boolean;
}

export interface AbandonedCartItem {
  id: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    variantTitle?: string;
  }[];
  totalAmount: number;
  abandonedAt: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  recovered: boolean;
}

export interface AdminSettings {
  announcementText: string;
  isAnnouncementActive: boolean;
  freeShippingThreshold: number;
  giftWrapFee: number;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  instagramHandle: string;
  atelierAddress: string;
  
  // Ziyaretçi Çıkış Teklifi (Exit-Intent Pop-up)
  exitIntentEnabled: boolean;
  exitIntentTitle: string;
  exitIntentSubtitle: string;
  exitIntentCouponCode: string;
  exitIntentDiscountRate: number;
  exitIntentCountdownMinutes: number;

  // Promosyon Pop-up
  promoPopupEnabled: boolean;
  promoPopupTitle?: string;
  promoPopupImage?: string;
  promoPopupLink?: string;

  // WhatsApp Business Cloud API (Hazır Altyapı)
  whatsappNotificationsEnabled: boolean;
  whatsappPhoneId?: string;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappTemplateName?: string;

  // E-Posta SMTP Ayarları
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;

  // Marka & Logo Yönetimi
  logoUrl?: string;
  logoDarkUrl?: string;
  logoText?: string;
  brandTagline?: string;
  logoScale?: number;

  // PayTR Ödeme Entegrasyonu
  paytrMerchantId?: string;
  paytrMerchantKey?: string;
  paytrMerchantSalt?: string;
  paytrTestMode?: boolean;
  paytrDebugOn?: boolean;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  templateType: 'lansman' | 'indirim' | 'ozel-davet' | 'sepet-kurtarma' | 'bulten';
  targetSegment: string;
  headline: string;
  bodyText: string;
  couponCode?: string;
  discountRate?: number;
  ctaLabel: string;
  ctaUrl: string;
  heroImageUrl?: string;
  senderName?: string;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  status: 'DRAFT' | 'SENT' | 'SCHEDULED';
  sentAt?: string;
  scheduledFor?: string;
}

export interface AutomatedEmailTrigger {
  id: string;
  title: string;
  description: string;
  event: 'WELCOME' | 'ABANDONED_CART' | 'STAGE_UPDATE' | 'VIP_LOYALTY' | 'BIRTHDAY';
  delay: string;
  isEnabled: boolean;
  openRate: number;
  sentCount: number;
  templateType: string;
}

export interface CmsPageData {
  slug: string;
  title: string;
  subtitle: string;
  content: string; // Markdown or HTML
  updatedAt: string;
}

export type ConceptSlotKey =
  | 'hero'
  | 'category_1'
  | 'category_2'
  | 'category_3'
  | 'showcase_1'
  | 'showcase_2';

export interface ConceptBannerItem {
  id: string;
  slotKey: ConceptSlotKey;
  slotName: string;
  title: string;
  subtitle?: string;
  tag?: string; // e.g. "%50'YE VARAN İNDİRİM"
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  recommendedDimensions: string; // e.g. "1920 × 600 px"
  aspectRatioLabel: string; // e.g. "16:5", "1:1 Kare", "4:3"
  categorySlug?: string;
  isActive: boolean;
}

export type ConceptBannersMap = Record<ConceptSlotKey, ConceptBannerItem>;


