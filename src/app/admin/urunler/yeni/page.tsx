'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PackagePlus,
  ArrowLeft,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Flame,
  Gem,
  Palette,
  Clock,
  Heart,
  Tag,
  DollarSign,
  Layers,
  ChevronRight,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProductVariant, AdminBulkTier } from '@/types/admin';

// Kategori seçenekleri ve ikonları
const CATEGORIES = [
  { id: 'cat-mum', name: 'Doğal Mumlar', icon: Flame, codePrefix: 'SFR-MUM' },
  { id: 'cat-tas', name: 'Kokulu Taş & Seramik', icon: Gem, codePrefix: 'SFR-TAS' },
  { id: 'cat-epoksi', name: 'Epoksi Tasarımlar', icon: Palette, codePrefix: 'SFR-EPX' },
  { id: 'cat-miyuki', name: 'Miyuki Boncuk Takı', icon: Sparkles, codePrefix: 'SFR-MYK' },
  { id: 'cat-ozel', name: 'Özel Tasarım & Hediyelik', icon: Tag, codePrefix: 'SFR-OZL' },
];

// Hazır Örnek Atölye Görselleri Kütüphanesi
const PRESET_GALLERY = [
  {
    category: 'Doğal Mumlar',
    title: 'Kehribar Cam Kavanoz Mum',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Doğal Mumlar',
    title: 'Yanan Çıtırtılı Ahşap Fitil',
    url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Doğal Mumlar',
    title: 'Kraft Etiketli Söz/Nişan Mumu',
    url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Kokulu Taş & Seramik',
    title: 'Venüs Heykel Büstü Kokulu Taş',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Epoksi Tasarımlar',
    title: 'Ceviz Ağacı & Safir Mavi Tepsi',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Epoksi Tasarımlar',
    title: 'Şeffaf Reçine & Doğal Çiçek Sunumluk',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Miyuki Boncuk Takı',
    title: 'Japon Delica 11/0 Safir Altın Bileklik',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Miyuki Boncuk Takı',
    title: 'El Dokuması Geometrik Miyuki',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  },
];

// Hazır Koku Notaları
const PRESET_SCENTS = [
  'Fransız Lavantası',
  'Madagaskar Vanilyası',
  'Sandal Ağacı',
  'Sedir Ağacı & Amber',
  'Beyaz Misk',
  'Yasemin & Pudra',
  'Tarçın & Karanfil',
  'Okaliptüs & Çam',
  'Portakal Çiçeği',
];

// Hazır Renk Seçenekleri
const PRESET_COLORS = [
  'Safir Gece Mavisi',
  'Kehribar Sarısı',
  'Zümrüt Derin Yeşil',
  'Fildişi Doğal Krem',
  'Terracotta Kiremit',
  '24K Altın Yaldız',
  'Kömür Füme',
  'Toz Pembe',
];

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c',
    ğ: 'g', Ğ: 'g',
    ı: 'i', I: 'i', İ: 'i',
    ö: 'o', Ö: 'o',
    ş: 's', Ş: 's',
    ü: 'u', Ü: 'u',
  };
  return text
    .split('')
    .map((c) => trMap[c] || c)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function YeniUrunEklePage() {
  const router = useRouter();
  const { addProduct, categories, showToast } = useAdmin();

  // 1. Temel Bilgiler State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'cat-mum');
  const [sku, setSku] = useState('SFR-MUM-05');
  const [barcode, setBarcode] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');

  // 2. Fiyatlandırma & İndirim State
  const [price, setPrice] = useState<number>(350);
  const [discountRate, setDiscountRate] = useState<number>(10); // %10
  const discountPrice =
    discountRate > 0 ? Math.round(price * (1 - discountRate / 100)) : price;

  // 3. Atölye & Üretim Nitelikleri
  const [preparationDays, setPreparationDays] = useState<number>(2);
  const [isCustomizable, setIsCustomizable] = useState<boolean>(true);
  const [scentNotes, setScentNotes] = useState<string[]>([]);
  const [customScentInput, setCustomScentInput] = useState('');
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState('');

  // 4. Görseller State (Demo görseller kaldırıldı)
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  // 5. Stok & Durum
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [minThreshold, setMinThreshold] = useState<number>(10);
  const [inStock, setInStock] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);

  // 6. Varyantlar (Opsiyonel - Demo veriler kaldırıldı)
  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [showVariants, setShowVariants] = useState<boolean>(false);

  // 7. Toplu Fiyatlandırma Baremleri (Opsiyonel - Demo veriler kaldırıldı)
  const [bulkTiers, setBulkTiers] = useState<AdminBulkTier[]>([]);
  const [showBulkTiers, setShowBulkTiers] = useState<boolean>(false);

  // Dosya Yükleme (Cloudinary / Supabase Storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'safirya_products');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || 'Görsel yüklenemedi.');
      }
    } catch {
      alert('Görsel servisine bağlanırken bir hata oluştu.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Başlık değiştikçe otomatik slug üret
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  };

  // Kategori değişince SKU önerisini güncelle
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      setSku(`${cat.codePrefix}-${randomSuffix}`);
    }
  };

  // Görsel Ekleme
  const handleAddImage = (urlToAdd?: string) => {
    const targetUrl = urlToAdd || newImageUrl.trim();
    if (!targetUrl) return;
    if (!images.includes(targetUrl)) {
      setImages((prev) => [...prev, targetUrl]);
    }
    if (!urlToAdd) setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };

  // Koku Notaları Ekle / Çıkar
  const handleToggleScent = (scent: string) => {
    setScentNotes((prev) =>
      prev.includes(scent) ? prev.filter((s) => s !== scent) : [...prev, scent]
    );
  };

  const handleAddCustomScent = () => {
    if (!customScentInput.trim()) return;
    if (!scentNotes.includes(customScentInput.trim())) {
      setScentNotes((prev) => [...prev, customScentInput.trim()]);
    }
    setCustomScentInput('');
  };

  // Renk Seçenekleri Ekle / Çıkar
  const handleToggleColor = (color: string) => {
    setColorOptions((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleAddCustomColor = () => {
    if (!customColorInput.trim()) return;
    if (!colorOptions.includes(customColorInput.trim())) {
      setColorOptions((prev) => [...prev, customColorInput.trim()]);
    }
    setCustomColorInput('');
  };

  // Varyant İşlemleri
  const handleAddVariant = () => {
    const newVariant: AdminProductVariant = {
      id: `var-${Date.now()}`,
      title: 'Yeni Varyant (Örn: 500g Cam Kavanoz)',
      sku: `${sku}-V${variants.length + 1}`,
      price: price,
      stockQuantity: 20,
      sizeOrVolume: 'Standart',
      isActive: true,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleUpdateVariant = (id: string, updates: Partial<AdminProductVariant>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Barem İşlemleri
  const handleAddBulkTier = () => {
    const newTier: AdminBulkTier = {
      id: `tier-${Date.now()}`,
      minQuantity: (bulkTiers[bulkTiers.length - 1]?.maxQuantity || 50) + 1,
      maxQuantity: null,
      discountPercentage: 20,
      description: 'Özel Adet Hediyelik Baremi',
    };
    setBulkTiers((prev) => [...prev, newTier]);
  };

  const handleUpdateBulkTier = (id: string, updates: Partial<AdminBulkTier>) => {
    setBulkTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleRemoveBulkTier = (id: string) => {
    setBulkTiers((prev) => prev.filter((t) => t.id !== id));
  };

  // Form Gönderme
  const handleSubmit = (asDraft: boolean = false) => {
    if (!name.trim()) {
      showToast('Lütfen ürün adını doldurunuz.');
      return;
    }

    if (!sku.trim()) {
      showToast('Lütfen stok kodunu (SKU) doldurunuz.');
      return;
    }

    if (images.length === 0) {
      showToast('Lütfen en az 1 adet ürün görseli ekleyiniz.');
      return;
    }

    const selectedCat = CATEGORIES.find((c) => c.id === selectedCategoryId);
    const finalSlug = slug.trim() || slugify(name);

    addProduct({
      name: name.trim(),
      slug: finalSlug,
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim() || undefined,
      category: selectedCat?.name || 'Doğal Mumlar',
      categoryId: selectedCategoryId,
      shortDesc: shortDesc.trim() || `${name} - El yapımı Safirya atölye tasarımı.`,
      description:
        description.trim() ||
        `${name}, Safirya atölyemizde tamamen el emeği ile doğal malzemelerden üretilmiştir.`,
      images,
      price: Number(price) || 0,
      discountRate: Number(discountRate) || 0,
      preparationDays: Number(preparationDays) || 2,
      isCustomizable,
      inStock,
      stockQuantity: Number(stockQuantity) || 0,
      minThreshold: Number(minThreshold) || 10,
      isFeatured,
      isBestSeller,
      isActive: asDraft ? false : isActive,
      scentNotes,
      colorOptions,
      variants: showVariants ? variants : undefined,
      bulkTiers: showBulkTiers ? bulkTiers : undefined,
      rating: 5.0,
      reviewCount: 0,
    });

    // Sunucu API'sine de asenkron bildirelim
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug: finalSlug,
        sku,
        categoryName: selectedCat?.name,
        price,
        discountRate,
        images,
        isCustomizable,
        stockQuantity,
      }),
    }).catch(() => {});

    router.push('/admin/urunler');
  };

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* ── 1. ÜST BAŞLIK & BREADCRUMB & GERİ DÖNÜŞ ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/admin" className="hover:text-[#D96B27] transition">
              Safirya Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/admin/urunler" className="hover:text-[#D96B27] transition">
              Ürün Kataloğu
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#D96B27] font-bold">Yeni Ürün Ekle</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-2 flex items-center gap-2.5">
            <PackagePlus className="w-7 h-7 text-[#D96B27]" />
            <span>Yeni Ürün Ekle</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            Mum, kokulu taş, reçine ve Miyuki koleksiyonunuza zanaatkar dokunuşlu yeni bir ürün tanımlayın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/urunler"
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-xs font-bold text-[#1B2A4A] flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Kataloğa Dön</span>
          </Link>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1B2A4A] text-xs font-bold transition active:scale-95 border border-[#E8E2D9]"
          >
            <span>Taslak Kaydet</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/25 flex items-center gap-2 transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ürünü Yayınla</span>
          </button>
        </div>
      </div>

      {/* ── 2. ANA İÇERİK GRID (SOL: FORM, SAĞ: CANLI ÖNİZLEME) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL KOLON: FORM KARTLARI (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* KART 1: TEMEL BİLGİLER */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Temel Ürün Bilgileri</h2>
                <p className="text-xs text-gray-500">Ürün adı, kategorisi, stok kodu ve açıklamaları</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Ürün Adı */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Örn: Doğal Kehribar Cam Kavanoz Soya Mumu (210g)"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40 font-medium"
                />
              </div>

              {/* Kategori Seçimi */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Ürün Kategorisi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md shadow-[#1B2A4A]/20'
                            : 'bg-[#FAF8F5]/60 hover:bg-white border-[#E8E2D9] text-gray-700'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slug / URL Yapısı & Stok Kodu (SKU) & Barkod */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                    Stok Kodu (SKU) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="SFR-MUM-01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                    Barkod / GTIN (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="8690000123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                </div>

                <div className="sm:col-span-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1B2A4A]">URL Slug</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSlugManual(false);
                        setSlug(slugify(name));
                      }}
                      className="text-[10px] text-[#D96B27] hover:underline font-bold"
                    >
                      Oto Üret
                    </button>
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="ornek-urun-slug"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                </div>
              </div>

              {/* Kısa Açıklama */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Kısa Açıklama / Spot Metin
                </label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Lavanta, sandal ağacı ve vanilya notaları ile huzur dolu atölye esintisi."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                />
              </div>

              {/* Detaylı Açıklama */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Detaylı Atölye Açıklaması & Zanaat Süreci
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Safirya atölyemizde tamamen el emeği ile %100 doğal soya vaksından üretilmiştir. Ahşap fitili yanarken çıtırtı sesi çıkarır..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* KART 2: GÖRSEL YÖNETİMİ & GALERİ */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1B2A4A]">Görseller & Galeri</h2>
                  <p className="text-xs text-gray-500">Ürününüzün yüksek çözünürlüklü fotoğrafları ({images.length} yüklendi)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPresetModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#D96B27] text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atölye Galerisinden Seç</span>
              </button>
            </div>

            {/* Görsel URL Girişi */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                  placeholder="Görsel URL yapıştırın (https://images.unsplash.com/...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAddImage()}
                className="px-4 py-2.5 rounded-xl bg-[#1B2A4A] hover:bg-[#2A3F6D] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Görsel Ekle</span>
              </button>

              <label className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#D96B27] border border-orange-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingImage ? 'Yükleniyor...' : 'Buluta Yükle'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingImage}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Yüklenen Görsellerin Thumbnail Önizlemesi */}
            {images.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#E8E2D9] rounded-2xl text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                <div className="text-xs font-bold text-gray-600">Henüz görsel eklenmedi</div>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Ürünün vitrinde şık görünmesi için yukarıdaki kutudan görsel URL girin veya Atölye Galerisi butonuna tıklayın.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {images.map((imgUrl, idx) => (
                  <div
                    key={imgUrl + idx}
                    className="relative group rounded-2xl overflow-hidden border border-[#E8E2D9] aspect-square bg-slate-50 shadow-2xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Ürün görseli ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Birincil / Kapak Rozeti */}
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider bg-[#1B2A4A] text-white px-2 py-0.5 rounded-md shadow-sm">
                        Kapak
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 hover:bg-white text-gray-800 px-2 py-0.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition"
                      >
                        Kapak Yap
                      </button>
                    )}

                    {/* Silme Butonu */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-sm opacity-0 group-hover:opacity-100 transition active:scale-95"
                      title="Görseli kaldır"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KART 3: FİYATLANDIRMA & İNDİRİM */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Fiyatlandırma & İndirim</h2>
                <p className="text-xs text-gray-500">Satış fiyatı, kampanya indirim oranı ve net tutar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Taban Satış Fiyatı (₺) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    ₺
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  İndirim Oranı (%)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    %
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Müşterinin Ödeyeceği Net Fiyat
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-black text-emerald-700">
                    ₺{discountPrice.toFixed(2)}
                  </span>
                  {discountRate > 0 && (
                    <span className="text-xs line-through text-gray-400">
                      ₺{price.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  %20 KDV dahil son tüketici fiyatı
                </span>
              </div>
            </div>
          </div>

          {/* KART 4: ATÖLYE & ZANAAT NİTELİKLERİ */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Atölye & Zanaat Özellikleri</h2>
                <p className="text-xs text-gray-500">Hazırlanma süresi, koku notaları, renkler ve kişiselleştirme</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Hazırlanma Süresi */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Atölye Hazırlanma / Kargoya Verilme Süresi
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 5, 7, 10].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setPreparationDays(days)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        preparationDays === days
                          ? 'bg-[#1B2A4A] text-white shadow-sm'
                          : 'bg-[#FAF8F5] text-gray-700 hover:bg-gray-100 border border-[#E8E2D9]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{days} Günde Hazır</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kişiselleştirilebilir Ürün Switch */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D96B27]" />
                    <span>Kişiselleştirilebilir Ürün</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Müşteri sipariş verirken kavanoz veya etiket üzerine isim, tarih, özel not yazabilir.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D96B27]" />
                </label>
              </div>

              {/* Koku Notaları (Doğal Mumlar & Kokulu Taş için) */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Koku Notaları (Mum & Kokulu Taş için)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {PRESET_SCENTS.map((scent) => {
                    const isSelected = scentNotes.includes(scent);
                    return (
                      <button
                        key={scent}
                        type="button"
                        onClick={() => handleToggleScent(scent)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[#D96B27] text-white shadow-xs'
                            : 'bg-white border border-[#E8E2D9] text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {scent}
                      </button>
                    );
                  })}
                </div>

                {/* Özel Koku Ekle */}
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customScentInput}
                    onChange={(e) => setCustomScentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomScent();
                      }
                    }}
                    placeholder="Özel koku notası yazın..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomScent}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1B2A4A] transition"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Renk & Doku Seçenekleri */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Renk & Malzeme Paleti (Epoksi, Takı ve Obje için)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {PRESET_COLORS.map((color) => {
                    const isSelected = colorOptions.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleToggleColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[#1B2A4A] text-white shadow-xs'
                            : 'bg-white border border-[#E8E2D9] text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {color}
                      </button>
                    );
                  })}
                </div>

                {/* Özel Renk Ekle */}
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    placeholder="Özel renk / taş adı yazın..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1B2A4A] transition"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* KART 5: VARYANT YÖNETİMİ (OPSİYONEL) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1B2A4A]">Gramaj / Boyut Varyantları</h2>
                  <p className="text-xs text-gray-500">210g kavanoz, 350g seramik kapaklı vb. farklı ölçüler</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVariants}
                  onChange={(e) => setShowVariants(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D96B27]" />
              </label>
            </div>

            {showVariants && (
              <div className="space-y-3 pt-2">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Varyant Başlığı</label>
                      <input
                        type="text"
                        value={v.title}
                        onChange={(e) => handleUpdateVariant(v.id, { title: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B27]"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">SKU</label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(v.id, { sku: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B27]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Fiyat (₺)</label>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(v.id, { price: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B27]"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Varyantı kaldır"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#E8E2D9] hover:border-[#D96B27] text-[#D96B27] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Varyant Ekle</span>
                </button>
              </div>
            )}
          </div>

          {/* KART 6: TOPLU SİPARİŞ & BAREMLİ FİYATLANDIRMA (OPSİYONEL) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1B2A4A]">Toplu Sipariş & Etkinlik Baremleri</h2>
                  <p className="text-xs text-gray-500">Söz, nişan, düğün ve kurumsal hediye için kademeli indirim</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBulkTiers}
                  onChange={(e) => setShowBulkTiers(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D96B27]" />
              </label>
            </div>

            {showBulkTiers && (
              <div className="space-y-3 pt-2">
                {bulkTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Min Adet</label>
                      <input
                        type="number"
                        value={tier.minQuantity}
                        onChange={(e) => handleUpdateBulkTier(tier.id, { minQuantity: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-bold bg-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Max Adet (Boş=Sınırsız)</label>
                      <input
                        type="number"
                        value={tier.maxQuantity ?? ''}
                        onChange={(e) =>
                          handleUpdateBulkTier(tier.id, {
                            maxQuantity: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="Sınırsız"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-bold bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">İndirim (%)</label>
                      <input
                        type="number"
                        value={tier.discountPercentage ?? 15}
                        onChange={(e) =>
                          handleUpdateBulkTier(tier.id, { discountPercentage: Number(e.target.value) })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-bold bg-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Açıklama</label>
                      <input
                        type="text"
                        value={tier.description || ''}
                        onChange={(e) => handleUpdateBulkTier(tier.id, { description: e.target.value })}
                        placeholder="Örn: Nişan Hediyeliği Baremi"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs bg-white"
                      />
                    </div>

                    <div className="sm:col-span-1 flex items-center justify-end pt-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveBulkTier(tier.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddBulkTier}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#E8E2D9] hover:border-[#D96B27] text-[#D96B27] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Barem Ekle</span>
                </button>
              </div>
            )}
          </div>

          {/* KART 7: ENVANTER & GÖRÜNÜRLÜK */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                7
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Envanter & Vitrin Durumu</h2>
                <p className="text-xs text-gray-500">Stok miktarı, kritik eşik ve vitrin öne çıkarma ayarları</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Mevcut Stok Miktarı (Adet)</label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Kritik Stok Uyarı Eşiği</label>
                <input
                  type="number"
                  min="1"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A] block">Stokta Var</span>
                  <span className="text-[10px] text-gray-500">Müşteriler sepete ekleyebilir</span>
                </div>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 text-[#D96B27] rounded focus:ring-[#D96B27]"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A] block">Vitrinde Aktif / Yayında</span>
                  <span className="text-[10px] text-gray-500">Müşteri vitrininde görünür</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#D96B27] rounded focus:ring-[#D96B27]"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A] block">Ana Sayfada Öne Çıkar</span>
                  <span className="text-[10px] text-gray-500">Koleksiyon başında göster</span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#D96B27] rounded focus:ring-[#D96B27]"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A] block">Çok Satanlar Listesine Ekle</span>
                  <span className="text-[10px] text-gray-500">Çok satan rozeti kazandırır</span>
                </div>
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 text-[#D96B27] rounded focus:ring-[#D96B27]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: CANLI VİTRİN ÖNİZLEMESİ & KAYIT BUTONLARI (col-span-4 sticky) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* CANLI KART ÖNİZLEMESİ */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B2A4A]">
                <Eye className="w-4 h-4 text-[#D96B27]" />
                <span>Canlı Vitrin Önizlemesi</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Canlı
              </span>
            </div>

            {/* Vitrin Kartı Simülasyonu */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden flex flex-col group">
              {/* Görsel */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={
                    images[0] ||
                    'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={name || 'Ürün Önizleme'}
                  className="w-full h-full object-cover"
                />

                {/* İndirim Rozeti */}
                {discountRate > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[11px] font-black bg-[#16A34A] text-white px-2 py-0.5 rounded-full shadow-sm">
                      -%{discountRate}
                    </span>
                  </div>
                )}

                {/* Kişiselleştirilebilir Rozeti */}
                {isCustomizable && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#1B2A4A] text-white px-2 py-0.5 rounded-full shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-[#D96B27]" />
                      Kişiselleştirilebilir
                    </span>
                  </div>
                )}

                {/* Hazırlanma süresi */}
                <div className="absolute bottom-2.5 left-3 bg-[#1B2A4A]/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-medium z-10">
                  <Clock className="w-3 h-3 text-[#D96B27]" />
                  <span>{preparationDays} Günde Hazır</span>
                </div>
              </div>

              {/* Bilgiler */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold bg-[#FAF8F5] border border-[#E8E2D9] text-[#1B2A4A]/70 px-1.5 py-0.5 rounded">
                    {currentCategory?.name || 'Doğal Mumlar'}
                  </span>
                  {isBestSeller && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                      Çok Satan
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-[#1B2A4A] line-clamp-2">
                  {name || 'Ürün Başlığı Buraya Gelecek'}
                </h3>

                {scentNotes.length > 0 && (
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    🌿 {scentNotes.join(', ')}
                  </p>
                )}

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-[#1B2A4A]">
                      ₺{discountPrice.toFixed(2)}
                    </span>
                    {discountRate > 0 && (
                      <span className="text-xs line-through text-gray-400 block -mt-1">
                        ₺{price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-gray-400">
                    Stok: {stockQuantity} Adet
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* İŞLEM & KAYDET PANELİ */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
              Yayınlama & İşlem
            </h3>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ürünü Kaydet ve Yayınla</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full py-3 px-4 rounded-2xl bg-[#1B2A4A] hover:bg-[#2A3F6D] text-white text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Taslak Olarak Sakla</span>
            </button>

            <Link
              href="/admin/urunler"
              className="w-full py-2.5 px-4 rounded-2xl border border-[#E8E2D9] hover:bg-slate-50 text-xs font-bold text-gray-600 transition flex items-center justify-center"
            >
              İptal Et ve Geri Dön
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. ATÖLYE HAZIR GÖRSEL KÜTÜPHANESİ MODALI ── */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#1B2A4A]">Safirya Atölye Görsel Kütüphanesi</h3>
                <p className="text-xs text-gray-500">Mum, seramik, epoksi ve takı için yüksek çözünürlüklü görseller</p>
              </div>

              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_GALLERY.map((item, idx) => (
                <div
                  key={item.url + idx}
                  onClick={() => {
                    handleAddImage(item.url);
                    setIsPresetModalOpen(false);
                  }}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-[#E8E2D9] hover:border-[#D96B27] transition flex flex-col bg-slate-50"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-[#1B2A4A]/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="px-3 py-1 rounded-xl bg-white text-[#1B2A4A] font-bold text-[11px] shadow-md">
                        + Ekle
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[9px] font-bold text-[#D96B27] uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-[#1B2A4A] truncate block mt-0.5">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
