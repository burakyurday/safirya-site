import { describe, it, expect } from 'vitest';
import {
  calculateTier,
  calculatePointsEarned,
  calculatePointsDiscount,
  calculateMaxRedeemablePoints,
  getNextTierProgress,
  generateReferralCode,
  createInitialLoyaltyAccount,
} from '@/lib/loyalty';
import { verifyCartAndCalculateTotal } from '@/lib/orderVerification';
import { CartItem } from '@/context/StoreContext';

describe('loyalty - Müşteri Sadakat & Atölye Kulübü Motoru', () => {
  it('harcama tutarına göre doğru seviyeyi belirlemelidir', () => {
    expect(calculateTier(0)).toBe('BRONZ');
    expect(calculateTier(1500)).toBe('BRONZ');
    expect(calculateTier(2500)).toBe('GUMUS');
    expect(calculateTier(5000)).toBe('GUMUS');
    expect(calculateTier(7500)).toBe('ALTIN');
    expect(calculateTier(12000)).toBe('ALTIN');
    expect(calculateTier(15000)).toBe('PLATIN');
    expect(calculateTier(35000)).toBe('PLATIN');
  });

  it('seviye çarpanlarına göre doğru puan hesaplamalıdır', () => {
    // ₺1000 sipariş
    // Bronz (1x): 1000 / 10 = 100 puan
    expect(calculatePointsEarned(1000, 'BRONZ')).toBe(100);
    // Gümüş (1.25x): 100 * 1.25 = 125 puan
    expect(calculatePointsEarned(1000, 'GUMUS')).toBe(125);
    // Altın (1.5x): 100 * 1.5 = 150 puan
    expect(calculatePointsEarned(1000, 'ALTIN')).toBe(150);
    // Platin (2x): 100 * 2 = 200 puan
    expect(calculatePointsEarned(1000, 'PLATIN')).toBe(200);
  });

  it('puanların TL karşılığını doğru hesaplamalıdır', () => {
    // 1 Puan = 0.5 TL
    expect(calculatePointsDiscount(100)).toBe(50.0);
    expect(calculatePointsDiscount(250)).toBe(125.0);
    expect(calculatePointsDiscount(0)).toBe(0);
  });

  it('sepet tutarının maksimum %50’si kadar puan kullanımına izin vermelidir', () => {
    // ₺1000 sepet, max %50 = ₺500 indirim = 1000 puan
    // Kullanıcının 2000 puanı varsa en fazla 1000 puan harcayabilir
    expect(calculateMaxRedeemablePoints(1000, 2000)).toBe(1000);

    // Kullanıcının 300 puanı varsa (₺150), 300 puan harcayabilir
    expect(calculateMaxRedeemablePoints(1000, 300)).toBe(300);
  });

  it('sonraki seviye ilerlemesini doğru hesaplamalıdır', () => {
    const progressBronz = getNextTierProgress(1250);
    expect(progressBronz.currentTier.key).toBe('BRONZ');
    expect(progressBronz.nextTier?.key).toBe('GUMUS');
    expect(progressBronz.neededSpend).toBe(1250);
    expect(progressBronz.progressPercentage).toBe(50);

    const progressPlatin = getNextTierProgress(20000);
    expect(progressPlatin.currentTier.key).toBe('PLATIN');
    expect(progressPlatin.nextTier).toBeUndefined();
    expect(progressPlatin.progressPercentage).toBe(100);
  });

  it('referans kodu ve hoş geldin hesabı oluşturmalıdır', () => {
    const code = generateReferralCode('Selin');
    expect(code).toMatch(/^SFR-SEL-\d{3}$/);

    const initialAcc = createInitialLoyaltyAccount('user-1', 'Selin');
    expect(initialAcc.pointsBalance).toBe(100); // 100 hoş geldin puanı
    expect(initialAcc.currentTier).toBe('BRONZ');
    expect(initialAcc.transactions.length).toBe(1);
    expect(initialAcc.transactions[0].type).toBe('WELCOME_BONUS');
  });

  it('orderVerification motorunda puan indirimini ve kazanılacak puanı doğrulamalıdır', () => {
    const mockItem: CartItem = {
      id: 'sfr-cat-5',
      name: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
      price: 855,
      quantity: 1,
    };

    // 200 Puan Kullanımı = ₺100 İndirim
    const result = verifyCartAndCalculateTotal({
      cartItems: [mockItem],
      usedPoints: 200,
    });

    expect(result.isValid).toBe(true);
    expect(result.subtotal).toBe(855);
    expect(result.pointsDiscount).toBe(100);
    expect(result.usedPoints).toBe(200);
    expect(result.shippingFee).toBe(0); // 855 - 100 = 755 >= 500
    expect(result.grandTotal).toBe(855 - 100);
    expect(result.pointsToEarn).toBe(Math.floor(755 / 10)); // 75 puan
  });
});
