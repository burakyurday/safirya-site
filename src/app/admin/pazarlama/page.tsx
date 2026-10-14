'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Tag,
  Share2,
  ShoppingCart,
  Send,
  PlusCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  X,
  Trash2,
  Eye,
  Sliders,
  Copy,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { MarketingCoupon, CrossSellRule } from '@/types/admin';

export default function PazarlamaPage() {
  const {
    coupons,
    crossSellRules,
    abandonedCarts,
    addCoupon,
    toggleCoupon,
    deleteCoupon,
    addCrossSellRule,
    toggleCrossSellRule,
    deleteCrossSellRule,
    sendCartReminder,
    settings,
    updateSettings,
    showToast,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'coupons' | 'crossSell' | 'abandoned' | 'exitIntent'>('coupons');

  // Kupon Modalı
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponLabel, setNewCouponLabel] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newMinTotal, setNewMinTotal] = useState<number>(250);

  // Çapraz Satış Modalı
  const [isAddCrossSellModalOpen, setIsAddCrossSellModalOpen] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newTriggerCat, setNewTriggerCat] = useState('Doğal Mumlar');
  const [newRecItems, setNewRecItems] = useState('El Yapımı Kibrit Şişesi, Beton Altlık');
  const [newDiscountPct, setNewDiscountPct] = useState<number>(10);
  const [newBannerText, setNewBannerText] = useState('Mumunuzun yanına özel atölye kibriti ekleyin, sepette %10 kazanın!');

  // Exit-Intent Form State (Lokal Kopya)
  const [exitEnabled, setExitEnabled] = useState(settings.exitIntentEnabled);
  const [exitTitle, setExitTitle] = useState(settings.exitIntentTitle);
  const [exitSubtitle, setExitSubtitle] = useState(settings.exitIntentSubtitle);
  const [exitCoupon, setExitCoupon] = useState(settings.exitIntentCouponCode);
  const [exitDiscount, setExitDiscount] = useState(settings.exitIntentDiscountRate);
  const [exitCountdown, setExitCountdown] = useState(settings.exitIntentCountdownMinutes || 15);

  // Terkedilen Sepet Detay Modalı
  const [selectedCart, setSelectedCart] = useState<any | null>(null);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    addCoupon({
      code: newCouponCode,
      label: newCouponLabel || `${newCouponCode} İndirimi`,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minCartTotal: Number(newMinTotal),
      isActive: true,
    });

    setNewCouponCode('');
    setNewCouponLabel('');
    setIsAddCouponModalOpen(false);
  };

  const handleCreateCrossSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle) return;

    addCrossSellRule({
      title: newRuleTitle,
      triggerCategory: newTriggerCat,
      recommendedProductNames: newRecItems.split(',').map((s) => s.trim()).filter(Boolean),
      discountPercentage: Number(newDiscountPct),
      bannerText: newBannerText,
      isActive: true,
    });

    setNewRuleTitle('');
    setIsAddCrossSellModalOpen(false);
  };

  const handleSaveExitIntent = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      exitIntentEnabled: exitEnabled,
      exitIntentTitle: exitTitle,
      exitIntentSubtitle: exitSubtitle,
      exitIntentCouponCode: exitCoupon,
      exitIntentDiscountRate: Number(exitDiscount),
      exitIntentCountdownMinutes: Number(exitCountdown),
    });
    showToast('Ziyaretçi çıkış teklifi (Exit-Intent) ayarları vitrinde güncellendi.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. ÜST BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Megaphone className="w-4 h-4" />
            <span>Pazarlama, Dönüşüm & Satış Artırma</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            Pazarlama & Çapraz Satış
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            İndirim kuponları, tamamlayıcı ürün eşleştirmeleri, terkedilen sepet hatırlatmaları ve çıkış teklifi pop-up yönetimi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/pazarlama/eposta"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>Kampanya E-Postaları & Otomasyon</span>
          </Link>

          {activeTab === 'coupons' && (
            <button
              onClick={() => setIsAddCouponModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/20 flex items-center gap-2 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Kupon Tanımla</span>
            </button>
          )}

          {activeTab === 'crossSell' && (
            <button
              onClick={() => setIsAddCrossSellModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/20 flex items-center gap-2 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Çapraz Satış Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DÖRT ANA MODÜL SEKMESİ */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D9] shadow-sm flex flex-wrap items-center gap-2">
        <Link
          href="/admin/pazarlama/eposta"
          className="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
        >
          <Mail className="w-4 h-4 text-purple-600" />
          <span>E-Posta Kampanyaları & Bültenler &rarr;</span>
        </Link>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'bg-[#1B2A4A] text-white shadow-md'
              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>İndirim Kuponları ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('crossSell')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'crossSell'
              ? 'bg-[#1B2A4A] text-white shadow-md'
              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Çapraz Satış (Cross-Sell) Kuralları ({crossSellRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('abandoned')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'abandoned'
              ? 'bg-[#1B2A4A] text-white shadow-md'
              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Terkedilen Sepetler ({abandonedCarts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exitIntent')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'exitIntent'
              ? 'bg-[#1B2A4A] text-white shadow-md'
              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Çıkış Teklifi (Exit-Intent Pop-up)</span>
        </button>
      </div>

      {/* 3. İÇERİK: SEKME 1 - İNDİRİM KUPONLARI */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                  <th className="py-4 px-5">Kupon Kodu & Başlık</th>
                  <th className="py-4 px-4 text-center">İndirim Tutarı</th>
                  <th className="py-4 px-4 text-center">Min. Sepet</th>
                  <th className="py-4 px-4 text-center">Kullanım Sayısı</th>
                  <th className="py-4 px-4 text-center">Durum</th>
                  <th className="py-4 px-5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((cp) => (
                  <tr key={cp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-mono font-black text-sm text-[#1B2A4A] tracking-wider">
                        {cp.code}
                      </div>
                      <div className="text-gray-500 font-medium text-xs mt-0.5">
                        {cp.label}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-[#D96B27] text-sm">
                      {cp.discountType === 'percentage'
                        ? `%${cp.discountValue} İndirim`
                        : `₺${cp.discountValue} İndirim`}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                      ₺{cp.minCartTotal.toLocaleString('tr-TR')}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-800">
                      {cp.usageCount} Kez
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleCoupon(cp.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                          cp.isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {cp.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => deleteCoupon(cp.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Kuponu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. İÇERİK: SEKME 2 - ÇAPRAZ SATIŞ KURALLARI */}
      {activeTab === 'crossSell' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crossSellRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-3 relative hover:border-[#D96B27] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                      {rule.triggerCategory || 'Tüm Sepetler'}
                    </span>
                    <h3 className="text-sm font-bold text-[#1B2A4A] mt-0.5">
                      {rule.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleCrossSellRule(rule.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                      rule.isActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {rule.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
                    <span>Önerilen Tamamlayıcı Ürünler (%{rule.discountPercentage} İndirimli):</span>
                  </div>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-gray-700">
                    {rule.recommendedProductNames.map((p, idx) => (
                      <li key={idx} className="font-medium">{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  &quot;{rule.bannerText}&quot;
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => deleteCrossSellRule(rule.id)}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Kuralı Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. İÇERİK: SEKME 3 - TERKEDİLEN SEPETLER */}
      {activeTab === 'abandoned' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A]">
                Ödeme Aşamasında Bırakılan Müşteri Sepetleri
              </h3>
              <p className="text-xs text-gray-500">
                Tek tıkla müşteriye özel %10 indirimli hatırlatma e-postası tetikleyin.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {abandonedCarts.filter((c) => c.reminderSent).length} Hatırlatma Gönderildi
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                  <th className="py-4 px-5">Müşteri İletişim</th>
                  <th className="py-4 px-4">Sepette Bırakılan Ürünler</th>
                  <th className="py-4 px-4 text-right">Sepet Tutarı</th>
                  <th className="py-4 px-4">Terkedilme Tarihi</th>
                  <th className="py-4 px-4 text-center">Hatırlatma Durumu</th>
                  <th className="py-4 px-5 text-right">E-Posta Aksiyonu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {abandonedCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#1B2A4A] text-xs">
                        {cart.customerEmail}
                      </div>
                      {cart.customerPhone && (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {cart.customerPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      <div className="font-semibold text-xs">
                        {cart.items.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-sm text-[#1B2A4A]">
                      ₺{cart.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                      {cart.abandonedAt}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {cart.reminderSent ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>GÖNDERİLDİ</span>
                          </span>
                          <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            {cart.reminderSentAt}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>BEKLİYOR</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => sendCartReminder(cart.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                          cart.reminderSent
                            ? 'bg-slate-100 hover:bg-slate-200 text-gray-700'
                            : 'bg-[#D96B27] hover:bg-[#c25a1e] text-white shadow-md shadow-[#D96B27]/20 active:scale-95'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{cart.reminderSent ? 'Tekrar Gönder' : 'Kuponlu Hatırlat'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. İÇERİK: SEKME 4 - EXIT-INTENT POP-UP YÖNETİMİ & CANLI ÖNİZLEME */}
      {activeTab === 'exitIntent' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Sol Kolon: Ayar Formu */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D96B27]">
                  Ziyaretçi Ayrılma Algoritması
                </span>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#1B2A4A]">
                  <input
                    type="checkbox"
                    checked={exitEnabled}
                    onChange={(e) => setExitEnabled(e.target.checked)}
                    className="rounded text-[#D96B27] focus:ring-[#D96B27] w-4 h-4"
                  />
                  <span>Modülü Etkinleştir</span>
                </label>
              </div>
              <h3 className="text-xl font-black text-[#1B2A4A] mt-1">
                Çıkış Teklifi (Exit-Intent Pop-up) Ayarları
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Mouse ekranın üst sınırına yöneldiğinde (sayfayı kapatmak veya sekme değiştirmek üzereyken) ziyaretçiye cazip bir teklif sunarak sepeti kurtarın.
              </p>
            </div>

            <form onSubmit={handleSaveExitIntent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Pop-up Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={exitTitle}
                  onChange={(e) => setExitTitle(e.target.value)}
                  placeholder="Örn: Atölyemizden Ayrılmadan Önce %10 Tanışma İndirimi!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-[#1B2A4A] text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Açıklama / Alt Başlık *
                </label>
                <textarea
                  rows={3}
                  required
                  value={exitSubtitle}
                  onChange={(e) => setExitSubtitle(e.target.value)}
                  placeholder="Örn: İlk siparişinize özel zanaatkar dokunuşlu el yapımı hediyeniz."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Kupon Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={exitCoupon}
                    onChange={(e) => setExitCoupon(e.target.value.toUpperCase())}
                    placeholder="SAFIRYA10"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    İndirim Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={exitDiscount}
                    onChange={(e) => setExitDiscount(parseFloat(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-xs focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Geri Sayım (Dk)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={exitCountdown}
                    onChange={(e) => setExitCountdown(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-xs focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs shadow-lg shadow-[#D96B27]/30 transition active:scale-95"
                >
                  Değişiklikleri Kaydet & Vitrinde Uygula
                </button>
              </div>
            </form>
          </div>

          {/* Sağ Kolon: Canlı Önizleme Kutusu */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Müşteri Ekranında Canlı Görünüm Simülasyonu
            </span>

            <div className="relative p-8 rounded-3xl bg-[#FAF8F5] border-2 border-dashed border-[#D96B27]/50 shadow-lg text-[#1B2A4A] overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D96B27]/10 text-[#D96B27] text-xs font-bold uppercase tracking-wider mb-3">
                <Flame className="w-3.5 h-3.5" />
                <span>Özel Atölye Fırsatı</span>
              </div>

              <h4 className="text-xl font-black text-[#1B2A4A] leading-tight">
                {exitTitle || 'Başlık burada görünecek'}
              </h4>

              <p className="text-xs text-[#1B2A4A]/70 mt-2 leading-relaxed">
                {exitSubtitle || 'Açıklama metni'}
              </p>

              {/* Geri Sayım */}
              <div className="flex items-center gap-2 mt-4 py-2 px-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>Kalan Süre:</span>
                <span className="font-mono font-bold text-[#D96B27] bg-white px-1.5 py-0.5 rounded border border-amber-300">
                  {exitCountdown}:00
                </span>
              </div>

              {/* Kupon Kodu */}
              <div className="mt-4 p-3 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Kupon</span>
                  <span className="text-base font-black font-mono tracking-wider">{exitCoupon}</span>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#D96B27] text-white font-bold text-xs"
                >
                  Kuponu Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: YENİ KUPON TANIMLAMA */}
      {isAddCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1B2A4A]">Yeni İndirim Kuponu</h3>
              <button onClick={() => setIsAddCouponModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kupon Kodu *</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="Örn: YAZ2026"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Kupon Etiketi / Açıklama</label>
                <input
                  type="text"
                  value={newCouponLabel}
                  onChange={(e) => setNewCouponLabel(e.target.value)}
                  placeholder="Örn: %15 Yaz Sezonu Atölye İndirimi"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">İndirim Türü</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold"
                  >
                    <option value="percentage">Yüzde İndirim (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">İndirim Miktarı</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Min. Sepet Tutarı (₺)</label>
                <input
                  type="number"
                  min="0"
                  value={newMinTotal}
                  onChange={(e) => setNewMinTotal(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D96B27] text-white text-xs font-bold"
                >
                  Kuponu Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: YENİ ÇAPRAZ SATIŞ KURALI */}
      {isAddCrossSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1B2A4A]">Yeni Çapraz Satış Kuralı</h3>
              <button onClick={() => setIsAddCrossSellModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCrossSell} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kural Başlığı *</label>
                <input
                  type="text"
                  required
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  placeholder="Örn: Mum Alanlara Kibrit ve Altlık Öner"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tetikleyici Kategori</label>
                <select
                  value={newTriggerCat}
                  onChange={(e) => setNewTriggerCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold"
                >
                  <option value="Doğal Mumlar">Doğal Mumlar</option>
                  <option value="Kokulu Taş & Seramik">Kokulu Taş & Seramik</option>
                  <option value="Epoksi Tasarımlar">Epoksi Tasarımlar</option>
                  <option value="Miyuki Boncuk Takı">Miyuki Boncuk Takı</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Önerilecek Ürünler (Virgülle Ayırın)</label>
                <input
                  type="text"
                  value={newRecItems}
                  onChange={(e) => setNewRecItems(e.target.value)}
                  placeholder="Ahşap Kibrit, Beton Altlık"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">İndirim Oranı (%)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={newDiscountPct}
                  onChange={(e) => setNewDiscountPct(parseFloat(e.target.value) || 10)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sepette Görünecek Banner Metni</label>
                <input
                  type="text"
                  value={newBannerText}
                  onChange={(e) => setNewBannerText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCrossSellModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D96B27] text-white text-xs font-bold"
                >
                  Kuralı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
