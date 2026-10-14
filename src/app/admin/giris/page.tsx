'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Lütfen kullanıcı adı ve parolanızı eksiksiz giriniz.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.');
        setIsLoading(false);
        return;
      }

      // Başarılı giriş -> hedef sayfaya yönlendir
      router.push(returnUrl);
      router.refresh();
    } catch {
      setErrorMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1916] text-[#F6F3EC] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      
      {/* Arka Plan Dekoratif Işıklandırma */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C85A32]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#5F6F52]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Atölye Marka Başlığı */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2A221E] border border-[#3E342F] text-[#C85A32] mb-4 shadow-xl">
            <Lock className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C85A32] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Safirya Atölye ERP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#F6F3EC]">
            Yönetim Paneli Girişi
          </h1>
          <p className="text-xs text-[#A89E94] mt-2 max-w-xs mx-auto">
            Bu alan yalnızca yetkili atölye personeli ve yöneticiler için parola korumalıdır.
          </p>
        </div>

        {/* Giriş Kartı */}
        <div className="bg-[#2A221E]/90 backdrop-blur-md border border-[#3E342F] rounded-xs p-6 sm:p-8 shadow-2xl">
          
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xs bg-[#8C2D19]/20 border border-[#8C2D19]/40 flex items-start gap-3 text-xs text-[#FFA48D]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kullanıcı Adı / E-posta */}
            <div>
              <label className="block text-xs font-medium text-[#C8BEB5] uppercase tracking-wider mb-2">
                Kullanıcı Adı veya E-posta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7067]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@safirya.tr"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xs bg-[#1F1916] border border-[#3E342F] text-sm text-[#F6F3EC] placeholder-[#5A5048] focus:border-[#C85A32] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition"
                />
              </div>
            </div>

            {/* Parola */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-[#C8BEB5] uppercase tracking-wider">
                  Yönetici Parolası
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7067]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xs bg-[#1F1916] border border-[#3E342F] text-sm text-[#F6F3EC] placeholder-[#5A5048] focus:border-[#C85A32] focus:outline-none focus:ring-1 focus:ring-[#C85A32] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7A7067] hover:text-[#C8BEB5] transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xs bg-[#C85A32] hover:bg-[#B34F2B] active:bg-[#9E4424] text-white text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Panele Güvenli Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Güvenlik Notu */}
          <div className="mt-6 pt-5 border-t border-[#3E342F]/70 flex items-center justify-between text-[11px] text-[#7A7067]">
            <div className="flex items-center gap-1.5 text-[#5F6F52]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-Bit SSL & JWT Korumalı</span>
            </div>
            <span>Safirya v2.6 ERP</span>
          </div>

        </div>

        {/* Ana Mağazaya Dönüş */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-[#7A7067] hover:text-[#C85A32] transition underline underline-offset-4"
          >
            ← Safirya Mağaza Vitrinine Dön
          </a>
        </div>

      </div>
    </div>
  );
}
