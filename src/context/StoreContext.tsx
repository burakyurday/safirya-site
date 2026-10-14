'use client';

import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  variantTitle?: string;
  scentNote?: string;
  customText?: string;
  colorPalette?: string;
  bulkTierLabel?: string;
  bulkDiscountRate?: number;
}

export interface AppliedCoupon {
  code: string;
  label: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

interface StoreContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  originalCartTotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Hediye Paketi & Notu
  isGiftWrapped: boolean;
  setIsGiftWrapped: (wrapped: boolean) => void;
  giftNote: string;
  setGiftNote: (note: string) => void;

  // Kupon Yönetimi
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  favorites: string[]; // Ürün ID'leri
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoritesCount: number;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Başlangıçta zengin kişiselleştirme detayları içeren 2 örnek ürün
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'demo-item-1',
      name: 'Doğal Mum & Epoksi Kişiselleştirilebilir Hediye Seti',
      price: 349.0,
      originalPrice: 429.0,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80',
      variantTitle: '210g Kehribar Cam Kavanoz',
      scentNote: 'Vanilya & Karamel',
      customText: 'Selin & Emre 24.10.2026',
      colorPalette: 'Gold & Krem',
      bulkTierLabel: '1 Adet (Standart)',
      bulkDiscountRate: 0,
    },
    {
      id: 'demo-item-2',
      name: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
      price: 271.0,
      originalPrice: 319.0,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
      variantTitle: 'Kraft Kutu & Keten İp Kurdele',
      scentNote: 'Lavanta & Sandal Ağacı',
      customText: 'Merve & Kaan Sonsuzluğa...',
      colorPalette: 'Zümrüt Yeşili',
      bulkTierLabel: '10+ Adet Baremi (%15 İndirim)',
      bulkDiscountRate: 15,
    },
  ]);

  const [favorites, setFavorites] = useState<string[]>(['demo-item-1', 'sfr-1']);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hediye Paketi ve Notu Durumu
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  // Kupon Durumu
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const originalCartTotal = cartItems.reduce(
    (acc, item) => acc + (item.originalPrice || item.price) * item.quantity,
    0
  );

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const qtyToAdd = item.quantity || 1;
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          quantity: qtyToAdd,
          originalPrice: item.originalPrice || item.price,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setIsGiftWrapped(false);
    setGiftNote('');
  };

  const applyCoupon = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: 'Lütfen bir kupon kodu giriniz.' };
    }

    if (code === 'SAFIRYA10') {
      setAppliedCoupon({
        code: 'SAFIRYA10',
        label: '%10 Tanışma İndirimi',
        discountType: 'percentage',
        discountValue: 10,
      });
      return { success: true, message: '%10 Tanışma İndirimi başarıyla uygulandı!' };
    }

    if (code === 'ATOLYE50') {
      setAppliedCoupon({
        code: 'ATOLYE50',
        label: '₺50 Atölye İndirimi',
        discountType: 'fixed',
        discountValue: 50,
      });
      return { success: true, message: '₺50 Atölye İndirimi başarıyla uygulandı!' };
    }

    if (code === 'BAHAR20') {
      setAppliedCoupon({
        code: 'BAHAR20',
        label: '%20 Bahar Atölye İndirimi',
        discountType: 'percentage',
        discountValue: 20,
      });
      return { success: true, message: '%20 Bahar Atölye İndirimi başarıyla uygulandı!' };
    }

    return {
      success: false,
      message: 'Geçersiz veya süresi dolmuş kupon kodu. (Örn: SAFIRYA10, ATOLYE50)',
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        originalCartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isGiftWrapped,
        setIsGiftWrapped,
        giftNote,
        setGiftNote,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore, StoreProvider içinde kullanılmalıdır.');
  }
  return context;
}
