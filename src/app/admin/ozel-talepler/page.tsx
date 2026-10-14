'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareQuote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  FileCheck,
  XCircle,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  X,
  Plus,
  Coins,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { CustomQuoteRequest, QuoteStatus } from '@/types/admin';

export default function OzelTaleplerPage() {
  const { quoteRequests, updateQuoteStatus, convertQuoteToOrder } = useAdmin();

  // Filtreler
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Detay & Fiyatlandırma Modalı State
  const [selectedQuote, setSelectedQuote] = useState<CustomQuoteRequest | null>(null);
  const [unitPriceInput, setUnitPriceInput] = useState<number>(0);
  const [totalPriceInput, setTotalPriceInput] = useState<number>(0);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [convertedOrderNumber, setConvertedOrderNumber] = useState<string | null>(null);

  // Yeni Manuel Talep Ekleme Modalı State
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newEventType, setNewEventType] = useState('Söz & Nişan Hediyeliği');
  const [newProductType, setNewProductType] = useState('Doğal Botanik Mum & Kokulu Taş Seti');
  const [newRequestedQty, setNewRequestedQty] = useState(100);
  const [newTargetBudget, setNewTargetBudget] = useState(10000);
  const [newEventDate, setNewEventDate] = useState('2026-11-30');
  const [newCustomText, setNewCustomText] = useState('');
  const [newSelectedScent, setNewSelectedScent] = useState('Lavanta & Sandal Ağacı');
  const [newCustomDetails, setNewCustomDetails] = useState('');
  const { addQuoteRequest } = useAdmin();

  // İstatistikler
  const totalCount = quoteRequests.length;
  const pendingCount = quoteRequests.filter((q) => q.status === 'BEKLEMEDE').length;
  const reviewingCount = quoteRequests.filter(
    (q) => q.status === 'INCELENIYOR' || q.status === 'TEKLIF_VERILDI'
  ).length;
  const approvedTotalRevenue = quoteRequests
    .filter((q) => q.status === 'ONAYLANDI')
    .reduce((sum, q) => sum + (q.quotedTotalPrice || 0), 0);

  // Filtrelenmiş Liste
  const filteredQuotes = quoteRequests.filter((quote) => {
    const matchesSearch =
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerPhone.includes(searchQuery) ||
      quote.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.customText && quote.customText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL' && quote.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Modalı Aç
  const handleOpenModal = (quote: CustomQuoteRequest) => {
    setSelectedQuote(quote);
    setUnitPriceInput(quote.quotedUnitPrice || (quote.targetBudget ? Math.round(quote.targetBudget / quote.requestedQuantity) : 100));
    setTotalPriceInput(
      quote.quotedTotalPrice ||
        (quote.quotedUnitPrice
          ? quote.quotedUnitPrice * quote.requestedQuantity
          : quote.targetBudget || 100 * quote.requestedQuantity)
    );
    setAdminNoteInput(quote.adminNote || '');
    setConvertedOrderNumber(null);
  };

  // Birim Fiyat Değiştiğinde Toplamı Güncelle
  const handleUnitPriceChange = (val: number) => {
    setUnitPriceInput(val);
    if (selectedQuote) {
      setTotalPriceInput(Math.round(val * selectedQuote.requestedQuantity));
    }
  };

  // Teklif Kaydet / Güncelle
  const handleSaveQuoteDetails = (status: QuoteStatus) => {
    if (!selectedQuote) return;
    updateQuoteStatus(
      selectedQuote.id,
      status,
      unitPriceInput,
      totalPriceInput,
      adminNoteInput
    );
    setSelectedQuote({
      ...selectedQuote,
      status,
      quotedUnitPrice: unitPriceInput,
      quotedTotalPrice: totalPriceInput,
      adminNote: adminNoteInput,
    });
  };

  // Teklifi Onayla ve Siparişe Dönüştür (Üretim Bandına Al)
  const handleConvertQuoteToOrder = () => {
    if (!selectedQuote) return;
    try {
      const createdOrder = convertQuoteToOrder(
        selectedQuote.id,
        unitPriceInput,
        totalPriceInput
      );
      setConvertedOrderNumber(createdOrder.orderNumber);
      setSelectedQuote({
        ...selectedQuote,
        status: 'ONAYLANDI',
        quotedUnitPrice: unitPriceInput,
        quotedTotalPrice: totalPriceInput,
        adminNote: adminNoteInput,
      });
    } catch (err: any) {
      alert(err.message || 'Dönüştürme sırasında hata oluştu.');
    }
  };

  // Yeni Talep Formu Gönder
  const handleCreateNewQuote = (e: React.FormEvent) => {
    e.preventDefault();
    addQuoteRequest({
      customerName: newCustomerName,
      customerEmail: newCustomerEmail,
      customerPhone: newCustomerPhone,
      eventType: newEventType,
      productType: newProductType,
      requestedQuantity: Number(newRequestedQty),
      targetBudget: Number(newTargetBudget),
      eventDate: newEventDate,
      customText: newCustomText,
      selectedScent: newSelectedScent,
      customDetails: newCustomDetails,
      quotedUnitPrice: Math.round(Number(newTargetBudget) / Number(newRequestedQty)),
      quotedTotalPrice: Number(newTargetBudget),
    });
    setIsNewQuoteModalOpen(false);
    // Reset
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewCustomerPhone('');
    setNewCustomText('');
    setNewCustomDetails('');
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'BEKLEMEDE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>Beklemede</span>
          </span>
        );
      case 'INCELENIYOR':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
            <Eye className="w-3 h-3" />
            <span>İnceleniyor</span>
          </span>
        );
      case 'TEKLIF_VERILDI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit">
            <Send className="w-3 h-3" />
            <span>Teklif Verildi</span>
          </span>
        );
      case 'ONAYLANDI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>Onaylandı (Bantta)</span>
          </span>
        );
      case 'REDDEDILDI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            <span>Reddedildi</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. ÜST BAŞLIK VE AKSİYON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Kişiye Özel & Kurumsal Toplu Siparişler</span>
          </div>
          <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight mt-1">
            Özel Teklifler & Talep Masası
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Vitrinden veya özel konfigüratörden gelen hediyelik, düğün, kurumsal toplu üretim taleplerini inceleyin; adet baremine göre özel birim fiyat tanımlayın ve onaylayarak doğrudan üretim bandına aktarın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/uretim-bandi"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-[#1B2A4A] text-xs font-bold transition shadow-sm"
          >
            <Layers className="w-4 h-4 text-[#D96B27]" />
            <span>Üretim Bandını Aç</span>
          </Link>

          <button
            onClick={() => setIsNewQuoteModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold transition shadow-md shadow-[#D96B27]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Manuel Talep Gir</span>
          </button>
        </div>
      </div>

      {/* 2. KPI KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Toplam Talep
            </div>
            <div className="text-2xl font-black text-[#1B2A4A] mt-1">
              {totalCount} adet
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Vitrinden & Atölyeden</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#1B2A4A] flex items-center justify-center font-bold">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Bekleyen Talepler
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {pendingCount} adet
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">Teklif bekliyor</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              İncelenen & Teklif
            </div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {reviewingCount} adet
            </div>
            <div className="text-[11px] text-blue-700/80 mt-0.5">Müşteriyle görüşülüyor</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Dönüşen Ciro (Bantta)
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₺{approvedTotalRevenue.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">Onaylanan özel siparişler</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. FİLTRELER & ARAMA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri adı, etkinlik veya ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
          {[
            { id: 'ALL', label: 'Tümü' },
            { id: 'BEKLEMEDE', label: 'Beklemede' },
            { id: 'INCELENIYOR', label: 'İnceleniyor' },
            { id: 'TEKLIF_VERILDI', label: 'Teklif Verildi' },
            { id: 'ONAYLANDI', label: 'Onaylandı' },
            { id: 'REDDEDILDI', label: 'Reddedildi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. TALEP TABLOSU */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E8E2D9] text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Müşteri & İletişim</th>
                <th className="p-4">Etkinlik & Ürün Türü</th>
                <th className="p-4 text-center">Talep Adedi</th>
                <th className="p-4">Etkinlik Tarihi</th>
                <th className="p-4">Özel Fiyat / Bütçe</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Kriterlere uygun özel teklif talebi bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-amber-50/30 transition">
                    {/* Müşteri */}
                    <td className="p-4">
                      <div className="font-bold text-[#1B2A4A] text-sm">
                        {quote.customerName}
                      </div>
                      <div className="flex flex-col text-[11px] text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {quote.customerEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {quote.customerPhone}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Talep: {quote.createdAt}
                      </span>
                    </td>

                    {/* Etkinlik & Ürün */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {quote.eventType}
                      </span>
                      <div className="font-semibold text-gray-800 mt-1">
                        {quote.productType}
                      </div>
                      {quote.customText && (
                        <div className="text-[11px] text-indigo-700 font-medium italic mt-0.5">
                          &ldquo;{quote.customText}&rdquo;
                        </div>
                      )}
                    </td>

                    {/* Adet */}
                    <td className="p-4 text-center">
                      <span className="text-sm font-black text-[#D96B27]">
                        {quote.requestedQuantity}
                      </span>
                      <span className="text-[10px] text-gray-400 block">adet</span>
                    </td>

                    {/* Etkinlik Tarihi */}
                    <td className="p-4 text-[11px] text-gray-600">
                      {quote.eventDate ? (
                        <div className="flex items-center gap-1 font-semibold text-gray-800">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{quote.eventDate}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Belirtilmedi</span>
                      )}
                    </td>

                    {/* Fiyat & Bütçe */}
                    <td className="p-4">
                      {quote.quotedTotalPrice ? (
                        <div>
                          <div className="font-bold text-emerald-700 text-sm">
                            ₺{quote.quotedTotalPrice.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            (₺{quote.quotedUnitPrice || 0} / adet)
                          </div>
                        </div>
                      ) : quote.targetBudget ? (
                        <div>
                          <div className="font-semibold text-gray-700 text-xs">
                            Hedef: ₺{quote.targetBudget.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-[10px] text-amber-600 font-medium">
                            Teklif verilmedi
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Bütçe yok</span>
                      )}
                    </td>

                    {/* Durum */}
                    <td className="p-4">{getStatusBadge(quote.status)}</td>

                    {/* Aksiyonlar */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(quote)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D96B27] text-[#D96B27] hover:bg-[#D96B27] hover:text-white text-xs font-bold transition shadow-xs"
                      >
                        İncele & Teklif Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: DETAYLI İNCELEME, ÖZEL FİYAT VERME & SİPARİŞE DÖNÜŞTÜRME */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Üst Başlık */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#D96B27] flex items-center justify-center">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1B2A4A]">
                    Özel Teklif İnceleme & Onay
                  </h3>
                  <p className="text-xs text-gray-500">
                    Talep ID: #{selectedQuote.id} &bull; {selectedQuote.createdAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Siparişe Dönüştürüldüyse Başarı Banner'ı */}
            {convertedOrderNumber && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">
                      Talep başarıyla onaylandı ve üretim sırasına alındı!
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Oluşturulan Sipariş No:{' '}
                      <strong>#{convertedOrderNumber}</strong>
                    </div>
                  </div>
                </div>
                <Link
                  href="/admin/uretim-bandi"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  <span>Bantta Gör</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Müşteri ve Talep Bilgileri Kutusu */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF9F5] p-4 rounded-xl border border-gray-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Müşteri Adı
                </span>
                <span className="font-bold text-[#1B2A4A] text-sm">
                  {selectedQuote.customerName}
                </span>
                <div className="mt-1 space-y-0.5 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <a
                      href={`mailto:${selectedQuote.customerEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedQuote.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <a
                      href={`https://wa.me/${selectedQuote.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      className="text-emerald-700 font-medium hover:underline flex items-center gap-0.5"
                    >
                      {selectedQuote.customerPhone} (WhatsApp)
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Etkinlik & Zamanlama
                </span>
                <span className="font-bold text-[#1B2A4A]">
                  {selectedQuote.eventType}
                </span>
                <div className="mt-1 text-gray-600 space-y-0.5">
                  <div>
                    Etkinlik Tarihi: <strong>{selectedQuote.eventDate || 'Belirtilmedi'}</strong>
                  </div>
                  <div>
                    Talep Edilen Adet:{' '}
                    <strong className="text-[#D96B27]">
                      {selectedQuote.requestedQuantity} Adet
                    </strong>
                  </div>
                  {selectedQuote.targetBudget && (
                    <div>
                      Müşteri Bütçesi: ₺{selectedQuote.targetBudget.toLocaleString('tr-TR')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ürün & Özel Tasarım Detayları */}
            <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white space-y-2 text-xs">
              <div className="font-bold text-[#1B2A4A] flex items-center justify-between">
                <span>İstenen Ürün & Kişiselleştirme Detayları</span>
                <span className="text-gray-500 font-normal">{selectedQuote.productType}</span>
              </div>

              {selectedQuote.customText && (
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900">
                  <span className="font-bold text-[10px] uppercase tracking-wide text-indigo-700 block">
                    Etiket / Lazer Kazıma Metni:
                  </span>
                  <span className="font-semibold text-sm">
                    &ldquo;{selectedQuote.customText}&rdquo;
                  </span>
                </div>
              )}

              {selectedQuote.selectedScent && (
                <div className="text-gray-700">
                  <strong>Seçilen Koku Notası:</strong> {selectedQuote.selectedScent}
                </div>
              )}

              <div className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="font-bold text-[10px] uppercase tracking-wide text-gray-400 block">
                  Müşteri Açıklaması & Notları:
                </span>
                <p className="mt-0.5 leading-relaxed">{selectedQuote.customDetails}</p>
              </div>

              {/* Referans Görseller */}
              {selectedQuote.referenceImages && selectedQuote.referenceImages.length > 0 && (
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wide text-gray-400 block mb-1">
                    Müşterinin Yüklediği Referans Görseller:
                  </span>
                  <div className="flex gap-2">
                    {selectedQuote.referenceImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 block relative group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="Referans" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ÖZEL FİYATLANDIRMA FORMU */}
            <div className="mt-4 p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D96B27] uppercase tracking-wide">
                <Coins className="w-4 h-4" />
                <span>Atölye Özel Fiyatlandırma & Teklif Notu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Özel Birim Fiyat (₺ / Adet)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={unitPriceInput}
                    onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-[#1B2A4A] font-bold focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Toplam Teklif Tutarı (₺)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalPriceInput}
                    onChange={(e) => setTotalPriceInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-[#1B2A4A] font-bold focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    {selectedQuote.requestedQuantity} adet x ₺{unitPriceInput}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                  Atölye Teklif / Müşteri Yanıt Notu
                </label>
                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Örn: 120 adet için kurdele ve kraft kutu fiyata dahildir. Numune hazırlanabilir..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              {/* Durum Değiştirme ve Butonlar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-orange-200/60">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-600">Durumu Değiştir:</span>
                  <button
                    type="button"
                    onClick={() => handleSaveQuoteDetails('INCELENIYOR')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                      selectedQuote.status === 'INCELENIYOR'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    İnceleniyor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveQuoteDetails('TEKLIF_VERILDI')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                      selectedQuote.status === 'TEKLIF_VERILDI'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    Teklif İletildi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveQuoteDetails('REDDEDILDI')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                      selectedQuote.status === 'REDDEDILDI'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    Reddet
                  </button>
                </div>

                {/* Ana Aksiyon: Onayla & Siparişe Dönüştür */}
                {selectedQuote.status !== 'ONAYLANDI' && (
                  <button
                    type="button"
                    onClick={handleConvertQuoteToOrder}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Teklifi Onayla & Üretim Bandına Al</span>
                  </button>
                )}
              </div>
            </div>

            {/* Alt Kapat */}
            <div className="mt-5 pt-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: YENİ MANUEL TALEP EKLEME FORMU */}
      {isNewQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D96B27]" />
                <h3 className="text-base font-black text-[#1B2A4A]">
                  Yeni Manuel Özel Talep Kaydet
                </h3>
              </div>
              <button
                onClick={() => setIsNewQuoteModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewQuote} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Müşteri Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                  placeholder="Örn: Ayşe & Barış Demir"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">E-Posta</label>
                  <input
                    type="email"
                    required
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                    placeholder="ornek@gmail.com"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Telefon</label>
                  <input
                    type="text"
                    required
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                    placeholder="+90 532 ..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Etkinlik Türü</label>
                  <input
                    type="text"
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Etkinlik Tarihi</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Talep Adedi</label>
                  <input
                    type="number"
                    min="1"
                    value={newRequestedQty}
                    onChange={(e) => setNewRequestedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hedef Bütçe (₺)</label>
                  <input
                    type="number"
                    min="100"
                    value={newTargetBudget}
                    onChange={(e) => setNewTargetBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Yazılacak Özel Metin</label>
                <input
                  type="text"
                  value={newCustomText}
                  onChange={(e) => setNewCustomText(e.target.value)}
                  placeholder="Örn: Ayşe & Barış 2026"
                  className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Özel İstekler / Detay</label>
                <textarea
                  rows={2}
                  value={newCustomDetails}
                  onChange={(e) => setNewCustomDetails(e.target.value)}
                  placeholder="Renk tercihi, paketleme istekleri..."
                  className="w-full px-3 py-2 border rounded-lg bg-[#F6F4F0] focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold transition shadow-sm"
                >
                  Talebi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
