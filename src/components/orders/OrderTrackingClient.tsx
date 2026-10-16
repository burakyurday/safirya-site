'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  ExternalLink,
  X,
  Flame,
  Feather,
  Palette,
  Tag,
  Gift,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface StagePhoto {
  stageKey: string;
  stageName: string;
  title: string;
  photoUrl: string;
  caption: string;
  timestamp: string;
}

interface OrderTrackingData {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  orderDate: string;
  currentStageIndex: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  cargoCompany?: string;
  trackingCode?: string;
  trackingUrl?: string;
  isGiftWrapped?: boolean;
  giftNote?: string;
  atelierNote: string;
  orderId?: string;
  contractStatus?: 'BEKLIYOR' | 'ONAYLANDI' | 'IPTAL';
  contractVerificationCode?: string;
  contractSignedAt?: string;
  photos: StagePhoto[];
  items: Array<{
    name: string;
    variantTitle?: string;
    quantity: number;
    price: number;
    image?: string;
    scentNote?: string;
    customText?: string;
    colorPalette?: string;
    bulkTierLabel?: string;
  }>;
}

// 5 AŞAMALI ATÖLYE ZAMAN ÇİZELGESİ ŞABLONU
const STAGES_MASTER = [
  {
    key: 'SIPARIS_ALINDI',
    stepNumber: '01',
    label: 'Sipariş Alındı',
    desc: 'Sipariş ve kişiselleştirme detayları onaylandı, hammadde reçetesi hazırlandı.',
  },
  {
    key: 'ATOLYEDE_URETIMDE',
    stepNumber: '02',
    label: 'Atölyede Üretimde',
    desc: 'Ustalarımız ürününüzü özenle hazırlıyor, fitil hizalaması ve doğal döküm yapılıyor.',
  },
  {
    key: 'KALITE_KONTROL_PAKETLEME',
    stepNumber: '03',
    label: 'Kalite Kontrol & Paketleme',
    desc: 'Koku/form kontrolü yapılıyor, özel hediye notunuz kraft ambalajla mühürleniyor.',
  },
  {
    key: 'KARGOYA_VERILDI',
    stepNumber: '04',
    label: 'Kargoya Verildi',
    desc: 'Kargo kuryesine teslim edildi, takip numarası ile transfer aşamasında.',
  },
  {
    key: 'TESLIM_EDILDI',
    stepNumber: '05',
    label: 'Teslim Edildi',
    desc: 'Siparişiniz adresinize güvenle ulaştırıldı. İyi günlerde kullanınız!',
  },
];

// Canlı siparişler API ve doğrulanmış atölye kayıtları üzerinden sorgulanır


function maskPhone(phone?: string): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length < 7) return clean;
  const start = clean.slice(0, Math.min(8, clean.length - 4));
  const end = clean.slice(-2);
  return `${start} *** **${end}`;
}

function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function OrderTrackingContent() {
  const { currentUser } = useStore();
  const searchParams = useSearchParams();
  const paramOrderNumber = searchParams.get('orderNumber') || '';
  const paramEmail = searchParams.get('email') || '';

  const [orderQuery, setOrderQuery] = useState(paramOrderNumber || '');
  const [emailInput, setEmailInput] = useState(paramEmail || '');
  const [activeOrder, setActiveOrder] = useState<OrderTrackingData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<StagePhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLookup = async (queryNo: string, contactEmail: string) => {
    setSearchError(null);
    const cleanNo = (queryNo || '').trim().toUpperCase();
    const cleanEmail = (contactEmail || '').trim().toLowerCase();

    // 1. ZORUNLU GÜVENLİK ALANLARI KONTROLÜ
    // Takip numarası ve e-posta adresi BİRLİKTE girilmek zorundadır.
    if (!cleanNo || !cleanEmail) {
      setActiveOrder(null);
      if (!cleanNo && !cleanEmail) {
        setSearchError('Lütfen sipariş numaranızı ve siparişte kullandığınız e-posta adresini giriniz.');
      } else if (!cleanNo) {
        setSearchError('Lütfen sipariş numaranızı giriniz.');
      } else {
        setSearchError(
          'Sipariş gizliliği ve güvenliği gereğince, sipariş detaylarını görüntülemek için siparişinize ait e-posta adresinizi girmeniz zorunludur.'
        );
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setActiveOrder(null);
      setSearchError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. SUNUCU TARAFI API KONTROLÜ (/api/orders/track)
      try {
        const apiRes = await fetch('/api/orders/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: cleanNo, email: cleanEmail }),
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && apiData.order) {
            setActiveOrder(apiData.order);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Ağ / API hatasında yerel depolama kontrollerine devam et
      }

      // 3. Admin Atölye Üretim Bandı ve Canlı Siparişlere bak (safirya_admin_orders)
      try {
        const adminRaw =
          typeof window !== 'undefined'
            ? localStorage.getItem('safirya_admin_orders')
            : null;
        if (adminRaw) {
          const adminOrders = JSON.parse(adminRaw);
          const match = adminOrders.find(
            (o: any) => o.orderNumber && o.orderNumber.toUpperCase() === cleanNo
          );
          if (match) {
            const orderEmail = (
              match.customerEmail ||
              match.email ||
              ''
            )
              .trim()
              .toLowerCase();

            // GÜVENLİK KONTROLÜ: E-posta birebir uyuşmak zorunda!
            if (orderEmail && orderEmail === cleanEmail) {
              let stageIdx = 0;
              if (match.stage === 'SIPARIS_ALINDI') stageIdx = 0;
              else if (match.stage === 'ATOLYEDE_URETIMDE') stageIdx = 1;
              else if (match.stage === 'KALITE_KONTROL_PAKETLEME') stageIdx = 2;
              else if (match.stage === 'KARGOYA_VERILDI') stageIdx = 3;
              else if (match.stage === 'TESLIM_EDILDI') stageIdx = 4;

              const photos =
                match.stagePhotos && match.stagePhotos.length > 0
                  ? match.stagePhotos.map((p: any) => ({
                      stageKey: p.stageKey || match.stage,
                      stageName: p.stageName || 'Atölye Aşaması',
                      title: p.stageName || 'Üretim Güncellemesi',
                      photoUrl: p.photoUrl,
                      caption: p.caption,
                      timestamp: p.takenAt || 'Bugün',
                    }))
                  : [
                      {
                        stageKey: 'SIPARIS_ALINDI',
                        stageName: '1. Aşama: Sipariş Onayı',
                        title: 'Atölye Üretim Fişi Hazırlandı',
                        photoUrl:
                          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
                        caption:
                          'Özel kişiselleştirme talebiniz atölye üretim panosuna iletildi.',
                        timestamp: match.createdAt || 'Bugün',
                      },
                    ];

              const items = (match.items || []).map((it: any) => ({
                name: it.productName,
                variantTitle: it.variantTitle,
                quantity: it.quantity,
                price: it.unitPrice,
                scentNote: it.customization?.selectedScent,
                customText: it.customization?.customText,
                colorPalette: it.customization?.selectedColor,
              }));

              let contractStatus = match.contractStatus;
              let contractVerificationCode = match.contractVerificationCode;
              let contractSignedAt = match.contractSignedAt;

              try {
                const contractsRaw =
                  typeof window !== 'undefined'
                    ? localStorage.getItem('safirya_admin_contracts')
                    : null;
                if (contractsRaw) {
                  const contracts = JSON.parse(contractsRaw);
                  const cMatch = contracts.find(
                    (c: any) =>
                      c.orderId === match.id ||
                      (c.orderNumber && c.orderNumber.toUpperCase() === match.orderNumber.toUpperCase())
                  );
                  if (cMatch) {
                    contractStatus = cMatch.status;
                    contractVerificationCode = cMatch.verificationCode;
                    contractSignedAt = cMatch.signedAt;
                  }
                }
              } catch {}

              setActiveOrder({
                orderNumber: match.orderNumber,
                orderId: match.id,
                customerName: match.customerName,
                email: orderEmail,
                phone: match.customerPhone || '',
                orderDate: match.createdAt || 'Bugün',
                currentStageIndex: stageIdx,
                totalAmount: match.totalAmount,
                paymentMethod:
                  match.paymentMethod === 'HAVALE_EFT' ? 'Havale / EFT' : 'Kredi Kartı',
                shippingAddress:
                  typeof match.shippingAddress === 'string'
                    ? match.shippingAddress
                    : `${match.shippingAddress?.address || ''} ${match.shippingAddress?.district || ''} / ${match.shippingAddress?.city || ''}`,
                cargoCompany: match.cargoCompany || undefined,
                trackingCode: match.cargoTrackingNo,
                trackingUrl: match.cargoTrackingNo
                  ? (match.cargoCompany?.toLowerCase().includes('aras')
                      ? `https://www.araskargo.com.tr/kargo-takip?code=${match.cargoTrackingNo}`
                      : match.cargoCompany?.toLowerCase().includes('mng')
                      ? `https://www.mngkargo.com.tr/gonderitakip?code=${match.cargoTrackingNo}`
                      : match.cargoCompany?.toLowerCase().includes('surat') || match.cargoCompany?.toLowerCase().includes('sürat')
                      ? `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${match.cargoTrackingNo}`
                      : match.cargoCompany?.toLowerCase().includes('ptt')
                      ? `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${match.cargoTrackingNo}`
                      : `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${match.cargoTrackingNo}`)
                  : undefined,
                isGiftWrapped: match.isGiftWrapped,
                giftNote: match.giftNote,
                contractStatus,
                contractVerificationCode,
                contractSignedAt,
                atelierNote:
                  photos.length > 0
                    ? `${photos[photos.length - 1].caption} (Son aşama: ${photos[photos.length - 1].stageName})`
                    : 'Siparişiniz atölye üretim bandında ilerlemektedir.',
                photos,
                items,
              });
              setIsLoading(false);
              return;
            } else {
              // GÜVENLİK ZAİFİYETİ ÖNLEME: Sipariş numarası var ama e-posta uyuşmuyor!
              // Kullanıcı ve sipariş numarası tarama saldırılarını engellemek için standart bulunamadı hatası döndürülür.
              setActiveOrder(null);
              setIsLoading(false);
              setSearchError(
                'Girdiğiniz sipariş numarası ve e-posta adresiyle eşleşen bir sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.'
              );
              return;
            }
          }
        }
      } catch {}

      // 4. Vitrin localStorage siparişlerine bak (safirya_orders)
      try {
        const storedRaw =
          typeof window !== 'undefined'
            ? localStorage.getItem('safirya_orders')
            : null;
        if (storedRaw) {
          const storedOrders = JSON.parse(storedRaw);
          const match = storedOrders.find(
            (o: { orderNumber: string }) =>
              o.orderNumber && o.orderNumber.toUpperCase() === cleanNo
          );
          if (match) {
            const orderEmail = (
              match.email ||
              match.guestEmail ||
              match.customerEmail ||
              ''
            )
              .trim()
              .toLowerCase();

            // GÜVENLİK KONTROLÜ: E-posta doğrulaması
            if (orderEmail && orderEmail === cleanEmail) {
              setActiveOrder({
                orderNumber: match.orderNumber,
                customerName: match.customerName || 'Değerli Müşterimiz',
                email: orderEmail,
                phone: match.phone || '',
                orderDate: match.date || 'Bugün',
                currentStageIndex: 0,
                totalAmount: match.totalAmount,
                paymentMethod:
                  match.paymentMethod === 'HAVALE_EFT' ? 'Havale / EFT' : 'Kredi Kartı',
                shippingAddress: match.shippingAddress,
                cargoCompany: match.cargoCompany || undefined,
                isGiftWrapped: match.isGiftWrapped,
                giftNote: match.giftNote,
                atelierNote:
                  'Siparişiniz sistemimize kaydedildi. Hammadde reçeteniz oluşturuldu ve İzmir Karşıyaka atölyemizde üretim sırasına alındı. Ustalarımız en kısa sürede üretime başlayacaktır.',
                photos: [
                  {
                    stageKey: 'SIPARIS_ALINDI',
                    stageName: '1. Aşama: Sipariş Onayı',
                    title: 'Atölye Üretim Fişi Hazırlandı',
                    photoUrl:
                      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
                    caption:
                      'Özel kişiselleştirme talebiniz atölye üretim panosuna iletildi.',
                    timestamp: 'Bugün',
                  },
                ],
                items: match.items || [],
              });
              setIsLoading(false);
              return;
            } else {
              // GÜVENLİK ZAİFİYETİ ÖNLEME
              setActiveOrder(null);
              setIsLoading(false);
              setSearchError(
                'Girdiğiniz sipariş numarası ve e-posta adresiyle eşleşen bir sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.'
              );
              return;
            }
          }
        }
      } catch {}

      // Hiçbir kaynakta eşleşme bulunamadı
      setActiveOrder(null);
      setIsLoading(false);
      setSearchError(
        'Girdiğiniz sipariş numarası ve e-posta adresiyle eşleşen bir sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.'
      );
    } catch {
      setActiveOrder(null);
      setIsLoading(false);
      setSearchError('Sorgulama sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
    }
  };

  useEffect(() => {
    if (paramOrderNumber && paramEmail) {
      setOrderQuery(paramOrderNumber);
      setEmailInput(paramEmail);
      performLookup(paramOrderNumber, paramEmail);
    } else if (paramOrderNumber && currentUser?.email) {
      setOrderQuery(paramOrderNumber);
      setEmailInput(currentUser.email);
      performLookup(paramOrderNumber, currentUser.email);
    } else if (currentUser?.email) {
      setEmailInput(currentUser.email);
      setOrderQuery('');
      setActiveOrder(null);
      setSearchError(null);
    } else if (paramOrderNumber) {
      setOrderQuery(paramOrderNumber);
      setEmailInput('');
      setActiveOrder(null);
      setSearchError(
        'Sipariş detaylarını görüntülemek için lütfen siparişinizde kullandığınız e-posta adresinizi giriniz.'
      );
    } else {
      setOrderQuery('');
      setEmailInput('');
      setActiveOrder(null);
      setSearchError(null);
    }
  }, [paramOrderNumber, paramEmail, currentUser?.email]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderQuery, emailInput);
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Başlık Alanı (Clean Minimalist White) */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A7067] mb-2">
            <PackageCheck className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Şeffaf Atölye ve Canlı Kargo Takibi</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18]">
            Sipariş Durumu & Üretim Takibi
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-2">
            Ürünlerinizin atölyemizdeki döküm, kalite kontrol ve paketleme aşamalarını anlık fotoğraflarla canlı izleyebilirsiniz.
          </p>
        </div>

        {/* 1. SORGULAMA ALANI */}
        <div className="bg-white p-6 sm:p-8 rounded-xs border border-stone-200 mb-8 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Sipariş Numarası *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: SFR-2026-1001"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm font-medium text-[#231B18] focus:outline-none focus:border-[#231B18]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                E-posta Adresi *
              </label>
              <input
                type="email"
                required
                placeholder="ornek@alanadi.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] disabled:opacity-50 text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Sorgula</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Güvenlik Bilgilendirme Notu */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-[#7A7067]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5F6F52] shrink-0" />
            <span>Kişisel verilerinizin ve sipariş gizliliğinizin korunması amacıyla yalnızca eşleşen e-posta adresiyle sorgulama yapılabilir.</span>
          </div>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xs text-xs font-medium border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Sipariş Henüz Sorgulanmadığında Bilgilendirme Kartı */}
        {!activeOrder && !searchError && (
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-xs p-8 text-center max-w-xl mx-auto space-y-3 mb-12">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto text-[#231B18]">
              <PackageCheck className="w-6 h-6 text-[#C85A32]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#231B18]">
              Siparişinizi Canlı Takip Edin
            </h3>
            <p className="text-xs text-[#7A7067] leading-relaxed">
              Sipariş numaranızı ve sipariş verirken kullandığınız e-posta adresinizi yukarıdaki alana girerek atölye üretim sürecini ve kargo aşamalarını canlı olarak izleyebilirsiniz.
            </p>
          </div>
        )}

        {/* 2. DETAYLI SİPARİŞ TAKİP EKRANI */}
        {activeOrder && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* ÜST SİPARİŞ BİLGİ ŞERİDİ */}
            <div className="bg-white rounded-xs border border-stone-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#7A7067] block">Sipariş Numarası</span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <h2 className="font-mono text-xl sm:text-2xl font-medium text-[#231B18] tracking-wider">
                      {activeOrder.orderNumber}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-xs text-[11px] font-medium bg-emerald-50 text-[#15803D] border border-emerald-200">
                      Ödeme Onaylandı
                    </span>
                  </div>
                  <span className="text-xs text-[#7A7067] mt-1 block">
                    {activeOrder.orderDate} • Alıcı: <strong className="text-[#231B18]">{activeOrder.customerName}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xs text-right">
                    <span className="text-[10px] uppercase tracking-widest text-[#7A7067] block">
                      Güncel Durum
                    </span>
                    <span className="text-sm font-medium text-[#231B18]">
                      {STAGES_MASTER[activeOrder.currentStageIndex]?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* DİJİTAL ONAYLI ÖZEL ÜRETİM SÖZLEŞMESİ (TKHK 6502 Md. 15/b) */}
              {(() => {
                const hasCustomText = activeOrder.items.some((it) => it.customText);
                const isApproved = activeOrder.contractStatus === 'ONAYLANDI';
                const isPending =
                  activeOrder.contractStatus === 'BEKLIYOR' ||
                  (!activeOrder.contractStatus && hasCustomText);

                if (isApproved) {
                  return (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-950">
                              Dijital Özel İmalat Sözleşmesi Onaylandı
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                              {activeOrder.contractVerificationCode || 'ONAYLANDI'}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800/80 mt-0.5">
                            TKHK 6502 Md. 15/b uyarınca kişiye özel üretim ve isim baskısı onayınız dijital imzanızla güvence altına alınmıştır.
                            {activeOrder.contractSignedAt && ` (${activeOrder.contractSignedAt})`}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/sozlesme-onay/${activeOrder.orderId || activeOrder.orderNumber}`}
                        className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition shrink-0 shadow-2xs"
                      >
                        Sözleşme Sertifikasını Gör →
                      </Link>
                    </div>
                  );
                }

                if (isPending) {
                  return (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-950">
                              Dijital Özel İmalat Sözleşmesi Onayı Bekleniyor
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-200/80 text-amber-900 font-bold">
                              İmza Gerekli
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800/90 mt-0.5">
                            Kişiselleştirilmiş ürünlerinizin hatasız hazırlanabilmesi için lütfen isim, tarih ve metin onayınızı dijital imzanızla tamamlayınız.
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/sozlesme-onay/${activeOrder.orderId || activeOrder.orderNumber}`}
                        className="px-4 py-2 rounded-lg bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs transition shrink-0 shadow-sm"
                      >
                        Sözleşmeyi İncele & İmzala →
                      </Link>
                    </div>
                  );
                }

                return null;
              })()}

              {/* 5 AŞAMALI GÖRSEL ZAMAN ÇİZELGESİ */}
              <div className="py-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-sm font-normal uppercase tracking-wider text-[#231B18]">
                    5 Aşamalı El Yapımı Atölye ve Kargo Takibi
                  </h3>
                  <span className="text-xs text-[#7A7067]">
                    Aşama {activeOrder.currentStageIndex + 1} / 5
                  </span>
                </div>

                {/* 5'li Yatay Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                  {STAGES_MASTER.map((stg, idx) => {
                    const isCompleted = idx < activeOrder.currentStageIndex;
                    const isActive = idx === activeOrder.currentStageIndex;

                    return (
                      <div
                        key={stg.key}
                        className={`p-4 rounded-xs border transition-all relative ${
                          isActive
                            ? 'bg-[#FAF8F5] border-[#231B18]'
                            : isCompleted
                            ? 'bg-white border-stone-300'
                            : 'bg-[#FAF8F5]/50 border-stone-200 opacity-60'
                        }`}
                      >
                        {/* Numara & Durum Rozeti */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-mono font-medium ${
                              isActive
                                ? 'text-[#231B18]'
                                : isCompleted
                                ? 'text-[#15803D]'
                                : 'text-stone-400'
                            }`}
                          >
                            {stg.stepNumber}
                          </span>
                          {isCompleted ? (
                            <div className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          ) : isActive ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#231B18] animate-pulse" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-stone-300" />
                          )}
                        </div>

                        <h4
                          className={`text-xs font-medium mb-1 ${
                            isActive
                              ? 'text-[#231B18]'
                              : isCompleted
                              ? 'text-[#231B18]'
                              : 'text-stone-400'
                          }`}
                        >
                          {stg.label}
                        </h4>

                        <p className="text-[11px] text-[#7A7067] leading-relaxed">
                          {stg.desc}
                        </p>

                        {isActive && (
                          <span className="inline-block mt-2.5 px-2 py-0.5 rounded-xs text-[10px] uppercase tracking-wider bg-[#231B18] text-white font-medium">
                            Şu Anki Aşama
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-block mt-2.5 px-2 py-0.5 rounded-xs text-[10px] font-medium bg-emerald-50 text-[#15803D]">
                            Tamamlandı
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ATÖLYE HAZIRLIK FOTOĞRAFLARI */}
              <div className="pt-8 border-t border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#231B18]" />
                    <h3 className="font-serif text-base font-normal text-[#231B18]">
                      Atölyeden Canlı Kareler
                    </h3>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#7A7067] bg-[#FAF8F5] px-2.5 py-1 rounded-xs border border-stone-200">
                    Kişiye Özel Üretim Kanıtı
                  </span>
                </div>

                {/* Atölye Usta Notu */}
                <div className="p-4 rounded-xs bg-[#FAF8F5] border border-stone-200 mb-6 flex gap-3 items-start">
                  <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-medium text-[#231B18]">
                      Atölye Şefimizin Notu:
                    </h5>
                    <p className="text-xs text-[#7A7067] mt-1 leading-relaxed">
                      {activeOrder.atelierNote}
                    </p>
                  </div>
                </div>

                {/* Üretim Fotoğrafları Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeOrder.photos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group cursor-pointer bg-white p-3 rounded-xs border border-stone-200 hover:border-[#231B18] transition"
                    >
                      <div className="relative aspect-video rounded-xs overflow-hidden mb-3 bg-[#FAF8F5]">
                        <img
                          src={photo.photoUrl}
                          alt={`${photo.title} - ${photo.stageName}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 bg-[#231B18]/80 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs backdrop-blur-xs">
                          {photo.timestamp}
                        </span>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs uppercase tracking-widest font-medium">
                          <span>Büyütmek İçin Tıkla</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#231B18]">{photo.stageName}</span>
                        <span className="text-[#15803D] text-[11px] font-medium">Doğrulandı</span>
                      </div>
                      <p className="text-xs text-[#7A7067] mt-1 line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ALT DETAYLAR: ÜRÜN ÖZELLEŞTİRMELERİ + TESLİMAT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sol: Siparişteki Kişiselleştirilmiş Ürünler */}
              <div className="lg:col-span-7 bg-white rounded-xs border border-stone-200 p-6 space-y-4">
                <h4 className="font-serif text-sm font-normal text-[#231B18] pb-3 border-b border-stone-200">
                  Siparişteki Tasarımlar & Kişiselleştirme Detayları
                </h4>

                <div className="divide-y divide-stone-100">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={`${it.name} - Sipariş Kalemi`}
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-16 object-cover rounded-xs border border-stone-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h5 className="text-xs sm:text-sm font-medium text-[#231B18]">
                            {it.name}
                          </h5>
                          <span className="text-xs font-semibold text-[#231B18]">
                            ₺{(it.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                        {it.variantTitle && (
                          <span className="text-[11px] text-[#7A7067] block">
                            {it.variantTitle} • {it.quantity} Adet
                          </span>
                        )}

                        {/* Kişiselleştirme Rozetleri */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {it.scentNote && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-xs bg-[#FAF8F5] border border-stone-200 font-medium text-[#231B18]">
                              <Flame className="w-2.5 h-2.5 text-[#C85A32]" />
                              <span>{it.scentNote}</span>
                            </span>
                          )}
                          {it.customText && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-xs bg-[#FAF8F5] border border-stone-200 font-medium text-[#C85A32]">
                              <Feather className="w-2.5 h-2.5 text-[#C85A32]" />
                              <span>&quot;{it.customText}&quot;</span>
                            </span>
                          )}
                          {it.colorPalette && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-xs bg-[#FAF8F5] border border-stone-200 font-medium text-[#231B18]">
                              <Palette className="w-2.5 h-2.5 text-[#7A7067]" />
                              <span>{it.colorPalette}</span>
                            </span>
                          )}
                          {it.bulkTierLabel && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-xs bg-emerald-50 border border-emerald-200 font-medium text-[#15803D]">
                              <Tag className="w-2.5 h-2.5 text-[#15803D]" />
                              <span>{it.bulkTierLabel}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sağ: Teslimat + Hediye Notu */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Teslimat Adresi Kartı */}
                <div className="bg-white rounded-xs border border-stone-200 p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#231B18]" />
                    <h4 className="font-serif text-sm font-normal text-[#231B18]">Teslimat Bilgileri</h4>
                  </div>
                  <p className="text-xs font-medium text-[#231B18]">{activeOrder.customerName}</p>
                  <p className="text-xs text-[#7A7067] leading-relaxed">
                    {activeOrder.shippingAddress}
                  </p>
                  {activeOrder.phone && (
                    <p className="text-xs text-[#7A7067]">Tel: {maskPhone(activeOrder.phone)}</p>
                  )}
                  {activeOrder.email && (
                    <p className="text-xs text-[#7A7067]">E-posta: {maskEmail(activeOrder.email)}</p>
                  )}

                  {/* Kargo Takip Linki */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#7A7067] block">Kargo Durumu:</span>
                      <strong className="text-[#231B18] font-medium">
                        {activeOrder.cargoCompany
                          ? activeOrder.cargoCompany
                          : activeOrder.currentStageIndex >= 3
                          ? 'Kargoya Verildi'
                          : 'Henüz Kargoya Verilmedi (Üretimde)'}
                      </strong>
                    </div>
                    {activeOrder.trackingCode && (
                      <a
                        href={activeOrder.trackingUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xs bg-[#231B18] text-white font-medium text-[11px] hover:bg-[#3A2E29] transition flex items-center gap-1 uppercase tracking-wider"
                      >
                        <span>{activeOrder.trackingCode}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Hediye Paketi & Notu Kartı */}
                {activeOrder.isGiftWrapped && (
                  <div className="bg-white rounded-xs border border-stone-200 p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#C85A32]" />
                      <h4 className="font-serif text-sm font-normal text-[#231B18]">Özel Hediye Paketi</h4>
                    </div>
                    {activeOrder.giftNote ? (
                      <div className="p-3.5 rounded-xs bg-[#FAF8F5] border border-stone-200 text-xs text-[#231B18]">
                        <span className="font-medium text-[#C85A32] block mb-1">
                          Müşteri Tebrik Notu:
                        </span>
                        <p className="italic leading-relaxed text-[#7A7067]">
                          &quot;{activeOrder.giftNote}&quot;
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#7A7067]">
                        Özel kraft kutu ve mühürlü ambalaj dahil edilmiştir.
                      </p>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* FOTOĞRAF BÜYÜTME (LIGHTBOX) MODALI */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-xs overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.photoUrl}
              alt={`${selectedPhoto.title} - ${selectedPhoto.stageName}`}
              decoding="async"
              className="w-full max-h-[70vh] object-cover"
            />
            <div className="p-5 bg-white space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-medium text-[#7A7067]">
                  {selectedPhoto.stageName} • {selectedPhoto.timestamp}
                </span>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1 rounded-xs text-[#7A7067] hover:text-[#231B18]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h4 className="font-serif text-base font-normal text-[#231B18]">
                {selectedPhoto.title}
              </h4>
              <p className="text-xs text-[#7A7067]">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderTrackingClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#231B18] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-[#7A7067]">Sipariş Durumu Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
