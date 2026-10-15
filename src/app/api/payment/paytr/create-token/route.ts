import { NextRequest, NextResponse } from 'next/server';
import { generatePaytrToken, isPaytrConfigured } from '@/lib/paytr';
import { supabaseAdmin } from '@/lib/supabase';

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
      grandTotal,
      shippingFee = 0,
      giftWrapFee = 0,
      couponDiscount = 0,
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

    if (!grandTotal || grandTotal <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz sepet tutarı.' },
        { status: 400 }
      );
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
      totalAmount: grandTotal,
      shippingFee,
      giftWrapFee,
      couponDiscount,
      isGiftWrapped,
      giftNote,
      invoiceType,
      companyName,
      taxOffice,
      vkn,
      items: cartItems,
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
      totalAmount: grandTotal,
      userIp,
      cartItems,
      shippingFee,
      giftWrapFee,
      couponDiscount,
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
