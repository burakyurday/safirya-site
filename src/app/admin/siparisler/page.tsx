'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  PlusCircle,
  Eye,
  X,
  Sparkles,
  QrCode,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminOrder, AdminInvoice, OrderStage, CustomContract } from '@/types/admin';
import ContractPreviewModal from '@/components/contract/ContractPreviewModal';
import { printContractA4, downloadContractPdf } from '@/lib/contractPdf';
import { printInvoiceA4, downloadInvoicePdf } from '@/lib/invoicePdf';

export default function SiparislerPage() {
  const {
    orders,
    invoices,
    customContracts,
    settings,
    generateInvoice,
    updateOrderStage,
    cancelInvoice,
    showToast,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [invoiceFilter, setInvoiceFilter] = useState<string>('ALL');

  // Modal Durumları
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null);
  const [isInvoicePdfModalOpen, setIsInvoicePdfModalOpen] = useState(false);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  // Sözleşme Modalı Durumları
  const [selectedContract, setSelectedContract] = useState<CustomContract | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Kargo Modal Durumu
  const [cargoModalOrder, setCargoModalOrder] = useState<AdminOrder | null>(null);
  const [cargoCompanyInput, setCargoCompanyInput] = useState('Yurtiçi Kargo');
  const [cargoTrackingCodeInput, setCargoTrackingCodeInput] = useState('');

  // Fatura A4 Yazdırma & İndirme Eylemleri
  const handlePrintInvoice = async () => {
    if (!selectedInvoice) return;
    setIsPrintingInvoice(true);
    try {
      await printInvoiceA4(selectedInvoice, settings);
    } catch (err) {
      console.error('Fatura yazdırma hatası:', err);
      window.print();
    } finally {
      setIsPrintingInvoice(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!selectedInvoice) return;
    setIsDownloadingInvoice(true);
    try {
      await downloadInvoicePdf(selectedInvoice, settings);
    } catch (err) {
      console.error('Fatura PDF indirme hatası:', err);
      alert('PDF oluşturulamadı.');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const formatAddress = (addr: any) => {
    if (!addr) return 'Adres belirtilmemiş';
    if (typeof addr === 'string') return addr;
    const parts = [addr.address || addr.fullAddress, addr.district, addr.city].filter(Boolean);
    return parts.join(' ') || 'Adres belirtilmemiş';
  };

  const handleStageChange = (order: AdminOrder, newStage: OrderStage) => {
    if (newStage === 'KARGOYA_VERILDI') {
      setCargoModalOrder(order);
      setCargoCompanyInput(order.cargoCompany || 'Yurtiçi Kargo');
      setCargoTrackingCodeInput(order.cargoTrackingNo || '');
    } else {
      updateOrderStage(order.id || order.orderNumber, newStage);
    }
  };

  const handleConfirmCargo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoModalOrder) return;
    const targetId = cargoModalOrder.id || cargoModalOrder.orderNumber;
    updateOrderStage(targetId, 'KARGOYA_VERILDI', {
      cargoCompany: cargoCompanyInput.trim(),
      cargoTrackingNo: cargoTrackingCodeInput.trim() || undefined,
    });
    setCargoModalOrder(null);
  };

  // Filtreleme
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.invoiceNo && o.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = stageFilter === 'ALL' || o.stage === stageFilter;
    const matchesInvoice =
      invoiceFilter === 'ALL' || o.invoiceStatus === invoiceFilter;

    return matchesSearch && matchesStage && matchesInvoice;
  });

  const handleCreateInvoice = (orderId: string) => {
    try {
      const inv = generateInvoice(orderId);
      setSelectedInvoice(inv);
      setIsInvoicePdfModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Fatura oluşturulamadı.');
    }
  };

  const handleViewInvoice = (order: AdminOrder) => {
    // 1. Önce Context'teki faturalarda ara
    let inv = invoices.find(
      (i) => (order.invoiceNo && i.invoiceNo === order.invoiceNo) || i.orderNumber === order.orderNumber
    );

    // 2. localStorage fallback
    if (!inv && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('safirya_invoices');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            inv = list.find(
              (i: any) =>
                (order.invoiceNo && i.invoiceNo === order.invoiceNo) ||
                i.orderNumber === order.orderNumber
            );
          }
        }
      } catch {}
    }

    if (inv) {
      setSelectedInvoice(inv);
      setIsInvoicePdfModalOpen(true);
    } else {
      // Siparişten sanal olarak oluşturup göster
      handleCreateInvoice(order.id || order.orderNumber);
    }
  };

  const findOrCreateContractForOrder = (order: AdminOrder): CustomContract => {
    // 1. Önce AdminContext'te kayıtlı sözleşme var mı
    let existing = customContracts.find(
      (c) => (c.orderId && c.orderId === order.id) || c.orderNumber === order.orderNumber
    );

    // 2. localStorage fallback
    if (!existing && typeof window !== 'undefined') {
      try {
        const raw =
          localStorage.getItem('safirya_custom_contracts') ||
          localStorage.getItem('safirya_admin_contracts');
        if (raw) {
          const list = JSON.parse(raw);
          existing = list.find(
            (c: any) =>
              (c.orderId && c.orderId === order.id) ||
              c.orderNumber === order.orderNumber ||
              (c.orderNumber &&
                order.orderNumber &&
                c.orderNumber.toUpperCase() === order.orderNumber.toUpperCase())
          );
        }
      } catch {}
    }

    if (existing) return existing;

    const orderItems = order.items || [];
    // 3. Sipariş kalemlerinden dinamik resmi sözleşme objesi üret
    const customItems = orderItems.filter(
      (i) => i.customization?.customText || (i as any).customText
    );
    const firstCustom = customItems[0] || orderItems[0];

    return {
      id: `cnt-${order.id || order.orderNumber}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: formatAddress(order.shippingAddress),
      productName:
        customItems.length > 0
          ? customItems.map((i) => `${i.productName || (i as any).name || 'Özel Ürün'} (${i.quantity} Adet)`).join(', ')
          : firstCustom?.productName || (firstCustom as any)?.name || 'Kişiye Özel Tasarım Hediyelik',
      quantity: customItems.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1,
      totalAmount: Number(order.totalAmount || 0),
      customText:
        customItems
          .map((i) => i.customization?.customText || (i as any).customText)
          .filter(Boolean)
          .join(' | ') || 'Özel İsim Belirtilmedi',
      scentNote: firstCustom?.customization?.selectedScent,
      colorPalette: firstCustom?.customization?.selectedColor,
      tagDesignType: firstCustom?.customization?.tagDesignType,
      extraNotes: firstCustom?.customization?.extraNote,
      status: order.contractStatus === 'ONAYLANDI' ? 'ONAYLANDI' : 'BEKLIYOR',
      verificationCode: order.contractVerificationCode || `SOZ-${order.orderNumber}-OK`,
      signedAt: order.contractSignedAt || String(order.createdAt || '').slice(0, 10),
      signedBy: order.contractSignedBy || order.customerName,
      signatureDataUrl: order.signatureDataUrl,
      legalConsentChecked: true,
      createdAt: order.createdAt || 'Yeni',
      agreedDeliveryDate: order.dueDate || '3-4 İş Günü',
      items: orderItems.map((i) => {
        const itemPrice = Number(i.unitPrice ?? (i as any).price ?? 0);
        const itemTotal = Number(i.totalAmount ?? (itemPrice * (i.quantity || 1)));
        return {
          productName: i.productName || (i as any).name || 'Özel Ürün',
          quantity: i.quantity || 1,
          unitPrice: itemPrice,
          totalAmount: itemTotal,
          customText: i.customization?.customText || (i as any).customText,
          scentNote: i.customization?.selectedScent,
          colorPalette: i.customization?.selectedColor,
          tagDesignType: i.customization?.tagDesignType,
          extraNote: i.customization?.extraNote,
        };
      }),
    };
  };

  const handleOpenContractModal = (order: AdminOrder) => {
    const contract = findOrCreateContractForOrder(order);
    setSelectedContract(contract);
    setIsContractModalOpen(true);
  };

  const handleDownloadContractPdf = async (order: AdminOrder) => {
    try {
      const contract = findOrCreateContractForOrder(order);
      await downloadContractPdf(contract, settings);
      showToast(`Sözleşme PDF indirildi: #${order.orderNumber}`);
    } catch (err: any) {
      showToast('PDF indirilemedi: ' + (err.message || ''));
    }
  };

  const handlePrintContract = async (order: AdminOrder) => {
    try {
      const contract = findOrCreateContractForOrder(order);
      await printContractA4(contract, settings);
    } catch (err: any) {
      showToast('Yazdırma başlatılamadı: ' + (err.message || ''));
    }
  };

  const stageLabels: Record<OrderStage, { label: string; color: string }> = {
    SIPARIS_ALINDI: { label: 'Sipariş Alındı', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    ATOLYEDE_URETIMDE: { label: 'Atölyede Üretimde', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    KALITE_KONTROL_PAKETLEME: { label: 'Kalite Kontrol & Paketleme', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    KARGOYA_VERILDI: { label: 'Kargoya Verildi', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    TESLIM_EDILDI: { label: 'Teslim Edildi', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. ÜST BAŞLIK & MANUEL SİPARİŞ BUTONU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Receipt className="w-4 h-4" />
            <span>Sipariş Takibi & Resmi E-Fatura Kesimi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            Siparişler & E-Fatura Yönetimi
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            Gelen siparişleri atölye üretim aşamalarına göre yönetin ve tek tıkla resmi e-arşiv fatura üretin.
          </p>
        </div>

        <Link
          href="/admin/siparisler/yeni"
          className="px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/20 flex items-center gap-2 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Hızlı Manuel Sipariş Oluştur</span>
        </Link>
      </div>

      {/* 2. ARAMA VE FİLTRELEME ÇUBUĞU */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sipariş no, müşteri adı, e-posta veya fatura no ile ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/50"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-semibold text-gray-700 bg-white"
          >
            <option value="ALL">Tüm Üretim Aşamaları</option>
            <option value="SIPARIS_ALINDI">Sipariş Alındı</option>
            <option value="ATOLYEDE_URETIMDE">Atölyede Üretimde</option>
            <option value="KALITE_KONTROL_PAKETLEME">Kalite Kontrol / Paketleme</option>
            <option value="KARGOYA_VERILDI">Kargoya Verildi</option>
            <option value="TESLIM_EDILDI">Teslim Edildi</option>
          </select>

          <select
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-semibold text-gray-700 bg-white"
          >
            <option value="ALL">Tüm Fatura Durumları</option>
            <option value="BEKLIYOR">Fatura Bekleyenler</option>
            <option value="OLUSTURULDU">E-Faturası Kesilenler</option>
            <option value="IPTAL">İptal Edilenler</option>
          </select>
        </div>
      </div>

      {/* 3. SİPARİŞLER TABLOSU */}
      <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-4 px-5">Sipariş No & Kanal</th>
                <th className="py-4 px-4">Müşteri Bilgileri</th>
                <th className="py-4 px-4 text-right">Tutar & Kalem</th>
                <th className="py-4 px-4">Üretim Aşaması</th>
                <th className="py-4 px-4">Ödeme Durumu</th>
                <th className="py-4 px-4">E-Fatura Durumu</th>
                <th className="py-4 px-5 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Arama kriterlerine uygun sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const currentStage = stageLabels[order.stage] || stageLabels.SIPARIS_ALINDI;
                  const isInvoiceReady = order.invoiceStatus === 'OLUSTURULDU';

                  return (
                    <tr key={order.id || order.orderNumber} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-xs text-[#1B2A4A]">
                          {order.orderNumber}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {order.channel}
                          </span>
                          {order.isGiftWrapped && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700">
                              Hediye
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {order.createdAt}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-800 text-xs">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {order.customerPhone || 'Belirtilmedi'}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[180px]">
                          {formatAddress(order.shippingAddress)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-sm text-[#1B2A4A]">
                          ₺{(Number(order.totalAmount) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {(order.items || []).length} Kalem Ürün
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.stage}
                          onChange={(e) => handleStageChange(order, e.target.value as OrderStage)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${currentStage.color}`}
                        >
                          <option value="SIPARIS_ALINDI">Sipariş Alındı</option>
                          <option value="ATOLYEDE_URETIMDE">Atölyede Üretimde</option>
                          <option value="KALITE_KONTROL_PAKETLEME">Kalite Kontrol & Paket</option>
                          <option value="KARGOYA_VERILDI">Kargoya Verildi</option>
                          <option value="TESLIM_EDILDI">Teslim Edildi</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            order.paymentStatus === 'ODENDI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus === 'ODENDI' ? 'Ödendi' : 'Ödeme Bekliyor'}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {order.paymentMethod}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isInvoiceReady ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>KESİLDİ</span>
                            </span>
                            <div className="font-mono text-[10px] text-gray-500 mt-0.5 font-semibold">
                              {order.invoiceNo}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>BEKLİYOR</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition cursor-pointer"
                          title="Sipariş Detaylarını Gör"
                        >
                          Detay
                        </button>

                        <Link
                          href={`/admin/etiket-montaj?orderId=${order.id || order.orderNumber}`}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#D96B27] border border-orange-200 text-xs font-bold transition shadow-xs inline-flex items-center gap-1"
                          title="Bu Sipariş İçin Etiket Montajı Yap"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Etiket</span>
                        </Link>

                        {/* Kişiselleştirme Sözleşmesi PDF İndir */}
                        {((order.items || []).some((i) => i.customization?.customText || (i as any).customText) || order.contractStatus) && (
                          <button
                            type="button"
                            onClick={() => handleDownloadContractPdf(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition shadow-xs inline-flex items-center gap-1 cursor-pointer"
                            title="Kişiye Özel Üretim Sözleşmesi PDF İndir"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Sözleşme PDF</span>
                          </button>
                        )}

                        {isInvoiceReady ? (
                          <button
                            onClick={() => handleViewInvoice(order)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF Fatura</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreateInvoice(order.id || order.orderNumber)}
                            className="px-3 py-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#D96B27] text-white text-xs font-bold transition shadow-sm active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>E-Fatura Oluştur</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: SİPARİŞ DETAY VE KİŞİSELLEŞTİRME NOTLARI */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                  Sipariş İnceleme
                </span>
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  {selectedOrder.orderNumber} - {selectedOrder.customerName}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-4 text-xs">
              
              {/* Teslimat Bilgileri */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-[#1B2A4A] text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D96B27]" />
                  <span>Teslimat & Adres Bilgileri</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div><strong>Telefon:</strong> {selectedOrder.customerPhone || 'Belirtilmedi'}</div>
                  <div><strong>E-Posta:</strong> {selectedOrder.customerEmail || 'Belirtilmedi'}</div>
                  <div className="col-span-2">
                    <strong>Adres:</strong> {formatAddress(selectedOrder.shippingAddress)}
                  </div>
                </div>
              </div>

              {/* Hediye Notu Varsa */}
              {selectedOrder.isGiftWrapped && (
                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 space-y-1 text-pink-900">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <span>Özel Hediye Paketi & Müşteri Notu:</span>
                  </div>
                  <p className="italic text-xs font-serif bg-white/60 p-2.5 rounded-xl border border-pink-200/60">
                    &quot;{selectedOrder.giftNote || 'Hediye notu belirtilmemiş'}&quot;
                  </p>
                </div>
              )}

              {/* KİŞİYE ÖZEL ÜRETİM SÖZLEŞMESİ KARTI (YASAL TKHK MD. 15/1-b) */}
              {((selectedOrder.items || []).some((i) => i.customization?.customText || (i as any).customText) || selectedOrder.contractStatus) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F3] border-2 border-orange-200 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#D96B27] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1B2A4A] block">
                            Kişiye Özel Üretim ve Kişiselleştirme Sözleşmesi
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {selectedOrder.contractStatus === 'ONAYLANDI' ? 'DİJİTAL ONAYLI' : 'ONAY BEKLİYOR'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          6502 Sayılı TKHK & Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-b Hükmünce Yasal Belge
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadContractPdf(selectedOrder)}
                        className="px-3.5 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#283d6a] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        title="Sözleşmeyi PDF Olarak İndir"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Sözleşmeyi İndir (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintContract(selectedOrder)}
                        className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        title="Yalnızca Sözleşmeyi A4 Formatında Yazdır"
                      >
                        <Printer className="w-3.5 h-3.5 text-gray-600" />
                        <span>A4 Yazdır</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenContractModal(selectedOrder)}
                        className="px-3 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#D96B27] font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                        title="Sözleşmeyi Ekranda İncele"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>İncele</span>
                      </button>
                    </div>
                  </div>

                  {/* Doğrulama Mührü ve İmza Özeti */}
                  <div className="bg-white/80 p-3 rounded-xl border border-orange-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-gray-600">
                        Doğrulama Mührü: <code className="font-bold text-[#1B2A4A]">{selectedOrder.contractVerificationCode || `SOZ-${selectedOrder.orderNumber}-OK`}</code>
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500">
                      <span>İmzalayan: <strong>{selectedOrder.contractSignedBy || selectedOrder.customerName}</strong></span>
                      {selectedOrder.contractSignedAt && (
                        <span> • Onay Tarihi: {selectedOrder.contractSignedAt}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Kalemler & Atölye Kişiselleştirme Detayları */}
              <div>
                <div className="font-bold text-gray-700 mb-2">Sipariş Edilen Ürünler:</div>
                <div className="space-y-2.5">
                  {(selectedOrder.items || []).map((item, idx) => {
                    const itemPrice = Number(item.unitPrice ?? (item as any).price ?? 0);
                    const itemTotal = Number(item.totalAmount ?? (itemPrice * (item.quantity || 1)));
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between font-bold text-sm text-[#1B2A4A]">
                          <span>
                            {item.quantity}x {item.productName || (item as any).name || 'Özel Ürün'}
                          </span>
                          <span>₺{itemTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        {item.variantTitle && (
                          <div className="text-gray-500 font-medium text-[11px]">
                            Varyant: {item.variantTitle}
                          </div>
                        )}

                        {/* Kişiselleştirme Kutusu */}
                        {item.customization && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-1 text-[11px]">
                            <div className="font-bold text-[#D96B27]">
                              ✂️ Atölye Kişiselleştirme Talimatları:
                            </div>
                            {item.customization.customText && (
                              <div>
                                <strong>Yazılacak İsim / Metin:</strong> &quot;{item.customization.customText}&quot;
                              </div>
                            )}
                            {item.customization.selectedScent && (
                              <div>
                                <strong>Koku Notaları:</strong> {item.customization.selectedScent}
                              </div>
                            )}
                            {item.customization.selectedColor && (
                              <div>
                                <strong>Renk Seçimi:</strong> {item.customization.selectedColor}
                              </div>
                            )}
                            {item.customization.tagDesignType && (
                              <div>
                                <strong>Etiket Şablonu:</strong> {item.customization.tagDesignType}
                              </div>
                            )}
                            {item.customization.extraNote && (
                              <div>
                                <strong>Özel Not:</strong> {item.customization.extraNote}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/etiket-montaj?orderId=${selectedOrder.id || selectedOrder.orderNumber}`}
                  className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#D96B27] border border-orange-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Etiket Montajına Git</span>
                </Link>

                {selectedOrder.invoiceStatus !== 'OLUSTURULDU' && (
                  <button
                    onClick={() => {
                      handleCreateInvoice(selectedOrder.id || selectedOrder.orderNumber);
                      setIsDetailModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#D96B27] text-white font-bold text-xs flex items-center gap-2 transition"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Şimdi E-Fatura Kes</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: E-FATURA PDF ÖNİZLEME VE YAZDIRMA */}
      {isInvoicePdfModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:static print:p-0 print:bg-white print:block">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-gray-200 max-h-[95vh] flex flex-col print:border-none print:shadow-none print:p-0 print:max-h-none print:w-full print:block">
            
            {/* Modal Üst Aksiyon Çubuğu */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#D96B27]" />
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  E-Arşiv / E-Fatura Resmi Belge Önizlemesi
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={isDownloadingInvoice}
                  className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  title="Resmi PDF Faturayı Cihaza İndir"
                >
                  <Download className="w-4 h-4 text-[#1B2A4A]" />
                  <span>{isDownloadingInvoice ? 'İndiriliyor...' : 'PDF İndir'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  disabled={isPrintingInvoice}
                  className="px-4 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#2A3F6D] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  title="Yalnızca Faturayı A4 Formatında Yazdır"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isPrintingInvoice ? 'Hazırlanıyor...' : 'A4 Yazdır / PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsInvoicePdfModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gerçekçi Fatura Şablonu (Yazdırılabilir Alan) */}
            <div
              id="invoice-printable-area"
              className="flex-1 overflow-y-auto mt-6 p-8 border border-gray-300 rounded-2xl bg-white shadow-inner font-sans text-[#1B2A4A] space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:overflow-visible print:w-full"
            >
              
              {/* Fatura Başlığı ve Logo */}
              <div className="flex items-start justify-between border-b-2 border-[#1B2A4A] pb-6">
                <div>
                  <div className="text-2xl font-black tracking-wider text-[#1B2A4A]">
                    SAFİRYA
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Safirya El Yapımı Tasarım ve Zanaat Atölyesi Tic. Ltd. Şti.
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                    <div>Karşıyaka / İzmir (Yalnızca Online E-Ticaret Hizmeti)</div>
                    <div>Karşıyaka V.D. • VKN: 1820448192 • Tic. Sicil: 491029-5</div>
                    <div>Mersis: 0182044819200001 • Tel: +90 (232) 555 7234</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded bg-[#1B2A4A] text-white text-xs font-bold tracking-widest uppercase">
                    E-ARŞİV FATURA
                  </div>
                  <div className="text-lg font-mono font-black text-[#D96B27] mt-2">
                    {selectedInvoice.invoiceNo}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    Tarih: {selectedInvoice.issueDate}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Sipariş No: {selectedInvoice.orderNumber}
                  </div>
                </div>
              </div>

              {/* Müşteri & Alıcı Bilgileri */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    SAYIN (MÜŞTERİ BİLGİLERİ)
                  </span>
                  <div className="font-bold text-[#1B2A4A] text-sm">
                    {selectedInvoice.customerName}
                  </div>
                  <div className="text-gray-600 mt-1 leading-relaxed">
                    {selectedInvoice.customerAddress}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    DÜZENLEME DETAYLARI
                  </span>
                  <div>TCKN/VKN: <strong>{selectedInvoice.customerTaxId || '11111111111'}</strong></div>
                  <div>Vergi Dairesi: <strong>Karşıyaka V.D.</strong></div>
                  <div>Fatura Türü: <strong>SATIS (Nihai Tüketici)</strong></div>
                  <div>Ödeme Yöntemi: <strong>KREDİ KARTI / SANAL POS</strong></div>
                </div>
              </div>

              {/* Kalemler Tablosu */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-gray-200 font-bold text-gray-600">
                    <tr>
                      <th className="py-2.5 px-3">Sıra</th>
                      <th className="py-2.5 px-3">Mal / Hizmet Cinsi</th>
                      <th className="py-2.5 px-3 text-center">Miktar</th>
                      <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                      <th className="py-2.5 px-3 text-center">KDV %</th>
                      <th className="py-2.5 px-3 text-right">KDV Tutarı</th>
                      <th className="py-2.5 px-3 text-right">Mal Hizmet Tutarı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedInvoice.items || []).map((item, idx) => {
                      const itemUnitPrice = Number(item.unitPrice) || 0;
                      const itemQuantity = Number(item.quantity) || 1;
                      const itemTotal = Number(item.totalAmount) || (itemUnitPrice * itemQuantity);
                      const itemVat = Number((itemTotal * 0.2).toFixed(2));
                      return (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-mono text-gray-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#1B2A4A]">{item.name || 'Ürün'}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{itemQuantity} Adet</td>
                          <td className="py-2.5 px-3 text-right font-mono">₺{itemUnitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center font-mono">%20</td>
                          <td className="py-2.5 px-3 text-right font-mono">₺{itemVat.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            ₺{itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Fatura Dip Toplamları */}
              <div className="flex items-start justify-between pt-4">
                <div className="space-y-2 text-xs text-gray-500 max-w-sm">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Maliye Bakanlığı GİB E-Arşiv Portalına İşlenmiştir</span>
                  </div>
                  <p className="text-[10px] leading-relaxed">
                    İşbu e-arşiv fatura 213 sayılı Vergi Usul Kanunu ve ilgili mevzuat hükümlerine uygun olarak düzenlenmiş ve elektronik ortamda imzalanmıştır.
                  </p>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <QrCode className="w-8 h-8 text-gray-700" />
                    <span>ETTN: 49b0129a-77e1-4c91-9128-ef2026880012</span>
                  </div>
                </div>

                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Matrah (KDV Hariç):</span>
                    <span className="font-mono font-bold">₺{(Number(selectedInvoice.subtotal) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Hesaplanan KDV (%20):</span>
                    <span className="font-mono font-bold">₺{(Number(selectedInvoice.taxAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#1B2A4A] pt-2 border-t-2 border-[#1B2A4A]">
                    <span>Ödenecek Tutar:</span>
                    <span className="font-mono text-[#D96B27]">₺{(Number(selectedInvoice.totalAmount) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end no-print">
              <button
                onClick={() => setIsInvoicePdfModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
              >
                Kapat
              </button>
            </div>
          </div>

          {/* Fatura Modalı açıkken Ctrl+P basılırsa yalnızca faturayı A4 formatında yazdır */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #invoice-printable-area,
                  #invoice-printable-area * {
                    visibility: visible;
                  }
                  #invoice-printable-area {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 10mm 15mm !important;
                    box-sizing: border-box !important;
                    background: white !important;
                  }
                }
              `,
            }}
          />
        </div>
      )}

      {/* KARGO BİLGİSİ GİRİŞİ MODALI */}
      {cargoModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D96B27]" />
                <h3 className="text-base font-black text-[#1B2A4A]">
                  Kargo Bilgilerini Girin
                </h3>
              </div>
              <button
                onClick={() => setCargoModalOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCargo} className="mt-4 space-y-4">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-gray-200 text-xs text-gray-700">
                <div className="font-bold text-[#1B2A4A]">
                  Sipariş #{cargoModalOrder.orderNumber}
                </div>
                <div>Alıcı: {cargoModalOrder.customerName}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Teslimat: {formatAddress(cargoModalOrder.shippingAddress)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                  Kargo Firması *
                </label>
                <select
                  value={cargoCompanyInput}
                  onChange={(e) => setCargoCompanyInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                >
                  <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                  <option value="Aras Kargo">Aras Kargo</option>
                  <option value="MNG Kargo">MNG Kargo</option>
                  <option value="Sürat Kargo">Sürat Kargo</option>
                  <option value="PTT Kargo">PTT Kargo</option>
                  <option value="HepsiJet">HepsiJet</option>
                  <option value="Kolay Gelsin">Kolay Gelsin</option>
                  <option value="Diğer Kargo">Diğer / Özel Taşıyıcı</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                  Kargo Takip Numarası
                </label>
                <input
                  type="text"
                  placeholder="Örn: 123456789012"
                  value={cargoTrackingCodeInput}
                  onChange={(e) => setCargoTrackingCodeInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F6F4F0] border border-gray-200 rounded-lg text-[#1B2A4A] font-mono focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Müşteriniz sipariş takibi sayfasında ve e-postasında bu takip kodunu görecektir.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCargoModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold transition shadow-md"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Kargoya Verildi Olarak Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: KİŞİYE ÖZEL ÜRETİM SÖZLEŞMESİ ÖNİZLEME & A4 YAZDIRMA */}
      {isContractModalOpen && selectedContract && (
        <ContractPreviewModal
          contract={selectedContract}
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          settings={settings}
        />
      )}
    </div>
  );
}
