'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
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
  Save,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProductVariant, AdminBulkTier } from '@/types/admin';

// Hazır Atölye Görselleri Kütüphanesi
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

export default function UrunDuzenlePage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const { products, updateProduct, categories, showToast } = useAdmin();

  const existingProduct = products.find((p) => p.id === productId);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');

  const [price, setPrice] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const discountPrice =
    discountRate > 0 ? Math.round(price * (1 - discountRate / 100)) : price;

  const [preparationDays, setPreparationDays] = useState<number>(2);
  const [isCustomizable, setIsCustomizable] = useState<boolean>(false);
  const [scentNotes, setScentNotes] = useState<string[]>([]);
  const [customScentInput, setCustomScentInput] = useState('');
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [minThreshold, setMinThreshold] = useState<number>(10);
  const [inStock, setInStock] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);

  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [showVariants, setShowVariants] = useState<boolean>(false);

  const [bulkTiers, setBulkTiers] = useState<AdminBulkTier[]>([]);
  const [showBulkTiers, setShowBulkTiers] = useState<boolean>(false);

  // Mevcut ürün verilerini yükle
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || '');
      setSlug(existingProduct.slug || '');
      setSelectedCategoryId(existingProduct.categoryId || categories[0]?.id || 'cat-mum');
      setSku(existingProduct.sku || '');
      setBarcode(existingProduct.barcode || '');
      setShortDesc(existingProduct.shortDesc || '');
      setDescription(existingProduct.description || '');

      setPrice(existingProduct.price || 0);
      setDiscountRate(existingProduct.discountRate || 0);

      setPreparationDays(existingProduct.preparationDays || 2);
      setIsCustomizable(Boolean(existingProduct.isCustomizable));
      setScentNotes(existingProduct.scentNotes || []);
      setColorOptions(existingProduct.colorOptions || []);

      setImages(existingProduct.images || []);
      setStockQuantity(existingProduct.stockQuantity || 0);
      setMinThreshold(existingProduct.minThreshold || 10);
      setInStock(Boolean(existingProduct.inStock));
      setIsActive(Boolean(existingProduct.isActive));
      setIsFeatured(Boolean(existingProduct.isFeatured));
      setIsBestSeller(Boolean(existingProduct.isBestSeller));

      if (existingProduct.variants && existingProduct.variants.length > 0) {
        setVariants(existingProduct.variants);
        setShowVariants(true);
      }

      if (existingProduct.bulkTiers && existingProduct.bulkTiers.length > 0) {
        setBulkTiers(existingProduct.bulkTiers);
        setShowBulkTiers(true);
      }
    }
  }, [existingProduct, categories]);

  if (!existingProduct) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E8E2D9] text-center space-y-4">
        <Package className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-lg font-bold text-[#1B2A4A]">Düzenlenecek Ürün Bulunamadı</h2>
        <p className="text-xs text-gray-500">Belirtilen ID'ye sahip ürün silinmiş veya mevcut değil.</p>
        <Link
          href="/admin/urunler"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D96B27] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ürün Kataloğuna Dön</span>
        </Link>
      </div>
    );
  }

  // Görsel Ekle / Kaldır
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

  // Kaydet
  const handleSave = () => {
    if (!name.trim()) {
      showToast('Lütfen ürün adını doldurunuz.');
      return;
    }

    if (!sku.trim()) {
      showToast('Lütfen stok kodunu doldurunuz.');
      return;
    }

    const selectedCat = categories.find((c) => c.id === selectedCategoryId);

    updateProduct(productId, {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim() || undefined,
      category: selectedCat?.name || existingProduct.category,
      categoryId: selectedCategoryId,
      shortDesc: shortDesc.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      discountRate: Number(discountRate) || 0,
      preparationDays: Number(preparationDays) || 2,
      isCustomizable,
      inStock,
      stockQuantity: Number(stockQuantity) || 0,
      minThreshold: Number(minThreshold) || 10,
      isFeatured,
      isBestSeller,
      isActive,
      scentNotes,
      colorOptions,
      images,
      variants: showVariants ? variants : undefined,
      bulkTiers: showBulkTiers ? bulkTiers : undefined,
    });

    router.push('/admin/urunler');
  };

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* ── 1. ÜST BAŞLIK VE AKSİYONLAR ── */}
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
            <span className="text-[#D96B27] font-bold">Ürünü Düzenle</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-2 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-[#D96B27]" />
            <span>Ürünü Düzenle</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            "{existingProduct.name}" ürününün tüm vitrin, fiyat ve atölye niteliklerini güncelleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/urunler"
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-xs font-bold text-[#1B2A4A] flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Kataloğa Dön</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/25 flex items-center gap-2 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>

      {/* ── 2. FORM & CANLI ÖNİZLEME GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL: FORM (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TEMEL BİLGİLER */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Temel Ürün Bilgileri</h2>
                <p className="text-xs text-gray-500">Ürün adı, kategorisi, SKU ve açıklamalar</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40 font-medium"
                />
              </div>

              {/* Kategori Seçimi (Dinamik) */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Bağlı Katalog / Kategori <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
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

              {/* SKU, Barkod ve Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">SKU (Stok Kodu)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-mono font-bold bg-[#FAF8F5]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Barkod</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-mono bg-[#FAF8F5]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-mono text-gray-600 bg-[#FAF8F5]/40"
                  />
                </div>
              </div>

              {/* Kısa Açıklama */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Kısa Açıklama</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs bg-[#FAF8F5]/40"
                />
              </div>

              {/* Detaylı Açıklama */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Detaylı Atölye Açıklaması</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] text-xs bg-[#FAF8F5]/40 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* GÖRSELLER */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1B2A4A]">Görseller ({images.length})</h2>
                  <p className="text-xs text-gray-500">Ürün fotoğrafları ve kapak görseli</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPresetModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#D96B27] text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atölye Galerisinden Seç</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Görsel URL ekleyin..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs bg-[#FAF8F5]/40"
              />
              <button
                type="button"
                onClick={() => handleAddImage()}
                className="px-4 py-2.5 rounded-xl bg-[#1B2A4A] text-white text-xs font-bold"
              >
                Ekle
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {images.map((imgUrl, idx) => (
                <div
                  key={imgUrl + idx}
                  className="relative group rounded-2xl overflow-hidden border border-[#E8E2D9] aspect-square bg-slate-50"
                >
                  <img src={imgUrl} alt={`Görsel ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 ? (
                    <span className="absolute top-2 left-2 text-[10px] font-black uppercase bg-[#1B2A4A] text-white px-2 py-0.5 rounded-md shadow-sm">
                      Kapak
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 text-gray-800 px-2 py-0.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition"
                    >
                      Kapak Yap
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-sm opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FİYAT & İNDİRİM */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Fiyatlandırma & İndirim</h2>
                <p className="text-xs text-gray-500">Satış fiyatı ve indirim oranı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Taban Fiyat (₺)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FAF8F5]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">İndirim Oranı (%)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FAF8F5]/40"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Net Satış Fiyatı</span>
                <span className="text-xl font-black text-emerald-700">₺{discountPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ATÖLYE NİTELİKLERİ */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Atölye & Zanaat Detayları</h2>
                <p className="text-xs text-gray-500">Hazırlanma süresi, kişiselleştirme, koku ve renkler</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Hazırlanma Süresi</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 5, 7, 10].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setPreparationDays(days)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        preparationDays === days
                          ? 'bg-[#1B2A4A] text-white shadow-sm'
                          : 'bg-[#FAF8F5] text-gray-700 border border-[#E8E2D9]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{days} Günde Hazır</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D96B27]" />
                    <span>Kişiselleştirilebilir Ürün</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">İsim, tarih, yazı baskısı yapılabilir</p>
                </div>
                <input
                  type="checkbox"
                  checked={isCustomizable}
                  onChange={(e) => setIsCustomizable(e.target.checked)}
                  className="w-5 h-5 text-[#D96B27] rounded"
                />
              </div>

              {/* Koku Notaları */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Koku Notaları</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_SCENTS.map((scent) => {
                    const isSelected = scentNotes.includes(scent);
                    return (
                      <button
                        key={scent}
                        type="button"
                        onClick={() => handleToggleScent(scent)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          isSelected ? 'bg-[#D96B27] text-white' : 'bg-white border border-[#E8E2D9] text-gray-600'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {scent}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Renkler */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Renk & Doku Seçenekleri</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_COLORS.map((color) => {
                    const isSelected = colorOptions.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleToggleColor(color)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          isSelected ? 'bg-[#1B2A4A] text-white' : 'bg-white border border-[#E8E2D9] text-gray-600'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* STOK & GÖRÜNÜRLÜK */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D96B27] flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1B2A4A]">Stok & Vitrin Durumu</h2>
                <p className="text-xs text-gray-500">Miktar ve görünürlük ayarları</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Stok Adedi</label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FAF8F5]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">Kritik Stok Eşiği</label>
                <input
                  type="number"
                  min="1"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FAF8F5]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-[#1B2A4A]">Vitrinde Aktif</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#D96B27] rounded"
                />
              </label>

              <label className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-[#1B2A4A]">Öne Çıkarılan</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#D96B27] rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* SAĞ: CANLI ÖNİZLEME (col-span-4) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#D96B27]" />
                Canlı Önizleme
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Canlı
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden flex flex-col">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={images[0] || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80'}
                  alt={name}
                  className="w-full h-full object-cover"
                />
                {discountRate > 0 && (
                  <span className="absolute top-3 left-3 text-[11px] font-black bg-[#16A34A] text-white px-2 py-0.5 rounded-full">
                    -%{discountRate}
                  </span>
                )}
                {isCustomizable && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#1B2A4A] text-white px-2 py-0.5 rounded-full">
                    Kişiselleştirilebilir
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[10px] font-semibold bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E2D9] text-[#1B2A4A]/70">
                  {currentCategory?.name || existingProduct.category}
                </span>
                <h3 className="font-bold text-xs text-[#1B2A4A]">{name}</h3>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-base font-black text-[#1B2A4A]">₺{discountPrice.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400">Stok: {stockQuantity}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Değişiklikleri Kaydet</span>
            </button>

            <Link
              href="/admin/urunler"
              className="w-full py-2.5 px-4 rounded-2xl border border-[#E8E2D9] hover:bg-slate-50 text-xs font-bold text-gray-600 transition flex items-center justify-center"
            >
              Vazgeç ve Kataloğa Dön
            </Link>
          </div>
        </div>
      </div>

      {/* Preset Modal */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1B2A4A]">Atölye Görsellerinden Seç</h3>
              <button onClick={() => setIsPresetModalOpen(false)} className="p-2 text-gray-500">
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
                  className="cursor-pointer rounded-2xl overflow-hidden border border-[#E8E2D9] hover:border-[#D96B27] group"
                >
                  <img src={item.url} alt={item.title} className="w-full aspect-square object-cover" />
                  <div className="p-2 text-[11px] font-bold text-[#1B2A4A] truncate">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
