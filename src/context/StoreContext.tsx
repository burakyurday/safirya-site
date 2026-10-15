'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, StoreNotification } from '@/types/user';

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

export type AuthModalView =
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'verify_email'
  | 'verify_reset';

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

  // Kullanıcı Kimlik & Giriş Yönetimi
  currentUser: UserProfile | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalView: AuthModalView;
  setAuthModalView: (view: AuthModalView) => void;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPasswordUser: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;

  // Bildirim Sistemi (Sadece giriş yapıldığında aktif)
  notifications: StoreNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (
    notif: Omit<StoreNotification, 'id' | 'createdAt' | 'isRead'>
  ) => StoreNotification;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Sepet Depolama Sabitleri
// KURAL: LocalStorage SADECE kayıt olmayan (misafir) kullanıcılar içindir.
// Kayıtlı (giriş yapmış) kullanıcıların sepeti ise hafızada (Session & Server in-memory) saklanır.
const GUEST_CART_STORAGE_KEY = 'safirya_guest_cart';
const SESSION_CART_STORAGE_KEY = 'safirya_session_cart';

const mergeCartLists = (target: CartItem[], incoming: CartItem[]): CartItem[] => {
  const result = [...target];
  incoming.forEach((inItem) => {
    const existingIndex = result.findIndex((r) => r.id === inItem.id);
    if (existingIndex > -1) {
      result[existingIndex] = {
        ...result[existingIndex],
        quantity: result[existingIndex].quantity + inItem.quantity,
      };
    } else {
      result.push(inItem);
    }
  });
  return result;
};

// Başlangıç kayıtlı örnek kullanıcılar (Demo test hesabı dahil)
const DEFAULT_REGISTERED_USERS: Array<UserProfile & { passwordHash: string }> = [
  {
    id: 'usr-1',
    name: 'Elif Kaya',
    email: 'elif.kaya@safirya.tr',
    phone: '+90 (532) 111 2233',
    isVerified: true,
    createdAt: new Date().toISOString(),
    passwordHash: 'Safirya123!',
  },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Sepet ve Favoriler (Başlangıçta boş)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const isLoadedRef = useRef(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hediye Paketi ve Notu Durumu
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  // Kupon Durumu
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Kullanıcı Durumu & Modal State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');

  // Bildirimler
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);

  // Sepet ve Oturum Senkronizasyonu
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Kullanıcı oturumunu oku
    let activeUser: UserProfile | null = null;
    try {
      const savedUser = localStorage.getItem('safirya_active_user');
      if (savedUser) {
        activeUser = JSON.parse(savedUser);
        setCurrentUser(activeUser);
      }
    } catch {}

    // Eski 'safirya_cart_items' anahtarı varsa temizle / misafir ise aktar
    try {
      const legacyCart = localStorage.getItem('safirya_cart_items');
      if (legacyCart) {
        if (!activeUser) {
          localStorage.setItem(GUEST_CART_STORAGE_KEY, legacyCart);
        }
        localStorage.removeItem('safirya_cart_items');
      }
    } catch {}

    // 2. Sepeti yükle:
    // - Kayıtlı kullanıcı: LocalStorage KULLANILMAZ; hafızadan (sessionStorage & /api/cart) yüklenir
    // - Kayıt olmayan misafir: Yalnızca LocalStorage kullanılır
    if (activeUser) {
      try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      } catch {}

      let loadedFromSession = false;
      try {
        const sessionCart = sessionStorage.getItem(SESSION_CART_STORAGE_KEY);
        if (sessionCart) {
          const parsed = JSON.parse(sessionCart);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (item: any) => item && item.id !== 'demo-item-1' && item.id !== 'demo-item-2'
            );
            setCartItems(cleaned);
            loadedFromSession = true;
          }
        }
      } catch {}

      // Sunucu in-memory deposundan senkronize et
      fetch(`/api/cart?userId=${encodeURIComponent(activeUser.id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.items)) {
            const cleaned = data.items.filter(
              (item: any) => item && item.id !== 'demo-item-1' && item.id !== 'demo-item-2'
            );
            if (!loadedFromSession || cleaned.length > 0) {
              setCartItems(cleaned);
              try {
                sessionStorage.setItem(SESSION_CART_STORAGE_KEY, JSON.stringify(cleaned));
              } catch {}
            }
          }
        })
        .catch(() => {});
    } else {
      // Kayıt olmayan (misafir) kullanıcı -> Yalnızca LocalStorage kullanılır
      try {
        const savedGuestCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (savedGuestCart) {
          const parsed = JSON.parse(savedGuestCart);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (item: any) => item && item.id !== 'demo-item-1' && item.id !== 'demo-item-2'
            );
            setCartItems(cleaned);
          }
        }
      } catch {}
    }

    // 3. Favorileri yükle
    try {
      const savedFavs = localStorage.getItem('safirya_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((id: string) => id !== 'demo-item-1');
          setFavorites(cleaned);
        }
      }
    } catch {}

    isLoadedRef.current = true;

    // 4. Kayıtlı kullanıcı tablosunu ilklendir (eğer boşsa)
    try {
      const storedUsers = localStorage.getItem('safirya_registered_users');
      if (!storedUsers) {
        localStorage.setItem(
          'safirya_registered_users',
          JSON.stringify(DEFAULT_REGISTERED_USERS)
        );
      }
    } catch {}

    // 5. Bildirimleri yükle
    try {
      const savedNotifs = localStorage.getItem('safirya_user_notifications');
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        // Varsayılan hoş geldin bildirimi
        const initialNotif: StoreNotification = {
          id: 'welcome-notif-1',
          title: '✨ Safirya Atölyesi’ne Hoş Geldiniz!',
          message:
            'Kadıköy atölyemizde özenle dökülen doğal soya mumları ve zanaatkar objelerimizi keşfedin.',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
          link: '/kategoriler',
        };
        const initialList = [initialNotif];
        localStorage.setItem('safirya_user_notifications', JSON.stringify(initialList));
        setNotifications(initialList);
      }
    } catch {}

    // 6. Custom event ile sekmeler veya admin paneli arası canlı bildirim dinleyicisi
    const handleNotificationsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<StoreNotification[]>;
      if (customEvent.detail) {
        setNotifications(customEvent.detail);
      } else {
        try {
          const fresh = localStorage.getItem('safirya_user_notifications');
          if (fresh) setNotifications(JSON.parse(fresh));
        } catch {}
      }
    };

    window.addEventListener('safirya_notifications_updated', handleNotificationsUpdated);
    return () => {
      window.removeEventListener('safirya_notifications_updated', handleNotificationsUpdated);
    };
  }, []);

  // Sepet güncellendiğinde senkronizasyon:
  // - Giriş Yapmış Kullanıcı: LocalStorage KESİNLİKLE KULLANILMAZ; sepet hafızada (sessionStorage & /api/cart) tutulur
  // - Kayıt Olmayan Misafir: Yalnızca LocalStorage kullanılır
  useEffect(() => {
    if (!isLoadedRef.current || typeof window === 'undefined') return;

    if (currentUser) {
      // Giriş yapılmışsa LocalStorage'ı temiz tut
      try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        localStorage.removeItem('safirya_cart_items');
      } catch {}

      // Hafızaya yaz (Oturum hafızası & Sunucu in-memory)
      try {
        sessionStorage.setItem(SESSION_CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch {}

      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, items: cartItems }),
      }).catch(() => {});
    } else {
      // Misafir: Yalnızca LocalStorage kullanılır
      try {
        localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch {}
    }
  }, [cartItems, currentUser]);

  // Favoriler güncellendiğinde LocalStorage'a kaydet
  useEffect(() => {
    if (!isLoadedRef.current || typeof window === 'undefined') return;
    try {
      localStorage.setItem('safirya_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

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
    if (typeof window !== 'undefined') {
      if (currentUser) {
        try {
          sessionStorage.removeItem(SESSION_CART_STORAGE_KEY);
        } catch {}
        fetch(`/api/cart?userId=${encodeURIComponent(currentUser.id)}`, {
          method: 'DELETE',
        }).catch(() => {});
      } else {
        try {
          localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          localStorage.removeItem('safirya_cart_items');
        } catch {}
      }
    }
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SAFIRYA10') {
      const coupon: AppliedCoupon = {
        code: 'SAFIRYA10',
        label: '%10 Tanışma İndirimi',
        discountType: 'percentage',
        discountValue: 10,
      };
      setAppliedCoupon(coupon);
      return { success: true, message: '🎉 %10 Tanışma İndirimi uygulandı!' };
    }
    if (cleanCode === 'ATOLYE25') {
      const coupon: AppliedCoupon = {
        code: 'ATOLYE25',
        label: '₺25 Atölye İndirimi',
        discountType: 'fixed',
        discountValue: 25,
      };
      setAppliedCoupon(coupon);
      return { success: true, message: '🎉 ₺25 Kupon İndirimi uygulandı!' };
    }
    return {
      success: false,
      message: 'Geçersiz kupon kodu. Lütfen kontrol ediniz (Örn: SAFIRYA10)',
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

  // ══════════════════════════════════════════════
  // KULLANICI GİRİŞ, KAYIT & ŞİFRE SIFIRLAMA
  // ══════════════════════════════════════════════

  const loginUser = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const stored = localStorage.getItem('safirya_registered_users');
      const users: Array<UserProfile & { passwordHash: string }> = stored
        ? JSON.parse(stored)
        : DEFAULT_REGISTERED_USERS;

      const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!matched) {
        return {
          success: false,
          error: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.',
        };
      }

      if (matched.passwordHash !== password) {
        return {
          success: false,
          error: 'Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyiniz.',
        };
      }

      const profile: UserProfile = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        phone: matched.phone,
        avatar: matched.avatar,
        isVerified: matched.isVerified,
        createdAt: matched.createdAt,
      };

      setCurrentUser(profile);
      localStorage.setItem('safirya_active_user', JSON.stringify(profile));
      setIsAuthModalOpen(false);

      // Misafir sepeti varsa kullanıcının hafızasına aktar ve localStorage'dan sil
      let newCart = [...cartItems];
      const guestCartRaw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      if (guestCartRaw) {
        try {
          const guestItems = JSON.parse(guestCartRaw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            newCart = mergeCartLists(newCart, guestItems);
          }
        } catch {}
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      }
      localStorage.removeItem('safirya_cart_items');

      // Sunucu in-memory deposundan da varsa sepeti al ve birleştir
      try {
        const res = await fetch(`/api/cart?userId=${encodeURIComponent(profile.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.items) && data.items.length > 0) {
            newCart = mergeCartLists(newCart, data.items);
          }
        }
      } catch {}

      setCartItems(newCart);
      try {
        sessionStorage.setItem(SESSION_CART_STORAGE_KEY, JSON.stringify(newCart));
      } catch {}
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, items: newCart }),
      }).catch(() => {});

      // Giriş yapınca karşılama bildirimi ekle
      addNotification({
        userEmail: profile.email,
        title: `👋 Hoş Geldiniz, ${profile.name}!`,
        message: 'Safirya hesabınıza başarıyla giriş yaptınız. Siparişlerinizi takip edebilirsiniz.',
        type: 'system',
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Giriş yapılamadı.' };
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. API ile doğrulama kodunu kontrol et
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code, type: 'register' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Girdiğiniz doğrulama kodu hatalı.' };
      }
    } catch {
      return { success: false, error: 'Doğrulama servisine ulaşılamadı. Lütfen tekrar deneyiniz.' };
    }

    try {
      const stored = localStorage.getItem('safirya_registered_users');
      const users: Array<UserProfile & { passwordHash: string }> = stored
        ? JSON.parse(stored)
        : DEFAULT_REGISTERED_USERS;

      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return {
          success: false,
          error: 'Bu e-posta adresiyle zaten kayıtlı bir hesap var. Giriş yapabilirsiniz.',
        };
      }

      const newUser: UserProfile & { passwordHash: string } = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        isVerified: true,
        createdAt: new Date().toISOString(),
        passwordHash: password,
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('safirya_registered_users', JSON.stringify(updatedUsers));

      const profile: UserProfile = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isVerified: true,
        createdAt: newUser.createdAt,
      };

      setCurrentUser(profile);
      localStorage.setItem('safirya_active_user', JSON.stringify(profile));
      setIsAuthModalOpen(false);

      // Misafir sepeti varsa kullanıcının hafızasına aktar ve localStorage'dan sil
      let newCart = [...cartItems];
      const guestCartRaw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      if (guestCartRaw) {
        try {
          const guestItems = JSON.parse(guestCartRaw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            newCart = mergeCartLists(newCart, guestItems);
          }
        } catch {}
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      }
      localStorage.removeItem('safirya_cart_items');

      setCartItems(newCart);
      try {
        sessionStorage.setItem(SESSION_CART_STORAGE_KEY, JSON.stringify(newCart));
      } catch {}
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, items: newCart }),
      }).catch(() => {});

      // Hoş geldin bildirimi
      addNotification({
        userEmail: profile.email,
        title: '🎉 Hesabınız Başarıyla Doğrulandı!',
        message: 'Safirya Atölyesi ailesine hoş geldiniz. İlk siparişinize özel SAFIRYA10 kuponunu kullanabilirsiniz.',
        type: 'system',
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Hesap oluşturulamadı.' };
    }
  };

  const resetPasswordUser = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. API ile doğrulama kodunu kontrol et
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code, type: 'reset_password' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Girdiğiniz sıfırlama kodu hatalı.' };
      }
    } catch {
      return { success: false, error: 'Doğrulama servisine ulaşılamadı. Lütfen tekrar deneyiniz.' };
    }

    try {
      const stored = localStorage.getItem('safirya_registered_users');
      const users: Array<UserProfile & { passwordHash: string }> = stored
        ? JSON.parse(stored)
        : DEFAULT_REGISTERED_USERS;

      const idx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      if (idx === -1) {
        return {
          success: false,
          error: 'Bu e-posta adresiyle ilişkili bir kullanıcı bulunamadı.',
        };
      }

      users[idx].passwordHash = newPassword;
      localStorage.setItem('safirya_registered_users', JSON.stringify(users));

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Şifre güncellenemedi.' };
    }
  };

  const logoutUser = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safirya_active_user');
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      localStorage.removeItem('safirya_cart_items');
      try {
        sessionStorage.removeItem(SESSION_CART_STORAGE_KEY);
      } catch {}
    }
    setCurrentUser(null);
    setCartItems([]);
  };

  // ══════════════════════════════════════════════
  // BİLDİRİM YÖNETİMİ
  // ══════════════════════════════════════════════

  const addNotification = (
    notif: Omit<StoreNotification, 'id' | 'createdAt' | 'isRead'>
  ): StoreNotification => {
    const newNotif: StoreNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 50);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('safirya_user_notifications', JSON.stringify(updated));
          window.dispatchEvent(
            new CustomEvent('safirya_notifications_updated', { detail: updated })
          );
        } catch {}
      }
      return updated;
    });

    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('safirya_user_notifications', JSON.stringify(updated));
          window.dispatchEvent(
            new CustomEvent('safirya_notifications_updated', { detail: updated })
          );
        } catch {}
      }
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('safirya_user_notifications', JSON.stringify(updated));
          window.dispatchEvent(
            new CustomEvent('safirya_notifications_updated', { detail: updated })
          );
        } catch {}
      }
      return updated;
    });
  };

  // Kullanıcıya özel filtrelenmiş okunmamış bildirim sayısı
  const visibleNotifications = notifications.filter((n) => {
    if (!currentUser) return false;
    if (!n.userEmail) return true; // Genel duyuru/bildirim
    return n.userEmail.toLowerCase() === currentUser.email.toLowerCase();
  });

  const unreadNotificationsCount = visibleNotifications.filter((n) => !n.isRead).length;

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

        // Kullanıcı Auth
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalView,
        setAuthModalView,
        loginUser,
        registerUser,
        resetPasswordUser,
        logoutUser,

        // Bildirimler
        notifications: visibleNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
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
