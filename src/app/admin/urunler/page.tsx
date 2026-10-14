'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  Flame,
  Gem,
  Palette,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Eye,
  Star,
  Clock,
  Layers,
  ArrowUpDown,
  Edit,
  FolderPlus,
  Grid,
  List,
  Gift,
  Heart,
  Boxes,
  Coffee,
  X,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProduct, AdminCategory } from '@/types/admin';

// İkon listesi
const AVAILABLE_ICONS = [
  { name: 'Flame', label: 'Doğal Mum / Alev', icon: Flame },
  { name: 'Gem', label: 'Kokulu Taş / Değerli', icon: Gem },
  { name: 'Palette', label: 'Epoksi / Sanat', icon: Palette },
  { name: 'Sparkles', label: 'Miyuki Takı / Parıltı', icon: Sparkles },
  { name: 'Tag', label: 'Özel Etiket / İndirim', icon: Tag },
  { name: 'Gift', label: 'Hediyelik Set', icon: Gift },
  { name: 'Heart', label: 'Söz & Nişan Hatırası', icon: Heart },
  { name: 'Star', label: 'Seçkin Koleksiyon', icon: Star },
  { name: 'Boxes', label: 'Atölye Serisi', icon: Boxes },
  { name: 'Coffee', label: 'Keyif & Dekorasyon', icon: Coffee },
];

function getCategoryIconComponent(iconName?: string) {
  const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
  return found ? found.icon : Tag;
}

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

export default function UrunlerPage() {
  const {
    products,
    deleteProduct,
    toggleProductStatus,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    showToast,
  } = useAdmin();

  // Aktif Sekme: 'products' | 'categories'
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Arama & Filtreler (Ürünler)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'CRITICAL'>('ALL');

  // Silme Onay Modal Durumları
  const [deleteProductCandidateId, setDeleteProductCandidateId] = useState<string | null>(null);
  const [deleteCategoryCandidateId, setDeleteCategoryCandidateId] = useState<string | null>(null);

  // Katalog / Kategori Ekleme / Düzenleme Modal Durumu
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Kategori Form State
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [isCatSlugManual, setIsCatSlugManual] = useState(false);
  const [catDescription, setCatDescription] = useState('');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catIcon, setCatIcon] = useState('Flame');
  const [catSortOrder, setCatSortOrder] = useState<number>(1);
  const [catIsActive, setCatIsActive] = useState(true);

  // İstatistikler
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const criticalProducts = products.filter((p) => p.stockQuantity <= p.minThreshold).length;
  const customizableCount = products.filter((p) => p.isCustomizable).length;
  const totalCategories = categories.length;

  // Filtrelenmiş Ürünler
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = p.isActive;
    if (statusFilter === 'DRAFT') matchesStatus = !p.isActive;
    if (statusFilter === 'CRITICAL') matchesStatus = p.stockQuantity <= p.minThreshold;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Ürün Silme Onayı
  const handleDeleteProductConfirm = () => {
    if (!deleteProductCandidateId) return;
    deleteProduct(deleteProductCandidateId);
    setDeleteProductCandidateId(null);
  };

  // Kategori Silme Onayı
  const handleDeleteCategoryConfirm = () => {
    if (!deleteCategoryCandidateId) return;
    deleteCategory(deleteCategoryCandidateId);
    setDeleteCategoryCandidateId(null);
  };

  // Yeni Katalog Ekle Modalını Aç
  const handleOpenAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCatName('');
    setCatSlug('');
    setIsCatSlugManual(false);
    setCatDescription('');
    setCatImageUrl('https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80');
    setCatIcon('Flame');
    setCatSortOrder(categories.length + 1);
    setCatIsActive(true);
    setIsCategoryModalOpen(true);
  };

  // Mevcut Kataloğu Düzenle Modalını Aç
  const handleOpenEditCategoryModal = (cat: AdminCategory) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setIsCatSlugManual(true);
    setCatDescription(cat.description || '');
    setCatImageUrl(cat.imageUrl || '');
    setCatIcon(cat.icon || 'Flame');
    setCatSortOrder(cat.sortOrder || 1);
    setCatIsActive(Boolean(cat.isActive));
    setIsCategoryModalOpen(true);
  };

  // Katalog Kaydet (Ekle veya Güncelle)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('Lütfen katalog / kategori adını giriniz.');
      return;
    }

    const finalSlug = catSlug.trim() || slugify(catName);

    if (editingCategoryId) {
      // Güncelle
      updateCategory(editingCategoryId, {
        name: catName.trim(),
        slug: finalSlug,
        description: catDescription.trim(),
        imageUrl: catImageUrl.trim() || undefined,
        icon: catIcon,
        sortOrder: Number(catSortOrder) || 1,
        isActive: catIsActive,
      });
    } else {
      // Yeni Ekle
      addCategory({
        name: catName.trim(),
        slug: finalSlug,
        description: catDescription.trim(),
        imageUrl: catImageUrl.trim() || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        icon: catIcon,
        sortOrder: Number(catSortOrder) || 1,
        isActive: catIsActive,
      });

      // API rotasına da gönderelim
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName.trim(),
          slug: finalSlug,
          description: catDescription.trim(),
          imageUrl: catImageUrl.trim(),
          icon: catIcon,
          sortOrder: Number(catSortOrder) || 1,
          isActive: catIsActive,
        }),
      }).catch(() => {});
    }

    setIsCategoryModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* ── 1. ÜST BAŞLIK VE HIZLI AKSİYONLAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Package className="w-4 h-4" />
            <span>Safirya Atölye Yönetimi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            Ürün Kataloğu & Koleksiyonlar
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            Atölye ürünlerinizi ve tematik koleksiyon kataloglarınızı oluşturun, düzenleyin ve vitrini yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAddCategoryModal}
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-xs font-bold text-[#1B2A4A] flex items-center gap-2 transition active:scale-95"
          >
            <FolderPlus className="w-4 h-4 text-[#D96B27]" />
            <span>Yeni Katalog Ekle</span>
          </button>

          <Link
            href="/admin/urunler/yeni"
            className="px-5 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/25 flex items-center gap-2 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Ürün Ekle</span>
          </Link>
        </div>
      </div>

      {/* ── 2. ÖZET İSTATİSTİK KARTLARI ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Toplam Katalog & Kategori
          </span>
          <div className="text-2xl font-black text-[#1B2A4A] mt-1">
            {totalCategories}
          </div>
          <span className="text-xs text-gray-500 font-medium mt-0.5 block">
            Doğal mum, taş, epoksi, takı
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Toplam Ürün Adedi
          </span>
          <div className="text-2xl font-black text-[#1B2A4A] mt-1">
            {totalProducts}
          </div>
          <span className="text-xs text-gray-500 font-medium mt-0.5 block">
            {activeProducts} adedi vitrinde yayında
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Kişiselleştirilebilir
          </span>
          <div className="text-2xl font-black text-[#D96B27] mt-1">
            {customizableCount}
          </div>
          <span className="text-xs text-gray-500 font-medium mt-0.5 block">
            İsim/tarih baskı özellikli
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Kritik Stok Uyarısı
          </span>
          <div className="text-2xl font-black text-red-600 mt-1">
            {criticalProducts}
          </div>
          <span className="text-xs text-gray-500 font-medium mt-0.5 block">
            Eşiğin altındaki ürünler
          </span>
        </div>
      </div>

      {/* ── 3. ANA SEKMELER: ÜRÜNLER & KATALOGLAR ── */}
      <div className="bg-white p-2 rounded-2xl border border-[#E8E2D9] shadow-xs flex items-center gap-2 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'products'
              ? 'bg-[#1B2A4A] text-white shadow-sm'
              : 'text-gray-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Ürünler ({totalProducts})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#1B2A4A] text-white shadow-sm'
              : 'text-gray-600 hover:bg-slate-100'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-[#D96B27]" />
          <span>Kataloglar / Koleksiyonlar ({totalCategories})</span>
        </button>
      </div>

      {/* ── 4. KATALOGLAR / KOLEKSİYONLAR SEKMESİ ── */}
      {activeTab === 'categories' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1B2A4A]">Katalog & Koleksiyon Listesi</h2>
              <p className="text-xs text-gray-500">Müşterilerin mağazada gezindiği ana kategoriler ve vitrin koleksiyonları</p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCategoryModal}
              className="px-4 py-2 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Katalog Tanımla</span>
            </button>
          </div>

          {/* Katalog Kartları Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const IconComp = getCategoryIconComponent(cat.icon);
              const productCount = products.filter(
                (p) => p.category === cat.name || p.categoryId === cat.id
              ).length;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-[#E8E2D9] hover:border-[#D96B27] shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
                >
                  {/* Görsel Başlığı */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={
                        cat.imageUrl ||
                        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Sıralama Rozeti */}
                    <span className="absolute top-3 left-3 bg-[#1B2A4A]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Sıra: {cat.sortOrder || 1}
                    </span>

                    {/* Aktif/Pasif Rozeti */}
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                        cat.isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {cat.isActive ? 'Yayında' : 'Taslak'}
                    </span>
                  </div>

                  {/* Detaylar */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#D96B27] flex items-center justify-center shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#1B2A4A] group-hover:text-[#D96B27] transition">
                            {cat.name}
                          </h3>
                          <span className="font-mono text-[10px] text-gray-400 block -mt-0.5">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>

                      {cat.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {/* Alt Bilgi & Aksiyonlar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        📦 {productCount} Ürün Bağlı
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/kategoriler/${cat.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-[#1B2A4A] hover:bg-slate-100 rounded-xl transition"
                          title="Vitrinde Görüntüle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCategoryModal(cat)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#FAF8F5] text-[#1B2A4A] hover:text-[#D96B27] border border-[#E8E2D9] text-xs font-bold transition flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteCategoryCandidateId(cat.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                          title="Kataloğu Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── 5. ÜRÜNLER SEKMESİ ── */
        <div className="space-y-4">
          {/* Arama ve Filtreleme */}
          <div className="bg-white p-4.5 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün adı, SKU veya kategori ile ara..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl border border-[#E8E2D9] text-xs font-semibold text-gray-700 bg-white"
            >
              <option value="ALL">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === 'ALL'
                    ? 'bg-[#1B2A4A] text-white shadow-xs'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                Tümü
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                Yayında
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('CRITICAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === 'CRITICAL'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                Kritik Stok
              </button>
            </div>
          </div>

          {/* Ürünler Tablosu */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                    <th className="py-4 px-5">Ürün & SKU</th>
                    <th className="py-4 px-4">Katalog / Kategori</th>
                    <th className="py-4 px-4 text-right">Fiyat & İndirim</th>
                    <th className="py-4 px-4 text-center">Stok</th>
                    <th className="py-4 px-4 text-center">Özellikler</th>
                    <th className="py-4 px-4 text-center">Yayında</th>
                    <th className="py-4 px-4 text-center">Öne Çıkan</th>
                    <th className="py-4 px-5 text-right">İşlemler</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <span>Aradığınız kriterlere uygun ürün bulunamadı.</span>
                        <div className="mt-3">
                          <Link
                            href="/admin/urunler/yeni"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D96B27] text-white text-xs font-bold"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Yeni Ürün Ekle</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isCritical = p.stockQuantity <= p.minThreshold;
                      const primaryImage =
                        p.images && p.images[0]
                          ? p.images[0]
                          : 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=80';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          {/* Ürün & SKU */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={primaryImage}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E8E2D9]"
                              />
                              <div className="min-w-0 max-w-xs">
                                <span className="font-mono text-[10px] text-gray-400 font-bold block">
                                  {p.sku}
                                </span>
                                <span className="font-bold text-[#1B2A4A] text-xs truncate block">
                                  {p.name}
                                </span>
                                {p.preparationDays && (
                                  <span className="text-[10px] text-gray-400 block">
                                    ⏱️ {p.preparationDays} günde hazır
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Kategori */}
                          <td className="py-3.5 px-4 text-gray-600 font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E2D9] text-[11px] font-bold text-gray-700">
                              {p.category}
                            </span>
                          </td>

                          {/* Fiyat & İndirim */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-[#1B2A4A] text-xs">
                              ₺{(p.discountPrice || p.price).toFixed(2)}
                            </div>
                            {p.discountRate > 0 && (
                              <div className="flex items-center justify-end gap-1 text-[10px]">
                                <span className="line-through text-gray-400">₺{p.price.toFixed(2)}</span>
                                <span className="font-bold text-emerald-600">-%{p.discountRate}</span>
                              </div>
                            )}
                          </td>

                          {/* Stok */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block font-black text-xs ${
                                isCritical ? 'text-red-600 animate-pulse' : 'text-[#1B2A4A]'
                              }`}
                            >
                              {p.stockQuantity}
                            </span>
                            {isCritical && (
                              <span className="block text-[9px] font-bold text-red-500 uppercase">
                                Kritik
                              </span>
                            )}
                          </td>

                          {/* Özellik Rozetleri */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {p.isCustomizable && (
                                <span
                                  title="Kişiselleştirilebilir"
                                  className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center text-[10px] font-bold"
                                >
                                  ✨
                                </span>
                              )}
                              {p.isBestSeller && (
                                <span
                                  title="Çok Satan"
                                  className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center text-[10px] font-bold"
                                >
                                  🔥
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Yayında Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleProductStatus(p.id, 'isActive')}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                                p.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}
                            >
                              {p.isActive ? 'Aktif' : 'Taslak'}
                            </button>
                          </td>

                          {/* Öne Çıkan Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleProductStatus(p.id, 'isFeatured')}
                              className={`p-1.5 rounded-lg transition ${
                                p.isFeatured
                                  ? 'text-amber-500 hover:text-amber-600'
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                              title={p.isFeatured ? 'Öne Çıkarıldı' : 'Öne Çıkarılmadı'}
                            >
                              <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                          </td>

                          {/* İşlemler (Düzenle & Sil & İncele) */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/urunler/${p.slug}`}
                                target="_blank"
                                className="p-1.5 text-gray-400 hover:text-[#1B2A4A] hover:bg-slate-100 rounded-lg transition"
                                title="Vitrinde Görüntüle"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <Link
                                href={`/admin/urunler/duzenle/${p.id}`}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#FAF8F5] text-[#1B2A4A] hover:text-[#D96B27] border border-[#E8E2D9] text-xs font-bold transition flex items-center gap-1"
                                title="Ürünü Düzenle"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Düzenle</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => setDeleteProductCandidateId(p.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Ürünü Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. KATALOG EKLEME & DÜZENLEME MODALI ── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2D9] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#D96B27] flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B2A4A]">
                    {editingCategoryId ? 'Kataloğu Düzenle' : 'Yeni Katalog / Kategori Ekle'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingCategoryId
                      ? 'Koleksiyon başlığını, görselini ve ikonunu güncelleyin.'
                      : 'Mağazanıza yeni bir ürün grubu ve vitrin koleksiyonu tanımlayın.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Katalog Adı */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Katalog / Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!isCatSlugManual) {
                      setCatSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="Örn: Aromaterapi Difüzörler, Seramik Figürler..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                />
              </div>

              {/* URL Slug & Sıralama */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1B2A4A]">URL Slug</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCatSlugManual(false);
                        setCatSlug(slugify(catName));
                      }}
                      className="text-[10px] text-[#D96B27] hover:underline font-bold"
                    >
                      Oto Üret
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={catSlug}
                    onChange={(e) => {
                      setIsCatSlugManual(true);
                      setCatSlug(e.target.value);
                    }}
                    placeholder="aromaterapi-difuzorler"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                    Sıralama Önceliği
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={catSortOrder}
                    onChange={(e) => setCatSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                </div>
              </div>

              {/* İkon Seçimi */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Kategori İkonu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = catIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setCatIcon(item.name)}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs'
                            : 'bg-white border-[#E8E2D9] text-gray-700 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold truncate max-w-full">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kapak Görseli URL */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Kapak Görseli URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40"
                  />
                  {catImageUrl && (
                    <img
                      src={catImageUrl}
                      alt="Önizleme"
                      className="w-10 h-10 rounded-xl object-cover border border-[#E8E2D9] shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                  Açıklama / Spot Metin
                </label>
                <textarea
                  rows={3}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Koleksiyon hakkında müşterilere bilgi veren kısa açıklama metni..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/40 leading-relaxed"
                />
              </div>

              {/* Vitrinde Yayında Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A] block">
                    Vitrinde Aktif / Yayında
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Müşteriler /kategoriler sayfasında ve menüde görebilir
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={catIsActive}
                  onChange={(e) => setCatIsActive(e.target.checked)}
                  className="w-5 h-5 text-[#D96B27] rounded"
                />
              </div>

              {/* Butonlar */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-gray-700 hover:bg-slate-50 transition"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/25 transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCategoryId ? 'Değişiklikleri Güncelle' : 'Kataloğu Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. ÜRÜN SİLME ONAY MODALI ── */}
      {deleteProductCandidateId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1B2A4A]">Ürünü Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Bu ürün vitrinden ve katalogdan kaldırılacaktır. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProductCandidateId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-gray-700 hover:bg-slate-50 transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteProductConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. KATALOG SİLME ONAY MODALI ── */}
      {deleteCategoryCandidateId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1B2A4A]">Kataloğu Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Bu katalog/kategori vitrinden kaldırılacaktır. İçindeki ürünler katalogsuz kalabilir.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCategoryCandidateId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-gray-700 hover:bg-slate-50 transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteCategoryConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
