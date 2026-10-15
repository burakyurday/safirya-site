import crypto from 'crypto';
import { CartItem } from '@/context/StoreContext';

export interface PaytrConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: '1' | '0';
  debugOn: '1' | '0';
  appUrl: string;
}

/**
 * PayTR ayarlarını ortam değişkenlerinden veya panel ayarlarından çeker.
 */
export function getPaytrConfig(): PaytrConfig {
  const merchantId = (process.env.PAYTR_MERCHANT_ID || '').trim();
  const merchantKey = (process.env.PAYTR_MERCHANT_KEY || '').trim();
  const merchantSalt = (process.env.PAYTR_MERCHANT_SALT || '').trim();
  const testMode = process.env.PAYTR_TEST_MODE === '0' ? '0' : '1'; // Güvenlik için varsayılan test modu
  const debugOn = process.env.PAYTR_DEBUG_ON === '1' ? '1' : '0';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://safirya.tr').replace(/\/$/, '');

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
    debugOn,
    appUrl,
  };
}

/**
 * PayTR mağaza bilgilerinin tanımlı olup olmadığını kontrol eder.
 */
export function isPaytrConfigured(): boolean {
  const config = getPaytrConfig();
  return Boolean(config.merchantId && config.merchantKey && config.merchantSalt);
}

/**
 * PayTR Sepet İçeriğini (user_basket) Kurallara Uygun Olarak Hazırlar
 *
 * PayTR Kuralı: Sepetteki (fiyat * adet) toplamının 100 ile çarpımı
 * payment_amount (kuruş) ile KURUŞU KURUŞUNA BİREBİR EŞİT OLMALIDIR.
 * Ayrıca PayTR sepet satırlarında eksi tutar kabul etmez.
 */
export function buildPaytrBasket(params: {
  cartItems: CartItem[];
  shippingFee: number;
  giftWrapFee: number;
  couponDiscount: number;
  grandTotal: number;
}): string {
  const { cartItems, shippingFee, giftWrapFee, couponDiscount, grandTotal } = params;

  // Sepet satırları dizisi [ [ürün_adı, birim_fiyat_TL, adet] ]
  const basket: Array<[string, string, number]> = [];

  // Eğer kupon indirimi yoksa veya 0 ise standart ürünleri ekle
  if (couponDiscount <= 0) {
    let itemsTotal = 0;

    cartItems.forEach((item) => {
      const price = item.price;
      const cleanName = item.name.replace(/["\\]/g, '').substring(0, 45);
      basket.push([cleanName, price.toFixed(2), item.quantity]);
      itemsTotal += price * item.quantity;
    });

    if (shippingFee > 0) {
      basket.push(['Kargo ve Teslimat', shippingFee.toFixed(2), 1]);
      itemsTotal += shippingFee;
    }

    if (giftWrapFee > 0) {
      basket.push(['Özel Hediye Paketi', giftWrapFee.toFixed(2), 1]);
      itemsTotal += giftWrapFee;
    }

    // Kuruş yuvarlama farkı varsa ilk kaleme yansıt
    const diff = Number((grandTotal - itemsTotal).toFixed(2));
    if (Math.abs(diff) > 0 && basket.length > 0) {
      const firstPrice = parseFloat(basket[0][1]);
      const adjustedPrice = Math.max(0.01, firstPrice + diff);
      basket[0][1] = adjustedPrice.toFixed(2);
    }
  } else {
    // İndirim varsa: PayTR eksi fiyat kabul etmediğinden,
    // tüm sepet toplamını grandTotal ile birebir eşitleyen kalemler oluşturulur
    let remainingAmount = grandTotal;

    // Hediye ve Kargo varsa önce onları ekle
    if (shippingFee > 0) {
      basket.push(['Kargo ve Teslimat', shippingFee.toFixed(2), 1]);
      remainingAmount -= shippingFee;
    }
    if (giftWrapFee > 0) {
      basket.push(['Özel Hediye Paketi', giftWrapFee.toFixed(2), 1]);
      remainingAmount -= giftWrapFee;
    }

    // Kalan tutarı sepetteki ürün adetlerine oranla dağıt
    const totalProductOriginalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let allocatedSum = 0;
    cartItems.forEach((item, index) => {
      const originalItemTotal = item.price * item.quantity;
      const ratio = totalProductOriginalPrice > 0 ? originalItemTotal / totalProductOriginalPrice : 1 / cartItems.length;
      
      let itemShare = Number((remainingAmount * ratio).toFixed(2));
      if (index === cartItems.length - 1) {
        // Son üründe kalan kuruşu dengele
        itemShare = Number((remainingAmount - allocatedSum).toFixed(2));
      } else {
        allocatedSum += itemShare;
      }

      const unitPrice = Math.max(0.01, itemShare / item.quantity);
      const cleanName = item.name.replace(/["\\]/g, '').substring(0, 45);
      basket.push([cleanName, unitPrice.toFixed(2), item.quantity]);
    });
  }

  return Buffer.from(JSON.stringify(basket), 'utf-8').toString('base64');
}

export interface CreatePaytrTokenParams {
  orderNumber: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  totalAmount: number;
  userIp: string;
  cartItems: CartItem[];
  shippingFee?: number;
  giftWrapFee?: number;
  couponDiscount?: number;
}

export interface CreatePaytrTokenResponse {
  success: boolean;
  token?: string;
  orderNumber?: string;
  error?: string;
  reason?: string;
  testMode?: boolean;
}

/**
 * PayTR iFrame API için token üretir.
 * https://www.paytr.com/odeme/api/get-token adresine istek atar.
 */
export async function generatePaytrToken(
  params: CreatePaytrTokenParams
): Promise<CreatePaytrTokenResponse> {
  const config = getPaytrConfig();

  if (!isPaytrConfigured()) {
    return {
      success: false,
      error: 'PayTR mağaza bilgileri eksik. Lütfen PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT çevre değişkenlerini tanımlayınız.',
    };
  }

  try {
    const paymentAmountKurus = Math.round(params.totalAmount * 100).toString();

    const userBasket = buildPaytrBasket({
      cartItems: params.cartItems,
      shippingFee: params.shippingFee || 0,
      giftWrapFee: params.giftWrapFee || 0,
      couponDiscount: params.couponDiscount || 0,
      grandTotal: params.totalAmount,
    });

    const merchantOkUrl = `${config.appUrl}/odeme/sonuc?status=success&oid=${params.orderNumber}`;
    const merchantFailUrl = `${config.appUrl}/odeme/sonuc?status=failed&oid=${params.orderNumber}`;

    const noInstallment = '0'; // 0: Taksitli ödeme açık (PayTR panel izinlerine göre)
    const maxInstallment = '12'; // Maksimum 12 taksit
    const currency = 'TL';
    const timeoutLimit = '30'; // 30 dakika

    // ── PayTR Token Hash Hesaplama ──
    // hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
    const hashString = `${config.merchantId}${params.userIp}${params.orderNumber}${params.email.trim()}${paymentAmountKurus}${userBasket}${noInstallment}${maxInstallment}${currency}${config.testMode}`;

    const paytrToken = crypto
      .createHmac('sha256', config.merchantKey)
      .update(hashString + config.merchantSalt)
      .digest('base64');

    // ── PayTR API'sine POST isteği (x-www-form-urlencoded) ──
    const formParams = new URLSearchParams();
    formParams.append('merchant_id', config.merchantId);
    formParams.append('user_ip', params.userIp);
    formParams.append('merchant_oid', params.orderNumber);
    formParams.append('email', params.email.trim());
    formParams.append('payment_amount', paymentAmountKurus);
    formParams.append('paytr_token', paytrToken);
    formParams.append('user_basket', userBasket);
    formParams.append('user_name', params.fullName.trim());
    formParams.append('user_address', params.address.trim());
    formParams.append('user_phone', params.phone.replace(/[^0-9]/g, ''));
    formParams.append('merchant_ok_url', merchantOkUrl);
    formParams.append('merchant_fail_url', merchantFailUrl);
    formParams.append('timeout_limit', timeoutLimit);
    formParams.append('currency', currency);
    formParams.append('test_mode', config.testMode);
    formParams.append('no_installment', noInstallment);
    formParams.append('max_installment', maxInstallment);
    formParams.append('debug_on', config.debugOn);
    formParams.append('lang', 'tr');

    const res = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    });

    const data = await res.json();

    if (data.status === 'success' && data.token) {
      return {
        success: true,
        token: data.token,
        orderNumber: params.orderNumber,
        testMode: config.testMode === '1',
      };
    } else {
      return {
        success: false,
        error: data.reason || 'PayTR token oluşturulamadı.',
        reason: data.reason,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'PayTR API sunucusuna bağlanırken hata oluştu.',
    };
  }
}

/**
 * PayTR Webhook Bildirim URL Doğrulama (Callback Verification)
 * PayTR ödeme sonucunda POST atarak sonucu bildirir.
 */
export function verifyPaytrCallback(body: Record<string, string>): {
  isValid: boolean;
  orderNumber: string;
  status: 'success' | 'failed';
  totalAmountKurus: number;
  failedReasonCode?: string;
  failedReasonMsg?: string;
} {
  const config = getPaytrConfig();
  const {
    merchant_oid,
    status,
    total_amount,
    hash,
    failed_reason_code,
    failed_reason_msg,
  } = body;

  // PayTR Doğrulama Formülü:
  // hash_str = merchant_oid + merchant_salt + status + total_amount;
  const hashString = `${merchant_oid}${config.merchantSalt}${status}${total_amount}`;
  const calculatedHash = crypto
    .createHmac('sha256', config.merchantKey)
    .update(hashString)
    .digest('base64');

  const isValid = hash === calculatedHash;

  return {
    isValid,
    orderNumber: merchant_oid,
    status: status === 'success' ? 'success' : 'failed',
    totalAmountKurus: parseInt(total_amount, 10) || 0,
    failedReasonCode: failed_reason_code,
    failedReasonMsg: failed_reason_msg,
  };
}
