'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Flame,
  Gem,
  Palette,
  AlertTriangle,
  PlusCircle,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  History,
  X,
  Plus,
  Trash2,
  Edit2,
  Info,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { SiliconeMold, MoldCategory, MoldMaterialType } from '@/types/admin';

export default function KalipTakipPage() {
  const {
    siliconeMolds,
    moldCastLogs,
    addSiliconeMold,
    updateSiliconeMold,
    deleteSiliconeMold,
    recordMoldCast,
    showToast,
  } = useAdmin();

  // Filtreler & Tab
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Modal Durumları
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMold, setEditingMold] = useState<SiliconeMold | null>(null);
  const [castModalMold, setCastModalMold] = useState<SiliconeMold | null>(null);
  const [customRounds, setCustomRounds] = useState<number>(1);
  const [castOrderNumber, setCastOrderNumber] = useState('');
  const [castNotes, setCastNotes] = useState('');

  // Kapasite Simülatörü State'leri
  const [simMoldId, setSimMoldId] = useState<string>(siliconeMolds[0]?.id || '');
  const [simTargetQty, setSimTargetQty] = useState<number>(100);

  // Yeni / Düzenleme Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MoldCategory>('Mum Kalıbı');
  const [formMaterial, setFormMaterial] = useState<MoldMaterialType>('Platin RTV-2');
  const [formCavities, setFormCavities] = useState<number>(6);
  const [formMoldCount, setFormMoldCount] = useState<number>(2);
  const [formCuringMinutes, setFormCuringMinutes] = useState<number>(240);
  const [formMaxCasts, setFormMaxCasts] = useState<number>(120);
  const [formCurrentCasts, setFormCurrentCasts] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  // İstatistik Hesaplamaları
  const totalMoldCount = siliconeMolds.reduce((acc, m) => acc + (m.activeMoldCount || 1), 0);
  const totalCastsPerformed = siliconeMolds.reduce((acc, m) => acc + (m.currentCasts || 0), 0);
  const criticalMolds = siliconeMolds.filter(
    (m) => (m.currentCasts / m.maxCasts) * 100 >= 80
  );
  const singleBatchTotalCapacity = siliconeMolds.reduce(
    (acc, m) => acc + m.cavityCount * m.activeMoldCount,
    0
  );

  // Filtrelenmiş Kalıplar
  const filteredMolds = siliconeMolds.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    const wearRate = (m.currentCasts / m.maxCasts) * 100;
    const matchesCritical = !onlyCritical || wearRate >= 80;

    return matchesSearch && matchesCategory && matchesCritical;
  });

  // Hızlı +1 Döküm Kaydet
  const handleQuickCast = (mold: SiliconeMold) => {
    recordMoldCast(mold.id, 1, undefined, 'Tek tur döküm tamamlandı.');
  };

  // Özel Döküm Turu Kaydet
  const handleSaveCustomCast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!castModalMold) return;
    recordMoldCast(
      castModalMold.id,
      customRounds,
      castOrderNumber.trim() || undefined,
      castNotes.trim() || undefined
    );
    setCastModalMold(null);
    setCustomRounds(1);
    setCastOrderNumber('');
    setCastNotes('');
  };

  // Kalıp Ekleme Modalını Aç
  const handleOpenAddModal = () => {
    setEditingMold(null);
    setFormCode(`KLP-${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormCategory('Mum Kalıbı');
    setFormMaterial('Platin RTV-2');
    setFormCavities(6);
    setFormMoldCount(2);
    setFormCuringMinutes(240);
    setFormMaxCasts(120);
    setFormCurrentCasts(0);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  // Kalıp Düzenleme Modalını Aç
  const handleOpenEditModal = (mold: SiliconeMold) => {
    setEditingMold(mold);
    setFormCode(mold.code);
    setFormName(mold.name);
    setFormCategory(mold.category);
    setFormMaterial(mold.materialType);
    setFormCavities(mold.cavityCount);
    setFormMoldCount(mold.activeMoldCount);
    setFormCuringMinutes(mold.curingMinutes);
    setFormMaxCasts(mold.maxCasts);
    setFormCurrentCasts(mold.currentCasts);
    setFormNotes(mold.notes || '');
    setIsAddModalOpen(true);
  };

  // Formu Kaydet
  const handleSaveMoldForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) return;

    if (editingMold) {
      updateSiliconeMold(editingMold.id, {
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        materialType: formMaterial,
        cavityCount: Number(formCavities),
        activeMoldCount: Number(formMoldCount),
        curingMinutes: Number(formCuringMinutes),
        maxCasts: Number(formMaxCasts),
        currentCasts: Number(formCurrentCasts),
        notes: formNotes.trim() || undefined,
      });
    } else {
      addSiliconeMold({
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        materialType: formMaterial,
        cavityCount: Number(formCavities),
        activeMoldCount: Number(formMoldCount),
        curingMinutes: Number(formCuringMinutes),
        maxCasts: Number(formMaxCasts),
        currentCasts: Number(formCurrentCasts),
        notes: formNotes.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
  };

  // Kapasite Simülasyon Hesaplamaları
  const simSelectedMold = siliconeMolds.find((m) => m.id === simMoldId) || siliconeMolds[0];
  const simBatchCapacity = simSelectedMold
    ? simSelectedMold.cavityCount * simSelectedMold.activeMoldCount
    : 1;
  const simNeededRounds = Math.ceil(simTargetQty / (simBatchCapacity || 1));
  const simTotalMinutes = simNeededRounds * (simSelectedMold?.curingMinutes || 60);
  const simTotalHours = (simTotalMinutes / 60).toFixed(1);
  const simEstWorkDays = (Number(simTotalHours) / 8).toFixed(1); // 8 saatlik atölye mesaisi
  const simEndCasts = (simSelectedMold?.currentCasts || 0) + simNeededRounds;
  const simWillExceed = simSelectedMold ? simEndCasts > simSelectedMold.maxCasts : false;

  return (
    <div className="space-y-6">
      
      {/* 1. ÜST BAŞLIK VE HIZLI AKSİYONLAR */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Boxes className="w-4 h-4" />
            <span>Atölye ERP & Ekipman Yönetimi</span>
          </div>
          <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight mt-1">
            Silikon Kalıp Kapasite & Ömür Takibi
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Mum, kokulu taş ve epoksi silikon kalıplarınızın döküm sayaçlarını izleyin, aşınma ve yıpranma oranlarını tespit edin ve toplu siparişleriniz için günlük döküm kapasitesini simüle edin.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/25 transition active:scale-95 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Silikon Kalıp Ekle</span>
        </button>
      </div>

      {/* 2. KPI İSTATİSTİK KARTLARI (4 Sütun) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Toplam Kalıp Çeşidi</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#1B2A4A]">{siliconeMolds.length} Model</div>
          <div className="text-[11px] text-gray-400">Atölyede fiziki {totalMoldCount} adet kalıp</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Toplam Döküm Sayacı</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{totalCastsPerformed} Döküm</div>
          <div className="text-[11px] text-gray-400">Atölye döküm tarihi boyunca</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Tek Tur Döküm Kapasitesi</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{singleBatchTotalCapacity} Adet/Tur</div>
          <div className="text-[11px] text-gray-400">Tüm kalıplar aynı anda dolu</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Kritik / Yıpranan Kalıplar</span>
            <AlertTriangle className={`w-4 h-4 ${criticalMolds.length > 0 ? 'text-red-600 animate-bounce' : 'text-gray-400'}`} />
          </div>
          <div className={`text-2xl font-black ${criticalMolds.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
            {criticalMolds.length} Kalıp
          </div>
          <div className="text-[11px] text-gray-400">
            {criticalMolds.length > 0 ? '%80 üzeri aşınma uyarısı' : 'Tüm kalıplar sağlıklı'}
          </div>
        </div>
      </div>

      {/* 3. ATÖLYE SİPARİŞ & GÜNLÜK KAPASİTE SİMÜLATÖRÜ */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2D3E64] text-white p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D96B27]" />
            <h2 className="text-base font-bold">Toplu Sipariş Kapasite & Süre Simülatörü</h2>
          </div>
          <span className="text-xs text-white/70">
            Müşteriye teslim tarihi vermeden önce döküm ve kürlenme süresini anında hesaplayın.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Kalıp Seçimi */}
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs text-white/80 font-medium">Üretilecek Kalıp Modeli:</label>
            <select
              value={simMoldId}
              onChange={(e) => setSimMoldId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
            >
              {siliconeMolds.map((m) => (
                <option key={m.id} value={m.id} className="text-gray-900">
                  {m.code} - {m.name} ({m.activeMoldCount} adet kalıp, {m.cavityCount} göz)
                </option>
              ))}
            </select>
          </div>

          {/* İstenen Sipariş Adedi */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs text-white/80 font-medium">Hedef Sipariş Adedi:</label>
            <input
              type="number"
              min={1}
              max={5000}
              value={simTargetQty}
              onChange={(e) => setSimTargetQty(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
            />
          </div>

          {/* Sonuç Özeti Kutuları */}
          <div className="sm:col-span-4 bg-white/10 p-3.5 rounded-xl border border-white/15 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-black/20 p-2 rounded-lg">
                <span className="text-[10px] text-white/70 block">Gereken Tur</span>
                <span className="text-sm font-black text-amber-300">{simNeededRounds} Döküm Turu</span>
              </div>
              <div className="bg-black/20 p-2 rounded-lg">
                <span className="text-[10px] text-white/70 block">Toplam Kürlenme</span>
                <span className="text-sm font-black text-emerald-300">{simTotalHours} Saat ({simEstWorkDays} İş Günü)</span>
              </div>
            </div>

            <div className="text-[11px] text-white/90 text-center">
              {simWillExceed ? (
                <span className="text-red-300 font-bold flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Bu sipariş kalıbın azami ömrünü aşacaktır! Yedek kalıp dökülmelidir.
                </span>
              ) : (
                <span className="text-emerald-300 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Kalıp ömrü bu siparişi tamamlamak için yeterlidir ({simEndCasts}/{simSelectedMold?.maxCasts}).
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ARAMA VE FİLTRE ÇUBUĞU */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kalıp kodu veya adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 font-semibold"
          >
            <option value="ALL">Tüm Kategoriler</option>
            <option value="Mum Kalıbı">Mum Kalıpları</option>
            <option value="Kokulu Taş Kalıbı">Kokulu Taş Kalıpları</option>
            <option value="Epoksi Reçine Kalıbı">Epoksi Kalıpları</option>
            <option value="Beton & Alçı Kalıbı">Beton & Alçı Kalıpları</option>
          </select>

          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              onlyCritical
                ? 'bg-red-500 text-white border-red-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sadece Aşınan Kalıplar (&gt;%80)</span>
          </button>
        </div>
      </div>

      {/* 5. KALIP KATALOĞU LİSTESİ / KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMolds.map((mold) => {
          const wearPercent = Math.min(100, Math.round((mold.currentCasts / mold.maxCasts) * 100));
          const remainingCasts = Math.max(0, mold.maxCasts - mold.currentCasts);
          const singleTurnOutput = mold.cavityCount * mold.activeMoldCount;

          let statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          let progressColor = 'bg-emerald-500';
          let statusText = 'Mükemmel / Sağlam';

          if (wearPercent >= 90) {
            statusColor = 'bg-red-50 text-red-800 border-red-200 animate-pulse';
            progressColor = 'bg-red-600';
            statusText = 'Kritik / Değiştirilmeli';
          } else if (wearPercent >= 75) {
            statusColor = 'bg-amber-50 text-amber-800 border-amber-200';
            progressColor = 'bg-amber-500';
            statusText = 'Yıpranma Başladı';
          }

          return (
            <div
              key={mold.id}
              className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              {/* Üst Başlık & Kod */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[#D96B27] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {mold.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                    {statusText}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#1B2A4A] line-clamp-1">{mold.name}</h3>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">{mold.category}</span>
                  <span>•</span>
                  <span>{mold.materialType}</span>
                </div>
              </div>

              {/* Teknik Özellikler Grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-gray-100 text-center">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Göz / Kavite</span>
                  <span className="text-xs font-bold text-[#1B2A4A]">{mold.cavityCount} Gözlü</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Atölye Adedi</span>
                  <span className="text-xs font-bold text-[#1B2A4A]">{mold.activeMoldCount} Adet</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Tur Çıktısı</span>
                  <span className="text-xs font-black text-[#D96B27]">{singleTurnOutput} Adet</span>
                </div>
              </div>

              {/* Kürlenme Süresi */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Kürlenme / Donma:
                </span>
                <span className="font-bold text-[#1B2A4A]">
                  {mold.curingMinutes >= 60 ? `${(mold.curingMinutes / 60).toFixed(1)} saat` : `${mold.curingMinutes} dk`}
                </span>
              </div>

              {/* Döküm Sayacı & Yıpranma İlerleme Çubuğu */}
              <div className="space-y-1.5 border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">
                    {mold.currentCasts} / {mold.maxCasts} Döküm
                  </span>
                  <span className="font-black text-[#1B2A4A]">%{wearPercent} Aşınma</span>
                </div>

                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor} transition-all duration-300`}
                    style={{ width: `${wearPercent}%` }}
                  />
                </div>

                <div className="text-[10px] text-gray-400 text-right">
                  Kalan Güvenli Ömür: <strong>{remainingCasts} döküm</strong>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickCast(mold)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Hızlı 1 Tur Döküm Kaydet"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Döküm Yap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCastModalMold(mold)}
                  className="py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold transition cursor-pointer"
                  title="Özel tur ve sipariş numarası ile döküm işle"
                >
                  Özel Döküm
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(mold)}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-[#1B2A4A] transition cursor-pointer"
                  title="Düzenle"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. DÖKÜM GÜNLÜĞÜ (SON İŞLEMLER TABLOSU) */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#D96B27]" />
            <h3 className="font-bold text-sm text-[#1B2A4A]">Atölye Döküm Günlüğü & Geçmiş Loglar</h3>
          </div>
          <span className="text-xs text-gray-400">Son yapılan döküm hareketleri</span>
        </div>

        {moldCastLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            Henüz döküm hareketi kaydedilmedi. Kart üzerindeki &ldquo;+1 Döküm Yap&rdquo; butonuyla işlem kaydedebilirsiniz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tarih</th>
                  <th className="py-2.5 px-3">Kalıp Adı</th>
                  <th className="py-2.5 px-3">Sipariş No</th>
                  <th className="py-2.5 px-3 text-center">Döküm Turu</th>
                  <th className="py-2.5 px-3 text-center">Üretilen Adet</th>
                  <th className="py-2.5 px-3">Zanaatkar / Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {moldCastLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-2.5 px-3 font-medium text-gray-500">{log.createdAt}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1B2A4A]">{log.moldName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#D96B27]">
                      {log.orderNumber ? `#${log.orderNumber}` : 'Genel Stok'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                      +{log.castCountDelta} Tur
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-[#1B2A4A]">
                      {log.totalItemsProduced} Adet
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 italic">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. MODAL: YENİ KALIP EKLE / DÜZENLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-base font-black text-[#1B2A4A]">
                {editingMold ? 'Kalıbı Düzenle' : 'Yeni Silikon Kalıp Tanımla'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMoldForm} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Kalıp Kodu</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Örn: KLP-BUBBLE-01"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MoldCategory)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  >
                    <option value="Mum Kalıbı">Mum Kalıbı</option>
                    <option value="Kokulu Taş Kalıbı">Kokulu Taş Kalıbı</option>
                    <option value="Epoksi Reçine Kalıbı">Epoksi Reçine Kalıbı</option>
                    <option value="Beton & Alçı Kalıbı">Beton & Alçı Kalıbı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Kalıp Adı / Modeli</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Örn: Bubble Küp Soya Mum Kalıbı (Geniş Boy)"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Silikon Türü</label>
                  <select
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value as MoldMaterialType)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  >
                    <option value="Platin RTV-2">Platin RTV-2 (Ultra Mukavemetli)</option>
                    <option value="Kalay Esaslı RTV">Kalay Esaslı RTV (Ekonomik)</option>
                    <option value="Şeffaf Reçine Silikonu">Şeffaf Reçine Silikonu (Epoksi)</option>
                    <option value="Poliüretan Kauçuk">Poliüretan Kauçuk (Beton)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Kürlenme / Donma (Dk)</label>
                  <input
                    type="number"
                    min={10}
                    max={2880}
                    value={formCuringMinutes}
                    onChange={(e) => setFormCuringMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Göz / Kavite Sayısı</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formCavities}
                    onChange={(e) => setFormCavities(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Atölyedeki Kalıp Adedi</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formMoldCount}
                    onChange={(e) => setFormMoldCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Maksimum Ömür (Tur)</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={formMaxCasts}
                    onChange={(e) => setFormMaxCasts(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              {editingMold && (
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Mevcut Yapılan Döküm Sayısı</label>
                  <input
                    type="number"
                    min={0}
                    value={formCurrentCasts}
                    onChange={(e) => setFormCurrentCasts(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Notlar & Usta Tavsiyeleri</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Kalıp bakımı, kalıp ayırıcı sprey önerisi vb."
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#D96B27] hover:bg-[#c25a1e] rounded-xl shadow-md"
                >
                  {editingMold ? 'Güncelle' : 'Kalıbı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: ÖZEL DÖKÜM İŞLEME */}
      {castModalMold && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black text-[#1B2A4A]">Döküm Turu Kaydet</h3>
                <p className="text-xs text-gray-500">{castModalMold.name}</p>
              </div>
              <button
                onClick={() => setCastModalMold(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomCast} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Yapılan Döküm Tur Sayısı
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={customRounds}
                  onChange={(e) => setCustomRounds(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-bold bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
                <span className="text-[11px] text-[#D96B27] font-semibold mt-1 block">
                  = Toplam {customRounds * castModalMold.cavityCount * castModalMold.activeMoldCount} adet ürün dökülmüş olacak.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  İlgili Sipariş Numarası (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: SFR-2026-8921"
                  value={castOrderNumber}
                  onChange={(e) => setCastOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Döküm Notu
                </label>
                <input
                  type="text"
                  placeholder="Örn: 65°C soya dökümü, pürüzsüz yüzey alındı."
                  value={castNotes}
                  onChange={(e) => setCastNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCastModalMold(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Dökümü Onayla & Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
