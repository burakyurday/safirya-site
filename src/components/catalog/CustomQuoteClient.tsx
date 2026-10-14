'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Calendar,
  Users,
  Tag,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export function CustomQuoteClient() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: 'Söz & Nişan Hediyeliği',
    productType: 'Doğal Botanik Soya Mumu',
    requestedQuantity: 50,
    eventDate: '',
    customText: '',
    selectedScent: 'Lavanta & Sandal Ağacı',
    details: '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Lütfen adınızı ve soyadınızı giriniz.';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Lütfen telefon numaranızı giriniz.';
    } else if (formData.customerPhone.replace(/[^0-9]/g, '').length < 10) {
      newErrors.customerPhone = 'Geçerli bir telefon numarası giriniz.';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Lütfen e-posta adresinizi giriniz.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim())) {
      newErrors.customerEmail = 'Geçerli bir e-posta adresi giriniz.';
    }
    if (!formData.requestedQuantity || formData.requestedQuantity < 10) {
      newErrors.requestedQuantity = 'Minimum toplu sipariş adedi 10 adettir.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const existing = typeof window !== 'undefined' ? localStorage.getItem('safirya_quote_requests') : null;
        const quotes = existing ? JSON.parse(existing) : [];
        const newQuote = {
          id: `quote-${Date.now()}`,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          eventType: formData.eventType,
          productType: formData.productType,
          requestedQuantity: Number(formData.requestedQuantity),
          eventDate: formData.eventDate,
          customText: formData.customText,
          selectedScent: formData.selectedScent,
          customDetails: formData.details,
          status: 'BEKLEMEDE',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        localStorage.setItem('safirya_quote_requests', JSON.stringify([newQuote, ...quotes]));
      } catch (err) {
        console.error('Teklif kaydetme hatası:', err);
      }
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="bg-white min-h-screen text-[#231B18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Üst Başlık */}
        <div className="max-w-3xl mx-auto text-center mb-12 border-b border-stone-100 pb-8">
          <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#7A7067] font-semibold block mb-2">
            Atölye Zanaatı & Kurumsal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#231B18]">
            Kişiye Özel & Toplu Sipariş Teklifi
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-3 leading-relaxed max-w-xl mx-auto">
            Söz, nişan, nikah, düğün veya kurumsal etkinlikleriniz için atölyemizde kişiselleştirilmiş hediyelikler üretiyoruz. Adet baremlerine göre %35&apos;e varan indirim fırsatından yararlanın.
          </p>
        </div>

        {/* Toplu İndirim Baremleri (3 Sütun) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#FAF8F5] p-6 rounded-xs border border-stone-200/80 text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7067] block mb-1">
              25 - 49 Adet
            </span>
            <div className="text-3xl font-serif text-[#C85A32] font-semibold mb-1">%15 İndirim</div>
            <p className="text-xs text-[#7A7067] leading-relaxed">
              Butik kutlamalar, kına ve doğum günleri için özel isim etiketli kraft hediye kutulama.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-xs border-2 border-[#231B18] text-center relative shadow-xs">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#231B18] text-white text-[9px] font-medium px-3 py-0.5 uppercase tracking-widest">
              En Çok Tercih Edilen
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7067] block mb-1">
              50 - 99 Adet
            </span>
            <div className="text-3xl font-serif text-[#C85A32] font-semibold mb-1">%25 İndirim</div>
            <p className="text-xs text-[#7A7067] leading-relaxed">
              Söz ve nişan törenleri için kişiye özel isim baskılı mühürlü kutu ve koku seçimi.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-xs border border-stone-200/80 text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7067] block mb-1">
              100+ Adet
            </span>
            <div className="text-3xl font-serif text-[#C85A32] font-semibold mb-1">%35 İndirim</div>
            <p className="text-xs text-[#7A7067] leading-relaxed">
              Büyük düğünler ve kurumsal etkinlikler için ücretsiz numune kiti ve kargo desteği.
            </p>
          </div>
        </div>

        {/* Form ve Atölye Süreci (İki Sütun) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Sol Kolon: Bilgilendirme */}
          <div className="lg:col-span-5 space-y-6 bg-[#FAF8F5] p-6 sm:p-8 rounded-xs border border-stone-200/80">
            <h3 className="font-serif text-xl font-normal text-[#231B18]">
              Atölye Sürecimiz Nasıl İşliyor?
            </h3>

            <div className="space-y-4 text-xs text-[#554D46]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-xs bg-[#231B18] text-white flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="block text-[#231B18] mb-0.5">Talep ve Konsept Belirleme:</strong>
                  Etkinlik tarihi, renk teması ve adet miktarını form ile iletin.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-xs bg-[#231B18] text-white flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="block text-[#231B18] mb-0.5">Örnek Çalışma & Onay:</strong>
                  İsim etiketi fontu, kurdele rengi ve koku notaları dijital onayınıza sunulur.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-xs bg-[#231B18] text-white flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="block text-[#231B18] mb-0.5">Atölye Dökümü & Kalite Kontrol:</strong>
                  Kadıköy atölyemizde tek tek el dökümü yapılır, kraft kutular özenle mühürlenir.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-xs bg-[#C85A32] text-white flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="block text-[#231B18] mb-0.5">Hasarsız Teslimat:</strong>
                  Etkinlik tarihinize en az 5 gün kala darbe emici özel ambalajla adresinize ulaştırılır.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <span className="text-[11px] text-[#7A7067] uppercase tracking-wider block mb-1">
                Atölye Şefi WhatsApp Destek:
              </span>
              <a
                href="https://wa.me/905325557234"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#231B18] hover:text-[#C85A32] flex items-center gap-1.5 transition"
              >
                +90 (532) 555 7234 (WhatsApp Hattı) →
              </a>
            </div>
          </div>

          {/* Sağ Kolon: Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xs border border-stone-200/80">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#231B18]">
                  Talebiniz Atölyemize Ulaştı!
                </h3>
                <p className="text-xs sm:text-sm text-[#7A7067] max-w-md mx-auto leading-relaxed">
                  Atölye şefimiz adet bareminize ve etkinlik tarihinize özel baremli fiyat teklifini ve numune görsellerini en geç 24 saat içinde iletecektir.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      customerName: '',
                      customerEmail: '',
                      customerPhone: '',
                      eventType: 'Söz & Nişan Hediyeliği',
                      productType: 'Doğal Botanik Soya Mumu',
                      requestedQuantity: 50,
                      eventDate: '',
                      customText: '',
                      selectedScent: 'Lavanta & Sandal Ağacı',
                      details: '',
                    });
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#231B18] text-white text-xs uppercase tracking-widest font-medium rounded-xs hover:bg-[#3A2E29]"
                >
                  Yeni Teklif Oluştur
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="border-b border-stone-100 pb-3 mb-4">
                  <h3 className="font-serif text-xl font-normal text-[#231B18]">
                    Toplu Sipariş Teklif Formu
                  </h3>
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="p-3 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Lütfen formdaki eksik veya hatalı alanları kontrol ediniz.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                      Adınız & Soyadınız *
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Ayşe Yılmaz"
                      value={formData.customerName}
                      onChange={(e) => {
                        setFormData({ ...formData, customerName: e.target.value });
                        if (errors.customerName) setErrors({ ...errors, customerName: '' });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    />
                    {errors.customerName && (
                      <p className="text-red-600 text-[11px] mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                      Telefon Numaranız (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={formData.customerPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, customerPhone: e.target.value });
                        if (errors.customerPhone) setErrors({ ...errors, customerPhone: '' });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    />
                    {errors.customerPhone && (
                      <p className="text-red-600 text-[11px] mt-1">{errors.customerPhone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                      E-Posta Adresiniz *
                    </label>
                    <input
                      type="email"
                      placeholder="ornek@domain.com"
                      value={formData.customerEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, customerEmail: e.target.value });
                        if (errors.customerEmail) setErrors({ ...errors, customerEmail: '' });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    />
                    {errors.customerEmail && (
                      <p className="text-red-600 text-[11px] mt-1">{errors.customerEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                      Etkinlik Türü
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    >
                      <option value="Söz & Nişan Hediyeliği">Söz & Nişan Hediyeliği</option>
                      <option value="Düğün & Nikah Hediyeliği">Düğün & Nikah Hediyeliği</option>
                      <option value="Kına & Bekarlığa Veda">Kına & Bekarlığa Veda</option>
                      <option value="Baby Shower & Doğum">Baby Shower & Doğum</option>
                      <option value="Kurumsal Etkinlik & Hediye">Kurumsal Etkinlik & Hediye</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                      İstenen Ürün Kategorisi
                    </label>
                    <select
                      value={formData.productType}
                      onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    >
                      <option value="Doğal Botanik Soya Mumu">Doğal Botanik Soya Mumu</option>
                      <option value="Dekoratif Kokulu Taş Figür">Dekoratif Kokulu Taş Figür</option>
                      <option value="Ahşap Epoksi Sunumluk">Ahşap Epoksi Sunumluk</option>
                      <option value="Miyuki Boncuk Takı Seti">Miyuki Boncuk Takı Seti</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                      Talep Edilen Adet ({formData.requestedQuantity} Adet) *
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="2000"
                      value={formData.requestedQuantity}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          requestedQuantity: parseInt(e.target.value) || 0,
                        });
                        if (errors.requestedQuantity) setErrors({ ...errors, requestedQuantity: '' });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                    Ürüne Yazılacak İsim / Tarih / Özel Not
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Selin & Emre • 18.06.2026"
                    value={formData.customText}
                    onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-xs text-[#231B18] focus:outline-none focus:border-[#231B18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231B18] mb-1.5 uppercase tracking-wider">
                    Özel İstekler, Renk Paleti ve Açıklamalar
                  </label>
                  <textarea
                    rows={3}
                    placeholder="İstediğiniz kurdele rengi, koku notaları veya özel ambalaj detaylarını buraya yazabilirsiniz..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-xs text-[#231B18] focus:outline-none focus:border-[#231B18] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium rounded-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Teklif İletiliyor...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Özel Fiyat Teklifi Al</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
