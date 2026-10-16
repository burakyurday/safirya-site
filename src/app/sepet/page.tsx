'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Gift,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight,
  X,
  Palette,
  Feather,
  Flame,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useStore, CartItem } from '@/context/StoreContext';

interface CrossSellProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  badge: string;
}

const CROSS_SELL_PRODUCTS: CrossSellProduct[] = [
  {
    id: 'cs-1',
    name: 'Vintage Ahşap Kibrit & Mum Söndürücü Çan Seti',
    category: 'Mum Tamamlayıcı',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    originalPrice: 89.0,
    discountedPrice: 65.0,
    discountRate: 27,
    badge: 'Mum Alanlara Özel',
  },
  {
    id: 'cs-2',
    name: 'Konsantre Yedek Esans Damlalık (15ml Saf Lavanta)',
    category: 'Doğal Esans',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
    originalPrice: 79.0,
    discountedPrice: 59.0,
    discountRate: 25,
    badge: 'Yedek Esans',
  },
  {
    id: 'cs-3',
    name: 'Doğal Masif Meşe Mum Altlığı & Sunumluk',
    category: 'Ahşap Obje',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    originalPrice: 69.0,
    discountedPrice: 49.0,
    discountRate: 29,
    badge: 'Zanaat Altlık',
  },
  {
    id: 'cs-4',
    name: 'Epoksi & Ahşap Parlatıcı Doğal Balmumu Bakım Kiti',
    category: 'Bakım Kiti',
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80',
    originalPrice: 95.0,
    discountedPrice: 69.0,
    discountRate: 27,
    badge: 'Koruyucu Cila',
  },
];

export default function CartPage() {
  const {
    cartItems,
    cartTotal,
    originalCartTotal,
    updateQuantity,
    removeFromCart,
    addToCart,
    isGiftWrapped,
    setIsGiftWrapped,
    giftNote,
    setGiftNote,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currentUser,
    loyaltyAccount,
    appliedPoints,
    pointsDiscount,
    pointsToEarn,
    applyPoints,
    removePoints,
    setIsAuthModalOpen,
    setAuthModalView,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [pointsInput, setPointsInput] = useState('');
  const [pointsFeedback, setPointsFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  const freeShippingThreshold = 500;
  const giftWrapFee = 30;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);
  const isFreeShipping = cartTotal >= freeShippingThreshold;

  const bulkSavings = Math.max(0, originalCartTotal - cartTotal);

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? (cartTotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const shippingFee = isFreeShipping || cartItems.length === 0 ? 0 : 45.0;
  const giftWrapCost = isGiftWrapped ? giftWrapFee : 0;
  const discountedSubtotal = Math.max(0, cartTotal - couponDiscount);
  const payableSubtotal = Math.max(0, discountedSubtotal - pointsDiscount);
  const grandTotal = payableSubtotal + giftWrapCost + shippingFee;

  const shippingSavings = isFreeShipping && cartItems.length > 0 ? 45.0 : 0;
  const totalSavings = bulkSavings + couponDiscount + pointsDiscount + shippingSavings;

  const handleApplyPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(pointsInput.trim(), 10);
    if (isNaN(pts) || pts <= 0) return;
    const res = applyPoints(pts);
    if (res.success) {
      setPointsFeedback({ type: 'success', message: res.message });
      setPointsInput('');
    } else {
      setPointsFeedback({ type: 'error', message: res.message });
    }
  };

  const handleQuickUseAllPoints = () => {
    if (!loyaltyAccount) return;
    const maxDiscountAllowed = discountedSubtotal * 0.5;
    const maxPoints = Math.floor(maxDiscountAllowed / 0.5);
    const pts = Math.min(loyaltyAccount.pointsBalance, maxPoints);
    if (pts < 50) {
      setPointsFeedback({ type: 'error', message: 'Kullanmak için en az 50 Safir Puan gereklidir.' });
      return;
    }
    const res = applyPoints(pts);
    if (res.success) {
      setPointsFeedback({ type: 'success', message: res.message });
    } else {
      setPointsFeedback({ type: 'error', message: res.message });
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const handleQuickCoupon = (code: string) => {
    const res = applyCoupon(code);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const addQuickNote = (noteText: string) => {
    setGiftNote(noteText);
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-8 text-[#231B18]">

      {/* Kupon Sonuç Popup */}
      {couponFeedback && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setCouponFeedback(null)}>
          {/* Arka plan overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Popup kart */}
          <div
            className="relative bg-white rounded-xs border border-stone-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat butonu */}
            <button
              onClick={() => setCouponFeedback(null)}
              className="absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-600 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {couponFeedback.type === 'error' ? (
              <>
                {/* Hata İkonu */}
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                </div>

                {/* Hata Başlık */}
                <h3 className="text-center font-serif text-lg font-semibold text-[#231B18] mb-2">
                  Kupon Uygulanamadı
                </h3>

                {/* Hata Mesajı */}
                <div className="bg-red-50/80 border border-red-200 rounded-xs p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 leading-relaxed">
                      {couponFeedback.message}
                    </p>
                  </div>
                </div>

                {/* Kapat Buton */}
                <button
                  onClick={() => setCouponFeedback(null)}
                  className="w-full py-2.5 bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-wider font-medium rounded-xs transition"
                >
                  Anladım
                </button>
              </>
            ) : (
              <>
                {/* Başarı İkonu */}
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                </div>

                {/* Başarı Başlık */}
                <h3 className="text-center font-serif text-lg font-semibold text-[#231B18] mb-2">
                  Kupon Uygulandı!
                </h3>

                {/* Başarı Mesajı */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xs p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {couponFeedback.message}
                    </p>
                  </div>
                </div>

                {/* Kapat Buton */}
                <button
                  onClick={() => setCouponFeedback(null)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs uppercase tracking-wider font-medium rounded-xs transition"
                >
                  Devam Et
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Üst Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-stone-100 pb-5">
          <div>
            <nav className="flex items-center gap-2 text-xs text-[#7A7067] mb-2">
              <Link href="/" className="hover:text-[#C85A32] transition">Anasayfa</Link>
              <span>/</span>
              <span className="text-[#231B18] font-medium">Sepetim</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18]">
              Alışveriş Sepetim
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#7A7067]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Koruma</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C85A32]" />
              <span>2 İş Gününde Kargo</span>
            </span>
          </div>
        </div>

        {/* 1. Ücretsiz Kargo İlerleme Çubuğu */}
        <div className="mb-8">
          {isFreeShipping ? (
            <div className="p-4 rounded-xs bg-[#FEF5C8] border border-[#F5E898] text-[#231B18] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold">
                    Tebrikler! Siparişiniz <span className="underline">Ücretsiz Kargo</span> hakkı kazandı.
                  </h3>
                  <p className="text-[11px] text-[#554D46]">
                    500 TL üzeri siparişlerde kargo bedeli Safirya atölyesi tarafından karşılanır.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-white text-emerald-700 font-semibold text-xs rounded-xs border border-stone-200">
                ₺45.00 Tasarruf
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xs bg-[#FAF8F5] border border-stone-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C85A32]" />
                  <p className="text-xs text-[#231B18]">
                    Ücretsiz kargo için <strong className="text-[#C85A32] font-semibold">₺{remainingForFreeShipping.toFixed(2)}</strong> değerinde ürün daha ekleyin!
                  </p>
                </div>
                <span className="text-xs text-[#7A7067] font-mono">
                  ₺{cartTotal.toFixed(2)} / ₺{freeShippingThreshold}
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-[#C85A32] transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* ── SOL KOLON (8 Sütun): Ürünler, Hediye Paketi, Cross-sell ── */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Ürün Listesi */}
              <div className="bg-white rounded-xs border border-stone-200/80 divide-y divide-stone-100">
                <div className="p-4 bg-[#FAF8F5] flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#7A7067]">
                  <span>Ürün Bilgisi ({cartItems.length})</span>
                  <span>Tutar</span>
                </div>

                {cartItems.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  const originalLineTotal = (item.originalPrice || item.price) * item.quantity;

                  return (
                    <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      {/* Görsel */}
                      {item.image && (
                        <div className="relative shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xs border border-stone-200/80"
                          />
                        </div>
                      )}

                      {/* Bilgiler */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif text-base font-normal text-[#231B18] leading-snug">
                              {item.name}
                            </h3>
                            {item.variantTitle && (
                              <p className="text-xs text-[#7A7067] mt-0.5">
                                {item.variantTitle}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-stone-400 hover:text-red-500 transition"
                            title="Ürünü Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Özelleştirme Rozetleri */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.scentNote && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-[#FAF8F5] border border-stone-200 text-[10px] text-[#231B18]">
                              <Flame className="w-3 h-3 text-[#C85A32]" />
                              <span>{item.scentNote}</span>
                            </span>
                          )}

                          {item.customText && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-[#FAF8F5] border border-stone-200 text-[10px] text-[#C85A32]">
                              <Feather className="w-3 h-3 text-[#C85A32]" />
                              <span>&quot;{item.customText}&quot;</span>
                            </span>
                          )}

                          {item.colorPalette && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-[#FAF8F5] border border-stone-200 text-[10px] text-[#231B18]">
                              <Palette className="w-3 h-3 text-[#C85A32]" />
                              <span>{item.colorPalette}</span>
                            </span>
                          )}

                          {item.bulkTierLabel && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                              <Tag className="w-3 h-3 text-emerald-700" />
                              <span>{item.bulkTierLabel}</span>
                            </span>
                          )}
                        </div>

                        {/* Adet Kontrol & Fiyat */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-stone-300 rounded-xs bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 text-stone-600 hover:text-[#231B18]"
                              title="Azalt"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-[#231B18]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 text-stone-600 hover:text-[#231B18]"
                              title="Artır"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-semibold text-[#231B18] block">
                              ₺{lineTotal.toFixed(2)}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-[#7A7067] line-through block">
                                ₺{originalLineTotal.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hediye Paketi Modülü */}
              <div className="bg-[#FAF8F5] rounded-xs border border-stone-200/80 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isGiftWrapped}
                      onChange={(e) => setIsGiftWrapped(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#C85A32] rounded-none border-stone-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-[#C85A32]" />
                        <span className="text-xs sm:text-sm font-semibold text-[#231B18]">
                          Özel Kraft Hediye Paketi & Mühürlü Kart (+₺{giftWrapFee})
                        </span>
                      </div>
                      <p className="text-xs text-[#7A7067] mt-0.5">
                        El yapımı kraft hediye kutusu, keten ip kurdele ve pirinç Safirya mühürlü tebrik zarfı ile hazırlanır.
                      </p>
                    </div>
                  </label>
                  <span className="text-xs font-bold text-[#C85A32] bg-white border border-stone-200 px-2.5 py-1 rounded-xs shrink-0">
                    +₺{giftWrapFee}
                  </span>
                </div>

                {isGiftWrapped && (
                  <div className="pt-3 border-t border-stone-200/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#231B18]">
                        Hediye Kartı Notunuz (Zarf içine konur)
                      </label>
                      <span className="text-[10px] text-[#7A7067]">
                        {giftNote.length}/150 Karakter
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      maxLength={150}
                      placeholder="Yeni eviniz huzur getirsin canım arkadaşım! Sevgilerimle..."
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xs border border-stone-300 bg-white text-xs text-[#231B18] focus:outline-none focus:border-[#231B18] resize-none"
                    />

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => addQuickNote('Yeni eviniz huzur, bereket ve mutluluk getirsin!')}
                        className="text-[11px] px-2.5 py-1 rounded-xs bg-white hover:border-[#231B18] border border-stone-200 text-[#231B18] transition"
                      >
                        🏡 Yeni Ev
                      </button>
                      <button
                        type="button"
                        onClick={() => addQuickNote('Nice mutlu, aydınlık ve huzurlu yaşlara! Doğum günün kutlu olsun.')}
                        className="text-[11px] px-2.5 py-1 rounded-xs bg-white hover:border-[#231B18] border border-stone-200 text-[#231B18] transition"
                      >
                        🎂 Doğum Günü
                      </button>
                      <button
                        type="button"
                        onClick={() => addQuickNote('Bir ömür boyu mutluluklar dilerim! Sevginiz her daim aydınlık kalsın.')}
                        className="text-[11px] px-2.5 py-1 rounded-xs bg-white hover:border-[#231B18] border border-stone-200 text-[#231B18] transition"
                      >
                        💍 Söz / Nişan / Düğün
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Çapraz Satış (Cross-sell) */}
              <div className="bg-white rounded-xs border border-stone-200/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#231B18]">
                      Sepetinize Özel Tamamlayıcı Ürünler
                    </h3>
                    <p className="text-xs text-[#7A7067] mt-0.5">
                      Seçtiğiniz ürünlerle uyumlu atölye aksesuarları
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => scrollCarousel('left')}
                      className="p-1.5 rounded-xs border border-stone-200 hover:border-stone-400 text-stone-700"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => scrollCarousel('right')}
                      className="p-1.5 rounded-xs border border-stone-200 hover:border-stone-400 text-stone-700"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x"
                >
                  {CROSS_SELL_PRODUCTS.map((prod) => (
                    <div
                      key={prod.id}
                      className="min-w-[200px] max-w-[220px] shrink-0 bg-[#FAF8F5] border border-stone-200/80 rounded-xs p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-square rounded-xs overflow-hidden mb-2 bg-white">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-xs font-serif font-medium text-[#231B18] line-clamp-2">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-[#231B18]">
                            ₺{prod.discountedPrice.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              id: prod.id,
                              name: prod.name,
                              price: prod.discountedPrice,
                              originalPrice: prod.originalPrice,
                              quantity: 1,
                              image: prod.image,
                            })
                          }
                          className="px-2.5 py-1 bg-[#231B18] hover:bg-[#3A2E29] text-white text-[11px] uppercase tracking-wider rounded-xs font-medium"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── SAĞ KOLON (4 Sütun - Sticky): Sipariş Özeti ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              
              <div className="bg-[#FAF8F5] rounded-xs border border-stone-200/80 p-6 space-y-5">
                <h3 className="font-serif text-xl font-normal text-[#231B18] pb-3 border-b border-stone-200">
                  Sipariş Özeti
                </h3>

                {/* Kupon Kodu */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block">
                    İndirim Kuponu
                  </label>
                  {appliedCoupon ? (
                    <div className="p-3 bg-white border border-stone-200 rounded-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span className="text-xs font-semibold text-[#231B18]">
                          {appliedCoupon.code} ({appliedCoupon.label})
                        </span>
                      </div>
                      <button onClick={removeCoupon} className="p-1 text-stone-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Kupon Kodu"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xs text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-wider font-medium rounded-xs"
                      >
                        Uygula
                      </button>
                    </form>
                  )}

                  {!appliedCoupon && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#7A7067]">Öneri:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickCoupon('SAFIRYA10')}
                        className="text-[10px] text-[#C85A32] underline"
                      >
                        SAFIRYA10 (%10)
                      </button>
                    </div>
                  )}
                </div>

                {/* Safir Puan Kullanımı */}
                <div className="space-y-2 pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Safir Puan Kullan</span>
                    </label>
                    {currentUser && loyaltyAccount && (
                      <span className="text-[10px] text-stone-500">
                        Bakiye: <strong className="text-[#C85A32]">{loyaltyAccount.pointsBalance}</strong> Puan
                      </span>
                    )}
                  </div>

                  {appliedPoints > 0 ? (
                    <div className="p-3 bg-white border border-emerald-200 rounded-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <div>
                          <span className="text-xs font-semibold text-emerald-800 block">
                            {appliedPoints} Puan Uygulandı
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            -₺{pointsDiscount.toFixed(2)} indirim uygulandı
                          </span>
                        </div>
                      </div>
                      <button onClick={removePoints} className="p-1 text-stone-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : currentUser ? (
                    loyaltyAccount && loyaltyAccount.pointsBalance >= 50 ? (
                      <div className="space-y-2">
                        <form onSubmit={handleApplyPoints} className="flex gap-2">
                          <input
                            type="number"
                            min="50"
                            max={loyaltyAccount.pointsBalance}
                            step="10"
                            placeholder="Örn: 100"
                            value={pointsInput}
                            onChange={(e) => setPointsInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xs text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs uppercase tracking-wider font-medium rounded-xs"
                          >
                            Kullan
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={handleQuickUseAllPoints}
                          className="text-[11px] text-[#C85A32] hover:underline block text-left"
                        >
                          ⚡ Tüm kullanılabilir puanları kullan ({Math.min(loyaltyAccount.pointsBalance, Math.floor(discountedSubtotal * 0.5 / 0.5))} Puan = ₺{((Math.min(loyaltyAccount.pointsBalance, Math.floor(discountedSubtotal * 0.5 / 0.5))) * 0.5).toFixed(2)})
                        </button>
                        {pointsFeedback && (
                          <div
                            className={`text-[10px] p-2 rounded ${
                              pointsFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {pointsFeedback.message}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded border border-stone-100">
                        Puan kullanmak için en az 50 Safir Puan gereklidir. Mevcut: {loyaltyAccount?.pointsBalance || 0} Puan.
                      </div>
                    )
                  ) : (
                    <div className="text-[11px] text-stone-600 bg-amber-50/70 p-2.5 rounded border border-amber-200/60 flex items-center justify-between">
                      <span>100 Puan (₺50) hoş geldin hediyeni kullan</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalView('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-[#C85A32] underline ml-2 shrink-0"
                      >
                        Giriş Yap
                      </button>
                    </div>
                  )}
                </div>

                {/* Fiyat Kırılımı */}
                <div className="space-y-2.5 text-xs text-[#554D46] pt-2 border-t border-stone-200">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span className="font-semibold text-[#231B18]">₺{cartTotal.toFixed(2)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#C85A32]">
                      <span>Kupon İndirimi ({appliedCoupon?.code})</span>
                      <span className="font-semibold">-₺{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-[#C85A32]">
                      <span>Safir Puan İndirimi ({appliedPoints} Puan)</span>
                      <span className="font-semibold">-₺{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {isGiftWrapped && (
                    <div className="flex justify-between text-[#231B18]">
                      <span>Hediye Paketi</span>
                      <span className="font-semibold">+₺{giftWrapFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Kargo Bedeli</span>
                    {isFreeShipping ? (
                      <span className="font-semibold text-emerald-700 bg-[#FEF5C8] px-2 py-0.5 rounded-none text-[11px]">
                        ÜCRETSİZ
                      </span>
                    ) : (
                      <span className="font-semibold text-[#231B18]">₺45.00</span>
                    )}
                  </div>
                </div>

                {/* Kazanılacak Safir Puan Rozeti */}
                {pointsToEarn > 0 && (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-lg flex items-center justify-between text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Kazanılacak Puan:</span>
                    </div>
                    <strong className="text-[#C85A32] font-semibold">+{pointsToEarn} Safir Puan</strong>
                  </div>
                )}

                {/* Toplam Tutar */}
                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-[#7A7067] block">Toplam Tutar</span>
                    <span className="text-[10px] text-[#7A7067]">KDV Dahil</span>
                  </div>
                  <span className="text-2xl font-serif text-[#231B18] font-semibold">
                    ₺{grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Buton */}
                <Link
                  href="/odeme"
                  className="w-full py-3.5 bg-[#231B18] hover:bg-[#3A2E29] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium rounded-xs transition"
                >
                  <span>Siparişi Tamamla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-[#7A7067] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit SSL Güvenli Alışveriş</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* Boş Sepet Ekranı */
          <div className="text-center py-20 bg-[#FAF8F5] rounded-xs border border-stone-200/80 max-w-md mx-auto p-8">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3 stroke-[1.2]" />
            <h3 className="font-serif text-xl font-normal text-[#231B18] mb-1">
              Sepetinizde Ürün Bulunmuyor
            </h3>
            <p className="text-xs text-[#7A7067] mb-6 leading-relaxed">
              Koleksiyonlarımızdaki doğal mum, takı ve el emeği objeleri incelemeye başlayabilirsiniz.
            </p>
            <Link
              href="/kategoriler"
              className="px-6 py-3 bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium rounded-xs inline-flex items-center gap-2"
            >
              <span>Koleksiyonları Keşfet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
