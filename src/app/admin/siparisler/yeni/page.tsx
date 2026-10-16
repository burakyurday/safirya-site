'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusCircle,
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  Phone,
  Store,
  Sparkles,
  Receipt,
  Truck,
  Gift,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminOrderItem, PaymentMethod, PaymentStatus } from '@/types/admin';

export default function YeniManuelSiparisPage() {
  const router = useRouter();
  const { addManualOrder, generateInvoice, finishedProducts, showToast } = useAdmin();

  // 1. Satış Kanalı
  const [channel, setChannel] = useState<'INSTAGRAM' | 'WHATSAPP' | 'TELEFON' | 'ATOLYE'>('WHATSAPP');

  // 2. Müşteri Bilgileri
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('İzmir');
  const [district, setDistrict] = useState('Karşıyaka');
  const [address, setAddress] = useState('');

  // 3. Sipariş Kalemleri
  const [items, setItems] = useState<AdminOrderItem[]>([
    {
      productName: 'Doğal Kehribar Cam Kavanoz Soya Mumu (210g)',
      variantTitle: '210g Kehribar Kavanoz',
      unitPrice: 349.0,
      quantity: 1,
      totalAmount: 349.0,
      customization: {
        customText: '',
        selectedScent: 'Fransız Lavantası',
        selectedColor: 'Doğal Krem',
        extraNote: '',
      },
    },
  ]);

  // 4. Fiyatlandırma ve Ekstralar
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isGiftWrapped, setIsGiftWrapped] = useState<boolean>(false);
  const [giftNote, setGiftNote] = useState<string>('');

  // 5. Ödeme & Kargo
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('ODENDI');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('HAVALE_EFT');
  const [cargoCompany, setCargoCompany] = useState<string>('');

  // Hesaplamalar
  const subtotal = items.reduce((acc, i) => acc + i.totalAmount, 0);
  const giftWrapFee = isGiftWrapped ? 30 : 0;
  const totalAmount = Math.max(0, subtotal - discountTotal + shippingFee + giftWrapFee);

  // Kalem Ekleme
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productName: 'Kişiye Özel İsimli Söz/Nişan Hediyelik Mumu',
        variantTitle: 'Kraft Kutu & Keten İp',
        unitPrice: 271.0,
        quantity: 1,
        totalAmount: 271.0,
        customization: {
          customText: '',
          selectedScent: 'Madagaskar Vanilyası',
          selectedColor: 'Safir Mavisi',
        },
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, updates: Partial<AdminOrderItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...updates };
        updated.totalAmount = updated.unitPrice * updated.quantity;
        return updated;
      })
    );
  };

  const handleUpdateCustomization = (index: number, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          customization: {
            ...item.customization,
            [field]: value,
          },
        };
      })
    );
  };

  const handleProductSelect = (index: number, productName: string) => {
    const found = finishedProducts.find((p) => p.name === productName);
    if (found) {
      handleUpdateItem(index, {
        productName: found.name,
        unitPrice: found.price,
      });
    } else {
      handleUpdateItem(index, { productName });
    }
  };

  const handleSubmit = (autoGenerateInvoice: boolean) => {
    if (!customerName || !customerPhone || items.length === 0) {
      showToast('Lütfen müşteri adı, telefon numarası ve ürünleri doldurunuz.');
      return;
    }

    const newOrder = addManualOrder({
      channel,
      customerName,
      customerPhone,
      customerEmail: customerEmail || 'manuel@safirya.tr',
      shippingAddress: {
        fullName: customerName,
        phone: customerPhone,
        city,
        district,
        address: address || 'Atölyeden Elden Teslim',
      },
      subtotal,
      discountTotal,
      shippingFee,
      isGiftWrapped,
      giftWrapFee,
      giftNote: isGiftWrapped ? giftNote : undefined,
      totalAmount,
      stage: 'SIPARIS_ALINDI',
      paymentStatus,
      paymentMethod,
      invoiceStatus: 'BEKLIYOR',
      cargoCompany,
      items,
    });

    if (autoGenerateInvoice) {
      generateInvoice(newOrder.id);
    }

    router.push('/admin/siparisler');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      
      {/* 1. ÜST NAVİGASYON VE GERİ DÖN */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/siparisler"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#D96B27] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sipariş Listesine Geri Dön</span>
        </Link>

        <span className="text-xs font-semibold text-gray-400">
          Hızlı Sipariş Girişi Modülü
        </span>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            Telefon / Instagram / WhatsApp / Atölye
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            Manuel Sipariş Oluştur
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Doğrudan müşteriden gelen talepleri, kişiselleştirme notlarını ve ödeme durumunu sisteme işleyin.
          </p>
        </div>

        {/* SATIŞ KANALI SEÇİMİ */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            1. Satış Kanalı Seçiniz
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50' },
              { id: 'INSTAGRAM', label: 'Instagram DM', icon: Sparkles, color: 'text-pink-600 bg-pink-50' },
              { id: 'TELEFON', label: 'Telefon Satışı', icon: Phone, color: 'text-blue-600 bg-blue-50' },
              { id: 'ATOLYE', label: 'Atölye Ziyareti', icon: Store, color: 'text-amber-600 bg-amber-50' },
            ].map((c) => {
              const Icon = c.icon;
              const isSelected = channel === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id as any)}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-[#D96B27] bg-[#D96B27]/10 ring-2 ring-[#D96B27]/30 font-bold'
                      : 'border-gray-200 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-[#1B2A4A]">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MÜŞTERİ & TESLİMAT BİLGİLERİ */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            2. Müşteri & Teslimat Bilgileri
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Müşteri Adı Soyadı"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Telefon Numarası *
              </label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+90 5..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                E-Posta (E-Fatura Gönderimi İçin)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ornek@alanadi.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                İl
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="İstanbul"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                İlçe
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Karşıyaka"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Kargo Şirketi
              </label>
              <select
                value={cargoCompany}
                onChange={(e) => setCargoCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
              >
                <option value="">Henüz Belirlenmedi (Kargoya Verildiğinde Girilecek)</option>
                <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                <option value="Aras Kargo">Aras Kargo</option>
                <option value="MNG Kargo">MNG Kargo</option>
                <option value="Sürat Kargo">Sürat Kargo</option>
                <option value="PTT Kargo">PTT Kargo</option>
                <option value="HepsiJet">HepsiJet</option>
                <option value="Kolay Gelsin">Kolay Gelsin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Açık Teslimat Adresi
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Mahalle, cadde, sokak, bina ve daire no..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
            />
          </div>
        </div>

        {/* SİPARİŞ KALEMLERİ VE KİŞİSELLEŞTİRME */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              3. Sipariş Kalemleri & Kişiselleştirme Detayları
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D96B27]" />
              <span>+ Yeni Kalem Ekle</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-gray-200 bg-[#FAF8F5]/60 space-y-3 relative text-xs"
              >
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-gray-600 mb-1">
                      Ürün Adı
                    </label>
                    <input
                      type="text"
                      required
                      value={item.productName}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      placeholder="Ürün adı yazın veya katalogdan seçin"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">
                      Adet
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(idx, { quantity: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-center bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">
                      Birim Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-right bg-white"
                    />
                  </div>
                </div>

                {/* Kişiselleştirme Kutusu */}
                <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] space-y-2.5">
                  <div className="text-[11px] font-bold text-[#D96B27] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Atölye Kişiselleştirme & Tasarım Detayları</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                        Ürüne Yazılacak İsim / Tarih Metni
                      </label>
                      <input
                        type="text"
                        value={item.customization?.customText || ''}
                        onChange={(e) => handleUpdateCustomization(idx, 'customText', e.target.value)}
                        placeholder="Örn: Selin & Burak 2026"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                        Koku / Esans Notası
                      </label>
                      <select
                        value={item.customization?.selectedScent || 'Lavanta'}
                        onChange={(e) => handleUpdateCustomization(idx, 'selectedScent', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                      >
                        <option value="Fransız Lavantası">Fransız Lavantası</option>
                        <option value="Madagaskar Vanilyası">Madagaskar Vanilyası</option>
                        <option value="Sandal Ağacı & Amber">Sandal Ağacı & Amber</option>
                        <option value="Yasemin & Beyaz Çay">Yasemin & Beyaz Çay</option>
                        <option value="Kokusuz (Sadece Doğal Soya)">Kokusuz (Doğal Soya)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                        Renk / Etiket Şablonu
                      </label>
                      <input
                        type="text"
                        value={item.customization?.selectedColor || ''}
                        onChange={(e) => handleUpdateCustomization(idx, 'selectedColor', e.target.value)}
                        placeholder="Örn: Safir Mavisi / Kraft Kalp Etiket"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HEDİYE PAKETİ & FİYATLANDIRMA DÖKÜMÜ */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            4. Hediye Paketi, İndirim ve Ödeme Bilgileri
          </label>

          {/* Hediye Paketi Seçimi */}
          <div className="p-4 rounded-2xl border border-pink-200 bg-pink-50/50 space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-pink-950">
              <input
                type="checkbox"
                checked={isGiftWrapped}
                onChange={(e) => setIsGiftWrapped(e.target.checked)}
                className="rounded text-[#D96B27] focus:ring-[#D96B27] w-4 h-4"
              />
              <Gift className="w-4 h-4 text-pink-600" />
              <span>Özel Atölye Hediye Paketi Uygula (+₺30)</span>
            </label>

            {isGiftWrapped && (
              <textarea
                rows={2}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="Hediye kartına el yazısıyla yazılacak müşteri notu..."
                className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white text-xs focus:ring-2 focus:ring-[#D96B27]"
              />
            )}
          </div>

          {/* Ödeme Durumu ve Yöntemi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Ödeme Durumu
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              >
                <option value="ODENDI">✅ Tahsil Edildi (Ödendi)</option>
                <option value="BEKLIYOR">⏳ Ödeme Bekliyor / Kapıda Ödeme</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Ödeme Yöntemi
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              >
                <option value="HAVALE_EFT">Banka Havale / EFT</option>
                <option value="KREDI_KARTI">Kredi Kartı / Link ile Ödeme</option>
                <option value="NAKIT">Atölye Nakit Tahsilat</option>
              </select>
            </div>
          </div>

          {/* Dip Toplam Özeti */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Ara Toplam:</span>
              <span className="font-mono font-bold">₺{subtotal.toFixed(2)}</span>
            </div>

            {isGiftWrapped && (
              <div className="flex justify-between text-pink-700">
                <span>Hediye Paketi Bedeli:</span>
                <span className="font-mono font-bold">+₺30.00</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="text-gray-600">Özel İndirim Tutarı (₺):</span>
              <input
                type="number"
                min="0"
                value={discountTotal || ''}
                onChange={(e) => setDiscountTotal(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-24 px-2 py-1 rounded-lg border border-gray-300 text-right font-bold text-xs"
              />
            </div>

            <div className="flex justify-between items-center text-lg font-black text-[#1B2A4A] pt-3 border-t border-gray-200">
              <span>Genel Toplam Tutar:</span>
              <span className="font-mono text-[#D96B27]">
                ₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* AKSİYON BUTONLARI */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            href="/admin/siparisler"
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 text-center transition"
          >
            Vazgeç
          </Link>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1B2A4A] hover:bg-[#2A3F6D] text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            Siparişi Sisteme Kaydet
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-lg shadow-[#D96B27]/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>Kaydet & Anında E-Fatura Kes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
