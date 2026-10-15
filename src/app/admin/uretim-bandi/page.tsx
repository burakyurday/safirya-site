'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Trash2,
  MoveLeft,
  MoveRight,
  Camera,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Eye,
  SlidersHorizontal,
  X,
  FileImage,
  ArrowRight,
  MessageSquare,
  Mail,
  Palette,
  Printer,
  FileCheck,
  FileSignature,
  Webhook,
  Check,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminOrder, KanbanColumn, OrderStagePhoto } from '@/types/admin';

// Atölye Hazır Aşama Fotoğraf Örnekleri
const PRESET_STAGE_PHOTOS = [
  {
    title: 'Hammadde & Tartım',
    url: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80',
    caption: 'Doğal soya vaksı tartıldı ve IFRA sertifikalı esansla harmanlandı.',
  },
  {
    title: 'Kalıp / Döküm',
    url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    caption: 'Mumlar 65°C hassas sıcaklıkta el dökümü ile kalıplara döküldü.',
  },
  {
    title: 'Kuruma & Dinlendirme',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    caption: 'Ürünlerimiz pürüzsüz yüzey dokusu için 24 saat oda sıcaklığında dinlendiriliyor.',
  },
  {
    title: 'Süsleme & Etiketleme',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    caption: 'İsme özel kraft etiketler ve kurdele bağlaması özenle tamamlandı.',
  },
  {
    title: 'Kalite Kontrol & Paketleme',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    caption: 'Hediye kutusu, mühür ve koruyucu sarım tamamlandı. Kargoya hazır!',
  },
];

// Renk seçenekleri
const COLOR_OPTIONS = [
  { label: 'Safir Mavisi', value: '#1B2A4A', bg: 'bg-[#1B2A4A]', text: 'text-white' },
  { label: 'Kehribar Turuncu', value: '#D96B27', bg: 'bg-[#D96B27]', text: 'text-white' },
  { label: 'Zümrüt Yeşili', value: '#059669', bg: 'bg-emerald-600', text: 'text-white' },
  { label: 'Altın Sarısı', value: '#D97706', bg: 'bg-amber-600', text: 'text-white' },
  { label: 'Gül Kurusu', value: '#BE185D', bg: 'bg-pink-700', text: 'text-white' },
  { label: 'Lila / Mor', value: '#7C3AED', bg: 'bg-purple-600', text: 'text-white' },
  { label: 'Antrasit Koyu Gri', value: '#374151', bg: 'bg-slate-700', text: 'text-white' },
];

function calculateDaysLeft(dueDateString?: string): { days: number; text: string; urgent: boolean } {
  if (!dueDateString) {
    return { days: 99, text: 'Tarih Belirtilmedi', urgent: false };
  }
  const due = new Date(dueDateString).getTime();
  const now = new Date('2026-10-14').getTime(); // Uygulama referans tarihi
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, text: `Gecikti (${Math.abs(diffDays)} gün)`, urgent: true };
  }
  if (diffDays === 0) {
    return { days: 0, text: 'Bugün Teslim!', urgent: true };
  }
  if (diffDays <= 2) {
    return { days: diffDays, text: `${diffDays} gün kaldı (Acil)`, urgent: true };
  }
  return { days: diffDays, text: `${diffDays} gün kaldı`, urgent: false };
}

export default function UretimBandiPage() {
  const {
    orders,
    kanbanColumns,
    addKanbanColumn,
    updateKanbanColumn,
    deleteKanbanColumn,
    moveKanbanColumn,
    moveOrderToColumn,
    updateOrderSortOrder,
    addStagePhotoToOrder,
    settings,
    siliconeMolds,
    recordMoldCast,
    customContracts,
    showToast,
  } = useAdmin();

  // State'ler
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Sözleşme Kopyalama Bildirimi
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Hızlı Kalıp Döküm Kaydı Modalı State
  const [quickCastOrder, setQuickCastOrder] = useState<AdminOrder | null>(null);
  const [selectedMoldId, setSelectedMoldId] = useState<string>('');
  const [castRounds, setCastRounds] = useState<number>(1);
  const [castNotes, setCastNotes] = useState<string>('');
  const [castOperator, setCastOperator] = useState<string>('Atölye Ustası');

  // Aşama Fotoğrafı Yükleme Modalı State
  const [photoModalOrder, setPhotoModalOrder] = useState<AdminOrder | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoStageName, setPhotoStageName] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);
  const [photoSuccessMessage, setPhotoSuccessMessage] = useState<string | null>(null);

  // Fotoğrafları Görüntüleme Modalı
  const [viewPhotosOrder, setViewPhotosOrder] = useState<AdminOrder | null>(null);

  // Yeni Sütun Ekleme State
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState('#D96B27');

  // Sütun Düzenleme State
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editColTitle, setEditColTitle] = useState('');
  const [editColColor, setEditColColor] = useState('');

  // Sıralı sütunlar
  const sortedColumns = [...kanbanColumns].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );

  // Filtrelenmiş Siparişler
  const activeOrders = orders;
  const filteredOrders = activeOrders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterUrgentOnly) {
      const daysInfo = calculateDaysLeft(o.dueDate);
      return daysInfo.urgent;
    }

    return true;
  });

  // Drag and Drop Fonksiyonları
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDropToColumn = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (!orderId) return;

    moveOrderToColumn(orderId, targetColId);
    setDraggedOrderId(null);
  };

  // Manuel Sıra Değiştirme
  const handleManualOrderRankChange = (
    orderId: string,
    currentRank: number,
    val: string
  ) => {
    const newRank = parseInt(val, 10);
    if (isNaN(newRank) || newRank <= 0 || newRank === currentRank) return;
    updateOrderSortOrder(orderId, newRank);
  };

  // Fotoğraf Yükleme Modalını Aç
  const handleOpenPhotoModal = (order: AdminOrder) => {
    setPhotoModalOrder(order);
    const currentColumn = sortedColumns.find(
      (c) => c.id === (order.kanbanColumnId || 'col-prep')
    );
    setPhotoStageName(currentColumn ? currentColumn.title : 'Üretim Aşaması');
    setPhotoUrl(PRESET_STAGE_PHOTOS[1].url);
    setPhotoCaption(PRESET_STAGE_PHOTOS[1].caption);
    setNotifyCustomer(true);
    setPhotoSuccessMessage(null);
  };

  // Fotoğrafı Gönder ve Kaydet
  const handleSubmitStagePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoModalOrder || !photoUrl.trim()) return;

    setIsSubmittingPhoto(true);
    try {
      await addStagePhotoToOrder(
        photoModalOrder.id,
        photoUrl.trim(),
        photoCaption.trim(),
        photoStageName,
        notifyCustomer
      );
      setPhotoSuccessMessage(
        `Fotoğraf başarıyla kaydedildi.${
          notifyCustomer
            ? ` Müşteriye (${photoModalOrder.customerEmail}) kurumsal HTML bildirim e-postası iletildi!`
            : ''
        }`
      );
      setTimeout(() => {
        setPhotoModalOrder(null);
        setPhotoSuccessMessage(null);
      }, 1600);
    } finally {
      setIsSubmittingPhoto(false);
    }
  };

  // Yeni Sütun Ekle
  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    addKanbanColumn(newColTitle.trim(), newColColor);
    setNewColTitle('');
  };

  // Sütun Güncelle
  const handleSaveEditColumn = (id: string) => {
    if (!editColTitle.trim()) return;
    updateKanbanColumn(id, editColTitle.trim(), editColColor);
    setEditingColId(null);
  };

  // Sözleşme Linkini Panoya Kopyala
  const handleCopyContractLink = (orderId: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/sozlesme-onay/${orderId}`;
    navigator.clipboard.writeText(url);
    setCopiedOrderId(orderId);
    showToast('Sözleşme onay bağlantısı panoya kopyalandı! Müşteriye iletebilirsiniz.');
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  // Hızlı Kalıp Dökümü Modalını Aç
  const handleOpenQuickCast = (order: AdminOrder) => {
    setQuickCastOrder(order);
    // Ürün ismine göre kalıp eşleştir veya ilk kalıbı seç
    const matchedMold = siliconeMolds.find((m) =>
      order.items.some((it) =>
        it.productName.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
      )
    );
    setSelectedMoldId(matchedMold ? matchedMold.id : siliconeMolds[0]?.id || '');
    setCastRounds(1);
    setCastNotes(`Sipariş #${order.orderNumber} (${order.customerName}) üretimi için.`);
    setCastOperator('Atölye Ustası');
  };

  // Hızlı Kalıp Dökümünü Kaydet
  const handleSaveQuickCast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCastOrder || !selectedMoldId) return;
    recordMoldCast(
      selectedMoldId,
      Number(castRounds) || 1,
      quickCastOrder.orderNumber,
      castNotes,
      castOperator
    );
    showToast(`Kalıp dökümü başarıyla işlendi! (#${quickCastOrder.orderNumber})`);
    setQuickCastOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. ÜST BAŞLIK VE HIZLI KPI'LAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Layers className="w-4 h-4" />
            <span>Atölye Canlı Üretim Hattı</span>
          </div>
          <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight mt-1">
            Sürükle-Bırak Üretim Sırası & Kanban
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Siparişleri dinamik aşama sütunlarına sürükleyip bırakın, kart üzerindeki sıra numarasıyla anında önceliklendirin ve müşterilerinize fotoğraflı aşama bildirimleri iletin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsColumnModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-[#1B2A4A] text-xs font-bold transition shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D96B27]" />
            <span>Aşama Sütunlarını Yönet ({sortedColumns.length})</span>
          </button>

          <Link
            href="/admin/siparisler/yeni"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold transition shadow-md shadow-[#D96B27]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sipariş Ekle</span>
          </Link>
        </div>
      </div>

      {/* 2. FİLTRE & ARAMA ÇUBUĞU */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sipariş no, müşteri adı veya ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
              filterUrgentOnly
                ? 'bg-red-500 text-white border-red-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sadece Acil Teslimatlar</span>
          </button>

          <span className="text-xs text-gray-500 font-medium ml-2">
            Toplam <strong>{filteredOrders.length}</strong> sipariş hatta
          </span>
        </div>
      </div>

      {/* 3. KANBAN TAHTASI (YATAY KAYDIRILABİLİR ALAN) */}
      <div className="overflow-x-auto pb-6">
        <div className="flex items-start gap-4 min-w-[1100px]">
          {sortedColumns.map((col, colIdx) => {
            // Bu sütundaki siparişler ve sortOrder'a göre sıralama
            const colOrders = filteredOrders
              .filter((o) => (o.kanbanColumnId || 'col-prep') === col.id)
              .sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));

            const isDropTarget = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropToColumn(e, col.id)}
                className={`w-80 shrink-0 flex flex-col rounded-2xl transition-all duration-200 ${
                  isDropTarget
                    ? 'ring-2 ring-[#D96B27] bg-[#FFF8F3]'
                    : 'bg-[#F9F8F6] border border-[#E8E2D9]'
                }`}
              >
                {/* Sütun Başlığı */}
                <div
                  className="p-3.5 rounded-t-2xl border-b border-gray-200 flex items-center justify-between"
                  style={{ borderTop: `4px solid ${col.color}` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <h3 className="text-xs font-black text-[#1B2A4A] uppercase tracking-wide">
                      {col.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-gray-700 border border-gray-200 shadow-xs">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Sütun Sıralama Butonları */}
                  <div className="flex items-center gap-1 text-gray-400">
                    <button
                      onClick={() => moveKanbanColumn(col.id, 'left')}
                      disabled={colIdx === 0}
                      title="Sütunu Sola Kaydır"
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-20 transition"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveKanbanColumn(col.id, 'right')}
                      disabled={colIdx === sortedColumns.length - 1}
                      title="Sütunu Sağa Kaydır"
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-20 transition"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sütun Kartları Listesi */}
                <div className="p-3 space-y-3 min-h-[500px]">
                  {colOrders.length === 0 ? (
                    <div className="h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 text-xs p-4 text-center">
                      <Layers className="w-6 h-6 mb-1 text-gray-300" />
                      <span>Bu aşamada sipariş yok</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        Kartı buraya sürükleyin
                      </span>
                    </div>
                  ) : (
                    colOrders.map((order, orderIdx) => {
                      const daysInfo = calculateDaysLeft(order.dueDate);
                      const isDragging = draggedOrderId === order.id;

                      return (
                        <div
                          key={order.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, order.id)}
                          className={`bg-white rounded-xl p-3.5 border transition-all duration-150 shadow-xs group cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#D96B27]/40 ${
                            isDragging
                              ? 'opacity-40 border-dashed border-[#D96B27] scale-95'
                              : 'border-gray-200'
                          }`}
                        >
                          {/* Üst Satır: Sıra No Inputu + Sipariş No + Kanal */}
                          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            {/* Manuel Sıra Numarası Inputu */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-400">
                                Sıra:
                              </span>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                defaultValue={order.sortOrder || orderIdx + 1}
                                onBlur={(e) =>
                                  handleManualOrderRankChange(
                                    order.id,
                                    order.sortOrder || orderIdx + 1,
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleManualOrderRankChange(
                                      order.id,
                                      order.sortOrder || orderIdx + 1,
                                      (e.target as HTMLInputElement).value
                                    );
                                  }
                                }}
                                title="Sıralamayı değiştirmek için sayı girin ve Enter'a basın"
                                className="w-10 px-1 py-0.5 text-center text-xs font-black bg-amber-50 border border-amber-200 rounded text-amber-900 focus:outline-none focus:ring-1 focus:ring-[#D96B27]"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-[#1B2A4A]">
                                #{order.orderNumber}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  order.channel === 'WHATSAPP'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.channel === 'INSTAGRAM'
                                    ? 'bg-pink-100 text-pink-800'
                                    : order.channel === 'ATOLYE'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {order.channel}
                              </span>
                            </div>
                          </div>

                          {/* Müşteri ve Ürün Bilgisi */}
                          <div className="py-2.5">
                            <div className="text-xs font-bold text-[#1B2A4A] truncate">
                              {order.customerName}
                            </div>

                            {/* Ürün Kalemleri */}
                            <div className="mt-1 space-y-1">
                              {order.items.map((item, iIdx) => (
                                <div
                                  key={iIdx}
                                  className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100"
                                >
                                  <div className="font-semibold text-gray-800 flex items-center justify-between">
                                    <span className="truncate">{item.productName}</span>
                                    <span className="text-[#D96B27] font-bold shrink-0 ml-1">
                                      x{item.quantity} adet
                                    </span>
                                  </div>

                                  {/* Özelleştirme Detayları */}
                                  {item.customization && (
                                    <div className="mt-1 space-y-0.5 text-[10px] text-gray-500 border-t border-gray-200/60 pt-1">
                                      {item.customization.selectedScent && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-amber-700 font-medium">Koku:</span>
                                          <span className="truncate">{item.customization.selectedScent}</span>
                                        </div>
                                      )}
                                      {item.customization.customText && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-indigo-700 font-medium">Baskı/Yazı:</span>
                                          <span className="font-bold text-gray-700 truncate">
                                            &ldquo;{item.customization.customText}&rdquo;
                                          </span>
                                        </div>
                                      )}
                                      {item.customization.selectedColor && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-emerald-700 font-medium">Renk:</span>
                                          <span>{item.customization.selectedColor}</span>
                                        </div>
                                      )}
                                      {item.customization.extraNote && (
                                        <div className="italic text-gray-400 truncate">
                                          Not: {item.customization.extraNote}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 4 Ana Entegrasyon: Etiket Montaj + Dijital Sözleşme + Kalıp Döküm */}
                          {(() => {
                            const hasCustomization = order.items.some(
                              (i) => i.customization?.customText
                            );
                            const contract = customContracts.find(
                              (c) =>
                                c.orderId === order.id ||
                                c.orderNumber === order.orderNumber
                            );
                            const isContractApproved =
                              contract?.status === 'ONAYLANDI' ||
                              order.contractStatus === 'ONAYLANDI';
                            const isContractPending =
                              contract?.status === 'BEKLIYOR' ||
                              order.contractStatus === 'BEKLIYOR';
                            const isCastingStage =
                              col.id === 'col-casting' ||
                              col.title.toLowerCase().includes('döküm') ||
                              col.title.toLowerCase().includes('kalıp');

                            return (
                              <div className="py-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                                {/* 1. Etiket Montajla Butonu */}
                                <Link
                                  href={`/admin/etiket-montaj?orderId=${order.id}`}
                                  title="Bu siparişin isim ve baskı bilgileriyle Web-to-Print etiket tabakası oluştur"
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold transition shadow-2xs ${
                                    hasCustomization
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}
                                >
                                  <Printer className="w-3 h-3 text-amber-700" />
                                  <span>Etiket Montajla</span>
                                </Link>

                                {/* 2. Dijital Onaylı Sözleşme Rozeti */}
                                {isContractApproved ? (
                                  <Link
                                    href={`/sozlesme-onay/${order.id}`}
                                    title="Sözleşme müşteri tarafından onaylandı ve imzalandı. Belgeyi görüntüle."
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition"
                                  >
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Sözleşme Onaylı</span>
                                  </Link>
                                ) : isContractPending ? (
                                  <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                                    <Link
                                      href={`/sozlesme-onay/${order.id}`}
                                      title="Müşteri onayı bekleniyor. Sözleşme onay sayfasına git."
                                      className="text-amber-800 font-bold hover:underline"
                                    >
                                      İmza Bekliyor
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyContractLink(order.id)}
                                      title="Sözleşme imza linkini kopyala (WhatsApp'tan iletmek için)"
                                      className="p-0.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded transition"
                                    >
                                      {copiedOrderId === order.id ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ) : hasCustomization ? (
                                  <Link
                                    href={`/sozlesme-onay/${order.id}`}
                                    title="Özel baskı için dijital onay sözleşmesi oluştur"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition"
                                  >
                                    <FileSignature className="w-3 h-3 text-gray-500" />
                                    <span>+ Sözleşme</span>
                                  </Link>
                                ) : null}

                                {/* 3. Kalıp Döküm Aşamasında Hızlı Döküm Kaydet */}
                                {isCastingStage && siliconeMolds.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuickCast(order)}
                                    title="Bu sipariş için silikon kalıp dökümü kaydet (aşınma ve ömür düşümü yapar)"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold transition ml-auto"
                                  >
                                    <Layers className="w-3 h-3 text-indigo-600" />
                                    <span>+ Döküm</span>
                                  </button>
                                )}
                              </div>
                            );
                          })()}

                          {/* Teslimat Tarihi ve Fotoğraf Durumu */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                            {/* Teslimat Geri Sayımı */}
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                                daysInfo.urgent
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{daysInfo.text}</span>
                            </div>

                            {/* Varsa Kayıtlı Aşama Fotoğraf Sayısı */}
                            {order.stagePhotos && order.stagePhotos.length > 0 && (
                              <button
                                onClick={() => setViewPhotosOrder(order)}
                                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{order.stagePhotos.length} Foto</span>
                              </button>
                            )}
                          </div>

                          {/* Aksiyon Barı */}
                          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1.5">
                            {/* Hızlı Aşama Fotoğrafı Yükle */}
                            <button
                              onClick={() => handleOpenPhotoModal(order)}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-[#D96B27] text-gray-700 hover:text-white border border-gray-200 hover:border-[#D96B27] text-[11px] font-bold transition group"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#D96B27] group-hover:text-white transition" />
                              <span>Aşama Fotoğrafı Yükle</span>
                            </button>

                            {/* Hızlı İlerleme Butonu (Sonraki Aşamaya Atla) */}
                            {colIdx < sortedColumns.length - 1 && (
                              <button
                                onClick={() =>
                                  moveOrderToColumn(
                                    order.id,
                                    sortedColumns[colIdx + 1].id
                                  )
                                }
                                title={`Bir sonraki aşamaya aktar: ${sortedColumns[colIdx + 1].title}`}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MODAL: AŞAMA FOTOĞRAFI YÜKLE & ÇOK KANALLI BİLDİRİM GÖNDER */}
      {photoModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#D96B27] flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1B2A4A]">
                    Aşama Fotoğrafı Yükle & Bildir
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sipariş #{photoModalOrder.orderNumber} - {photoModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPhotoModalOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {photoSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-800">İşlem Tamamlandı!</h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  {photoSuccessMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitStagePhoto} className="mt-4 space-y-4">
                {/* Aşama Adı */}
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Aktif Üretim Aşaması Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={photoStageName}
                    onChange={(e) => setPhotoStageName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                {/* Hızlı Hazır Atölye Fotoğrafları Seçimi */}
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5">
                    Hızlı Hazır Atölye Görselleri (Tek tıkla seçin):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_STAGE_PHOTOS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setPhotoUrl(preset.url);
                          setPhotoCaption(preset.caption);
                        }}
                        className={`p-2 rounded-lg text-left border text-[11px] transition flex items-center gap-2 ${
                          photoUrl === preset.url
                            ? 'border-[#D96B27] bg-orange-50 text-[#D96B27] font-bold'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <FileImage className="w-4 h-4 shrink-0" />
                        <span className="truncate">{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fotoğraf URL Girişi & Önizleme */}
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Fotoğraf Bağlantısı (URL)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />

                  {photoUrl && (
                    <div className="mt-2 relative h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt="Aşama Önizleme"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] bg-black/60 text-white font-medium">
                        Önizleme
                      </span>
                    </div>
                  )}
                </div>

                {/* Açıklama / Müşteriye Not */}
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Aşama Açıklaması / Müşteriye Özel Mesaj
                  </label>
                  <textarea
                    rows={2}
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Örn: Mumlarınız pürüzsüz yüzey için dinlendirilmeye alındı..."
                    className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                {/* Çok Kanallı Bildirim Seçenekleri */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                  <div className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#D96B27]" />
                    <span>Müşteri İletişim Kanalları</span>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyCustomer}
                      onChange={(e) => setNotifyCustomer(e.target.checked)}
                      className="rounded text-[#D96B27] focus:ring-[#D96B27] w-4 h-4"
                    />
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        <strong>E-posta Gönder (Nodemailer):</strong> {photoModalOrder.customerEmail} adresine kurumsal fotoğraflı bildirim iletilsin.
                      </span>
                    </div>
                  </label>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 pl-6">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>WhatsApp Business API:</strong>{' '}
                      {settings.whatsappNotificationsEnabled ? (
                        <span className="text-emerald-700 font-bold">
                          Aktif (Otomatik şablon mesajı gönderilecek)
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Devre dışı (Vitrin & CMS ayarlarından aktif edilebilir)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Webhook & Canlı ERP Entegrasyonu Bildirimi */}
                  <div className="flex items-center justify-between gap-2 text-[11px] bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100 text-indigo-950">
                    <div className="flex items-center gap-1.5">
                      <Webhook className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        <strong>Webhook (Discord / Slack / Harici ERP):</strong>{' '}
                        {settings.webhookEnabled ? (
                          <span className="text-emerald-700 font-bold">
                            Aktif (order.photo_uploaded olayı tetiklenecek)
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            Devre dışı (Ayarlar &gt; Webhook sekmesinden açılabilir)
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-indigo-700 shrink-0">
                      HMAC-SHA256
                    </span>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPhotoModalOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPhoto}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/20 transition disabled:opacity-50"
                  >
                    {isSubmittingPhoto ? (
                      <span>Kaydediliyor & Gönderiliyor...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Aşama Fotoğrafını Kaydet & Bildir</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL: FOTOĞRAFLARI GÖRÜNTÜLEME */}
      {viewPhotosOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black text-[#1B2A4A]">
                  Kayıtlı Üretim Fotoğrafları
                </h3>
                <p className="text-xs text-gray-500">
                  Sipariş #{viewPhotosOrder.orderNumber} - {viewPhotosOrder.customerName}
                </p>
              </div>
              <button
                onClick={() => setViewPhotosOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {viewPhotosOrder.stagePhotos?.map((photo, pIdx) => (
                <div
                  key={pIdx}
                  className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
                >
                  <div className="h-44 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || 'Aşama Fotoğrafı'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                      {photo.stageName}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-700 font-medium">{photo.caption}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{photo.takenAt}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewPhotosOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: DİNAMİK SÜTUN (AŞAMA) YÖNETİMİ */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#D96B27]" />
                <h3 className="text-base font-black text-[#1B2A4A]">
                  Dinamik Üretim Aşamaları (Kanban Sütunları)
                </h3>
              </div>
              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yeni Aşama Ekleme Formu */}
            <form
              onSubmit={handleCreateColumn}
              className="mt-4 p-4 rounded-xl bg-[#F6F4F0] border border-gray-200 space-y-3"
            >
              <div className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wide">
                + Yeni Üretim Aşaması Sütunu Ekle
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Aşama Adı (Örn: Lazer Kazıma, Vernikleme...)"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />

                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setNewColColor(c.value)}
                      title={c.label}
                      className={`w-6 h-6 rounded-full transition-transform ${c.bg} ${
                        newColColor === c.value
                          ? 'ring-2 ring-offset-2 ring-[#D96B27] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold transition shrink-0"
                >
                  Ekle
                </button>
              </div>
            </form>

            {/* Mevcut Sütunlar Listesi */}
            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              <div className="text-xs font-bold text-gray-500 mb-1">
                Mevcut Aşama Sıralaması:
              </div>

              {sortedColumns.map((col, idx) => {
                const isEditing = editingColId === col.id;

                return (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2 mr-2">
                        <input
                          type="text"
                          value={editColTitle}
                          onChange={(e) => setEditColTitle(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded"
                        />
                        <div className="flex items-center gap-1">
                          {COLOR_OPTIONS.map((c) => (
                            <button
                              type="button"
                              key={c.value}
                              onClick={() => setEditColColor(c.value)}
                              className={`w-4 h-4 rounded-full ${c.bg} ${
                                editColColor === c.value ? 'ring-2 ring-black' : ''
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleSaveEditColumn(col.id)}
                          className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded font-bold"
                        >
                          Kaydet
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-gray-400">
                          #{idx + 1}
                        </span>
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: col.color }}
                        />
                        <span className="text-xs font-bold text-[#1B2A4A]">
                          {col.title}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Sola / Sağa Kaydır */}
                      <button
                        onClick={() => moveKanbanColumn(col.id, 'left')}
                        disabled={idx === 0}
                        title="Sola Taşı"
                        className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-20"
                      >
                        <MoveLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveKanbanColumn(col.id, 'right')}
                        disabled={idx === sortedColumns.length - 1}
                        title="Sağa Taşı"
                        className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-20"
                      >
                        <MoveRight className="w-4 h-4" />
                      </button>

                      {/* Düzenle */}
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingColId(col.id);
                            setEditColTitle(col.title);
                            setEditColColor(col.color);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 text-xs font-semibold px-2"
                        >
                          Düzenle
                        </button>
                      )}

                      {/* Sil */}
                      <button
                        onClick={() => deleteKanbanColumn(col.id)}
                        disabled={sortedColumns.length <= 1}
                        title="Sütunu Sil"
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1B2A4A] text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: HIZLI KALIP DÖKÜMÜ KAYDET */}
      {quickCastOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1B2A4A]">
                    Hızlı Silikon Kalıp Dökümü Kaydet
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sipariş #{quickCastOrder.orderNumber} - {quickCastOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickCastOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickCast} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                  Kullanılan Silikon Kalıp
                </label>
                <select
                  value={selectedMoldId}
                  onChange={(e) => setSelectedMoldId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  required
                >
                  {siliconeMolds.map((mold) => (
                    <option key={mold.id} value={mold.id}>
                      {mold.name} ({mold.cavityCount} Gözlü) - Kalan: {mold.maxCasts - mold.currentCasts} döküm (%{Math.round((mold.currentCasts / mold.maxCasts) * 100)} yıpranma)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Tur / Döküm Sayısı
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={castRounds}
                    onChange={(e) => setCastRounds(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] font-bold focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Dökümü Yapan Usta
                  </label>
                  <input
                    type="text"
                    value={castOperator}
                    onChange={(e) => setCastOperator(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                  Not / Parti Açıklaması
                </label>
                <input
                  type="text"
                  value={castNotes}
                  onChange={(e) => setCastNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              {selectedMoldId && (() => {
                const m = siliconeMolds.find((x) => x.id === selectedMoldId);
                if (!m) return null;
                const producedUnits = (m.cavityCount || 1) * castRounds;
                return (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>Üretilecek Net Adet:</span>
                      <span className="text-amber-800 text-sm font-black">{producedUnits} Adet</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Bu işlem sonrası kalıbın toplam döküm sayısı <strong>{m.currentCasts + castRounds} / {m.maxCasts}</strong> olacak ve ömür çubuğu güncellenecektir.
                    </p>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setQuickCastOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kalıp Dökümünü Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
