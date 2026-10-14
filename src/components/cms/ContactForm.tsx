'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Genel Bilgi & Sipariş',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Lütfen adınızı ve soyadınızı giriniz.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Lütfen e-posta adresinizi giriniz.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Lütfen geçerli bir e-posta adresi giriniz.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Lütfen telefon numaranızı giriniz.';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      newErrors.phone = 'Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Lütfen mesajınızı en az 10 karakter olacak şekilde yazınız.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Genel Bilgi & Sipariş',
        message: '',
      });
      setErrors({});
    }, 600);
  };

  return (
    <div className="bg-white rounded-xs border border-stone-200 p-6 sm:p-8">
      <h3 className="font-serif text-xl font-normal text-[#231B18] mb-1">
        Bize Mesaj Gönderin
      </h3>
      <p className="text-xs text-[#7A7067] mb-6">
        Sorularınız, özel tasarım talepleriniz veya atölye randevusu için aşağıdaki formu doldurabilirsiniz.
      </p>

      {submitted ? (
        <div className="p-6 rounded-xs bg-[#FEF5C8] border border-[#F5E898] text-center space-y-3 animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-[#231B18] text-[#FEF5C8] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-normal text-[#231B18]">
            Mesajınız Atölyemize Ulaştı
          </h4>
          <p className="text-xs text-[#554D46] max-w-md mx-auto">
            Talebiniz incelenerek en geç 24 saat içerisinde tarafınıza dönüş yapılacaktır.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs uppercase tracking-wider font-medium text-[#231B18] hover:underline pt-2 cursor-pointer"
          >
            Yeni bir mesaj gönder →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {Object.keys(errors).length > 0 && (
            <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Lütfen formdaki eksik veya hatalı bilgileri düzeltiniz.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Adınız Soyadınız *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Örn: Selin Yılmaz"
                className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white transition focus:outline-none ${
                  errors.name
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-stone-300 focus:border-[#231B18]'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                E-Posta Adresiniz *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="ornek@domain.com"
                className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white transition focus:outline-none ${
                  errors.email
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-stone-300 focus:border-[#231B18]'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Telefon Numaranız *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="05XX XXX XX XX"
                className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white transition focus:outline-none ${
                  errors.phone
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-stone-300 focus:border-[#231B18]'
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Konu
              </label>
              <select
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
              >
                <option value="Genel Bilgi & Sipariş">Genel Bilgi & Sipariş</option>
                <option value="Söz / Nişan / Düğün Hediyeliği">Söz / Nişan / Düğün Hediyeliği</option>
                <option value="Kurumsal Toplu Sipariş">Kurumsal Toplu Sipariş</option>
                <option value="Atölye Ziyareti & Randevu">Atölye Ziyareti & Randevu</option>
                <option value="İade veya Değişim">İade veya Değişim</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
              Mesajınız *
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: '' });
              }}
              placeholder="İstediğiniz adet, model, koku notası veya sorularınızı buraya yazabilirsiniz..."
              className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white transition focus:outline-none ${
                errors.message
                  ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                  : 'border-stone-300 focus:border-[#231B18]'
              }`}
            />
            {errors.message && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mesajınız İletiliyor...</span>
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Mesajı Gönder</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
