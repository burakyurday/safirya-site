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
import { AdminOrder, AdminInvoice, OrderStage } from '@/types/admin';

export default function SiparislerPage() {
  const {
    orders,
    invoices,
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

  // Filtreleme
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (!order.invoiceNo) return;
    const inv = invoices.find((i) => i.invoiceNo === order.invoiceNo);
    if (inv) {
      setSelectedInvoice(inv);
      setIsInvoicePdfModalOpen(true);
    } else {
      // Siparişten sanal olarak göster
      handleCreateInvoice(order.id);
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
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
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
                          {order.customerPhone}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          {order.shippingAddress.city} / {order.shippingAddress.district}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-sm text-[#1B2A4A]">
                          ₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {order.items.length} Kalem Ürün
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.stage}
                          onChange={(e) => updateOrderStage(order.id, e.target.value as OrderStage)}
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
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
                          title="Sipariş Detaylarını Gör"
                        >
                          Detay
                        </button>

                        {isInvoiceReady ? (
                          <button
                            onClick={() => handleViewInvoice(order)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm active:scale-95 inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF Fatura</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreateInvoice(order.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#D96B27] text-white text-xs font-bold transition shadow-sm active:scale-95 inline-flex items-center gap-1"
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
                  <div><strong>Telefon:</strong> {selectedOrder.customerPhone}</div>
                  <div><strong>E-Posta:</strong> {selectedOrder.customerEmail}</div>
                  <div className="col-span-2">
                    <strong>Adres:</strong> {selectedOrder.shippingAddress.address} {selectedOrder.shippingAddress.district} / {selectedOrder.shippingAddress.city}
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

              {/* Kalemler & Atölye Kişiselleştirme Detayları */}
              <div>
                <div className="font-bold text-gray-700 mb-2">Sipariş Edilen Ürünler:</div>
                <div className="space-y-2.5">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between font-bold text-sm text-[#1B2A4A]">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span>₺{item.totalAmount.toLocaleString('tr-TR')}</span>
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
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                {selectedOrder.invoiceStatus !== 'OLUSTURULDU' && (
                  <button
                    onClick={() => {
                      handleCreateInvoice(selectedOrder.id);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-gray-200 max-h-[95vh] flex flex-col">
            
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
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#2A3F6D] text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Yazdır / PDF Kaydet</span>
                </button>

                <button
                  onClick={() => setIsInvoicePdfModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gerçekçi Fatura Şablonu (Yazdırılabilir Alan) */}
            <div className="flex-1 overflow-y-auto mt-6 p-8 border border-gray-300 rounded-2xl bg-white shadow-inner font-sans text-[#1B2A4A] space-y-6">
              
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
                    <div>Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul</div>
                    <div>Kadıköy V.D. • VKN: 1820448192 • Tic. Sicil: 491029-5</div>
                    <div>Mersis: 0182044819200001 • Tel: +90 (212) 555 7234</div>
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
                  <div>Vergi Dairesi: <strong>Kadıköy V.D.</strong></div>
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
                    {selectedInvoice.items.map((item, idx) => {
                      const itemVat = item.totalAmount * 0.2;
                      return (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-mono text-gray-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#1B2A4A]">{item.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{item.quantity} Adet</td>
                          <td className="py-2.5 px-3 text-right font-mono">₺{item.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center font-mono">%20</td>
                          <td className="py-2.5 px-3 text-right font-mono">₺{itemVat.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            ₺{item.totalAmount.toFixed(2)}
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
                    <span className="font-mono font-bold">₺{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Hesaplanan KDV (%20):</span>
                    <span className="font-mono font-bold">₺{selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#1B2A4A] pt-2 border-t-2 border-[#1B2A4A]">
                    <span>Ödenecek Tutar:</span>
                    <span className="font-mono text-[#D96B27]">₺{selectedInvoice.totalAmount.toFixed(2)}</span>
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
        </div>
      )}
    </div>
  );
}
