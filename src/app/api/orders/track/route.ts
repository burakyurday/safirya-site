import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

// 5 Aşamalı Üretim İndeks Eşleştirmesi
const STAGE_INDEX_MAP: Record<string, number> = {
  SIPARIS_ALINDI: 0,
  ATOLYEDE_URETIMDE: 1,
  KALITE_KONTROL_PAKETLEME: 2,
  KARGOYA_VERILDI: 3,
  TESLIM_EDILDI: 4,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, email } = body || {};

    if (!orderNumber || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sipariş detaylarını görüntülemek için sipariş numarası ve e-posta adresi zorunludur.',
        },
        { status: 400 }
      );
    }

    const cleanOrderNumber = String(orderNumber).trim().toUpperCase();
    const cleanEmail = String(email).trim().toLowerCase();

    // E-posta format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    // 1. Prisma Veritabanında Siparişi Ara
    try {
      const dbOrder = await prisma.order.findUnique({
        where: { orderNumber: cleanOrderNumber },
        include: {
          user: true,
          items: {
            include: {
              customization: true,
            },
          },
          stagePhotos: true,
        },
      });

      if (dbOrder) {
        // E-posta Doğrulama: Siparişin sahibinin e-postası ile girilen e-posta birebir uyuşmalı
        const orderEmail = (
          dbOrder.guestEmail ||
          dbOrder.user?.email ||
          ''
        )
          .trim()
          .toLowerCase();

        // GÜVENLİK: E-posta uyuşmazsa siparişin varlığı sızdırılmadan standart hata verilir (Anti-Enumeration)
        if (!orderEmail || orderEmail !== cleanEmail) {
          return NextResponse.json(
            {
              success: false,
              error: 'Girdiğiniz sipariş numarası ve e-posta adresiyle eşleşen bir sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.',
            },
            { status: 404 }
          );
        }

        const stageIdx = STAGE_INDEX_MAP[dbOrder.stage] ?? 0;
        const photos = dbOrder.stagePhotos.map((p) => ({
          stageKey: p.stage,
          stageName: p.caption || 'Atölye Aşaması',
          title: p.caption || 'Üretim Güncellemesi',
          photoUrl: p.photoUrl,
          caption: p.caption || '',
          timestamp: new Date(p.takenAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
          }),
        }));

        let formattedAddress = '';
        if (typeof dbOrder.shippingAddress === 'string') {
          formattedAddress = dbOrder.shippingAddress;
        } else if (dbOrder.shippingAddress && typeof dbOrder.shippingAddress === 'object') {
          const addr = dbOrder.shippingAddress as Record<string, any>;
          formattedAddress = [addr.neighborhood, addr.address, addr.district, addr.city]
            .filter(Boolean)
            .join(' ');
        }

        const sanitizedOrder = {
          orderNumber: dbOrder.orderNumber,
          customerName: dbOrder.guestName || dbOrder.user?.name || 'Değerli Müşterimiz',
          email: orderEmail,
          phone: dbOrder.guestPhone || dbOrder.user?.phone || '',
          orderDate: new Date(dbOrder.createdAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          currentStageIndex: stageIdx,
          totalAmount: Number(dbOrder.totalAmount),
          paymentMethod: dbOrder.paymentMethod === 'HAVALE_EFT' ? 'Havale / EFT' : 'Kredi Kartı',
          shippingAddress: formattedAddress,
          cargoCompany: dbOrder.cargoCompany || undefined,
          trackingCode: dbOrder.trackingCode || undefined,
          trackingUrl: dbOrder.trackingUrl || undefined,
          isGiftWrapped: dbOrder.isGiftWrapped,
          giftNote: dbOrder.giftNote || undefined,
          atelierNote:
            photos.length > 0
              ? `${photos[photos.length - 1].caption} (Son aşama: ${photos[photos.length - 1].stageName})`
              : 'Siparişiniz atölye üretim bandında ilerlemektedir.',
          photos:
            photos.length > 0
              ? photos
              : [
                  {
                    stageKey: 'SIPARIS_ALINDI',
                    stageName: '1. Aşama: Sipariş Onayı',
                    title: 'Atölye Üretim Fişi Hazırlandı',
                    photoUrl:
                      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
                    caption: 'Özel kişiselleştirme talebiniz atölye üretim panosuna iletildi.',
                    timestamp: 'Bugün',
                  },
                ],
          items: dbOrder.items.map((it) => ({
            name: it.productName,
            variantTitle: it.variantName || undefined,
            quantity: it.quantity,
            price: Number(it.unitPrice),
            scentNote: it.customization?.selectedScent || undefined,
            customText: it.customization?.customText || undefined,
            colorPalette: it.customization?.selectedColor || undefined,
          })),
        };

        return NextResponse.json({ success: true, order: sanitizedOrder });
      }
    } catch {
      // Prisma bağlantısı henüz aktif değilse devam et
    }

    // 2. Supabase Storage Kontrolü (PayTR & Havale/EFT siparişleri)
    if (supabaseAdmin) {
      try {
        const completedPath = `orders/completed/${cleanOrderNumber}.json`;
        let fileData: any = null;

        const { data: compData } = await supabaseAdmin.storage
          .from('safirya-media')
          .download(completedPath);

        if (compData) {
          fileData = compData;
        } else {
          // Henüz ödenmemiş veya bekleyen Havale/EFT siparişini kontrol et
          const pendingPath = `orders/pending/${cleanOrderNumber}.json`;
          const { data: pendData } = await supabaseAdmin.storage
            .from('safirya-media')
            .download(pendingPath);
          if (pendData) fileData = pendData;
        }

        if (fileData) {
          const text = await fileData.text();
          const savedOrder = JSON.parse(text);

          const orderEmail = (savedOrder.email || savedOrder.customerEmail || '')
            .trim()
            .toLowerCase();

          if (orderEmail && orderEmail === cleanEmail) {
            return NextResponse.json({ success: true, order: savedOrder });
          } else {
            return NextResponse.json(
              {
                success: false,
                error: 'Girdiğiniz sipariş numarası ve e-posta adresiyle eşleşen bir sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.',
              },
              { status: 404 }
            );
          }
        }

        // orders/all.json toplu sipariş listesinde ara
        const { data: allData } = await supabaseAdmin.storage
          .from('safirya-media')
          .download('orders/all.json');
        if (allData) {
          const allText = await allData.text();
          const allOrders = JSON.parse(allText);
          if (Array.isArray(allOrders)) {
            const matched = allOrders.find(
              (o: any) => o.orderNumber && o.orderNumber.toUpperCase() === cleanOrderNumber
            );
            if (matched) {
              const orderEmail = (
                matched.email ||
                matched.customerEmail ||
                matched.guestEmail ||
                ''
              )
                .trim()
                .toLowerCase();

              if (orderEmail && orderEmail === cleanEmail) {
                return NextResponse.json({ success: true, order: matched });
              } else {
                return NextResponse.json(
                  {
                    success: false,
                    error: 'Girdiğiniz sipariş numarası ve e-posta adresiyle eşleşen bir sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.',
                  },
                  { status: 404 }
                );
              }
            }
          }
        }
      } catch {
        // Storage indirme hatası
      }
    }

    // Sipariş hiçbir sunucu kaynağında bulunamadı
    return NextResponse.json(
      {
        success: false,
        error: 'Girdiğiniz sipariş numarası ve e-posta adresiyle eşleşen bir sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.',
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sipariş sorgulama sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
