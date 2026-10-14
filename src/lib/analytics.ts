export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Global window.gtag tanımlaması
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Sayfa görüntüleme takibi
export const pageview = (url: string) => {
  if (typeof window === 'undefined') return;

  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Safirya Analytics] PageView: ${url}`);
  }
};

// Genel etkinlik takibi
export const trackEvent = (action: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('event', action, params);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Safirya Analytics] Event: ${action}`, params);
  }
};

// Sepete Ekle Etkinliği
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}) => {
  trackEvent('add_to_cart', {
    currency: 'TRY',
    value: product.price * (product.quantity || 1),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
        item_category: product.category,
      },
    ],
  });
};

// Satın Alma (Purchase) Etkinliği
export const trackPurchase = (order: {
  orderNumber: string;
  totalAmount: number;
  shipping?: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  trackEvent('purchase', {
    transaction_id: order.orderNumber,
    value: order.totalAmount,
    currency: 'TRY',
    shipping: order.shipping || 0,
    items: order.items.map((item) => ({
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};
