'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const formatCooldown = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalView,
    setAuthModalView,
    loginUser,
    registerUser,
    resetPasswordUser,
  } = useStore();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Modal kapandığında / açıldığında state sıfırlama
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setVerificationCode('');
    }
  }, [isAuthModalOpen, authModalView]);

  // 2 Dakikalık (120 saniye) geri sayım sayacı
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ESC ile kapatma
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAuthModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // 1. GİRİŞ YAPMA İŞLEMİ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setIsSubmitting(true);
    const result = await loginUser(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Giriş yapılamadı.');
    }
  };

  // 2. KAYIT İÇİN KOD GÖNDERME
  const handleSendRegisterCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Girdiğiniz şifreler birbiriyle uyuşmuyor.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          userName: fullName.trim(),
          type: 'register',
        }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setAuthModalView('verify_email');
        setResendCooldown(120); // 2 dakika bekleme süresi
        setSuccessMsg(
          `${email} adresinize 6 haneli doğrulama kodu gönderildi. Lütfen gelen kutunuzu kontrol ediniz.`
        );
      } else {
        setErrorMsg(data.error || 'Kod gönderilemedi.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Sunucu ile iletişim kurulamadı. Lütfen tekrar deneyiniz.');
    }
  };

  // 3. KAYIT KODU DOĞRULAMA VE TAMAMLAMA
  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMsg('Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz.');
      return;
    }

    setIsSubmitting(true);
    const result = await registerUser(fullName, email, password, verificationCode.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Girdiğiniz doğrulama kodu hatalı. Lütfen kontrol edip tekrar deneyiniz.');
      setVerificationCode('');
    }
  };

  // 4. ŞİFRE SIFIRLAMA KODU İSTEME
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Lütfen kayıtlı e-posta adresinizi giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: 'reset_password',
        }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setAuthModalView('verify_reset');
        setResendCooldown(120); // 2 dakika bekleme süresi
        setSuccessMsg(
          `${email} adresinize şifre sıfırlama kodu gönderildi. Lütfen gelen kutunuzu kontrol ediniz.`
        );
      } else {
        setErrorMsg(data.error || 'Sıfırlama kodu gönderilemedi.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('İletişim hatası oluştu. Lütfen tekrar deneyiniz.');
    }
  };

  // 5. YENİ ŞİFREYİ ONAYLAMA
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMsg('Lütfen 6 haneli sıfırlama kodunu giriniz.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Yeni şifreler uyuşmuyor.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPasswordUser(email, verificationCode.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.');
      setTimeout(() => {
        setAuthModalView('login');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
      }, 1500);
    } else {
      setErrorMsg(result.error || 'Girdiğiniz sıfırlama kodu hatalı. Lütfen kontrol edip tekrar deneyiniz.');
      setVerificationCode('');
    }
  };

  // KOD TEKRAR GÖNDERME (2 Dakika kısıtlamalı)
  const handleResendCode = async (type: 'register' | 'reset_password') => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), type }),
      });
      const data = await res.json();
      setIsSubmitting(false);
      if (data.success) {
        setResendCooldown(120); // Tekrar 2 dakika sayaç başlat
        setSuccessMsg('Yeni doğrulama kodu e-posta adresinize iletildi.');
      } else {
        setErrorMsg(data.error || 'Kod gönderilemedi.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Kod gönderilirken bir hata oluştu.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#231B18]/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white rounded-xs shadow-2xl border border-[#E2DCD3] overflow-hidden text-[#231B18] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Üst Başlık & Kapat */}
        <div className="bg-[#FAF8F5] border-b border-[#E2DCD3] p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#231B18] text-[#F6F3EC] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-medium text-[#231B18]">
                {authModalView === 'login' && 'Safirya Hesabım'}
                {authModalView === 'register' && 'Yeni Hesap Oluştur'}
                {authModalView === 'verify_email' && 'E-Posta Doğrulama'}
                {authModalView === 'forgot_password' && 'Şifre Sıfırlama'}
                {authModalView === 'verify_reset' && 'Yeni Şifre Belirle'}
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-[#C85A32] font-semibold">
                Kadıköy Atölye
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded text-stone-400 hover:text-[#231B18] transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Gövdesi */}
        <div className="p-6 space-y-4">
          {/* Hata Bildirimi */}
          {errorMsg && (
            <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Başarı Bildirimi */}
          {successMsg && (
            <div className="p-3.5 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              1. GİRİŞ YAPMA FORMU
          ══════════════════════════════════════════════ */}
          {authModalView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                  E-Posta Adresi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18]">
                    Şifreniz
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalView('forgot_password');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-[#C85A32] hover:underline"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition disabled:opacity-70 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Giriş Yapılıyor...</span>
                  </span>
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-stone-200 text-center text-xs text-[#7A7067]">
                <span>Henüz bir hesabınız yok mu? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('register');
                    setErrorMsg('');
                  }}
                  className="font-medium text-[#231B18] underline hover:text-[#C85A32]"
                >
                  Hemen Kayıt Olun
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════
              2. YENİ KAYIT FORMU
          ══════════════════════════════════════════════ */}
          {authModalView === 'register' && (
            <form onSubmit={handleSendRegisterCode} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                  Adınız & Soyadınız *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                  E-Posta Adresiniz *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                    Şifre *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="En az 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                    Şifre Tekrar *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Tekrar girin"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xs bg-[#FAF8F5] border border-stone-200 text-[11px] text-[#7A7067] flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
                <span>
                  Kayıt ol butonuna tıkladığınızda e-posta adresinize 6 haneli doğrulama kodu gönderilecektir.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition disabled:opacity-70 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Kod Gönderiliyor...</span>
                  </span>
                ) : (
                  <>
                    <span>Doğrulama Kodu Gönder</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-[#7A7067]">
                <span>Zaten bir hesabınız var mı? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('login');
                    setErrorMsg('');
                  }}
                  className="font-medium text-[#231B18] underline hover:text-[#C85A32]"
                >
                  Giriş Yap
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════
              3. E-POSTA DOĞRULAMA KODU FORMU (Kayıt)
          ══════════════════════════════════════════════ */}
          {authModalView === 'verify_email' && (
            <form onSubmit={handleVerifyRegister} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-stone-200 mx-auto flex items-center justify-center text-[#C85A32]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-sm font-medium text-[#231B18]">
                  E-Posta Doğrulama Kodu
                </h3>
                <p className="text-xs text-[#7A7067]">
                  <strong>{email}</strong> adresinize gönderilen 6 haneli kodu giriniz.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xs border-2 border-stone-300 focus:border-[#231B18] focus:outline-none bg-[#FAF8F5]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || verificationCode.length !== 6}
                className="w-full py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Doğrulanıyor...</span>
                  </span>
                ) : (
                  <span>Hesabı Onayla & Kaydı Tamamla</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-[#7A7067] pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setAuthModalView('register')}
                  className="hover:underline text-[#231B18]"
                >
                  ← Bilgileri Değiştir
                </button>

                {/* 2 Dakikalık Tekrar Gönder Butonu ve Geri Sayım */}
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={() => handleResendCode('register')}
                  className={`text-xs flex items-center gap-1.5 transition font-medium ${
                    resendCooldown > 0 || isSubmitting
                      ? 'text-stone-400 cursor-not-allowed opacity-60'
                      : 'text-[#C85A32] hover:underline cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? (
                    <span>
                      Tekrar Kod Gönder <span className="font-mono font-bold">({formatCooldown(resendCooldown)})</span>
                    </span>
                  ) : (
                    <span>Kodu Tekrar Gönder</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════
              4. ŞİFRE SIFIRLAMA TALEBİ FORMU
          ══════════════════════════════════════════════ */}
          {authModalView === 'forgot_password' && (
            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-sm font-medium text-[#231B18]">
                  Şifrenizi mi Unuttunuz?
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Kayıtlı e-posta adresinizi girin. Size 6 haneli şifre sıfırlama kodu gönderelim.
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                  E-Posta Adresiniz
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition disabled:opacity-70 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Kod Gönderiliyor...</span>
                  </span>
                ) : (
                  <>
                    <span>Sıfırlama Kodu Gönder</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-[#7A7067]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('login');
                    setErrorMsg('');
                  }}
                  className="font-medium text-[#231B18] underline hover:text-[#C85A32]"
                >
                  ← Giriş Ekranına Dön
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════
              5. YENİ ŞİFRE BELİRLEME FORMU
          ══════════════════════════════════════════════ */}
          {authModalView === 'verify_reset' && (
            <form onSubmit={handleCompleteReset} className="space-y-3.5">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-sm font-medium text-[#231B18]">
                  Yeni Şifre Belirleme
                </h3>
                <p className="text-xs text-[#7A7067]">
                  <strong>{email}</strong> adresinize gönderilen kodu ve yeni şifrenizi giriniz.
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                  6 Haneli Sıfırlama Kodu *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-2 rounded-xs border-2 border-stone-300 focus:border-[#231B18] focus:outline-none bg-[#FAF8F5]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                  Yeni Şifre *
                </label>
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                  Yeni Şifre Tekrar *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Şifreyi onaylayın"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] bg-white focus:outline-none focus:border-[#231B18] transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || verificationCode.length !== 6}
                className="w-full py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Şifre Güncelleniyor...</span>
                  </span>
                ) : (
                  <span>Şifremi Sıfırla & Giriş Yap</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-[#7A7067] pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="hover:underline text-[#231B18]"
                >
                  ← Girişe Dön
                </button>

                {/* 2 Dakikalık Tekrar Gönder Butonu ve Geri Sayım */}
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={() => handleResendCode('reset_password')}
                  className={`text-xs flex items-center gap-1.5 transition font-medium ${
                    resendCooldown > 0 || isSubmitting
                      ? 'text-stone-400 cursor-not-allowed opacity-60'
                      : 'text-[#C85A32] hover:underline cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? (
                    <span>
                      Tekrar Kod Gönder <span className="font-mono font-bold">({formatCooldown(resendCooldown)})</span>
                    </span>
                  ) : (
                    <span>Kodu Tekrar Gönder</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
