'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

interface CartDrawerProps {
  freeShippingThreshold?: number;
  giftWrapFee?: number;
}

export function CartDrawer({
  freeShippingThreshold = 500,
  giftWrapFee = 30,
}: CartDrawerProps) {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
  } = useStore();

  if (!isCartOpen) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Karartma Arka Planı */}
      <div
        className="absolute inset-0 bg-[#231B18]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Sepet Başlığı */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#231B18] stroke-[1.5]" />
              <h2 className="font-serif text-lg font-normal text-[#231B18]">
                Alışveriş Sepetim
              </h2>
              <span className="bg-[#FAF8F5] text-[#231B18] border border-stone-200 text-xs px-2 py-0.5 rounded-xs font-mono font-medium">
                {cartCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xs text-[#7A7067] hover:text-[#231B18] hover:bg-[#FAF8F5] transition"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ücretsiz Kargo İlerleme Çubuğu */}
          <div className="p-3.5 bg-[#FAF8F5] border-b border-stone-200">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="text-xs text-[#231B18] font-medium mb-1.5 flex items-center justify-between">
                  <span>Ücretsiz Kargo İçin:</span>
                  <strong className="text-[#C85A32]">₺{remainingForFreeShipping.toFixed(2)} Kaldı</strong>
                </p>
                <div className="w-full h-1 bg-stone-200 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-[#231B18] transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-[#15803D]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Siparişinizde Ücretsiz Kargo Kazandınız</span>
              </div>
            )}
          </div>

          {/* Sepet Ürün Listesi */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-white">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 bg-[#FAF8F5] rounded-xs border border-stone-200 relative"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={`${item.name} - Sepet Ürünü`}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-16 object-cover rounded-xs border border-stone-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-serif text-sm font-normal text-[#231B18] leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    {item.variantTitle && (
                      <span className="text-xs text-[#7A7067] block mt-0.5">
                        {item.variantTitle}
                      </span>
                    )}
                    {(item.scentNote || item.customText) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.scentNote && (
                          <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-xs border border-stone-200 text-[#231B18]">
                            {item.scentNote}
                          </span>
                        )}
                        {item.customText && (
                          <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-xs border border-stone-200 text-[#C85A32] font-medium truncate max-w-[150px]">
                            &quot;{item.customText}&quot;
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-sm font-semibold text-[#231B18]">
                        ₺{(item.price * item.quantity).toFixed(0)}
                      </span>

                      {/* Adet Kontrolü */}
                      <div className="flex items-center border border-stone-300 rounded-xs bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-[#C85A32] transition text-[#231B18]"
                          title="Azalt"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-semibold px-2 text-[#231B18]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-[#C85A32] transition text-[#231B18]"
                          title="Artır"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-3 right-3 text-[#7A7067] hover:text-[#231B18] transition"
                    title="Sepetten Çıkar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3 stroke-[1.5]" />
                <h3 className="font-serif text-base font-normal text-[#231B18] mb-1">
                  Sepetiniz Boş
                </h3>
                <p className="text-xs text-[#7A7067] mb-5">
                  Atölyemizin el emeği ürünlerini keşfederek sepetinizi doldurabilirsiniz.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-white text-xs px-5 py-2.5 rounded-xs uppercase tracking-widest font-medium transition"
                >
                  Koleksiyonu Keşfet
                </button>
              </div>
            )}
          </div>

          {/* Sepet Dip Not ve Sipariş Butonları */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-stone-200 space-y-3.5">
              {/* Hediye Paketi Bilgisi */}
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xs bg-white border border-stone-200 text-[#231B18]">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#C85A32]" />
                  <span>Özel Mühürlü Kraft Hediye Paketi</span>
                </div>
                <span className="font-medium text-[#C85A32]">₺{giftWrapFee}</span>
              </div>

              {/* Alt Toplam & Kargo */}
              <div className="space-y-1.5 text-xs text-[#7A7067]">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span className="font-medium text-[#231B18]">₺{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo Ücreti</span>
                  <span className="font-medium text-[#15803D]">
                    {remainingForFreeShipping === 0 ? 'ÜCRETSİZ' : '₺45.00'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-normal text-[#231B18] pt-2 border-t border-stone-200">
                  <span className="font-serif">Genel Toplam</span>
                  <span className="text-lg font-semibold text-[#231B18]">
                    ₺{(cartTotal + (remainingForFreeShipping === 0 ? 0 : 45)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* CTA Butonları */}
              <Link
                href="/sepet"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition cursor-pointer"
              >
                <span>Sepete Git & Siparişi Tamamla</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
