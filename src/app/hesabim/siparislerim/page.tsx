'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import {
  Clock,
  ArrowRight,
  PackageCheck,
  ShoppingBag,
  LogIn,
  CheckCircle2,
  Truck,
  Package,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Gift,
  AlertCircle,
  Sparkles,
  Flame,
  Check,
} from 'lucide-react';

interface OrderItemDTO {
  id?: string;
  name: string;
  productName?: string;
  variantTitle?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  totalAmount?: number;
  image?: string;
  customText?: string;
  selectedScent?: string;
  selectedColor?: string;
  extraNote?: string;
}

interface UserOrderDTO {
  orderNumber: string;
  orderId?: string;
  customerName: string;
  email: string;
  phone?: string;
  date: string;
  createdAt: string;
  totalAmount: number;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  stage: string;
  stageIndex: number;
  stageLabel: string;
  stageStep: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  cargoCompany?: string;
  trackingCode?: string;
  trackingUrl?: string;
  isGiftWrapped?: boolean;
  giftNote?: string;
  contractStatus?: string;
  contractVerificationCode?: string;
  contractSignedAt?: string;
  items: OrderItemDTO[];
  photos?: Array<{
    stageKey: string;
    stageName: string;
    title: string;
    photoUrl: string;
    caption: string;
    timestamp: string;
  }>;
  source?: 'database' | 'supabase_storage';
}

const STAGES_MASTER = [
  { key: 'SIPARIS_ALINDI', step: '01', label: 'Sipariş Onaylandı' },
  { key: 'ATOLYEDE_URETIMDE', step: '02', label: 'Atölyede Üretimde' },
  { key: 'KALITE_KONTROL_PAKETLEME', step: '03', label: 'Kalite Kontrol' },
  { key: 'KARGOYA_VERILDI', step: '04', label: 'Kargoya Verildi' },
  { key: 'TESLIM_EDILDI', step: '05', label: 'Teslim Edildi' },
];

export default function MyOrdersPage() {
  const { currentUser, setAuthModalView, setIsAuthModalOpen } = useStore();
  const [orders, setOrders] = useState<UserOrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Doğrudan Supabase Bulut & PostgreSQL API'sinden siparişleri çeker
  const fetchCloudOrders = useCallback(async (isManualRefresh = false) => {
    if (!currentUser?.email) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setFetchError(null);

    try {
      const res = await fetch('/api/orders/me', {
        method: 'GET',
        headers: { credentials: 'include' },
        cache: 'no-store',
      });

      if (!res.ok) {
        if (res.status === 401) {
          setOrders([]);
          setLoading(false);
          setRefreshing(false);
          return;
        }
        throw new Error(`Sunucu hatası: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Siparişler buluttan çekilirken hata oluştu:', err);
      setFetchError(
        'Siparişleriniz bulut sunucusundan yüklenirken bir iletişim sorunu oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyiniz.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchCloudOrders();
  }, [fetchCloudOrders]);

  // Giriş Yapılmamış Durum
  if (!currentUser) {
    return (
      <div className="bg-white min-h-[70vh] py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center mx-auto text-[#231B18]">
            <LogIn className="w-7 h-7 text-[#C85A32]" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18]">
              Siparişlerinizi Görüntülemek İçin Giriş Yapın
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              Geçmiş ve devam eden tüm siparişlerinizi, canlı atölye üretim fotoğraflarını ve kargo hareketlerini doğrudan bulut hesabınızdan takip edebilirsiniz.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAuthModalView('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition cursor-pointer"
            >
              Giriş Yap
            </button>

            <Link
              href="/siparis-takip"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xs border border-stone-300 hover:border-[#231B18] text-[#231B18] hover:bg-[#FAF8F5] text-xs uppercase tracking-widest font-medium transition"
            >
              Üyeliksiz Sipariş Sorgula
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[70vh] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık ve Bulut Yenileme Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18]">
                Siparişlerim
              </h1>
              {!loading && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#7A7067]">
                  {orders.length} Sipariş
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
              Atölyemizden verdiğiniz geçmiş ve devam eden tüm el yapımı siparişleriniz (Supabase Bulut Senkronize).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchCloudOrders(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xs border border-stone-300 hover:border-[#231B18] bg-white hover:bg-[#FAF8F5] text-xs font-medium text-[#231B18] transition disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Sipariş durumlarını Supabase bulutundan yenile"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#C85A32] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Güncelleniyor...' : 'Buluttan Yenile'}</span>
            </button>
          </div>
        </div>

        {/* Hata Bildirimi */}
        {fetchError && (
          <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-xs flex items-start justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchCloudOrders(true)}
              className="font-medium underline hover:text-[#231B18] shrink-0"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Yükleniyor Durumu (Skelet Yükleme) */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xs border border-stone-200 p-6 animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-stone-200 rounded" />
                    <div className="w-24 h-3 bg-stone-100 rounded" />
                  </div>
                  <div className="w-28 h-6 bg-stone-200 rounded" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-stone-200 rounded-xs shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="w-48 h-4 bg-stone-200 rounded" />
                    <div className="w-32 h-3 bg-stone-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const stageIdx = order.stageIndex ?? 0;
              const isDelivered = order.stage === 'TESLIM_EDILDI';
              const isShipped = order.stage === 'KARGOYA_VERILDI';
              const isCrafting =
                order.stage === 'ATOLYEDE_URETIMDE' || order.stage === 'KALITE_KONTROL_PAKETLEME';

              return (
                <div
                  key={order.orderNumber}
                  className="bg-white rounded-xs border border-stone-200 hover:border-[#231B18] transition shadow-2xs overflow-hidden"
                >
                  {/* Sipariş Üst Başlık Şeridi */}
                  <div className="bg-[#FAF8F5]/80 p-5 sm:p-6 border-b border-stone-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-[#7A7067]">
                            Sipariş No:
                          </span>
                          <h3 className="font-mono text-sm font-bold text-[#231B18] tracking-wider">
                            #{order.orderNumber}
                          </h3>
                        </div>
                        <span className="text-xs text-[#7A7067] mt-0.5 block">
                          {order.date}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Aşama Rozeti */}
                        <span
                          className={`text-xs px-3 py-1 rounded-xs font-medium flex items-center gap-1.5 border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isShipped
                              ? 'bg-[#C85A32]/10 text-[#C85A32] border-[#C85A32]/30'
                              : isCrafting
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          {isDelivered ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : isShipped ? (
                            <Truck className="w-3.5 h-3.5 text-[#C85A32]" />
                          ) : isCrafting ? (
                            <Flame className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-stone-600" />
                          )}
                          <span>
                            {order.stageLabel} ({order.stageStep})
                          </span>
                        </span>

                        {/* Toplam Tutar */}
                        <div className="bg-white px-3 py-1 rounded-xs border border-stone-200 text-right">
                          <span className="text-[10px] uppercase tracking-wider text-[#7A7067] block">
                            Toplam
                          </span>
                          <span className="text-sm font-bold text-[#231B18]">
                            ₺{Number(order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 5 Aşamalı Görsel Zaman Çizelgesi (Mini Stepper) */}
                    <div className="mt-5 pt-4 border-t border-stone-200">
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {STAGES_MASTER.map((step, idx) => {
                          const isCompleted = idx < stageIdx;
                          const isCurrent = idx === stageIdx;

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center">
                              <div
                                className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-600'
                                    : isCurrent
                                    ? 'bg-[#C85A32]'
                                    : 'bg-stone-200'
                                }`}
                              />
                              <span
                                className={`text-[10px] hidden sm:block truncate w-full ${
                                  isCurrent
                                    ? 'font-bold text-[#231B18]'
                                    : isCompleted
                                    ? 'font-medium text-emerald-800'
                                    : 'text-stone-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sipariş Ürünleri ve Kalemleri */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-start gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || item.productName || 'Safirya Ürünü'}
                                loading="lazy"
                                decoding="async"
                                className="w-14 h-14 object-cover rounded-xs border border-stone-200 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-[#FAF8F5] border border-stone-200 rounded-xs flex items-center justify-center shrink-0 text-stone-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}

                            <div className="space-y-1">
                              <h4 className="font-serif text-sm font-medium text-[#231B18]">
                                {item.name || item.productName}
                              </h4>
                              {item.variantTitle && (
                                <p className="text-[11px] text-[#7A7067]">
                                  {item.variantTitle}
                                </p>
                              )}

                              {/* Kişiselleştirme Rozetleri */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                {item.customText && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                                    <Sparkles className="w-3 h-3 text-[#C85A32]" />
                                    <span>İsim/Metin: &ldquo;{item.customText}&rdquo;</span>
                                  </span>
                                )}
                                {item.selectedScent && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700 font-medium">
                                    Koku: {item.selectedScent}
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700 font-medium">
                                    Renk: {item.selectedColor}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs text-[#7A7067] block">
                              {item.quantity} Adet
                            </span>
                            <span className="text-xs font-semibold text-[#231B18]">
                              ₺{(Number(item.unitPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Kargo Takip Bilgisi (Varsa) */}
                    {order.trackingCode && (
                      <div className="p-3.5 rounded-xs bg-[#FAF8F5] border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#C85A32] shrink-0" />
                          <div>
                            <span className="font-medium text-[#231B18]">
                              {order.cargoCompany || 'Kargo'}:{' '}
                            </span>
                            <span className="font-mono text-stone-800 font-bold">
                              {order.trackingCode}
                            </span>
                          </div>
                        </div>

                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#C85A32] hover:underline font-medium"
                          >
                            <span>Kargo Firmasında Sorgula</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Hediye Paketi Bilgisi (Varsa) */}
                    {order.isGiftWrapped && (
                      <div className="p-3 rounded-xs bg-rose-50/70 border border-rose-200/80 flex items-start gap-2 text-xs text-rose-900">
                        <Gift className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Özel Hediye Paketi Mühürlendi</span>
                          {order.giftNote && (
                            <p className="text-[11px] text-rose-800 italic mt-0.5">
                              &ldquo;{order.giftNote}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dijital İmalat Sözleşmesi (Varsa) */}
                    {order.contractStatus === 'ONAYLANDI' && (
                      <div className="p-3 rounded-xs bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-2 text-xs text-emerald-950">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            TKHK 6502 Dijital Özel İmalat Onayı Doğrulandı (Kod: {order.contractVerificationCode || 'ONAYLI'})
                          </span>
                        </div>
                        <Link
                          href={`/sozlesme-onay/${order.orderId || order.orderNumber}`}
                          className="font-bold underline text-emerald-800 hover:text-emerald-950 text-[11px] shrink-0"
                        >
                          Sertifika →
                        </Link>
                      </div>
                    )}

                    {/* Canlı Takip Butonu */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
                      <div className="text-[11px] text-[#7A7067]">
                        <span>Ödeme:{' '}</span>
                        <strong className="text-[#231B18]">{order.paymentMethod}</strong>
                        {order.shippingAddress && (
                          <span className="hidden md:inline">
                            {' '}• Teslimat: {order.shippingAddress.slice(0, 40)}...
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/siparis-takip?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(currentUser.email)}`}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>Atölyeden Canlı Takip Et</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Sipariş Bulunmadığında Boş Durum */
          <div className="bg-[#FAF8F5] rounded-xs border border-stone-200 p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto text-[#231B18]">
              <PackageCheck className="w-7 h-7 text-[#C85A32]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-lg font-normal text-[#231B18]">
                Henüz Kayıtlı Bir Siparişiniz Bulunmuyor
              </h2>
              <p className="text-xs text-[#7A7067] leading-relaxed">
                {currentUser.name}, bulut hesabınıza bağlı bir sipariş kaydı bulunamadı. Doğal soya mumları ve özel tasarım epoksi koleksiyonlarımızı inceleyebilirsiniz.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/kategoriler"
                className="w-full sm:w-auto px-6 py-3 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Koleksiyonları Keşfet</span>
              </Link>

              <Link
                href="/siparis-takip"
                className="w-full sm:w-auto px-6 py-3 rounded-xs border border-stone-300 hover:border-[#231B18] text-[#231B18] hover:bg-white text-xs uppercase tracking-widest font-medium transition inline-flex items-center justify-center gap-2"
              >
                <span>Misafir Siparişi Takip Et</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
