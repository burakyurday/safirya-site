import { NextRequest, NextResponse } from 'next/server';
import { generatePaytrToken, isPaytrConfigured } from '@/lib/paytr';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyCartAndCalculateTotal } from '@/lib/orderVerification';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'safirya-media';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      email,
      fullName,
      phone,
      city,
      district,
      neighborhood,
      address,
      postalCode,
      orderNote,
      cartItems,
      grandTotal: clientGrandTotal,
      couponCode,
      isGiftWrapped = false,
      giftNote,
      invoiceType = 'INDIVIDUAL',
      companyName,
      taxOffice,
      vkn,
    } = body;

    // 1. Temel Doğrulamalar
    if (!orderNumber || !email || !fullName || !phone || !address || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Eksik sipariş bilgisi. Lütfen tüm alanları doldurunuz.' },
        { status: 400 }
      );
    }

    // 2. Fiyat ve Sepet Doğrulaması (Sunucu Tabanlı Güvenlik Kontrolü)
    const verification = verifyCartAndCalculateTotal({
      cartItems,
      couponCode,
      isGiftWrapped,
    });

    if (!verification.isValid || verification.verifiedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Sepet tutarı doğrulanamadı.' },
        { status: 400 }
      );
    }

    const verifiedGrandTotal = verification.grandTotal;
    const verifiedShippingFee = verification.shippingFee;
    const verifiedGiftWrapFee = verification.giftWrapFee;
    const verifiedCouponDiscount = verification.couponDiscount;

    if (clientGrandTotal && Math.abs(Number(clientGrandTotal) - verifiedGrandTotal) > 1.0) {
      console.warn('Güvenlik Uyarısı: İstemci fiyatı ile sunucu fiyatı uyuşmuyor. Sunucu fiyatı uygulandı.', {
        clientTotal: clientGrandTotal,
        verifiedTotal: verifiedGrandTotal,
        orderNumber,
      });
    }

    // 2. Müşteri IP Adresini Al
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    let userIp = '127.0.0.1';

    if (forwardedFor) {
      userIp = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      userIp = realIp.trim();
    }

    // 3. PayTR Yapılandırma Kontrolü
    if (!isPaytrConfigured()) {
      return NextResponse.json(
        {
          success: false,
          isConfigured: false,
          error:
            'PayTR mağaza bilgileri henüz sisteme girilmedi. Lütfen .env dosyasında PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT alanlarını doldurunuz.',
        },
        { status: 200 }
      );
    }

    // 4. Bekleyen Siparişi Buluta (Supabase Storage) Kaydet
    // (Callback geldiğinde veya kullanıcı tarayıcıyı kapatsa dahi sipariş kaybolmaz)
    const fullShippingAddress = `${neighborhood ? neighborhood + ' ' : ''}${address} ${district} / ${city} ${postalCode || ''}`.trim();

    const pendingOrderData = {
      orderNumber,
      email: email.trim(),
      customerName: fullName.trim(),
      phone: phone.trim(),
      shippingAddress: fullShippingAddress,
      city,
      district,
      neighborhood,
      address,
      postalCode,
      orderNote,
      totalAmount: verifiedGrandTotal,
      shippingFee: verifiedShippingFee,
      giftWrapFee: verifiedGiftWrapFee,
      couponDiscount: verifiedCouponDiscount,
      isGiftWrapped,
      giftNote,
      invoiceType,
      companyName,
      taxOffice,
      vkn,
      items: verification.verifiedItems,
      stage: 'SIPARIS_ALINDI',
      paymentStatus: 'BEKLIYOR',
      paymentMethod: 'PAYTR_KREDI_KARTI',
      createdAt: new Date().toISOString(),
      userIp,
    };

    if (supabaseAdmin) {
      try {
        const orderPath = `orders/pending/${orderNumber}.json`;
        const payload = Buffer.from(JSON.stringify(pendingOrderData, null, 2), 'utf-8');
        await supabaseAdmin.storage.from(BUCKET_NAME).upload(orderPath, payload, {
          contentType: 'application/json',
          upsert: true,
        });
      } catch (storageErr) {
        console.warn('Pending order storage backup warning:', storageErr);
      }
    }

    // 5. PayTR Token Üret
    const result = await generatePaytrToken({
      orderNumber,
      email,
      fullName,
      phone,
      address: fullShippingAddress,
      totalAmount: verifiedGrandTotal,
      userIp,
      cartItems: verification.verifiedItems as any,
      shippingFee: verifiedShippingFee,
      giftWrapFee: verifiedGiftWrapFee,
      couponDiscount: verifiedCouponDiscount,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'PayTR ödeme oturumu başlatılamadı.',
          reason: result.reason,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      orderNumber,
      testMode: result.testMode,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Ödeme oturumu oluşturulurken beklenmeyen bir hata oluştu.',
      },
      { status: 500 }
    );
  }
}
