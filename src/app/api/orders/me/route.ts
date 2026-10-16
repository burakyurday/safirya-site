import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'safirya-media';

// 5 Aşamalı Üretim ve Durum Tanımları
const STAGE_CONFIG: Record<string, { index: number; label: string; step: string }> = {
  SIPARIS_ALINDI: { index: 0, label: 'Sipariş Onaylandı', step: 'Aşama 1/5' },
  ATOLYEDE_URETIMDE: { index: 1, label: 'Atölyede Üretimde', step: 'Aşama 2/5' },
  KALITE_KONTROL_PAKETLEME: { index: 2, label: 'Kalite Kontrol & Paketleme', step: 'Aşama 3/5' },
  KARGOYA_VERILDI: { index: 3, label: 'Kargoya Verildi', step: 'Aşama 4/5' },
  TESLIM_EDILDI: { index: 4, label: 'Teslim Edildi', step: 'Aşama 5/5' },
};

function formatTurkishDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'Tarih Belirtilmedi';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateInput);
  }
}

function computeCargoTrackingUrl(company?: string, code?: string): string | undefined {
  if (!code) return undefined;
  const comp = (company || '').toLowerCase();
  if (comp.includes('aras')) {
    return `https://www.araskargo.com.tr/kargo-takip?code=${encodeURIComponent(code)}`;
  }
  if (comp.includes('mng')) {
    return `https://www.mngkargo.com.tr/gonderitakip?code=${encodeURIComponent(code)}`;
  }
  if (comp.includes('surat') || comp.includes('sürat')) {
    return `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${encodeURIComponent(code)}`;
  }
  if (comp.includes('ptt')) {
    return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(code)}`;
  }
  return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(code)}`;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Kullanıcı Oturum Token Doğrulaması (Cookie veya Authorization Header)
    const cookieToken = req.cookies.get(USER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Siparişlerinizi görüntülemek için lütfen giriş yapınız.', orders: [] },
        { status: 401 }
      );
    }

    const payload = await verifyUserSessionToken(token);
    if (!payload || !payload.email) {
      return NextResponse.json(
        { success: false, error: 'Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapınız.', orders: [] },
        { status: 401 }
      );
    }

    const userEmail = payload.email.trim().toLowerCase();
    const userId = payload.id;

    const mergedOrdersMap = new Map<string, any>();

    // 2. Prisma PostgreSQL Veritabanından Siparişleri Çek
    try {
      const dbOrders = await prisma.order.findMany({
        where: {
          OR: [
            { userId: userId },
            { guestEmail: { equals: userEmail, mode: 'insensitive' } },
            { user: { email: { equals: userEmail, mode: 'insensitive' } } },
          ],
        },
        include: {
          user: true,
          items: {
            include: {
              customization: true,
              product: {
                select: {
                  images: true,
                },
              },
            },
          },
          stagePhotos: {
            orderBy: { takenAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (Array.isArray(dbOrders)) {
        for (const ord of dbOrders) {
          const stageKey = ord.stage || 'SIPARIS_ALINDI';
          const stageInfo = STAGE_CONFIG[stageKey] || {
            index: 0,
            label: 'Sipariş Onaylandı',
            step: 'Aşama 1/5',
          };

          let formattedAddress = '';
          if (typeof ord.shippingAddress === 'string') {
            formattedAddress = ord.shippingAddress;
          } else if (ord.shippingAddress && typeof ord.shippingAddress === 'object') {
            const addr = ord.shippingAddress as Record<string, any>;
            formattedAddress = [
              addr.neighborhood,
              addr.address,
              addr.district,
              addr.city,
              addr.postalCode,
            ]
              .filter(Boolean)
              .join(' ');
          }

          const photos = (ord.stagePhotos || []).map((p) => ({
            stageKey: p.stage,
            stageName: p.caption || 'Atölye Aşaması',
            title: p.caption || 'Üretim Güncellemesi',
            photoUrl: p.photoUrl,
            caption: p.caption || '',
            timestamp: formatTurkishDate(p.takenAt),
          }));

          const items = (ord.items || []).map((it) => {
            const productImage = it.product?.images?.[0] || undefined;
            return {
              id: it.id,
              name: it.productName,
              productName: it.productName,
              variantTitle: it.variantName || undefined,
              variantName: it.variantName || undefined,
              quantity: it.quantity,
              unitPrice: Number(it.unitPrice),
              price: Number(it.unitPrice),
              totalAmount: Number(it.totalAmount),
              image: productImage,
              customText: it.customization?.customText || undefined,
              selectedScent: it.customization?.selectedScent || undefined,
              selectedColor: it.customization?.selectedColor || undefined,
              extraNote: it.customization?.extraNote || undefined,
            };
          });

          mergedOrdersMap.set(ord.orderNumber.toUpperCase(), {
            orderNumber: ord.orderNumber,
            orderId: ord.id,
            customerName: ord.guestName || ord.user?.name || payload.name,
            email: ord.guestEmail || ord.user?.email || userEmail,
            phone: ord.guestPhone || ord.user?.phone || payload.phone || '',
            date: formatTurkishDate(ord.createdAt),
            createdAt: ord.createdAt.toISOString(),
            totalAmount: Number(ord.totalAmount),
            subtotal: Number(ord.subtotal),
            discountTotal: Number(ord.discountTotal),
            shippingFee: Number(ord.shippingFee),
            stage: stageKey,
            stageIndex: stageInfo.index,
            stageLabel: stageInfo.label,
            stageStep: stageInfo.step,
            paymentMethod: ord.paymentMethod === 'HAVALE_EFT' ? 'Havale / EFT' : 'Kredi Kartı',
            paymentStatus: ord.paymentStatus || 'BEKLIYOR',
            shippingAddress: formattedAddress,
            cargoCompany: ord.cargoCompany || undefined,
            trackingCode: ord.trackingCode || undefined,
            trackingUrl:
              ord.trackingUrl || computeCargoTrackingUrl(ord.cargoCompany || undefined, ord.trackingCode || undefined),
            isGiftWrapped: Boolean(ord.isGiftWrapped),
            giftNote: ord.giftNote || undefined,
            items,
            photos,
            source: 'database',
          });
        }
      }
    } catch (dbError) {
      console.warn('Prisma sipariş okuma hatası / henüz tablo senkronize değil:', dbError);
    }

    // 3. Supabase Cloud Storage Kontrolü (orders/all.json)
    if (supabaseAdmin) {
      try {
        const { data: allData } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .download('orders/all.json');

        if (allData) {
          const text = await allData.text();
          const allOrders = JSON.parse(text);

          if (Array.isArray(allOrders)) {
            for (const ord of allOrders) {
              const ordEmail = (ord.email || ord.customerEmail || ord.guestEmail || '')
                .trim()
                .toLowerCase();
              const ordUserId = ord.userId;

              const isOwner =
                (ordEmail && ordEmail === userEmail) ||
                (ordUserId && ordUserId === userId);

              if (isOwner && ord.orderNumber) {
                const cleanNo = ord.orderNumber.toUpperCase();
                // Veritabanında zaten varsa veritabanı önceliklidir, yoksa ekle
                if (!mergedOrdersMap.has(cleanNo)) {
                  const stageKey = ord.stage || 'SIPARIS_ALINDI';
                  const stageInfo = STAGE_CONFIG[stageKey] || {
                    index: 0,
                    label: 'Sipariş Onaylandı',
                    step: 'Aşama 1/5',
                  };

                  let formattedAddress = '';
                  if (typeof ord.shippingAddress === 'string') {
                    formattedAddress = ord.shippingAddress;
                  } else if (ord.shippingAddress && typeof ord.shippingAddress === 'object') {
                    const addr = ord.shippingAddress as Record<string, any>;
                    formattedAddress =
                      addr.fullAddress ||
                      [addr.neighborhood, addr.address, addr.district, addr.city]
                        .filter(Boolean)
                        .join(' ');
                  }

                  const trackingCode = ord.trackingCode || ord.cargoTrackingNo || undefined;
                  const cargoCompany = ord.cargoCompany || undefined;

                  mergedOrdersMap.set(cleanNo, {
                    orderNumber: ord.orderNumber,
                    orderId: ord.id || `ord-${ord.orderNumber}`,
                    customerName: ord.customerName || payload.name,
                    email: ordEmail || userEmail,
                    phone: ord.phone || ord.customerPhone || payload.phone || '',
                    date: formatTurkishDate(ord.createdAt || ord.date),
                    createdAt: ord.createdAt || new Date().toISOString(),
                    totalAmount: Number(ord.totalAmount || 0),
                    subtotal: Number(ord.subtotal || ord.totalAmount || 0),
                    discountTotal: Number(ord.discountTotal || 0),
                    shippingFee: Number(ord.shippingFee || 0),
                    stage: stageKey,
                    stageIndex: stageInfo.index,
                    stageLabel: stageInfo.label,
                    stageStep: stageInfo.step,
                    paymentMethod:
                      ord.paymentMethod === 'HAVALE_EFT' ? 'Havale / EFT' : 'Kredi Kartı',
                    paymentStatus: ord.paymentStatus || 'BEKLIYOR',
                    shippingAddress: formattedAddress,
                    cargoCompany,
                    trackingCode,
                    trackingUrl:
                      ord.trackingUrl || computeCargoTrackingUrl(cargoCompany, trackingCode),
                    isGiftWrapped: Boolean(ord.isGiftWrapped),
                    giftNote: ord.giftNote || undefined,
                    contractStatus: ord.contractStatus,
                    contractVerificationCode: ord.contractVerificationCode,
                    contractSignedAt: ord.contractSignedAt,
                    items: (ord.items || []).map((it: any) => ({
                      id: it.id,
                      name: it.name || it.productName || 'Safirya Ürünü',
                      productName: it.productName || it.name || 'Safirya Ürünü',
                      variantTitle: it.variantTitle || it.variantName || undefined,
                      variantName: it.variantName || it.variantTitle || undefined,
                      quantity: it.quantity || 1,
                      unitPrice: Number(it.unitPrice || it.price || 0),
                      price: Number(it.price || it.unitPrice || 0),
                      totalAmount: Number(it.totalAmount || (it.price || 0) * (it.quantity || 1)),
                      image: it.image || it.imageUrl || undefined,
                      customText: it.customText || it.customization?.customText || undefined,
                      selectedScent: it.scentNote || it.customization?.selectedScent || undefined,
                      selectedColor: it.colorPalette || it.customization?.selectedColor || undefined,
                    })),
                    photos: (ord.stagePhotos || ord.photos || []).map((p: any) => ({
                      stageKey: p.stageKey || p.stage || stageKey,
                      stageName: p.stageName || p.caption || 'Atölye Aşaması',
                      title: p.title || p.caption || 'Üretim Güncellemesi',
                      photoUrl: p.photoUrl,
                      caption: p.caption || '',
                      timestamp: p.timestamp || formatTurkishDate(p.takenAt),
                    })),
                    source: 'supabase_storage',
                  });
                }
              }
            }
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage sipariş listesi okuma uyarısı:', storageErr);
      }
    }

    // Tarihe göre yeniden eskiye sırala
    const sortedOrders = Array.from(mergedOrdersMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      count: sortedOrders.length,
      orders: sortedOrders,
    });
  } catch (error: any) {
    console.error('Kullanıcı siparişleri getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Siparişleriniz alınırken bir sunucu hatası meydana geldi.',
        orders: [],
      },
      { status: 500 }
    );
  }
}
