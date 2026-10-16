'use client';

import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Download,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  X,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import {
  TransactionType,
  TransactionCategory,
  PaymentMethod,
  FinanceTransaction,
} from '@/types/admin';

export default function FinansPage() {
  const {
    financeTransactions,
    addFinanceTransaction,
    accounts,
    showToast,
  } = useAdmin();

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | '3MONTHS'>('MONTH');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GELIR' | 'GIDER'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Yeni İşlem Modalı
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('GIDER');
  const [txCategory, setTxCategory] = useState<TransactionCategory>('HAMMADDE_ALIMI');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('HAVALE_EFT');
  const [txDescription, setTxDescription] = useState('');
  const [txRefNo, setTxRefNo] = useState('');
  const [txAccountId, setTxAccountId] = useState('');

  // Tarih Filtresi Hesaplama
  const now = new Date();
  const filteredTransactions = financeTransactions.filter((tx) => {
    const txDate = new Date(tx.date);

    let matchesDate = true;
    if (dateFilter === 'TODAY') {
      matchesDate =
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getDate() === now.getDate();
    } else if (dateFilter === 'WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = txDate >= oneWeekAgo;
    } else if (dateFilter === 'MONTH') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = txDate >= oneMonthAgo;
    } else if (dateFilter === '3MONTHS') {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      matchesDate = txDate >= threeMonthsAgo;
    }

    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    const matchesCategory =
      categoryFilter === 'ALL' || tx.category === categoryFilter;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.referenceNo && tx.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.accountName && tx.accountName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDate && matchesType && matchesCategory && matchesSearch;
  });

  // Toplam Hesaplamalar (Seçili Filtreye Göre)
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'GELIR')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'GIDER')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfitLoss = totalIncome - totalExpense;

  // Gider Kalemleri Dağılımı Hesaplama
  const expenseByCategory: Record<string, number> = {};
  filteredTransactions
    .filter((t) => t.type === 'GIDER')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const categoryLabels: Record<TransactionCategory, string> = {
    SIPARIS_SATIS: 'Sipariş & Satış Tahsilatı',
    HAMMADDE_ALIMI: 'Hammadde & Malzeme Alımı',
    ATOLYE_KIRA_AIDAT: 'Atölye Kirası & Aidat',
    ELEKTRIK_SU_GAZ: 'Elektrik, Su, Isınma',
    KARGO_LOJISTIK: 'Kargo & Lojistik Dağıtım',
    PAZARLAMA_REKLAM: 'Pazarlama & Sosyal Medya',
    MAAS_PERSONEL: 'Maaş & Zanaatkar Personel',
    AMBALAJ_PAKETLEME: 'Ambalaj, Kutu & Kurdele',
    DIGER: 'Diğer Genel Giderler',
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0 || !txDescription) return;

    const selectedAcc = accounts.find((a) => a.id === txAccountId);

    addFinanceTransaction({
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      paymentMethod: txPaymentMethod,
      description: txDescription,
      referenceNo: txRefNo || undefined,
      accountId: txAccountId || undefined,
      accountName: selectedAcc?.name,
    });

    // Formu sıfırla
    setTxAmount(0);
    setTxDescription('');
    setTxRefNo('');
    setTxAccountId('');
    setIsAddModalOpen(false);
  };

  // CSV Raporu Dışa Aktarma
  const handleExportCSV = () => {
    const headers = ['ID,Tarih,İşlem Türü,Kategori,Tutar,Ödeme Yöntemi,Açıklama,Referans No,İlgili Cari'];
    const rows = filteredTransactions.map((t) =>
      [
        t.id,
        `"${t.date}"`,
        t.type,
        `"${categoryLabels[t.category] || t.category}"`,
        t.amount,
        t.paymentMethod,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.referenceNo || ''}"`,
        `"${t.accountName || ''}"`,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Safirya_Finans_Raporu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Finansal rapor CSV formatında indirildi.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. ÜST BAŞLIK VE HIZLI AKSİYONLAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Wallet className="w-4 h-4" />
            <span>Kasa, Banka & Kâr-Zarar Tablosu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            Finans & Gelir-Gider Raporlama
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            Nakit akışı, hammadde harcamaları, atölye giderleri ve net kârlılık analizi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-xs font-bold text-[#1B2A4A] flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Excel / CSV Dışa Aktar</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/20 flex items-center gap-2 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Gelir / Gider Ekle</span>
          </button>
        </div>
      </div>

      {/* 2. TARİH ARALIĞI FİLTRESİ */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D9] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Calendar className="w-4 h-4 text-[#D96B27]" />
          <span>Analiz Dönemi:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'TODAY', label: 'Bugün' },
            { id: 'WEEK', label: 'Son 7 Gün' },
            { id: 'MONTH', label: 'Son 30 Gün (Bu Ay)' },
            { id: '3MONTHS', label: 'Son 3 Ay (Çeyrek)' },
            { id: 'ALL', label: 'Tüm Zamanlar' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateFilter(item.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                dateFilter === item.id
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. FİNANSAL KPI KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Toplam Gelir */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Dönem Gelirleri (Tahsilatlar)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            E-ticaret POS satışları ve kurumsal havaleler
          </p>
        </div>

        {/* Toplam Gider */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Dönem Giderleri (Harcamalar)
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            ₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Hammadde, kira, kargo ve atölye faturaları
          </p>
        </div>

        {/* Net Kâr / Zarar */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Net Faaliyet Kârı / Dengesi
            </span>
            <div className={`p-2 rounded-xl ${netProfitLoss >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${netProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ₺{netProfitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {netProfitLoss >= 0 ? 'Pozitif nakit akışı ve kârlılık' : 'Dönem içi yatırım/gider fazlası'}
          </p>
        </div>
      </div>

      {/* 4. GİDER DAĞILIMI ANALİZİ (GÖRSEL ÇUBUKLAR) */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#D96B27]" />
            <h3 className="text-sm font-bold text-[#1B2A4A]">
              Gider Kalemleri Dağılım Analizi
            </h3>
          </div>
          <span className="text-xs font-bold text-gray-500">
            Toplam Harcama: ₺{totalExpense.toLocaleString('tr-TR')}
          </span>
        </div>

        {totalExpense === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            Seçili dönemde gider kaydı bulunmamaktadır.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {Object.entries(expenseByCategory).map(([catKey, amount]) => {
              const label = categoryLabels[catKey as TransactionCategory] || catKey;
              const percentage = Math.round((amount / totalExpense) * 100);

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{label}</span>
                    <span className="font-bold text-[#1B2A4A]">
                      ₺{amount.toLocaleString('tr-TR')} (%{percentage})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D96B27] to-amber-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. ARAMA VE DETAYLI İŞLEM TABLOSU */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İşlem açıklaması, referans no veya cari adı ile ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/50"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-semibold text-gray-700 bg-white"
          >
            <option value="ALL">Gelir + Gider (Tümü)</option>
            <option value="GELIR">Sadece Gelirler</option>
            <option value="GIDER">Sadece Giderler</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-semibold text-gray-700 bg-white"
          >
            <option value="ALL">Tüm Kategoriler</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3.5 px-4">Tarih</th>
                <th className="py-3.5 px-4">Tür</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Açıklama / Referans</th>
                <th className="py-3.5 px-4">Ödeme Yöntemi</th>
                <th className="py-3.5 px-4">İlgili Cari / Sipariş</th>
                <th className="py-3.5 px-4 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Seçili kriterlerde finansal hareket bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'GELIR';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {tx.date}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isIncome ? 'GELİR' : 'GİDER'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-gray-800">
                        {categoryLabels[tx.category] || tx.category}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1B2A4A]">
                          {tx.description}
                        </div>
                        {tx.referenceNo && (
                          <div className="text-[10px] text-gray-400 font-mono">
                            Ref: {tx.referenceNo}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                        {tx.paymentMethod === 'KREDI_KARTI'
                          ? 'Kredi Kartı / POS'
                          : tx.paymentMethod === 'HAVALE_EFT'
                          ? 'Havale / EFT'
                          : 'Nakit'}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {tx.accountName ? (
                          <span className="font-semibold text-gray-700">
                            {tx.accountName}
                          </span>
                        ) : tx.orderNumber ? (
                          <span className="font-mono text-[#D96B27] font-semibold">
                            {tx.orderNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-sm">
                        <span className={isIncome ? 'text-emerald-600' : 'text-red-600'}>
                          {isIncome ? '+' : '-'}₺{tx.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MODAL: YENİ GELİR / GİDER EKLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                  Kasa / Banka Kaydı
                </span>
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  Yeni Finansal Hareket Ekle
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 mt-4 text-xs">
              
              {/* İşlem Türü Butonları */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTxType('GELIR')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    txType === 'GELIR'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>GELİR (Tahsilat / Satış)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTxType('GIDER')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    txType === 'GIDER'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>GİDER (Harcama / Ödeme)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Gider / Gelir Kategorisi *
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#D96B27]"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tutar (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={txAmount || ''}
                    onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-sm focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Açıklama *
                </label>
                <input
                  type="text"
                  required
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="Örn: 25kg Soya vaksı fatura ödemesi / Karşıyaka Atölye Kirası"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Ödeme Yöntemi
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#D96B27]"
                  >
                    <option value="HAVALE_EFT">Banka Havale / EFT</option>
                    <option value="KREDI_KARTI">Kredi Kartı / Sanal POS</option>
                    <option value="NAKIT">Nakit Kasa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Fiş / Fatura / Dekont No
                  </label>
                  <input
                    type="text"
                    value={txRefNo}
                    onChange={(e) => setTxRefNo(e.target.value)}
                    placeholder="Örn: EFT-881273"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  İlişkili Cari Hesap (Opsiyonel)
                </label>
                <select
                  value={txAccountId}
                  onChange={(e) => setTxAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                >
                  <option value="">Cari Hesapsız Bağımsız Hareket</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
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
                  İşlemi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
