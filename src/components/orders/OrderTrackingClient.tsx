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
} from 'lucide-react';

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

// ÖRNEK SİPARİŞ VERİTABANI
const DEMO_ORDERS: Record<string, OrderTrackingData> = {
  'SFR-2026-1042': {
    orderNumber: 'SFR-2026-1042',
    customerName: 'Elif Kaya',
    email: 'elif.kaya@example.com',
    phone: '+90 541 234 5678',
    orderDate: '14 Ekim 2026 • 10:45',
    currentStageIndex: 1,
    totalAmount: 620.0,
    paymentMethod: 'Kredi Kartı (3D Secure)',
    shippingAddress: 'Caferağa Mah. Şair Nefi Sk. No:18 D:4 Kadıköy / İstanbul',
    cargoCompany: 'Yurtiçi Kargo (Hazırlanıyor)',
    isGiftWrapped: true,
    giftNote: 'Canım Selin, yeni yuvanız size sonsuz mutluluk ve aydınlık getirsin! Sevgilerimle.',
    atelierNote:
      'Ahşap fitiller pirinç tabanla el ile sabitlendi. %100 saf soya vaksı 65°C ısıda doğal "Vanilya & Karamel" esansıyla harmanlandı. Şu an Kadıköy atölyemizin dinlenme odasında 48 saatlik doğal kürlenme sürecindedir.',
    photos: [
      {
        stageKey: 'SIPARIS_ALINDI',
        stageName: '1. Aşama: Malzeme Hazırlığı',
        title: 'Doğal Vaks ve Koku Reçetesi',
        photoUrl:
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        caption: 'Saf soya vaksı tartıldı ve doğal esanslar hazırlandı.',
        timestamp: '14 Ekim 10:55',
      },
      {
        stageKey: 'ATOLYEDE_URETIMDE',
        stageName: '2. Aşama: El ile Sıcak Döküm',
        title: 'Ahşap Fitil & Dinlenme',
        photoUrl:
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        caption: 'Ahşap fitil yerleştirildi, kehribar kavanoza saf lavanta ve vanilya esansıyla döküldü.',
        timestamp: '14 Ekim 11:30',
      },
    ],
    items: [
      {
        name: 'Doğal Mum & Epoksi Kişiselleştirilebilir Hediye Seti',
        variantTitle: '210g Kehribar Cam Kavanoz',
        quantity: 1,
        price: 349.0,
        image:
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=80',
        scentNote: 'Vanilya & Karamel',
        customText: 'Selin & Emre 24.10.2026',
        colorPalette: 'Gold & Krem',
        bulkTierLabel: 'Tekli Alım',
      },
      {
        name: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
        variantTitle: 'Kraft Kutu & Keten İp Kurdele',
        quantity: 1,
        price: 271.0,
        image:
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80',
        scentNote: 'Lavanta & Sandal Ağacı',
        customText: 'Merve & Kaan Sonsuzluğa...',
        colorPalette: 'Zümrüt Yeşili',
        bulkTierLabel: '10+ Adet Baremi (%15 İndirim)',
      },
    ],
  },
  'SFR-2026-1043': {
    orderNumber: 'SFR-2026-1043',
    customerName: 'Caner Demir',
    email: 'caner.demir@example.com',
    phone: '+90 532 987 6543',
    orderDate: '13 Ekim 2026 • 15:20',
    currentStageIndex: 2,
    totalAmount: 1450.0,
    paymentMethod: 'Kredi Kartı',
    shippingAddress: 'Bağdat Cad. No:240 D:8 Çiftehavuzlar Kadıköy / İstanbul',
    cargoCompany: 'Yurtiçi Kargo (Barkod Basıldı)',
    isGiftWrapped: true,
    giftNote: 'Tüm sevdiklerimize söz günümüzden tatlı bir hatıra...',
    atelierNote:
      '25 adet nişan hediyeliğinin koku ve fitil testleri tamamlandı. Kraft etiketlere "Selin & Emre" baskısı uygulandı ve mühürlü kutulara yerleştirildi.',
    photos: [
      {
        stageKey: 'ATOLYEDE_URETIMDE',
        stageName: '2. Aşama: Toplu Döküm',
        title: '25 Adet Nişan Hediyeliği Dökümü',
        photoUrl:
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
        caption: 'Toplu barem siparişi için 25 adet kalıp hazırlandı.',
        timestamp: '13 Ekim 17:00',
      },
      {
        stageKey: 'KALITE_KONTROL_PAKETLEME',
        stageName: '3. Aşama: Etiketleme & Kurdele',
        title: 'Mühürlü Hediye Paketleri',
        photoUrl:
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        caption: 'Özel hediye paketleri mühürlenip kurdeleleri bağlandı.',
        timestamp: '14 Ekim 09:30',
      },
    ],
    items: [
      {
        name: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
        variantTitle: '25 Adet Nişan Baremi',
        quantity: 25,
        price: 58.0,
        image:
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80',
        scentNote: 'Lavanta & Amber',
        customText: 'Selin & Emre 2026',
        colorPalette: 'Terracotta',
        bulkTierLabel: '25+ Adet Baremi (%15 İndirim)',
      },
    ],
  },
  'SFR-2026-8921': {
    orderNumber: 'SFR-2026-8921',
    customerName: 'Zeynep Arslan',
    email: 'zeynep.arslan@example.com',
    phone: '+90 533 111 2233',
    orderDate: '12 Ekim 2026 • 09:15',
    currentStageIndex: 3,
    totalAmount: 499.0,
    paymentMethod: 'Havale / EFT',
    shippingAddress: 'Alsancak Mah. Atatürk Cad. No:52 D:3 Konak / İzmir',
    cargoCompany: 'Yurtiçi Kargo',
    trackingCode: 'YK-84920193',
    trackingUrl: 'https://www.yurticikargo.com',
    isGiftWrapped: false,
    atelierNote:
      'Okyanus epoksi sunumluk ahşap zımparası ve doğal yağ bakımı tamamlanıp darbe emici ambalajla paketlendi.',
    photos: [
      {
        stageKey: 'KALITE_KONTROL_PAKETLEME',
        stageName: '3. Aşama: Epoksi Zımpara & Cila',
        title: 'Doğal Yağ Bakımı',
        photoUrl:
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        caption: 'Epoksi sunumluk yüzeyi parlatıldı ve koruyucu balmumu sürüldü.',
        timestamp: '12 Ekim 16:00',
      },
    ],
    items: [
      {
        name: 'Okyanus Esintisi Epoksi Tepsi & Sunumluk',
        variantTitle: 'Doğal Ceviz Ağacı & Mavi Reçine',
        quantity: 1,
        price: 499.0,
        image:
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
        colorPalette: 'Safir Mavi',
      },
    ],
  },
};

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const paramOrderNumber = searchParams.get('orderNumber') || '';
  const paramEmail = searchParams.get('email') || '';

  const [orderQuery, setOrderQuery] = useState(paramOrderNumber || 'SFR-2026-1042');
  const [emailOrPhone, setEmailOrPhone] = useState(paramEmail || 'elif.kaya@example.com');
  const [activeOrder, setActiveOrder] = useState<OrderTrackingData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<StagePhoto | null>(null);

  const performLookup = (queryNo: string, contact: string) => {
    setSearchError(null);
    const cleanNo = queryNo.trim().toUpperCase();

    // 1. Önce Admin Atölye Üretim Bandı ve Canlı Siparişlere bak (safirya_admin_orders)
    try {
      const adminRaw = typeof window !== 'undefined' ? localStorage.getItem('safirya_admin_orders') : null;
      if (adminRaw) {
        const adminOrders = JSON.parse(adminRaw);
        const match = adminOrders.find(
          (o: any) => o.orderNumber && o.orderNumber.toUpperCase() === cleanNo
        );
        if (match) {
          let stageIdx = 0;
          if (match.stage === 'SIPARIS_ALINDI') stageIdx = 0;
          else if (match.stage === 'ATOLYEDE_URETIMDE') stageIdx = 1;
          else if (match.stage === 'KALITE_KONTROL_PAKETLEME') stageIdx = 2;
          else if (match.stage === 'KARGOYA_VERILDI') stageIdx = 3;
          else if (match.stage === 'TESLIM_EDILDI') stageIdx = 4;

          const photos = (match.stagePhotos && match.stagePhotos.length > 0)
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
                  photoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
                  caption: 'Özel kişiselleştirme talebiniz atölye üretim panosuna iletildi.',
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

          setActiveOrder({
            orderNumber: match.orderNumber,
            customerName: match.customerName,
            email: match.customerEmail || contact,
            phone: match.customerPhone || '',
            orderDate: match.createdAt || 'Bugün',
            currentStageIndex: stageIdx,
            totalAmount: match.totalAmount,
            paymentMethod: match.paymentMethod === 'HAVALE_EFT' ? 'Havale / EFT' : 'Kredi Kartı',
            shippingAddress: typeof match.shippingAddress === 'string'
              ? match.shippingAddress
              : `${match.shippingAddress?.address || ''} ${match.shippingAddress?.district || ''} / ${match.shippingAddress?.city || ''}`,
            cargoCompany: match.cargoCompany || 'Yurtiçi Kargo',
            trackingCode: match.cargoTrackingNo,
            trackingUrl: match.cargoTrackingNo ? `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${match.cargoTrackingNo}` : undefined,
            isGiftWrapped: match.isGiftWrapped,
            giftNote: match.giftNote,
            atelierNote:
              photos.length > 0
                ? `${photos[photos.length - 1].caption} (Son aşama: ${photos[photos.length - 1].stageName})`
                : 'Siparişiniz atölye üretim bandında ilerlemektedir.',
            photos,
            items,
          });
          return;
        }
      }
    } catch {}

    // 2. Vitrin localStorage siparişlerine bak
    try {
      const storedRaw = typeof window !== 'undefined' ? localStorage.getItem('safirya_orders') : null;
      if (storedRaw) {
        const storedOrders = JSON.parse(storedRaw);
        const match = storedOrders.find(
          (o: { orderNumber: string }) => o.orderNumber.toUpperCase() === cleanNo
        );
        if (match) {
          setActiveOrder({
            orderNumber: match.orderNumber,
            customerName: match.customerName || 'Değerli Müşterimiz',
            email: match.email || contact,
            phone: match.phone || '',
            orderDate: match.date || 'Bugün',
            currentStageIndex: 0,
            totalAmount: match.totalAmount,
            paymentMethod: match.paymentMethod === 'HAVALE_EFT' ? 'Havale / EFT' : 'Kredi Kartı',
            shippingAddress: match.shippingAddress,
            cargoCompany: 'Yurtiçi Kargo (Sıraya Alındı)',
            isGiftWrapped: match.isGiftWrapped,
            giftNote: match.giftNote,
            atelierNote:
              'Siparişiniz sistemimize kaydedildi. Hammadde reçeteniz oluşturuldu ve Kadıköy atölyemizde üretim sırasına alındı. Ustalarımız en kısa sürede üretime başlayacaktır.',
            photos: [
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
            items: match.items || [],
          });
          return;
        }
      }
    } catch {}

    // 3. Demo veritabanında ara
    if (DEMO_ORDERS[cleanNo]) {
      setActiveOrder(DEMO_ORDERS[cleanNo]);
      return;
    }

    setSearchError(
      `"${cleanNo}" numaralı sipariş bulunamadı. Lütfen sipariş numaranızı kontrol ediniz. (Örn: SFR-2026-1042, SFR-2026-1043, SFR-2026-8921)`
    );
    setActiveOrder(null);
  };

  useEffect(() => {
    if (paramOrderNumber) {
      setOrderQuery(paramOrderNumber);
      if (paramEmail) setEmailOrPhone(paramEmail);
      performLookup(paramOrderNumber, paramEmail);
    } else {
      performLookup('SFR-2026-1042', 'elif.kaya@example.com');
    }
  }, [paramOrderNumber, paramEmail]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderQuery, emailOrPhone);
  };

  const handleQuickDemoClick = (demoNo: string, email: string) => {
    setOrderQuery(demoNo);
    setEmailOrPhone(email);
    performLookup(demoNo, email);
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
            Üyeliksiz siparişleriniz dahil olmak üzere sipariş numaranız ve e-posta adresiniz ile ürününüzün atölyedeki el emeği aşamalarını canlı izleyebilirsiniz.
          </p>
        </div>

        {/* 1. SORGULAMA KUTUSU & HIZLI DEMO SEÇENEKLERİ */}
        <div className="bg-white p-6 sm:p-8 rounded-xs border border-stone-200 mb-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Sipariş Numarası *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: SFR-2026-1042"
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
                placeholder="elif.kaya@example.com"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Sorgula</span>
              </button>
            </div>
          </form>

          {/* Hızlı Demo Siparişleri */}
          <div className="mt-4 pt-4 border-t border-stone-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#7A7067] text-[11px] uppercase tracking-wider">Hızlı Aşama Örnekleri:</span>
            <button
              type="button"
              onClick={() => handleQuickDemoClick('SFR-2026-1042', 'elif.kaya@example.com')}
              className="px-2.5 py-1 rounded-xs bg-[#FAF8F5] border border-stone-200 hover:border-[#231B18] text-[#231B18] text-xs transition"
            >
              SFR-2026-1042 (2. Aşama: Atölyede Üretimde)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoClick('SFR-2026-1043', 'caner.demir@example.com')}
              className="px-2.5 py-1 rounded-xs bg-[#FAF8F5] border border-stone-200 hover:border-[#231B18] text-[#231B18] text-xs transition"
            >
              SFR-2026-1043 (3. Aşama: Paketleme)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoClick('SFR-2026-8921', 'zeynep.arslan@example.com')}
              className="px-2.5 py-1 rounded-xs bg-[#FAF8F5] border border-stone-200 hover:border-[#231B18] text-[#231B18] text-xs transition"
            >
              SFR-2026-8921 (4. Aşama: Kargoda)
            </button>
          </div>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xs text-xs font-medium border border-red-200">
              {searchError}
            </div>
          )}
        </div>

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
                  <p className="text-xs text-[#7A7067]">Tel: {activeOrder.phone}</p>

                  {/* Kargo Takip Linki */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#7A7067] block">Kargo Durumu:</span>
                      <strong className="text-[#231B18] font-medium">{activeOrder.cargoCompany}</strong>
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
