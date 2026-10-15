export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'order_stage'
  | 'order_created'
  | 'promo'
  | 'system';

export interface StoreNotification {
  id: string;
  userId?: string;
  userEmail?: string;
  title: string;
  message: string;
  orderNumber?: string;
  stageName?: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  // Sipariş Hareketleri Tetikleyicileri
  notifyOnOrderReceived: boolean;
  notifyOnOrderProduction: boolean;
  notifyOnOrderQuality: boolean;
  notifyOnOrderShipped: boolean;
  notifyOnOrderDelivered: boolean;

  // Gönderim Kanalları
  channelSite: boolean;
  channelEmail: boolean;
  channelWhatsapp: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  notifyOnOrderReceived: true,
  notifyOnOrderProduction: true,
  notifyOnOrderQuality: true,
  notifyOnOrderShipped: true,
  notifyOnOrderDelivered: true,
  channelSite: true,
  channelEmail: true,
  channelWhatsapp: false,
};
