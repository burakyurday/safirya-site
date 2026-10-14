'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  History,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  X,
  Package,
  Sparkles,
  Layers,
  Flame,
  Gem,
  Palette,
  PackagePlus,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { RawCategory, StockUnit, StockLogType } from '@/types/admin';

export default function ErpStokPage() {
  const {
    rawMaterials,
    finishedProducts,
    stockLogs,
    criticalStockCount,
    addRawMaterial,
    updateRawMaterialStock,
    accounts,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'raw' | 'finished'>('raw');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Modal Durumları
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  // Hızlı Stok Değişim Form State
  const [stockDelta, setStockDelta] = useState<number>(0);
  const [stockLogType, setStockLogType] = useState<StockLogType>('GIRIS_SATIN_ALMA');
  const [stockReason, setStockReason] = useState('');
  const [unitCostInput, setUnitCostInput] = useState<number>(0);

  // Yeni Hammadde Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<RawCategory>('Mum Hammaddesi');
  const [newUnit, setNewUnit] = useState<StockUnit>('kg');
  const [newCurrentStock, setNewCurrentStock] = useState<number>(10);
  const [newMinThreshold, setNewMinThreshold] = useState<number>(5);
  const [newUnitCost, setNewUnitCost] = useState<number>(150);
  const [newSupplierId, setNewSupplierId] = useState<string>('');

  // Tedarikçiler listesi
  const suppliers = accounts.filter((a) => a.type === 'TEDARIKCI');

  // Filtrelenmiş Hammaddeler
  const filteredMaterials = rawMaterials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesCritical = !onlyCritical || m.currentStock <= m.minThreshold;

    return matchesSearch && matchesCategory && matchesCritical;
  });

  // Filtrelenmiş Bitmiş Ürünler
  const filteredProducts = finishedProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const selectedMaterial = rawMaterials.find((m) => m.id === selectedMaterialId);

  const handleOpenStockModal = (id: string) => {
    setSelectedMaterialId(id);
    const mat = rawMaterials.find((m) => m.id === id);
    if (mat) {
      setUnitCostInput(mat.unitCost);
    }
    setStockDelta(0);
    setStockReason('');
    setStockLogType('GIRIS_SATIN_ALMA');
    setIsUpdateStockModalOpen(true);
  };

  const handleSaveStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || stockDelta === 0) return;

    // Eğer çıkış ise negatif delta
    const actualDelta =
      stockLogType === 'URETIMDE_KULLANIM' || stockLogType === 'FIRE_KAYIP'
        ? -Math.abs(stockDelta)
        : Math.abs(stockDelta);

    updateRawMaterialStock(
      selectedMaterialId,
      actualDelta,
      stockLogType,
      stockReason,
      unitCostInput
    );

    setIsUpdateStockModalOpen(false);
  };

  const handleCreateRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    const selectedSupplier = suppliers.find((s) => s.id === newSupplierId);

    addRawMaterial({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      category: newCategory,
      unit: newUnit,
      currentStock: Number(newCurrentStock),
      minThreshold: Number(newMinThreshold),
      unitCost: Number(newUnitCost),
      supplierId: newSupplierId || undefined,
      supplierName: selectedSupplier?.name,
    });

    // Formu sıfırla
    setNewCode('');
    setNewName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. ÜST BAŞLIK VE HIZLI AKSİYONLAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Boxes className="w-4 h-4" />
            <span>Atölye ERP & Envanter Kontrolü</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            Stok & Hammadde Yönetimi
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            Doğal soya parafini, IFRA esanslar, döküm reçineleri ve Miyuki boncuklarının anlık gramaj/adet takibi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/urunler/yeni"
            className="px-4 py-2.5 rounded-xl bg-[#1B2A4A] hover:bg-[#2A3F6D] text-white text-xs font-bold shadow-md flex items-center gap-2 transition active:scale-95"
          >
            <PackagePlus className="w-4 h-4 text-[#D96B27]" />
            <span>Yeni Ürün Ekle</span>
          </Link>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-xs font-bold text-[#1B2A4A] flex items-center gap-2 transition"
          >
            <History className="w-4 h-4 text-gray-500" />
            <span>Stok Hareket Geçmişi</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/20 flex items-center gap-2 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Hammadde Tanımla</span>
          </button>
        </div>
      </div>

      {/* 2. KRİTİK STOK ALARM PANELİ */}
      {criticalStockCount > 0 && (
        <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-300 text-red-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-red-600 text-white shrink-0 shadow-md animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-red-200 text-red-800 px-2.5 py-0.5 rounded-full">
                  Acil İkmal Uyarısı
                </span>
                <span className="text-xs font-bold text-red-800">
                  {criticalStockCount} Malzeme Kritik Eşiğin Altında!
                </span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                Atölye üretiminin aksamaması için lütfen tedarikçilere sipariş geçiniz veya gelen sevkiyatı stoğa işleyiniz.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              onlyCritical
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-white text-red-700 border-red-300 hover:bg-red-100'
            }`}
          >
            {onlyCritical ? 'Tüm Stokları Göster' : 'Sadece Kritik Stokları Listele'}
          </button>
        </div>
      )}

      {/* 3. SEKMELER & ARAMA / FİLTRE ÇUBUĞU */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
        
        {/* Sekmeler */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'raw'
                  ? 'bg-[#1B2A4A] text-white shadow-md'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Atölye Hammaddeleri ({rawMaterials.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('finished')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'finished'
                  ? 'bg-[#1B2A4A] text-white shadow-md'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Bitmiş Ürün Stoğu ({finishedProducts.length})</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Toplam <strong>{filteredMaterials.length}</strong> kayıt listeleniyor
          </div>
        </div>

        {/* Arama ve Kategori Filtresi */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hammadde adı veya stok kodu ile ara (örn: HAM-SOYA, Lavanta, Miyuki)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/50"
            />
          </div>

          {activeTab === 'raw' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
            >
              <option value="ALL">Tüm Kategoriler</option>
              <option value="Mum Hammaddesi">Mum Hammaddesi</option>
              <option value="Epoksi Kimyasalları">Epoksi Kimyasalları</option>
              <option value="Miyuki Boncuk">Miyuki Boncuk</option>
              <option value="Ambalaj & Kutu">Ambalaj & Kutu</option>
              <option value="Döşeme & Fitil">Döşeme & Fitil</option>
            </select>
          )}

          {activeTab === 'raw' && (
            <button
              onClick={() => setOnlyCritical(!onlyCritical)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                onlyCritical
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sadece Kritik Stoklar</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. VERİ TABLOSU: HAMMADDELER VEYA BİTMİŞ ÜRÜNLER */}
      {activeTab === 'raw' ? (
        <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                  <th className="py-4 px-5">Stok Kodu & Malzeme</th>
                  <th className="py-4 px-4">Kategori</th>
                  <th className="py-4 px-4 text-center">Birim</th>
                  <th className="py-4 px-4 text-right">Mevcut Miktar</th>
                  <th className="py-4 px-4 text-right">Kritik Eşik</th>
                  <th className="py-4 px-4 text-right">Birim Maliyet</th>
                  <th className="py-4 px-4">Tedarikçi</th>
                  <th className="py-4 px-4 text-center">Durum</th>
                  <th className="py-4 px-5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      Aradığınız kriterlere uygun hammadde bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => {
                    const isCritical = mat.currentStock <= mat.minThreshold;

                    return (
                      <tr
                        key={mat.id}
                        className={`hover:bg-slate-50/80 transition ${
                          isCritical ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-[#1B2A4A] text-xs">
                            {mat.code}
                          </div>
                          <div className="font-semibold text-gray-800 text-xs mt-0.5">
                            {mat.name}
                          </div>
                          {mat.notes && (
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-xs">
                              {mat.notes}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {mat.category}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-[11px] font-bold">
                            {mat.unit}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-sm">
                          <span
                            className={
                              isCritical ? 'text-red-600 animate-pulse font-extrabold' : 'text-[#1B2A4A]'
                            }
                          >
                            {mat.currentStock.toLocaleString('tr-TR')}
                          </span>{' '}
                          <span className="text-[10px] font-normal text-gray-500">
                            {mat.unit}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right text-gray-500 font-semibold">
                          {mat.minThreshold.toLocaleString('tr-TR')} {mat.unit}
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold text-[#1B2A4A]">
                          ₺{mat.unitCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600">
                          {mat.supplierName ? (
                            <span className="truncate block max-w-[140px] text-xs">
                              {mat.supplierName}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              <span>KRİTİK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Yeterli</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleOpenStockModal(mat.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#D96B27] text-white text-xs font-bold transition shadow-sm active:scale-95"
                          >
                            Stok Güncelle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Bitmiş Ürünler Tablosu */
        <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                  <th className="py-4 px-5">Ürün & SKU</th>
                  <th className="py-4 px-4">Kategori</th>
                  <th className="py-4 px-4 text-right">Satış Fiyatı</th>
                  <th className="py-4 px-4 text-right">Mevcut Stok</th>
                  <th className="py-4 px-4 text-right">Kritik Eşik</th>
                  <th className="py-4 px-4 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isCritical = p.stockQuantity <= p.minThreshold;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-xs text-gray-500">
                          {p.sku}
                        </div>
                        <div className="font-bold text-[#1B2A4A] text-xs mt-0.5">
                          {p.name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#1B2A4A]">
                        ₺{p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm">
                        <span className={isCritical ? 'text-red-600' : 'text-[#1B2A4A]'}>
                          {p.stockQuantity} Adet
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-500 font-semibold">
                        {p.minThreshold} Adet
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isCritical ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                            Kritik Stok
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Stokta Var
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: HIZLI STOK GÜNCELLEME */}
      {isUpdateStockModalOpen && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                  {selectedMaterial.code}
                </span>
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  Stok Hareketi Ekle
                </h3>
              </div>
              <button
                onClick={() => setIsUpdateStockModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockUpdate} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-gray-500">Seçili Malzeme:</div>
                <div className="font-bold text-[#1B2A4A] text-sm mt-0.5">
                  {selectedMaterial.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Mevcut Stok: <strong>{selectedMaterial.currentStock} {selectedMaterial.unit}</strong> (Kritik Eşik: {selectedMaterial.minThreshold} {selectedMaterial.unit})
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  İşlem Türü
                </label>
                <select
                  value={stockLogType}
                  onChange={(e) => setStockLogType(e.target.value as StockLogType)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#D96B27]"
                >
                  <option value="GIRIS_SATIN_ALMA">➕ Giriş / Satın Alma (Stok Artar, Finans Gideri İşlenir)</option>
                  <option value="URETIMDE_KULLANIM">➖ Üretimde Kullanım (Stok Azalır)</option>
                  <option value="FIRE_KAYIP">⚠️ Fire / Dökülme / Zayiat (Stok Azalır)</option>
                  <option value="SAYIM_DUZELTME">🔄 Sayım Düzeltme (Fiziksel Sayım Farkı)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Miktar Değişimi ({selectedMaterial.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={stockDelta || ''}
                    onChange={(e) => setStockDelta(parseFloat(e.target.value) || 0)}
                    placeholder={`Örn: 5 ${selectedMaterial.unit}`}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-sm focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Birim Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCostInput || ''}
                    onChange={(e) => setUnitCostInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-sm focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Açıklama / Referans No
                </label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="Örn: 25kg Soya vaksı sevkiyatı / Fatura No: FAT-9102"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs shadow-md shadow-[#D96B27]/20 transition"
                >
                  Stok Hareketini Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: YENİ HAMMADDE TANIMLAMA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                  Envanter Kartı
                </span>
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  Yeni Hammadde Kartı Tanımla
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRawMaterial} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Stok Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Örn: HAM-ESANS-AMB"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs uppercase focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RawCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#D96B27]"
                  >
                    <option value="Mum Hammaddesi">Mum Hammaddesi</option>
                    <option value="Epoksi Kimyasalları">Epoksi Kimyasalları</option>
                    <option value="Miyuki Boncuk">Miyuki Boncuk</option>
                    <option value="Ambalaj & Kutu">Ambalaj & Kutu</option>
                    <option value="Döşeme & Fitil">Döşeme & Fitil</option>
                    <option value="Ahşap & Doğal Malzeme">Ahşap & Doğal Malzeme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Hammadde Adı *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Örn: Kehribar & Sandal Ağacı Konsantre Yağ"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Ölçü Birimi
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as StockUnit)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#D96B27]"
                  >
                    <option value="kg">kg</option>
                    <option value="gr">gr</option>
                    <option value="litre">litre</option>
                    <option value="ml">ml</option>
                    <option value="adet">adet</option>
                    <option value="metre">metre</option>
                    <option value="set">set</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Başlangıç Stoğu
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCurrentStock}
                    onChange={(e) => setNewCurrentStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Kritik Eşik Limiti
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-red-600 focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Birim Maliyeti (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newUnitCost}
                    onChange={(e) => setNewUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tedarikçi Firma
                  </label>
                  <select
                    value={newSupplierId}
                    onChange={(e) => setNewSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                  >
                    <option value="">Seçiniz (Opsiyonel)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs shadow-md shadow-[#D96B27]/20 transition"
                >
                  Hammaddeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: STOK HAREKET GEÇMİŞİ */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#D96B27]" />
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  Son Stok Hareketleri & Denetim Logları
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 divide-y divide-gray-100">
              {stockLogs.map((log) => {
                const isPositive = log.quantityDelta > 0;
                return (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-[#1B2A4A]">
                        {log.materialName}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {log.date} • {log.reason || 'Stok Hareketi'} {log.referenceNo ? `(${log.referenceNo})` : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          isPositive ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? `+${log.quantityDelta}` : log.quantityDelta} {log.unit}
                      </span>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {log.type}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
