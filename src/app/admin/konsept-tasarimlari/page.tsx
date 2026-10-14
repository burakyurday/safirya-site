'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  Eye,
  Sliders,
  Check,
  ArrowRight,
  Maximize2,
  Grid3X3,
  Columns,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { ConceptSlotKey, ConceptBannerItem } from '@/types/admin';

export default function KonseptTasarimlariPage() {
  const {
    conceptBanners,
    updateConceptBanner,
    resetConceptBanners,
    categories,
    showToast,
  } = useAdmin();

  const [selectedSlot, setSelectedSlot] = useState<ConceptSlotKey>('hero');
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const bannerSlots: {
    key: ConceptSlotKey;
    title: string;
    sectionName: string;
    dimensions: string;
    ratio: string;
    description: string;
  }[] = [
    {
      key: 'hero',
      title: 'Ana Hero Banner',
      sectionName: 'Üst Geniş Vitrin',
      dimensions: '1920 × 600 px (Geniş Ekran) / Mobil: 800 × 800 px',
      ratio: '16:5',
      description: 'Sayfanın en üstünde yer alan ana vitrin ve kampanya banner alanı.',
    },
    {
      key: 'category_1',
      title: '1. Koleksiyon Kartı (Sol)',
      sectionName: 'Kategorilerimize Göz Atın',
      dimensions: '800 × 800 px (1:1 Kare)',
      ratio: '1:1',
      description: '3\'lü vitrinin sol kartı (Örn: Çay Fincanı Seti / Doğal Mumlar).',
    },
    {
      key: 'category_2',
      title: '2. Koleksiyon Kartı (Orta)',
      sectionName: 'Kategorilerimize Göz Atın',
      dimensions: '800 × 800 px (1:1 Kare)',
      ratio: '1:1',
      description: '3\'lü vitrinin orta kartı (Örn: Kahve Yanı Bardağı Seti / Takılar).',
    },
    {
      key: 'category_3',
      title: '3. Koleksiyon Kartı (Sağ)',
      sectionName: 'Kategorilerimize Göz Atın',
      dimensions: '800 × 800 px (1:1 Kare)',
      ratio: '1:1',
      description: '3\'lü vitrinin sağ kartı (Örn: Tabak Setleri / Epoksi Tasarımlar).',
    },
    {
      key: 'showcase_1',
      title: 'Vitrin 1 - Split Banner',
      sectionName: 'Kavanoz & Saklama Koleksiyonu',
      dimensions: '1200 × 800 px (4:3 veya 3:2)',
      ratio: '4:3',
      description: 'Sol tarafında geniş konsept görseli, sağında 3 adet ürün sergileyen vitrin bölümü.',
    },
    {
      key: 'showcase_2',
      title: 'Vitrin 2 - Split Banner',
      sectionName: 'Kahvaltılık & Sofra Koleksiyonu',
      dimensions: '1200 × 800 px (4:3 veya 3:2)',
      ratio: '4:3',
      description: 'Sol tarafında geniş konsept görseli, sağında 3 adet ürün sergileyen 2. vitrin bölümü.',
    },
  ];

  const currentBanner = conceptBanners[selectedSlot] || {
    id: `concept-${selectedSlot}`,
    slotKey: selectedSlot,
    slotName: 'Konsept Alanı',
    title: '',
    subtitle: '',
    tag: '',
    buttonText: 'KEŞFEDİN',
    buttonLink: '/kategoriler',
    imageUrl: '',
    recommendedDimensions: '1200 × 800 px',
    aspectRatioLabel: 'Standart',
    isActive: true,
  };

  // Bulut veya Yerel Dosya Yükleme (Cloudinary / Supabase Storage Entegrasyonu)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotKey: ConceptSlotKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Görsel boyutu en fazla 10MB olmalıdır.');
      return;
    }

    setIsUploading(slotKey);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'safirya_banners');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        updateConceptBanner(slotKey, { imageUrl: data.url });
        showToast(
          data.provider === 'cloudinary'
            ? 'Görsel Cloudinary CDN üzerine yüklendi ve vitrinde yayına alındı.'
            : data.provider === 'supabase'
            ? 'Görsel Supabase Storage üzerine yüklendi ve vitrinde yayına alındı.'
            : 'Görsel başarıyla vitrinde yayına alındı.'
        );
      } else {
        alert(data.error || 'Görsel yüklenirken bir hata oluştu.');
      }
    } catch {
      alert('Görsel yükleme servisine bağlanırken bir hata oluştu.');
    } finally {
      setIsUploading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* ── Üst Başlık & Aksiyonlar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DCD3] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C85A32] font-semibold">
            <ImageIcon className="w-4 h-4" />
            <span>Vitrin Tasarım Yönetimi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#231B18] mt-1">
            Konsept Tasarımları & Boyut Rehberi
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1 max-w-2xl">
            Ana sayfadaki tüm konsept afişlerini, kampanya bannerlarını ve koleksiyon alanlarını buradan yönetebilirsiniz. Boyut rehberine uygun görselleri eklediğinizde mağaza vitrininiz anında güncellenir.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xs border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-[#F6F3EC] text-xs uppercase tracking-wider font-medium transition inline-flex items-center gap-1.5"
          >
            <span>Canlı Mağazada Gör</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              if (confirm('Tüm konsept alanlarını varsayılan boş şablona sıfırlamak istediğinize emin misiniz?')) {
                resetConceptBanners();
              }
            }}
            className="px-3 py-2 rounded-xs border border-[#E2DCD3] text-[#7A7067] hover:text-[#C85A32] hover:border-[#C85A32] text-xs font-medium transition inline-flex items-center gap-1.5"
            title="Tüm alanları sıfırla"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>
        </div>
      </div>

      {/* ── Boyut ve Format Kılavuzu Bilgi Kartı ── */}
      <div className="bg-[#FAF8F5] border border-[#E2DCD3] rounded-xs p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xs bg-[#231B18] text-[#F6F3EC] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[#231B18] uppercase tracking-wider">
                Tavsiye Edilen Görsel Çözünürlükleri & Format Standartları
              </h3>
              <p className="text-xs text-[#7A7067] mt-0.5 leading-relaxed">
                Tasarım hazırlarken aşağıdaki tam piksel ölçülerini referans alınız. Yüksek çözünürlüklü Retina ekranlarda keskin durması için WebP veya yüksek kaliteli JPG formatı tavsiye edilir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xs border border-[#E2DCD3] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] block">
                    1. Ana Hero Banner
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#231B18] block mt-0.5">
                    1920 × 600 px
                  </span>
                </div>
                <span className="text-[11px] text-[#7A7067] mt-1">16:5 En-Boy Oranı • Masaüstü Panoramik</span>
              </div>

              <div className="bg-white p-3 rounded-xs border border-[#E2DCD3] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] block">
                    2. 3&apos;lü Koleksiyon Kartları
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#231B18] block mt-0.5">
                    800 × 800 px
                  </span>
                </div>
                <span className="text-[11px] text-[#7A7067] mt-1">1:1 Tam Kare • Kategorilerimize Göz Atın</span>
              </div>

              <div className="bg-white p-3 rounded-xs border border-[#E2DCD3] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] block">
                    3. Vitrin Split Bannerları
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#231B18] block mt-0.5">
                    1200 × 800 px
                  </span>
                </div>
                <span className="text-[11px] text-[#7A7067] mt-1">4:3 veya 3:2 Yatay • Sol Büyük Afiş</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alan Seçim Sekmeleri (Slot Navigator) ── */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#7A7067] mb-3">
          Düzenlemek İstediğiniz Konsept Alanını Seçin:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {bannerSlots.map((slot) => {
            const hasImage = Boolean(conceptBanners[slot.key]?.imageUrl);
            const isSelected = selectedSlot === slot.key;

            return (
              <button
                key={slot.key}
                onClick={() => setSelectedSlot(slot.key)}
                className={`p-3 text-left rounded-xs border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#231B18] bg-[#231B18] text-white shadow-sm'
                    : 'border-[#E2DCD3] bg-white text-[#231B18] hover:border-[#7A7067]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-none font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#C85A32] border border-[#E2DCD3]'
                    }`}>
                      {slot.ratio}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${hasImage ? 'bg-emerald-500' : 'bg-amber-400'}`} title={hasImage ? 'Görsel Yüklü' : 'Henüz Boş'} />
                  </div>
                  <h4 className="text-xs font-semibold leading-tight line-clamp-1">{slot.title}</h4>
                </div>
                <div className={`text-[10px] mt-2 font-mono ${isSelected ? 'text-stone-300' : 'text-[#7A7067]'}`}>
                  {slot.dimensions.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Seçili Slotun Düzenleme Kartı ── */}
      <div className="bg-white border border-[#E2DCD3] rounded-xs p-6 sm:p-8 space-y-6">
        
        {/* Slot Başlığı ve Boyut Etiketi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD3] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-[#C85A32] text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                {currentBanner.slotKey}
              </span>
              <h2 className="text-xl font-serif text-[#231B18]">
                {bannerSlots.find((s) => s.key === selectedSlot)?.title}
              </h2>
            </div>
            <p className="text-xs text-[#7A7067] mt-1">
              {bannerSlots.find((s) => s.key === selectedSlot)?.description}
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E2DCD3] px-3.5 py-2 rounded-xs text-right">
            <span className="text-[10px] uppercase font-bold text-[#7A7067] block">Önerilen Çözünürlük</span>
            <span className="text-xs font-mono font-bold text-[#231B18]">
              {bannerSlots.find((s) => s.key === selectedSlot)?.dimensions}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sol Kolon (5 Sütun): Görsel Önizleme & Yükleme */}
          <div className="lg:col-span-5 space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block">
              Görsel Önizlemesi & Yükleme
            </label>

            {/* Önizleme Kutusu */}
            <div className={`relative overflow-hidden rounded-xs border-2 ${
              currentBanner.imageUrl
                ? 'border-[#231B18] bg-stone-900'
                : 'border-dashed border-[#C85A32]/40 bg-[#FAF8F5]'
            } flex items-center justify-center p-2 min-h-[220px]`}>
              
              {currentBanner.imageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title || 'Konsept Görseli'}
                    className="w-full h-48 sm:h-56 object-cover rounded-xs"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateConceptBanner(selectedSlot, { imageUrl: '' })}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xs flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Görseli Kaldır</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E2DCD3] mx-auto flex items-center justify-center text-[#7A7067]">
                    <ImageIcon className="w-6 h-6 stroke-[1.2]" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#231B18] block">Görsel Henüz Eklenmedi</span>
                    <span className="text-[11px] text-[#7A7067] block mt-0.5">
                      Bu alan ana sayfada boyut rehberiyle birlikte boş şablon olarak gösterilir.
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#C85A32] font-semibold pt-1">
                    📐 {bannerSlots.find((s) => s.key === selectedSlot)?.dimensions.split('/')[0]}
                  </div>
                </div>
              )}
            </div>

            {/* Yükleme Butonları */}
            <div className="space-y-3">
              <label className="block">
                <span className="sr-only">Dosya Seç</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileUpload(e, selectedSlot)}
                  disabled={isUploading === selectedSlot}
                  className="block w-full text-xs text-[#7A7067] file:mr-3 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#231B18] file:text-white hover:file:bg-[#3A2E29] file:cursor-pointer cursor-pointer border border-[#E2DCD3] rounded-xs"
                />
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Veya Görsel URL Linki yapıştırın (https://...)"
                  value={currentBanner.imageUrl || ''}
                  onChange={(e) => updateConceptBanner(selectedSlot, { imageUrl: e.target.value })}
                  className="flex-1 px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
                />
                {currentBanner.imageUrl && (
                  <button
                    onClick={() => updateConceptBanner(selectedSlot, { imageUrl: '' })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xs border border-red-200"
                    title="Görseli Sıfırla"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Kolon (7 Sütun): Metinler & Yönlendirme */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Başlık & Alt Başlık */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                  Ana Başlık
                </label>
                <input
                  type="text"
                  value={currentBanner.title}
                  onChange={(e) => updateConceptBanner(selectedSlot, { title: e.target.value })}
                  placeholder="Örn: SON YAZ FIRSATLARI"
                  className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                  Üst / Alt Başlık
                </label>
                <input
                  type="text"
                  value={currentBanner.subtitle || ''}
                  onChange={(e) => updateConceptBanner(selectedSlot, { subtitle: e.target.value })}
                  placeholder="Örn: Seçili Ürünlerde %50'ye Varan İndirim"
                  className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
                />
              </div>
            </div>

            {/* 2. Kampanya Rozeti & Buton Metni */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                  Kampanya Rozeti (Tag)
                </label>
                <input
                  type="text"
                  value={currentBanner.tag || ''}
                  onChange={(e) => updateConceptBanner(selectedSlot, { tag: e.target.value })}
                  placeholder="Örn: %50'YE VARAN İNDİRİM"
                  className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                  Buton Metni
                </label>
                <input
                  type="text"
                  value={currentBanner.buttonText}
                  onChange={(e) => updateConceptBanner(selectedSlot, { buttonText: e.target.value })}
                  placeholder="Örn: ALIŞVERİŞE BAŞLA"
                  className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
                />
              </div>
            </div>

            {/* 3. Buton Linki */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                Buton Yönlendirme Linki (Sayfa URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentBanner.buttonLink}
                  onChange={(e) => updateConceptBanner(selectedSlot, { buttonLink: e.target.value })}
                  placeholder="/kategoriler/dogal-mumlar veya /cok-satanlar"
                  className="flex-1 px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      updateConceptBanner(selectedSlot, { buttonLink: e.target.value });
                    }
                  }}
                  className="px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs bg-[#FAF8F5] text-[#231B18]"
                >
                  <option value="">Hızlı Kategori Seç...</option>
                  <option value="/cok-satanlar">Çok Satanlar</option>
                  <option value="/kategoriler">Tüm Kategoriler</option>
                  <option value="/kisiye-ozel-toplu-siparis">Özel & Toplu Sipariş</option>
                  {categories.map((c) => (
                    <option key={c.id} value={`/kategoriler/${c.slug}`}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vitrin 1 ve Vitrin 2 için Kategori Bağlantısı */}
            {(selectedSlot === 'showcase_1' || selectedSlot === 'showcase_2') && (
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-xs space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block">
                  Yanında Gösterilecek Ürün Kategorisi (3 Ürün)
                </label>
                <select
                  value={currentBanner.categorySlug || ''}
                  onChange={(e) => updateConceptBanner(selectedSlot, { categorySlug: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs bg-white text-[#231B18]"
                >
                  <option value="">Tüm Koleksiyondan Otomatik Seç</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#7A7067]">
                  Bu konsept afişinin sağ tarafında sergilenecek 3 adet ürün bu seçilen kategoriden dinamik olarak getirilir.
                </p>
              </div>
            )}

            {/* Aktiflik Durumu */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2DCD3]">
              <div>
                <span className="text-xs font-semibold text-[#231B18] block">Vitrinde Göster (Aktif)</span>
                <span className="text-[11px] text-[#7A7067] block">Pasife alındığında bu alan gizlenir.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentBanner.isActive}
                  onChange={(e) => updateConceptBanner(selectedSlot, { isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
              </label>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
