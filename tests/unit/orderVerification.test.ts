import { describe, it, expect } from 'vitest';
import { verifyCartAndCalculateTotal } from '@/lib/orderVerification';
import { CartItem } from '@/context/StoreContext';

describe('orderVerification - Sepet ve Fiyat Hesaplama Motoru', () => {
  it('boş sepet için isValid false dönmelidir', () => {
    const result = verifyCartAndCalculateTotal({ cartItems: [] });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Sepet boş');
  });

  it('standart tekil ürün ekleme ve kargo ücreti hesaplamalıdır', () => {
    const mockItem: CartItem = {
      id: 'sfr-cat-1',
      name: 'Doğal Kehribar Cam Kavanoz Soya Mumu (210g)',
      price: 323,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59',
    };

    const result = verifyCartAndCalculateTotal({ cartItems: [mockItem] });

    expect(result.isValid).toBe(true);
    expect(result.subtotal).toBe(323);
    // ₺500 altı olduğu için kargo ücreti (45 TL) eklenmelidir
    expect(result.shippingFee).toBe(45);
    expect(result.grandTotal).toBe(323 + 45);
  });

  it('₺500 ve üzeri sepetlerde kargo ücretsiz (0 TL) olmalıdır', () => {
    const mockItem: CartItem = {
      id: 'sfr-cat-5',
      name: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
      price: 855,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119',
    };

    const result = verifyCartAndCalculateTotal({ cartItems: [mockItem] });

    expect(result.isValid).toBe(true);
    expect(result.subtotal).toBe(855);
    expect(result.shippingFee).toBe(0);
    expect(result.grandTotal).toBe(855);
  });

  it('SAFIRYA10 kuponu %10 indirim sağlamalıdır', () => {
    const mockItem: CartItem = {
      id: 'sfr-cat-5',
      name: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
      price: 855,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119',
    };

    const result = verifyCartAndCalculateTotal({
      cartItems: [mockItem],
      couponCode: 'SAFIRYA10',
    });

    expect(result.isValid).toBe(true);
    expect(result.couponDiscount).toBe(85.5);
    expect(result.grandTotal).toBe(855 - 85.5);
  });

  it('hediye paketi seçildiğinde hediye paketi ücreti eklenmelidir', () => {
    const mockItem: CartItem = {
      id: 'sfr-cat-5',
      name: 'Safir Okyanus Dalgalı Epoksi Sunumluk & Tepsi',
      price: 855,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119',
    };

    const result = verifyCartAndCalculateTotal({
      cartItems: [mockItem],
      isGiftWrapped: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.giftWrapFee).toBe(30);
    expect(result.grandTotal).toBe(855 + 30);
  });

  it('toplu sipariş bareminde (10+ adet) barem indirimi uygulanmalıdır', () => {
    const mockItem: CartItem = {
      id: 'sfr-cat-1',
      name: 'Doğal Kehribar Cam Kavanoz Soya Mumu (210g)',
      price: 323,
      quantity: 10,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59',
    };

    const result = verifyCartAndCalculateTotal({ cartItems: [mockItem] });

    expect(result.isValid).toBe(true);
    // 10 adet için %10 barem indirimi
    expect(result.bulkDiscount).toBeGreaterThan(0);
    expect(result.shippingFee).toBe(0); // Toplam > 500 TL
  });
});
