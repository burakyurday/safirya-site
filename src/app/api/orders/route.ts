import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { getAdminSessionServer } from '@/lib/adminAuth';
import {
  verifyCartAndCalculateTotal,
  generateSafeOrderNumber,
} from '@/lib/orderVerification';
import { generateSafiryaEmailHtml } from '@/lib/notifications/email';
import { sendEmail } from '@/lib/email/sender';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'safirya-media';

// POST /api/orders - Güvenli Sipariş Oluşturma
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      city,
      district,
      neighborhood,
      address,
      postalCode,
      orderNote,
      invoiceType = 'INDIVIDUAL',
      companyName,
      taxOffice,
      vkn,
      paymentMethod = 'HAVALE_EFT',
      cartItems,
      couponCode,
      isGiftWrapped = false,
      giftNote,
      contractId,
      contractStatus,
      contractVerificationCode,
      contractSignedAt,
      contractSignedBy,
      signatureDataUrl,
    } = body;

    // 1. Temel Girdi Doğrulamaları
    if (!fullName || !email || !phone || !city || !district || !address) {
      return NextResponse.json(
        { success: false, error: 'Eksik adres veya iletişim bilgisi. Lütfen tüm alanları doldurunuz.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).' },
        { status: 400 }
      );
    }

    // 2. Fiyat ve Sepet Güvenlik Doğrulaması (Fiyat Manipülasyonuna Karşı Korumalı)
    const verification = verifyCartAndCalculateTotal({
      cartItems,
      couponCode,
      isGiftWrapped,
    });

    if (!verification.isValid || verification.verifiedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Sepet doğrulanamadı.' },
        { status: 400 }
      );
    }

    // 3. Benzersiz Güvenli Sipariş Numarası Üret
    const orderNumber = generateSafeOrderNumber();
    const cleanCustomerName = String(fullName).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const fullShippingAddress = `${neighborhood ? neighborhood + ' ' : ''}${address} ${district} / ${city} ${postalCode || ''}`.trim();

    const isPaid = paymentMethod === 'PAYTR_TEST';
    const paymentStatus = isPaid ? 'ODENDI' : 'BEKLIYOR';

    const orderRecord = {
      orderNumber,
      customerName: cleanCustomerName,
      email: cleanEmail,
      customerEmail: cleanEmail,
      phone: cleanPhone,
      customerPhone: cleanPhone,
      shippingAddress: {
        fullName: cleanCustomerName,
        phone: cleanPhone,
        city,
        district,
        neighborhood,
        address,
        postalCode,
        fullAddress: fullShippingAddress,
      },
      billingAddress: {
        invoiceType,
        companyName: companyName || '',
        taxOffice: taxOffice || '',
        vkn: vkn || '',
      },
      orderNote: orderNote ? String(orderNote).trim() : undefined,
      items: verification.verifiedItems,
      subtotal: verification.subtotal,
      discountTotal: verification.couponDiscount + verification.bulkDiscount,
      shippingFee: verification.shippingFee,
      isGiftWrapped,
      giftWrapFee: verification.giftWrapFee,
      giftNote: isGiftWrapped ? giftNote : undefined,
      totalAmount: verification.grandTotal,
      stage: 'SIPARIS_ALINDI',
      paymentMethod,
      paymentStatus,
      contractId: contractId || undefined,
      contractStatus: contractStatus || (verification.verifiedItems.some((it) => it.customText) ? 'ONAYLANDI' : undefined),
      contractVerificationCode: contractVerificationCode || undefined,
      contractSignedAt: contractSignedAt || undefined,
      contractSignedBy: contractSignedBy || undefined,
      signatureDataUrl: signatureDataUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    // 4. Prisma Veritabanına Kayıt Denemesi
    let prismaSaved = false;
    try {
      await prisma.order.create({
        data: {
          orderNumber,
          guestName: cleanCustomerName,
          guestEmail: cleanEmail,
          guestPhone: cleanPhone,
          shippingAddress: orderRecord.shippingAddress,
          billingAddress: orderRecord.billingAddress,
          subtotal: verification.subtotal,
          discountTotal: verification.couponDiscount + verification.bulkDiscount,
          shippingFee: verification.shippingFee,
          isGiftWrapped,
          giftWrapFee: verification.giftWrapFee,
          giftNote: isGiftWrapped ? giftNote : null,
          totalAmount: verification.grandTotal,
          stage: 'SIPARIS_ALINDI',
          paymentStatus: paymentStatus === 'ODENDI' ? 'ODENDI' : 'BEKLIYOR',
          paymentMethod,
          items: {
            create: verification.verifiedItems.map((it) => ({
              productName: it.name,
              variantName: it.variantTitle || null,
              unitPrice: it.unitPrice,
              quantity: it.quantity,
              totalAmount: it.totalAmount,
              productId: it.productId.startsWith('cat-') || it.productId.startsWith('sfr-')
                ? 'sfr-cat-1' // Şemada geçerli productId referansı
                : it.productId,
            })),
          },
        },
      });
      prismaSaved = true;
    } catch {
      // Prisma bağlantısı henüz aktif değilse bulut depolama devralır
    }

    // 5. Supabase Bulut Depolamaya Kalıcı Kayıt
    if (supabaseAdmin) {
      try {
        const orderFolder = isPaid ? 'completed' : 'pending';
        const orderFilePath = `orders/${orderFolder}/${orderNumber}.json`;
        const payload = Buffer.from(JSON.stringify(orderRecord, null, 2), 'utf-8');

        await supabaseAdmin.storage.from(BUCKET_NAME).upload(orderFilePath, payload, {
          contentType: 'application/json',
          upsert: true,
        });

        // Toplu sipariş listesini (orders/all.json) de güncelle
        try {
          const allPath = 'orders/all.json';
          const { data: allData } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .download(allPath);
          let ordersList: any[] = [];
          if (allData) {
            const text = await allData.text();
            ordersList = JSON.parse(text);
          }
          ordersList.unshift(orderRecord);
          await supabaseAdmin.storage.from(BUCKET_NAME).upload(
            allPath,
            Buffer.from(JSON.stringify(ordersList, null, 2), 'utf-8'),
            { contentType: 'application/json', upsert: true }
          );
        } catch {}
      } catch (storageErr) {
        console.warn('Supabase Storage sipariş yedekleme uyarısı:', storageErr);
      }
    }

    // 6. Müşteriye Sipariş Onay E-Postası Gönder
    try {
      const emailCaption =
        paymentMethod === 'HAVALE_EFT'
          ? `₺${verification.grandTotal.toFixed(2)} tutarındaki Havale/EFT siparişiniz başarıyla alındı. Lütfen açıklama alanına #${orderNumber} yazarak banka transferinizi tamamlayınız ve dekontunuzu WhatsApp destek hattımıza (+90 532 555 72 34) iletiniz. Dekont onayının ardından siparişiniz derhal üretime alınacaktır.`
          : `₺${verification.grandTotal.toFixed(2)} tutarındaki siparişiniz onaylandı. Zanaatkar ustalarımız atölyemizde hazırlığa başladı.`;

      const emailHtml = generateSafiryaEmailHtml({
        to: cleanEmail,
        customerName: cleanCustomerName,
        orderNumber,
        stageName: paymentMethod === 'HAVALE_EFT' ? 'Sipariş Alındı (Havale Bekleniyor)' : 'Sipariş Onaylandı',
        caption: emailCaption,
      });

      await sendEmail({
        to: cleanEmail,
        subject: `Siparişiniz Alındı! #${orderNumber} - Safirya Atölye`,
        html: emailHtml,
        from: process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>',
      });
    } catch (emailErr) {
      console.warn('Sipariş onay e-postası gönderme hatası:', emailErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      order: orderRecord,
      prismaSaved,
    });
  } catch (error: any) {
    console.error('Sipariş oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Sipariş oluşturulurken sunucu hatası meydana geldi.' },
      { status: 500 }
    );
  }
}

// GET /api/orders - Yönetici İçin Tüm Siparişleri Listeleme (Korumalı)
export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionServer();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
        { status: 401 }
      );
    }

    // 1. Prisma'dan dene
    try {
      const dbOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          stagePhotos: true,
        },
      });

      if (dbOrders && dbOrders.length > 0) {
        return NextResponse.json({ success: true, orders: dbOrders, source: 'database' });
      }
    } catch {}

    // 2. Supabase Storage orders/all.json kontrol et
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.storage.from(BUCKET_NAME).download('orders/all.json');
        if (data) {
          const text = await data.text();
          const orders = JSON.parse(text);
          return NextResponse.json({ success: true, orders, source: 'cloud_storage' });
        }
      } catch {}
    }

    return NextResponse.json({ success: true, orders: [], source: 'empty' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Siparişler listelenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders - Sipariş Aşaması ve Kargo Takip Bilgilerini Güncelleme
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSessionServer();
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderNumber, stage, cargoCompany, trackingCode } = body;

    if (!orderNumber || !stage) {
      return NextResponse.json(
        { success: false, error: 'Sipariş numarası ve aşama bilgisi zorunludur.' },
        { status: 400 }
      );
    }

    // 1. Prisma Veritabanında Güncelle
    try {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          stage,
          cargoCompany: cargoCompany || undefined,
          trackingCode: trackingCode || undefined,
        },
      });
    } catch {}

    // 2. Supabase Storage orders/all.json dosyasını güncelle
    if (supabaseAdmin) {
      try {
        const allPath = 'orders/all.json';
        const { data } = await supabaseAdmin.storage.from(BUCKET_NAME).download(allPath);
        if (data) {
          const text = await data.text();
          const list = JSON.parse(text);
          if (Array.isArray(list)) {
            const updated = list.map((ord: any) =>
              ord.orderNumber === orderNumber
                ? {
                    ...ord,
                    stage,
                    ...(cargoCompany ? { cargoCompany } : {}),
                    ...(trackingCode !== undefined ? { trackingCode, cargoTrackingNo: trackingCode } : {}),
                  }
                : ord
            );
            await supabaseAdmin.storage.from(BUCKET_NAME).upload(
              allPath,
              Buffer.from(JSON.stringify(updated, null, 2), 'utf-8'),
              { contentType: 'application/json', upsert: true }
            );
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Sipariş #${orderNumber} aşaması "${stage}" olarak güncellendi.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sipariş güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

