'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (isRegister && !fullName.trim()) {
      newErrors.fullName = 'Lütfen adınızı ve soyadınızı giriniz.';
    }
    if (!email.trim()) {
      newErrors.email = 'Lütfen e-posta adresinizi giriniz.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Lütfen geçerli bir e-posta adresi giriniz.';
    }
    if (!password) {
      newErrors.password = 'Lütfen şifrenizi giriniz.';
    } else if (password.length < 6) {
      newErrors.password = 'Şifreniz en az 6 karakter olmalıdır.';
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
      setSuccessMessage(
        isRegister
          ? 'Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...'
          : 'Giriş başarılı! Hesabınıza yönlendiriliyorsunuz...'
      );
      setTimeout(() => {
        window.location.href = '/hesabim/siparislerim';
      }, 1000);
    }, 600);
  };

  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xs border border-stone-200 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#231B18] flex items-center justify-center mx-auto mb-3">
            <User className="w-5 h-5 text-[#231B18]" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#231B18]">
            {isRegister ? 'Yeni Hesap Oluştur' : 'Safirya Hesabım'}
          </h1>
          <p className="text-xs text-[#7A7067] mt-1">
            {isRegister
              ? 'Siparişlerinizi ve favorilerinizi kolayca takip edin.'
              : 'Atölye hesabınıza giriş yaparak siparişlerinizi yönetin.'}
          </p>
        </div>

        {successMessage ? (
          <div className="p-4 rounded-xs bg-[#FEF5C8] border border-[#F5E898] text-[#231B18] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {Object.keys(errors).length > 0 && (
              <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Lütfen belirtilen alanları kontrol ediniz.</span>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                  Adınız & Soyadınız *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Elif Kaya"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                    errors.fullName
                      ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                      : 'border-stone-300 focus:border-[#231B18]'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                E-Posta Adresiniz *
              </label>
              <input
                type="email"
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
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

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Şifreniz *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                  errors.password
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-stone-300 focus:border-[#231B18]'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
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
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>İşlem yapılıyor...</span>
                </span>
              ) : (
                <>
                  <span>{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-[#7A7067]">
          {isRegister ? (
            <p>
              Zaten bir hesabınız var mı?{' '}
              <button
                onClick={() => {
                  setIsRegister(false);
                  setErrors({});
                }}
                className="text-[#231B18] font-medium underline hover:text-[#C85A32]"
              >
                Giriş Yap
              </button>
            </p>
          ) : (
            <p>
              Hesabınız yok mu?{' '}
              <button
                onClick={() => {
                  setIsRegister(true);
                  setErrors({});
                }}
                className="text-[#231B18] font-medium underline hover:text-[#C85A32]"
              >
                Hemen Kayıt Olun
              </button>
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-stone-200 text-center">
          <Link
            href="/siparis-takip"
            className="text-xs text-[#7A7067] hover:text-[#231B18] transition"
          >
            Üyeliksiz Verilen Siparişleri Takip Et →
          </Link>
        </div>
      </div>
    </div>
  );
}
