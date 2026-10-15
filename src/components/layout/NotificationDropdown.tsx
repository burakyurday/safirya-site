'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  Info,
  Check,
  ExternalLink,
  X,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { StoreNotification } from '@/types/user';

interface Props {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: Props) {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useStore();

  const ref = useRef<HTMLDivElement>(null);

  // Dışarı tıklama ile kapatma
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const getNotificationIcon = (notif: StoreNotification) => {
    if (notif.stageName?.includes('Kargo') || notif.title?.includes('Kargo')) {
      return <Truck className="w-4 h-4 text-[#C85A32]" />;
    }
    if (notif.stageName?.includes('Teslim') || notif.title?.includes('Teslim')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (notif.type === 'order_stage' || notif.orderNumber) {
      return <Package className="w-4 h-4 text-[#5F6F52]" />;
    }
    if (notif.type === 'promo') {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
    return <Info className="w-4 h-4 text-[#231B18]" />;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Az önce';
      if (diffMins < 60) return `${diffMins} dk önce`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} saat önce`;
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return 'Yakın zamanda';
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xs shadow-2xl border border-stone-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-[#231B18]"
      role="dialog"
      aria-label="Bildirimler"
    >
      {/* Üst Başlık */}
      <div className="p-3.5 px-4 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#C85A32]" />
          <h3 className="font-serif text-sm font-medium text-[#231B18]">
            Bildirimler
          </h3>
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#C85A32] text-white text-[10px] font-semibold">
              {unreadNotificationsCount} yeni
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-[#C85A32] hover:underline font-medium cursor-pointer"
            >
              Tümünü Okundu Say
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bildirim Listesi */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-stone-100">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const content = (
              <div
                className={`p-3.5 flex items-start gap-3 transition hover:bg-[#FAF8F5]/80 ${
                  !notif.isRead ? 'bg-[#FAF8F5]/50' : 'bg-white'
                }`}
                onClick={() => {
                  if (!notif.isRead) markNotificationAsRead(notif.id);
                  if (notif.link) onClose();
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(notif)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs truncate ${
                        !notif.isRead ? 'font-semibold text-[#231B18]' : 'font-medium text-stone-700'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#7A7067] mt-1 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {notif.orderNumber && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-stone-100 border border-stone-200 text-[#231B18] font-medium">
                        #{notif.orderNumber}
                      </span>
                    )}
                    {notif.link && (
                      <span className="text-[10px] text-[#C85A32] font-medium flex items-center gap-0.5 hover:underline">
                        <span>Görüntüle</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#C85A32] shrink-0 mt-1.5" />
                )}
              </div>
            );

            if (notif.link) {
              return (
                <Link key={notif.id} href={notif.link} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={notif.id}>{content}</div>;
          })
        ) : (
          <div className="py-12 px-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
              <Check className="w-5 h-5 text-[#5F6F52]" />
            </div>
            <p className="font-serif text-sm text-[#231B18]">
              Henüz yeni bir bildiriminiz bulunmuyor
            </p>
            <p className="text-[11px] text-[#7A7067]">
              Sipariş verdiğinizde atölye üretim ve kargo hareketleri burada anlık olarak listelenecektir.
            </p>
          </div>
        )}
      </div>

      {/* Alt Bilgi */}
      <div className="p-2.5 px-4 bg-[#FAF8F5] border-t border-stone-200 text-center">
        <Link
          href="/hesabim/siparislerim"
          onClick={onClose}
          className="text-[11px] uppercase tracking-wider font-medium text-[#231B18] hover:text-[#C85A32] transition"
        >
          Sipariş Geçmişini Görüntüle →
        </Link>
      </div>
    </div>
  );
}
