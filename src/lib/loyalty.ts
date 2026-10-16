import {
  LoyaltyAccount,
  LoyaltyTierKey,
  LoyaltyTierConfig,
  LOYALTY_TIERS,
  LOYALTY_CONFIG,
  LoyaltyTransaction,
} from '@/types/loyalty';

/**
 * Toplam harcamaya göre kullanıcının hak kazandığı seviyeyi hesaplar
 */
export function calculateTier(totalSpent: number): LoyaltyTierKey {
  if (totalSpent >= LOYALTY_TIERS.PLATIN.minSpend) {
    return 'PLATIN';
  }
  if (totalSpent >= LOYALTY_TIERS.ALTIN.minSpend) {
    return 'ALTIN';
  }
  if (totalSpent >= LOYALTY_TIERS.GUMUS.minSpend) {
    return 'GUMUS';
  }
  return 'BRONZ';
}

/**
 * Sipariş tutarı ve seviye katsayısına göre kazanılacak puanı hesaplar
 */
export function calculatePointsEarned(amount: number, tierKey: LoyaltyTierKey = 'BRONZ'): number {
  if (amount <= 0) return 0;
  const config = LOYALTY_TIERS[tierKey] || LOYALTY_TIERS.BRONZ;
  const basePoints = Math.floor(amount / 10);
  return Math.round(basePoints * config.pointsMultiplier);
}

/**
 * Puan miktarının TL indirim karşılığını hesaplar
 */
export function calculatePointsDiscount(points: number): number {
  if (points <= 0) return 0;
  return Number((points * LOYALTY_CONFIG.POINT_VALUE_TL).toFixed(2));
}

/**
 * Sepet tutarına göre en fazla kaç puan harcanabileceğini hesaplar (max %50 sepet tutarı kuralı)
 */
export function calculateMaxRedeemablePoints(subtotal: number, userPointsBalance: number): number {
  if (subtotal <= 0 || userPointsBalance <= 0) return 0;
  // Maksimum indirim tutarı (sepetin %50'si)
  const maxDiscountAllowed = (subtotal * LOYALTY_CONFIG.MAX_REDEEM_PERCENTAGE) / 100;
  const maxPointsAllowedByTotal = Math.floor(maxDiscountAllowed / LOYALTY_CONFIG.POINT_VALUE_TL);
  return Math.min(userPointsBalance, maxPointsAllowedByTotal);
}

/**
 * Bir sonraki seviyeye kalan ilerleme durumunu hesaplar
 */
export function getNextTierProgress(totalSpent: number): {
  currentTier: LoyaltyTierConfig;
  nextTier?: LoyaltyTierConfig;
  neededSpend: number;
  progressPercentage: number;
} {
  const currentKey = calculateTier(totalSpent);
  const currentTier = LOYALTY_TIERS[currentKey];

  let nextTier: LoyaltyTierConfig | undefined = undefined;
  let neededSpend = 0;
  let progressPercentage = 100;

  if (currentKey === 'BRONZ') {
    nextTier = LOYALTY_TIERS.GUMUS;
    neededSpend = Math.max(0, nextTier.minSpend - totalSpent);
    progressPercentage = Math.min(100, Math.round((totalSpent / nextTier.minSpend) * 100));
  } else if (currentKey === 'GUMUS') {
    nextTier = LOYALTY_TIERS.ALTIN;
    const tierRange = nextTier.minSpend - currentTier.minSpend;
    const spendInCurrentTier = totalSpent - currentTier.minSpend;
    neededSpend = Math.max(0, nextTier.minSpend - totalSpent);
    progressPercentage = Math.min(100, Math.round((spendInCurrentTier / tierRange) * 100));
  } else if (currentKey === 'ALTIN') {
    nextTier = LOYALTY_TIERS.PLATIN;
    const tierRange = nextTier.minSpend - currentTier.minSpend;
    const spendInCurrentTier = totalSpent - currentTier.minSpend;
    neededSpend = Math.max(0, nextTier.minSpend - totalSpent);
    progressPercentage = Math.min(100, Math.round((spendInCurrentTier / tierRange) * 100));
  } else {
    // Platin - En üst seviye
    progressPercentage = 100;
    neededSpend = 0;
  }

  return {
    currentTier,
    nextTier,
    neededSpend,
    progressPercentage,
  };
}

/**
 * Benzersiz bir referans / davet kodu üretir (örn: SFR-SEL-482)
 */
export function generateReferralCode(userName?: string): string {
  const cleanName = (userName || 'KULUP')
    .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '')
    .slice(0, 3)
    .toUpperCase();
  const randNum = Math.floor(100 + Math.random() * 900);
  return `SFR-${cleanName || 'SAF'}-${randNum}`;
}

/**
 * Yeni veya giriş yapan kullanıcı için varsayılan sadakat hesabı oluşturur
 */
export function createInitialLoyaltyAccount(userId: string, userName?: string): LoyaltyAccount {
  const welcomeTx: LoyaltyTransaction = {
    id: `tx-welcome-${Date.now()}`,
    type: 'WELCOME_BONUS',
    points: LOYALTY_CONFIG.WELCOME_BONUS_POINTS,
    description: 'Safirya Atölye Kulübü Hoş Geldin Bonusu',
    createdAt: new Date().toISOString(),
  };

  return {
    id: `loyalty-${userId}`,
    userId,
    pointsBalance: LOYALTY_CONFIG.WELCOME_BONUS_POINTS,
    lifetimePoints: LOYALTY_CONFIG.WELCOME_BONUS_POINTS,
    totalSpent: 0,
    currentTier: 'BRONZ',
    referralCode: generateReferralCode(userName),
    transactions: [welcomeTx],
  };
}
