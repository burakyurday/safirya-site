'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star,
  Search,
  Truck,
  Minus,
  Plus,
  ChevronDown,
  Info,
  Share2,
  Link as LinkIcon,
  Heart,
  Sparkles,
  CheckCircle2,
  Send,
  X,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ALL_CATALOG_PRODUCTS } from '@/lib/catalog';

interface BulkTier {
  quantityLabel: string;
  min: number;
  discountPct: number;
  discountLabel: string;
}

const BULK_TIERS: BulkTier[] = [
  { quantityLabel: '1 Adet', min: 1, discountPct: 0, discountLabel: 'Standart' },
  { quantityLabel: '10+ Adet', min: 10, discountPct: 10, discountLabel: '%10 İndirim' },
  { quantityLabel: '50+ Adet', min: 50, discountPct: 15, discountLabel: '%15 İndirim' },
  { quantityLabel: '100+ Adet', min: 100, discountPct: 20, discountLabel: '%20 İndirim' },
];

const COLOR_OPTIONS = [
  { name: 'Lacivert', hex: '#1B2A4A' },
  { name: 'Zümrüt Yeşili', hex: '#2D5A27' },
  { name: 'Terracotta', hex: '#C86428' },
  { name: 'Gold & Krem', hex: '#D4AF37' },
  { name: 'Pudra Pembe', hex: '#E8B4B8' },
];

const SCENT_OPTIONS = [
  'Vanilya & Karamel',
  'Fransız Lavantası',
  'Sandal Ağacı & Amber',
  'Sedir Ağacı & Misk',
  'Beyaz Yasemin & Narenciye',
];

export default function ProductDetailPage() {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const catalogItem = ALL_CATALOG_PRODUCTS.find((p) => p.slug === slug);

  const product = {
    id: catalogItem?.id || 'sfr-bundle-1',
    name: catalogItem?.name || 'Doğal Mum & Epoksi Kişiselleştirilebilir Hediye Seti',
    slug: catalogItem?.slug || 'dogal-mum-epoksi-kisiye-ozel-hediye-seti',
    brand: catalogItem?.brand || 'SAFİRYA',
    price: catalogItem?.discountPrice || catalogItem?.price || 349,
    originalPrice: catalogItem?.discountPrice ? catalogItem.price : 429,
    discountRate: catalogItem?.discountRate || 18,
    savedAmount:
      catalogItem?.discountPrice && catalogItem.price
        ? catalogItem.price - catalogItem.discountPrice
        : 80,
    rating: catalogItem?.rating || 4.9,
    reviewCount: catalogItem?.reviewCount || 124,
    images: catalogItem
      ? [
          catalogItem.image,
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
        ]
      : [
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1000&q=80',
        ],
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedScent, setSelectedScent] = useState('Vanilya & Karamel');
  const [isScentDropdownOpen, setIsScentDropdownOpen] = useState(false);
  const [customText, setCustomText] = useState('Selin & Emre 24.10.2026');
  const [selectedColor, setSelectedColor] = useState('Gold & Krem');
  const [quantity, setQuantity] = useState(1);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const favorite = isFavorite(product.id);

  const activeDiscountPct = BULK_TIERS[selectedTierIndex].discountPct;
  const unitPrice = activeDiscountPct > 0 
    ? Math.round(product.price * (1 - activeDiscountPct / 100))
    : product.price;

  const handleSelectTier = (index: number) => {
    setSelectedTierIndex(index);
    setQuantity(BULK_TIERS[index].min);
  };

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: unitPrice,
      originalPrice: product.originalPrice,
      quantity,
      image: product.images[0],
      scentNote: selectedScent,
      customText: customText.trim() || undefined,
      colorPalette: selectedColor,
      bulkTierLabel: BULK_TIERS[selectedTierIndex].quantityLabel,
      bulkDiscountRate: activeDiscountPct,
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-[#231B18]">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#7A7067] mb-8">
          <Link href="/" className="hover:text-[#C85A32] transition">Anasayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:text-[#C85A32] transition">Koleksiyonlar</Link>
          <span>/</span>
          <span className="text-[#231B18] font-medium">{product.name}</span>
        </nav>

        {/* 2 Sütunlu Ana Gövde */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ── SOL KOLON: ÜRÜN GALERİSİ (5 Sütun) ── */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Ana Büyük Görsel */}
            <div className="relative aspect-square rounded-xs overflow-hidden bg-[#FAF8F5] border border-stone-200/80 group">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
              />
              
              {/* Büyüteç Butonu */}
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 text-stone-700 hover:text-[#C85A32] shadow-xs flex items-center justify-center transition"
                title="Büyük Görseli İncele"
              >
                <Search className="w-4 h-4 stroke-[1.5]" />
              </button>

              {/* Favori Butonu */}
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-3 left-3 w-9 h-9 rounded-full bg-white/95 shadow-xs flex items-center justify-center transition ${
                  favorite ? 'text-red-500' : 'text-stone-700 hover:text-red-500'
                }`}
                title="Favorilere Ekle"
              >
                <Heart className={`w-4 h-4 stroke-[1.5] ${favorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Satırı */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-xs overflow-hidden border transition-all ${
                    selectedImage === idx
                      ? 'border-[#231B18] ring-1 ring-[#231B18]'
                      : 'border-stone-200/80 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Görsel ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Güven Rozetleri Alt Bandı */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100 text-center text-xs">
              <div className="p-2.5 bg-[#FAF8F5] rounded-xs border border-stone-200/60">
                <Truck className="w-4 h-4 text-[#C85A32] mx-auto mb-1 stroke-[1.5]" />
                <span className="font-medium text-[#231B18] block text-[11px]">2 İş Günü Kargo</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded-xs border border-stone-200/60">
                <ShieldCheck className="w-4 h-4 text-[#C85A32] mx-auto mb-1 stroke-[1.5]" />
                <span className="font-medium text-[#231B18] block text-[11px]">Hasarsız Teslimat</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded-xs border border-stone-200/60">
                <Sparkles className="w-4 h-4 text-[#C85A32] mx-auto mb-1 stroke-[1.5]" />
                <span className="font-medium text-[#231B18] block text-[11px]">%100 Doğal Soya</span>
              </div>
            </div>

          </div>

          {/* ── SAĞ KOLON: BİLGİ & KİŞİSELLEŞTİRME (6 Sütun) ── */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Marka & Başlık */}
            <div className="space-y-1.5 border-b border-stone-100 pb-5">
              <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#7A7067] font-semibold block">
                {product.brand} • ZANAAT ATÖLYESİ
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal leading-tight">
                {product.name}
              </h1>

              {/* Değerlendirme & Yorumlar */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <div className="flex items-center text-[#C85A32]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-[#231B18]">{product.rating}</span>
                <span className="text-[#7A7067]">({product.reviewCount} Değerlendirme)</span>
              </div>
            </div>

            {/* Fiyat Satırı */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-serif text-[#C85A32] font-semibold">
                {unitPrice.toFixed(2)} TL
              </span>
              <span className="text-base text-[#7A7067] line-through font-mono">
                {product.originalPrice.toFixed(2)} TL
              </span>
              {activeDiscountPct > 0 && (
                <span className="bg-[#C85A32] text-white text-[10px] font-medium uppercase px-2 py-0.5 tracking-wider">
                  %{activeDiscountPct} Barem İndirimi
                </span>
              )}
            </div>

            {/* ── KİŞİSELLEŞTİRME VE KONFİGÜRASYON FORMU ── */}
            <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xs p-5 sm:p-6 space-y-5">
              <div className="border-b border-stone-200/60 pb-3">
                <h3 className="text-xs uppercase font-semibold tracking-widest text-[#231B18]">
                  Özelleştirme Seçenekleri
                </h3>
              </div>

              {/* 1. Koku Seçimi */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#231B18] block uppercase tracking-wider">
                  Koku Seçimi: <span className="font-normal text-[#7A7067]">{selectedScent}</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsScentDropdownOpen(!isScentDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-stone-300 rounded-xs text-xs font-medium text-[#231B18] hover:border-[#231B18] transition"
                  >
                    <span>{selectedScent}</span>
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  </button>

                  {isScentDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xs shadow-xl z-20 overflow-hidden py-1">
                      {SCENT_OPTIONS.map((scent) => (
                        <button
                          key={scent}
                          type="button"
                          onClick={() => {
                            setSelectedScent(scent);
                            setIsScentDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs transition ${
                            selectedScent === scent
                              ? 'bg-[#FAF8F5] text-[#C85A32] font-semibold'
                              : 'text-[#231B18] hover:bg-stone-50'
                          }`}
                        >
                          {scent}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Kişiselleştirme Yazısı */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#231B18] block uppercase tracking-wider">
                  Ürün Üzerine Yazılacak İsim / Tarih / Mesaj
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={40}
                  placeholder="Örn: Selin & Emre 24.10.2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xs text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                />
                <span className="text-[10px] text-[#7A7067] block text-right">
                  {customText.length}/40 Karakter
                </span>
              </div>

              {/* 3. Epoksi & Renk Paleti */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#231B18] block uppercase tracking-wider">
                  Renk Seçeneği: <span className="font-normal text-[#7A7067]">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  {COLOR_OPTIONS.map((color) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-[#231B18] scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 4. Toplu Sipariş Barem Baremleri */}
              <div className="space-y-2 border-t border-stone-200/60 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block">
                  Toplu Sipariş Baremleri (Adede Göre İndirim)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {BULK_TIERS.map((tier, idx) => {
                    const isSelected = selectedTierIndex === idx;
                    return (
                      <button
                        key={tier.quantityLabel}
                        type="button"
                        onClick={() => handleSelectTier(idx)}
                        className={`p-2.5 rounded-xs text-center border transition-all ${
                          isSelected
                            ? 'bg-[#231B18] text-white border-[#231B18]'
                            : 'bg-white border-stone-300 text-[#231B18] hover:border-stone-500'
                        }`}
                      >
                        <span className="block text-xs font-semibold">{tier.quantityLabel}</span>
                        <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-stone-300' : 'text-[#C85A32]'}`}>
                          {tier.discountLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Adet Seçimi */}
              <div className="flex items-center justify-between border-t border-stone-200/60 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#231B18]">
                  Sipariş Adedi
                </span>
                <div className="flex items-center border border-stone-300 bg-white rounded-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-stone-600 hover:text-[#231B18] transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold text-[#231B18]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-stone-600 hover:text-[#231B18] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Başarılı Bildirim */}
              {addedNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ürün sepetinize başarıyla eklendi!</span>
                </div>
              )}

              {/* Aksiyon Butonları */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-[#231B18] hover:bg-[#3A2E29] text-white py-3.5 rounded-xs text-xs uppercase tracking-widest font-medium transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                  <span>Sepete Ekle • ₺{(unitPrice * quantity).toLocaleString('tr-TR')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-white py-3 rounded-xs text-xs uppercase tracking-widest font-medium transition text-center"
                >
                  Özel Gün & Toplu Teklif Al
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* ── ZOOM MODALI ── */}
        {isZoomed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="max-h-[85vh] w-auto rounded-xs object-contain"
              />
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white text-[#231B18] hover:text-[#C85A32] shadow-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── ÖZEL TEKLİF MODALI ── */}
        {isQuoteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsQuoteModalOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-xs shadow-2xl border border-stone-200 p-6 sm:p-8 text-[#231B18] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-[#C85A32] transition"
              >
                <X className="w-5 h-5" />
              </button>

              {quoteSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-xl font-normal text-[#231B18]">Teklif Talebiniz Alındı!</h3>
                  <p className="text-xs text-[#7A7067] max-w-sm mx-auto">
                    Atölye şefimiz özel tasarım ve adet detaylarınızı inceleyerek en geç 24 saat içinde sizinle iletişime geçecektir.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuoteModalOpen(false);
                      setQuoteSubmitted(false);
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xs bg-[#231B18] text-white text-xs uppercase tracking-wider font-medium"
                  >
                    Kapat
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setQuoteSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="font-serif text-xl font-normal text-[#231B18]">
                      Toplu Sipariş & Özel Teklif Talebi
                    </h3>
                    <p className="text-xs text-[#7A7067] mt-0.5">
                      Söz, nişan, nikah veya kurumsal hediyeleriniz için hızlı fiyat teklifi alın.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold block mb-1">Adınız Soyadınız *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ad Soyad"
                        className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1">E-posta Adresi *</label>
                        <input
                          required
                          type="email"
                          placeholder="ornek@mail.com"
                          className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Telefon / WhatsApp *</label>
                        <input
                          required
                          type="tel"
                          placeholder="05XX XXX XX XX"
                          className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1">Etkinlik Türü & Notlarınız</label>
                      <textarea
                        rows={2}
                        placeholder="Hediyelik sayısı, etkinlik tarihi ve özel istekleriniz..."
                        className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18] resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium rounded-xs transition"
                  >
                    Teklif Talebini Gönder
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
