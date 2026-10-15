'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginUser, registerUser, resetPasswordUser } = useStore();

  const [mode, setMode] = useState<'login' | 'register' | 'verify_email' | 'forgot_password' | 'verify_reset'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (currentUser) {
      router.push('/hesabim');
    }
  }, [currentUser, router]);

  // Sayaç
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Giriş Yapma
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

    if (result.success) {
      setSuccessMsg('Giriş başarılı! Hesabınıza yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/hesabim');
      }, 800);
    } else {
      setErrorMsg(result.error || 'Giriş yapılamadı.');
    }
  };

  // Kayıt İçin Kod İstemesi
  const handleSendRegisterCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Girdiğiniz şifreler uyuşmuyor.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), userName: fullName.trim(), type: 'register' }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setMode('verify_email');
        setResendCooldown(60);
        if (data.code) setSimulatedCode(data.code);
        setSuccessMsg(`${email} adresinize 6 haneli doğrulama kodu gönderildi.`);
      } else {
        setErrorMsg(data.error || 'Kod gönderilemedi.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Sunucu hatası oluştu.');
    }
  };

  // Kayıt Kodu Doğrulama
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

    if (result.success) {
      setSuccessMsg('Hesabınız başarıyla oluşturuldu ve doğrulandı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/hesabim');
      }, 1000);
    } else {
      setErrorMsg(result.error || 'Doğrulama başarısız.');
    }
  };

  // Şifre Sıfırlama Kodu İsteme
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Lütfen e-posta adresinizi giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), type: 'reset_password' }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setMode('verify_reset');
        setResendCooldown(60);
        if (data.code) setSimulatedCode(data.code);
        setSuccessMsg(`${email} adresinize şifre sıfırlama kodu gönderildi.`);
      } else {
        setErrorMsg(data.error || 'Kod gönderilemedi.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Sunucu hatası oluştu.');
    }
  };

  // Yeni Şifreyi Kaydetme
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMsg('Lütfen 6 haneli kodu giriniz.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Şifreler uyuşmuyor.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPasswordUser(email, verificationCode.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Şifreniz güncellendi! Yeni şifrenizle giriş yapabilirsiniz.');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
      }, 1500);
    } else {
      setErrorMsg(result.error || 'Şifre güncellenemedi.');
    }
  };

  return (
    <div className="bg-white min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xs border border-stone-200 space-y-6">
        
        {/* Üst Başlık */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#231B18] flex items-center justify-center mx-auto">
            <User className="w-5 h-5 text-[#231B18]" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#231B18]">
            {mode === 'login' && 'Safirya Hesabım'}
            {mode === 'register' && 'Yeni Hesap Oluştur'}
            {mode === 'verify_email' && 'E-Posta Doğrulama'}
            {mode === 'forgot_password' && 'Şifre Sıfırlama'}
            {mode === 'verify_reset' && 'Yeni Şifre Belirle'}
          </h1>
          <p className="text-xs text-[#7A7067]">
            {mode === 'login' && 'Atölye hesabınıza giriş yaparak siparişlerinizi yönetin.'}
            {mode === 'register' && 'Siparişlerinizi ve favorilerinizi kolayca takip edin.'}
            {mode === 'verify_email' && `${email} adresinize gönderilen 6 haneli kodu girin.`}
            {mode === 'forgot_password' && 'Kayıtlı e-posta adresinizi giriniz.'}
            {mode === 'verify_reset' && 'Doğrulama kodunu ve yeni şifrenizi giriniz.'}
          </p>
        </div>

        {/* Hata & Başarı Mesajları */}
        {errorMsg && (
          <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {simulatedCode && (
          <div className="p-2.5 rounded-xs bg-[#FAF8F5] border border-amber-300 text-amber-900 text-[11px] flex items-center justify-between">
            <span>Doğrulama Kodunuz: <strong className="font-mono text-xs">{simulatedCode}</strong></span>
            <button
              type="button"
              onClick={() => setVerificationCode(simulatedCode)}
              className="text-[10px] text-[#C85A32] underline font-semibold"
            >
              Koda Yapıştır
            </button>
          </div>
        )}

        {/* 1. GİRİŞ FORMU */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18]">
                  Şifreniz *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition cursor-pointer"
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

            <div className="pt-2 text-center text-xs text-[#7A7067]">
              <span>Hesabınız yok mu? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="font-medium text-[#231B18] underline hover:text-[#C85A32]"
              >
                Hemen Kayıt Olun
              </button>
            </div>
          </form>
        )}

        {/* 2. KAYIT FORMU */}
        {mode === 'register' && (
          <form onSubmit={handleSendRegisterCode} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Adınız & Soyadınız *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Elif Kaya"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                E-Posta Adresiniz *
              </label>
              <input
                type="email"
                required
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
              />
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
                  className="w-full px-3 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
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
                  className="w-full px-3 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xs bg-[#FAF8F5] border border-stone-200 text-xs text-[#7A7067] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
              <span>
                Kayıt ol butonuna tıkladığınızda e-posta adresinize 6 haneli doğrulama kodu gönderilecektir.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition cursor-pointer"
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
                  setMode('login');
                  setErrorMsg('');
                }}
                className="font-medium text-[#231B18] underline hover:text-[#C85A32]"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        )}

        {/* 3. DOĞRULAMA KODU GİRİŞ FORMU */}
        {mode === 'verify_email' && (
          <form onSubmit={handleVerifyRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1 text-center">
                6 Haneli Doğrulama Kodu *
              </label>
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
              className="w-full py-3.5 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Doğrulanıyor...' : 'Hesabı Onayla & Giriş Yap'}
            </button>

            <div className="flex items-center justify-between text-xs text-[#7A7067] pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="hover:underline text-[#231B18]"
              >
                ← Geri Dön
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleSendRegisterCode}
                className="text-[#C85A32] hover:underline disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Tekrar Gönder (${resendCooldown}s)` : 'Kodu Tekrar Gönder'}
              </button>
            </div>
          </form>
        )}

        {/* 4. ŞİFRE SIFIRLAMA TALEBİ */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleSendResetCode} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                Kayıtlı E-Posta Adresiniz *
              </label>
              <input
                type="email"
                required
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition cursor-pointer"
            >
              {isSubmitting ? 'Kod Gönderiliyor...' : 'Sıfırlama Kodu Gönder'}
            </button>

            <div className="pt-2 text-center text-xs text-[#7A7067]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-medium text-[#231B18] underline hover:text-[#C85A32]"
              >
                ← Giriş Ekranına Dön
              </button>
            </div>
          </form>
        )}

        {/* 5. YENİ ŞİFRE BELİRLEME */}
        {mode === 'verify_reset' && (
          <form onSubmit={handleCompleteReset} className="space-y-4">
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
                className="w-full px-3.5 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
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
                className="w-full px-3.5 py-2 rounded-xs border border-stone-300 text-sm text-[#231B18] focus:border-[#231B18] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || verificationCode.length !== 6}
              className="w-full py-3.5 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Güncelleniyor...' : 'Şifremi Sıfırla & Giriş Yap'}
            </button>

            <div className="pt-2 text-center text-xs text-[#7A7067]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-medium text-[#231B18] underline hover:text-[#C85A32]"
              >
                ← Girişe Dön
              </button>
            </div>
          </form>
        )}

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
