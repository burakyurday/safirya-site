export type LoyaltyTierKey = 'BRONZ' | 'GUMUS' | 'ALTIN' | 'PLATIN';

export interface LoyaltyTierConfig {
  key: LoyaltyTierKey;
  name: string;
  minSpend: number;
  maxSpend?: number;
  pointsMultiplier: number; // örn: 1.0, 1.25, 1.5, 2.0
  badgeColor: string;
  badgeTextColor: string;
  iconName: string;
  perks: string[];
}

export const LOYALTY_TIERS: Record<LoyaltyTierKey, LoyaltyTierConfig> = {
  BRONZ: {
    key: 'BRONZ',
    name: 'Zanaat Meraklısı',
    minSpend: 0,
    maxSpend: 2499,
    pointsMultiplier: 1.0,
    badgeColor: 'bg-amber-100 border-amber-300',
    badgeTextColor: 'text-amber-800',
    iconName: 'Sparkles',
    perks: [
      'Her ₺10 alışverişte 1 Safir Puan',
      'Kayıtta 100 Hoş Geldin Puanı',
      'Doğum gününde sürpriz hediye puan',
      'Fotoğraflı yorumlara 50 Puan',
    ],
  },
  GUMUS: {
    key: 'GUMUS',
    name: 'Atölye Dostu',
    minSpend: 2500,
    maxSpend: 7499,
    pointsMultiplier: 1.25,
    badgeColor: 'bg-slate-100 border-slate-300',
    badgeTextColor: 'text-slate-800',
    iconName: 'Award',
    perks: [
      '%25 daha fazla puan kazanımı (1.25x)',
      'Her siparişte sürpriz numune esans testerı',
      'Yeni koleksiyonlara 24 saat önceden erişim',
      'Özel indirim günlerinde çift puan',
    ],
  },
  ALTIN: {
    key: 'ALTIN',
    name: 'Safirya İntisap',
    minSpend: 7500,
    maxSpend: 14999,
    pointsMultiplier: 1.5,
    badgeColor: 'bg-yellow-100 border-yellow-300',
    badgeTextColor: 'text-yellow-800',
    iconName: 'Crown',
    perks: [
      '%50 daha fazla puan kazanımı (1.5x)',
      'Koşulsuz tüm siparişlerde ÜCRETSİZ KARGO',
      'Kişiselleştirme (isim/tarih baskı) tamamen ücretsiz',
      'Yılda 1 adet adınıza özel dökülen doğum günü mumu',
    ],
  },
  PLATIN: {
    key: 'PLATIN',
    name: 'Koleksiyoner VIP',
    minSpend: 15000,
    pointsMultiplier: 2.0,
    badgeColor: 'bg-emerald-100 border-emerald-300',
    badgeTextColor: 'text-emerald-900',
    iconName: 'Gem',
    perks: [
      '2 KAT puan kazanımı (2.0x)',
      'Öncelikli atölye imalat sırası (Express hazırlık)',
      'Özel tasarım siparişlerinde birebir zanaatkar danışmanlığı',
      'Sınırlı sayıda üretilen konsept ürünlere ilk davet',
    ],
  },
};

export type LoyaltyTransactionType =
  | 'ORDER_EARN'
  | 'ORDER_REDEEM'
  | 'WELCOME_BONUS'
  | 'REVIEW_BONUS'
  | 'BIRTHDAY_BONUS'
  | 'REFERRAL_BONUS'
  | 'ADMIN_ADJUSTMENT';

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  points: number; // pozitif (kazanç) veya negatif (harcama)
  description: string;
  orderNumber?: string;
  createdAt: string;
}

export interface LoyaltyAccount {
  id: string;
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  totalSpent: number;
  currentTier: LoyaltyTierKey;
  referralCode: string;
  referredByCode?: string;
  birthday?: string;
  transactions: LoyaltyTransaction[];
}

/**
 * Puan Değişim Oranları:
 * 1 Safir Puan = ₺0.50 (Yani 100 Puan = ₺50 indirim)
 * Her ₺10 harcama = 1 Safir Puan (Tier katsayısı ile çarpılır)
 */
export const LOYALTY_CONFIG = {
  POINT_VALUE_TL: 0.5, // 1 puan = 0.5 TL indirim
  POINTS_PER_10_TL: 1, // her 10 TL'ye 1 puan
  WELCOME_BONUS_POINTS: 100, // ₺50 değerinde hoş geldin puanı
  REVIEW_BONUS_POINTS: 50, // ₺25 değerinde fotoğraflı yorum puanı
  REFERRAL_BONUS_POINTS: 100, // ₺50 değerinde arkadaş davet puanı
  MAX_REDEEM_PERCENTAGE: 50, // Bir sepette toplam tutarın en fazla %50'si puanla ödenebilir
  MIN_POINTS_TO_REDEEM: 50, // En az 50 puan (₺25) kullanılabilir
};
