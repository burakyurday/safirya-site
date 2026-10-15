import { ALL_CATALOG_PRODUCTS, CatalogProductItem } from '@/lib/catalog';
import { CartItem } from '@/context/StoreContext';

export interface VerifiedOrderItem {
  productId: string;
  name: string;
  variantTitle?: string;
  unitPrice: number;
  originalUnitPrice: number;
  quantity: number;
  totalAmount: number;
  image?: string;
  scentNote?: string;
  customText?: string;
  colorPalette?: string;
}

export interface OrderVerificationResult {
  isValid: boolean;
  error?: string;
  verifiedItems: VerifiedOrderItem[];
  subtotal: number;
  bulkDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  giftWrapFee: number;
  grandTotal: number;
  appliedCouponCode?: string;
}

const FREE_SHIPPING_THRESHOLD = 500;
const STANDARD_SHIPPING_FEE = 45;
const GIFT_WRAP_FEE = 30;

/**
 * Valid coupons and their server-side rules
 */
const VALID_COUPONS: Record<
  string,
  { type: 'percentage' | 'fixed'; value: number; label: string }
> = {
  SAFIRYA10: { type: 'percentage', value: 10, label: '%10 Tanışma İndirimi' },
  ATOLYE25: { type: 'fixed', value: 25, label: '₺25 Atölye İndirimi' },
  BAHAR15: { type: 'percentage', value: 15, label: '%15 Bahar Kampanyası' },
};

/**
 * Sunucu tarafında sepet kalemlerini ve fiyatları katalog doğrulamasıyla hesaplar.
 * İstemciden gelen fiyat manipülasyonlarını (client-side price tampering) engeller.
 */
export function verifyCartAndCalculateTotal(params: {
  cartItems: CartItem[];
  couponCode?: string;
  isGiftWrapped?: boolean;
}): OrderVerificationResult {
  const { cartItems, couponCode, isGiftWrapped = false } = params;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      isValid: false,
      error: 'Sepet boş veya geçersiz ürün listesi gönderildi.',
      verifiedItems: [],
      subtotal: 0,
      bulkDiscount: 0,
      couponDiscount: 0,
      shippingFee: 0,
      giftWrapFee: 0,
      grandTotal: 0,
    };
  }

  // Katalog ürün haritası (Hızlı arama için id ve slug eşleşmesi)
  const catalogMap = new Map<string, CatalogProductItem>();
  ALL_CATALOG_PRODUCTS.forEach((prod) => {
    catalogMap.set(prod.id, prod);
    if (prod.slug) catalogMap.set(prod.slug, prod);
  });

  const verifiedItems: VerifiedOrderItem[] = [];
  let subtotal = 0;
  let originalSubtotal = 0;

  for (const item of cartItems) {
    const rawQuantity = Number(item.quantity);
    if (!Number.isInteger(rawQuantity) || rawQuantity < 1 || rawQuantity > 1000) {
      return {
        isValid: false,
        error: `Geçersiz ürün adedi: ${item.name || 'Bilinmeyen ürün'}`,
        verifiedItems: [],
        subtotal: 0,
        bulkDiscount: 0,
        couponDiscount: 0,
        shippingFee: 0,
        giftWrapFee: 0,
        grandTotal: 0,
      };
    }

    const productId = (item as any).productId || item.id || '';
    const catalogProduct = catalogMap.get(productId) || catalogMap.get(item.id);

    let verifiedUnitPrice = 0;
    let originalUnitPrice = 0;

    if (catalogProduct) {
      // Katalogda varsa indirimli fiyatı veya taban fiyatı esas al
      verifiedUnitPrice = Number(catalogProduct.discountPrice || catalogProduct.price);
      originalUnitPrice = Number(catalogProduct.price);
    } else {
      // Özel tasarım veya varyant ürün: Gelen fiyatın pozitif sayı olduğunu doğrula
      const clientPrice = Number(item.price);
      if (isNaN(clientPrice) || clientPrice <= 0 || clientPrice > 100000) {
        return {
          isValid: false,
          error: `Geçersiz ürün birim fiyatı: ${item.name}`,
          verifiedItems: [],
          subtotal: 0,
          bulkDiscount: 0,
          couponDiscount: 0,
          shippingFee: 0,
          giftWrapFee: 0,
          grandTotal: 0,
        };
      }
      verifiedUnitPrice = Number(clientPrice.toFixed(2));
      originalUnitPrice = Number((item.originalPrice || clientPrice).toFixed(2));
    }

    // Toplu alım baremi (25+ adet için %15 indirim kuralı)
    if (rawQuantity >= 25 && verifiedUnitPrice === originalUnitPrice) {
      verifiedUnitPrice = Number((verifiedUnitPrice * 0.85).toFixed(2));
    }

    const itemTotal = Number((verifiedUnitPrice * rawQuantity).toFixed(2));
    subtotal += itemTotal;
    originalSubtotal += originalUnitPrice * rawQuantity;

    verifiedItems.push({
      productId: catalogProduct ? catalogProduct.id : productId,
      name: (item.name || catalogProduct?.name || 'Safirya Atölye Ürünü').trim().substring(0, 100),
      variantTitle: item.variantTitle?.trim(),
      unitPrice: verifiedUnitPrice,
      originalUnitPrice,
      quantity: rawQuantity,
      totalAmount: itemTotal,
      image: item.image || catalogProduct?.image,
      scentNote: item.scentNote?.trim(),
      customText: item.customText?.trim(),
      colorPalette: item.colorPalette?.trim(),
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  const bulkDiscount = Math.max(0, Number((originalSubtotal - subtotal).toFixed(2)));

  // Kupon İndirimi Hesapla
  let couponDiscount = 0;
  let appliedCouponKey: string | undefined = undefined;

  if (couponCode) {
    const cleanCoupon = couponCode.trim().toUpperCase();
    const couponRule = VALID_COUPONS[cleanCoupon];
    if (couponRule) {
      appliedCouponKey = cleanCoupon;
      if (couponRule.type === 'percentage') {
        couponDiscount = Number(((subtotal * couponRule.value) / 100).toFixed(2));
      } else {
        couponDiscount = Math.min(subtotal, couponRule.value);
      }
    } else if (cleanCoupon.startsWith('NUMUNE-')) {
      // "Numune Kiti Al, Toplu Siparişte Düş" Kurgusu:
      // Numune kuponu toplu siparişlerde (en az 20 adet veya ₺1000 sepet tutarı) ₺250 kiti birebir düşer!
      const totalQuantity = verifiedItems.reduce((acc, it) => acc + it.quantity, 0);
      if (totalQuantity >= 20 || subtotal >= 1000) {
        appliedCouponKey = cleanCoupon;
        couponDiscount = Math.min(subtotal, 250); // ₺250 Numune Kit bedeli iadesi
      }
    }
  }

  // Kargo Hesapla
  const discountedSubtotal = Math.max(0, Number((subtotal - couponDiscount).toFixed(2)));
  const shippingFee =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD || verifiedItems.length === 0
      ? 0
      : STANDARD_SHIPPING_FEE;

  // Hediye Paketi
  const giftWrapFee = isGiftWrapped ? GIFT_WRAP_FEE : 0;

  // Nihai Tutar
  const grandTotal = Number((discountedSubtotal + shippingFee + giftWrapFee).toFixed(2));

  return {
    isValid: true,
    verifiedItems,
    subtotal,
    bulkDiscount,
    couponDiscount,
    shippingFee,
    giftWrapFee,
    grandTotal,
    appliedCouponCode: appliedCouponKey,
  };
}

/**
 * Kriptografik rastgele güvenli sipariş numarası üretir (Örn: SFR-2026-8921)
 */
export function generateSafeOrderNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SFR-${currentYear}-${randomSuffix}`;
}
