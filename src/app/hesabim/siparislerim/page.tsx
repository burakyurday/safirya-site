'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

interface UserOrder {
  orderNumber: string;
  customerName?: string;
  email?: string;
  date?: string;
  totalAmount?: number;
  stage?: string;
  paymentMethod?: string;
  shippingAddress?: string;
  items?: Array<{
    name?: string;
    productName?: string;
    variantTitle?: string;
    quantity: number;
    price?: number;
    unitPrice?: number;
    image?: string;
  }>;
}

const STAGE_LABELS: Record<string, { label: string; step: string }> = {
  SIPARIS_ALINDI: { label: 'Sipariş Onaylandı', step: 'Aşama 1/5' },
  ATOLYEDE_URETIMDE: { label: 'Atölyede Üretimde', step: 'Aşama 2/5' },
  KALITE_KONTROL_PAKETLEME: { label: 'Kalite Kontrol & Paketleme', step: 'Aşama 3/5' },
  KARGOYA_VERILDI: { label: 'Kargoya Verildi', step: 'Aşama 4/5' },
  TESLIM_EDILDI: { label: 'Teslim Edildi', step: 'Aşama 5/5' },
};

export default function MyOrdersPage() {
  const { currentUser, setAuthModalView, setIsAuthModalOpen } = useStore();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const userEmail = currentUser.email.trim().toLowerCase();
    const matchedOrders: UserOrder[] = [];

    // 1. safirya_orders (Vitrin / Ödeme siparişleri)
    try {
      const storedRaw = localStorage.getItem('safirya_orders');
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((ord: any) => {
            const ordEmail = (ord.email || ord.guestEmail || ord.customerEmail || '')
              .trim()
              .toLowerCase();
            if (ordEmail === userEmail && ord.orderNumber) {
              matchedOrders.push(ord);
            }
          });
        }
      }
    } catch {}

    // 2. safirya_admin_orders (Admin panelinden işlenen siparişler)
    try {
      const adminRaw = localStorage.getItem('safirya_admin_orders');
      if (adminRaw) {
        const parsed = JSON.parse(adminRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((ord: any) => {
            const ordEmail = (ord.customerEmail || ord.email || '')
              .trim()
              .toLowerCase();
            if (
              ordEmail === userEmail &&
              ord.orderNumber &&
              !matchedOrders.some((existing) => existing.orderNumber === ord.orderNumber)
            ) {
              matchedOrders.push({
                orderNumber: ord.orderNumber,
                customerName: ord.customerName,
                email: ord.customerEmail || ord.email,
                date: ord.createdAt,
                totalAmount: ord.totalAmount,
                stage: ord.stage,
                paymentMethod: ord.paymentMethod,
                shippingAddress:
                  typeof ord.shippingAddress === 'string'
                    ? ord.shippingAddress
                    : `${ord.shippingAddress?.address || ''} ${ord.shippingAddress?.district || ''} / ${ord.shippingAddress?.city || ''}`,
                items: ord.items,
              });
            }
          });
        }
      }
    } catch {}

    setOrders(matchedOrders);
    setLoading(false);
  }, [currentUser]);

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
              Geçmiş ve devam eden tüm siparişlerinizi, atölye aşama fotoğraflarını ve canlı kargo durumunu hesabınızdan takip edebilirsiniz.
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
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18]">
            Siparişlerim
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Atölyemizden verdiğiniz geçmiş ve devam eden tüm el yapımı siparişleriniz.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#231B18] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#7A7067]">Siparişleriniz yükleniyor...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const stageInfo = STAGE_LABELS[order.stage || 'SIPARIS_ALINDI'] || {
                label: 'Sipariş Alındı',
                step: 'Aşama 1/5',
              };

              const firstItem = order.items && order.items[0];
              const remainingCount = (order.items?.length || 1) - 1;

              return (
                <div
                  key={order.orderNumber}
                  className="bg-white rounded-xs border border-stone-200 p-6 hover:border-[#231B18] transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#7A7067]">Sipariş No:</span>
                      <h3 className="font-mono text-sm font-medium text-[#231B18]">
                        #{order.orderNumber}
                      </h3>
                      {order.date && (
                        <span className="text-[11px] text-[#7A7067]">{order.date}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-[#FAF8F5] text-[#231B18] border border-stone-200 text-xs px-3 py-1 rounded-xs font-medium flex items-center gap-1.5">
                        {order.stage === 'TESLIM_EDILDI' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : order.stage === 'KARGOYA_VERILDI' ? (
                          <Truck className="w-3.5 h-3.5 text-[#C85A32]" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#231B18]" />
                        )}
                        <span>{stageInfo.label} ({stageInfo.step})</span>
                      </span>
                      {order.totalAmount !== undefined && (
                        <span className="text-sm font-semibold text-[#231B18]">
                          ₺{Number(order.totalAmount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {firstItem?.image ? (
                        <img
                          src={firstItem.image}
                          alt={firstItem.name || firstItem.productName || 'Sipariş Kalemi'}
                          loading="lazy"
                          decoding="async"
                          className="w-14 h-14 object-cover rounded-xs border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[#FAF8F5] border border-stone-200 rounded-xs flex items-center justify-center shrink-0 text-stone-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-serif text-sm font-normal text-[#231B18]">
                          {firstItem?.name || firstItem?.productName || 'Safirya El Yapımı Tasarım'}
                          {remainingCount > 0 && ` + ${remainingCount} Ürün`}
                        </h4>
                        {firstItem?.variantTitle && (
                          <p className="text-[11px] text-[#7A7067]">
                            {firstItem.variantTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Güvenli Canlı Takip Bağlantısı: Hem Sipariş No hem E-posta birlikte iletilir */}
                    <Link
                      href={`/siparis-takip?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(currentUser.email)}`}
                      className="bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium px-4 py-2.5 rounded-xs flex items-center justify-center gap-1.5 shrink-0 transition"
                    >
                      <span>Canlı Takip Et</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Sipariş Bulunmadığında Temiz Boş Durum */
          <div className="bg-[#FAF8F5] rounded-xs border border-stone-200 p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto text-[#231B18]">
              <PackageCheck className="w-7 h-7 text-[#C85A32]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-lg font-normal text-[#231B18]">
                Henüz Kayıtlı Bir Siparişiniz Bulunmuyor
              </h2>
              <p className="text-xs text-[#7A7067] leading-relaxed">
                {currentUser.name}, henüz atölyemizden bir sipariş vermediniz. Doğal soya mumları ve özel tasarım epoksi koleksiyonumuzu inceleyebilirsiniz.
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
