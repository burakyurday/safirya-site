'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AdminQuickBar() {
  const { currentUser } = useStore();
  const pathname = usePathname();

  // Admin sayfalarında bu çubuğu gösterme (kendi navigasyonu var)
  if (pathname?.startsWith('/admin')) return null;

  const isAdmin = currentUser && Boolean(currentUser.isAdmin || currentUser.role === 'ADMIN');
  if (!isAdmin) return null;

  return (
    <aside
      aria-label="Yönetici Hızlı Geçiş Çubuğu"
      className="bg-[#1C1513] text-[#F6F3EC] border-b border-[#3E342F] px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between z-50 relative animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2 truncate">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C85A32]/20 border border-[#C85A32]/50 text-[#FFA48D] text-[10px] font-bold uppercase tracking-wider shrink-0">
          <ShieldCheck className="w-3 h-3 text-[#C85A32]" />
          <span>Yönetici Modu</span>
        </span>
        <span className="hidden sm:inline text-stone-300 truncate text-[11px]">
          Hoş geldiniz, <strong className="text-white font-medium">{currentUser.name}</strong> ({currentUser.email}). Yönetici yetkiniz aktiftir.
        </span>
        <span className="sm:hidden text-stone-300 truncate text-[11px] font-medium">
          {currentUser.name}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/api/admin/auth/switch"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#C85A32] hover:bg-[#B34E2A] text-white text-[11px] font-semibold uppercase tracking-wider transition-colors shadow-2xs group cursor-pointer"
          title="Safirya Yönetim Paneline Geçiş Yap"
        >
          <span>Yönetim Paneline Geç</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </aside>
  );
}
