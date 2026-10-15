import { OrderStage, AdminOrder, AdminSettings } from '@/types/admin';
import { StoreNotification } from '@/types/user';
import { dispatchStageNotification } from './index';

export const STAGE_META: Record<
  OrderStage,
  {
    title: string;
    message: (orderNumber: string) => string;
    settingKey: keyof AdminSettings;
  }
> = {
  SIPARIS_ALINDI: {
    title: 'Siparişiniz Başarıyla Alındı',
    message: (orderNumber) =>
      `#${orderNumber} numaralı siparişiniz onaylandı ve atölye üretim kuyruğuna eklendi.`,
    settingKey: 'notifyOnOrderReceived',
  },
  ATOLYEDE_URETIMDE: {
    title: 'Siparişiniz Atölyede Üretimde',
    message: (orderNumber) =>
      `#${orderNumber} numaralı el yapımı tasarımınız ustalarımızın ellerinde özenle şekillenmeye başladı.`,
    settingKey: 'notifyOnOrderProduction',
  },
  KALITE_KONTROL_PAKETLEME: {
    title: 'Kalite Kontrol ve Paketleme Aşamasında',
    message: (orderNumber) =>
      `#${orderNumber} numaralı siparişinizin atölye üretimi tamamlandı, korumalı ambalajıyla paketleniyor.`,
    settingKey: 'notifyOnOrderQuality',
  },
  KARGOYA_VERILDI: {
    title: 'Siparişiniz Kargoya Verildi',
    message: (orderNumber) =>
      `#${orderNumber} numaralı siparişiniz kargo firmasına teslim edildi ve yola çıktı.`,
    settingKey: 'notifyOnOrderShipped',
  },
  TESLIM_EDILDI: {
    title: 'Siparişiniz Teslim Edildi',
    message: (orderNumber) =>
      `#${orderNumber} numaralı siparişiniz teslim edildi. Güzel günlerde kullanmanızı dileriz!`,
    settingKey: 'notifyOnOrderDelivered',
  },
};

/**
 * Tarayıcıda saklanan site bildirimlerine yeni bir bildirim ekler ve dinleyicileri uyarır
 */
export function addSiteNotification(notification: Omit<StoreNotification, 'id' | 'createdAt' | 'isRead'>): StoreNotification {
  const newNotif: StoreNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('safirya_user_notifications');
      const list: StoreNotification[] = stored ? JSON.parse(stored) : [];
      const updated = [newNotif, ...list].slice(0, 50); // Son 50 bildirim
      localStorage.setItem('safirya_user_notifications', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('safirya_notifications_updated', { detail: updated }));
    } catch (e) {
      console.warn('Site bildirimi kaydedilemedi:', e);
    }
  }

  return newNotif;
}

/**
 * Sipariş aşama değişikliğinde bildirim ayarlarını kontrol ederek
 * hem site içine hem e-posta ile bildirim gönderir.
 */
export async function triggerOrderStageNotification({
  order,
  newStage,
  settings,
  photoUrl,
  caption,
}: {
  order: AdminOrder;
  newStage: OrderStage;
  settings: AdminSettings;
  photoUrl?: string;
  caption?: string;
}): Promise<{ siteNotified: boolean; emailSent: boolean }> {
  const meta = STAGE_META[newStage];
  if (!meta) return { siteNotified: false, emailSent: false };

  // Yönetim panelindeki ilgili aşama ayarı kontrolü
  const isStageEnabled = settings[meta.settingKey] ?? true;
  if (!isStageEnabled) {
    console.log(`[Safirya Bildirim] ${newStage} aşaması için bildirim ayarı kapalı.`);
    return { siteNotified: false, emailSent: false };
  }

  let siteNotified = false;
  let emailSent = false;

  // 1. Site içi Kullanıcı Bildirimi (Çan Simgesi)
  const isSiteChannelEnabled = settings.notifyChannelSite ?? true;
  if (isSiteChannelEnabled) {
    addSiteNotification({
      userEmail: order.customerEmail,
      orderNumber: order.orderNumber,
      stageName: meta.title,
      title: `🎨 ${meta.title}`,
      message: caption ? `${meta.message(order.orderNumber)} Not: "${caption}"` : meta.message(order.orderNumber),
      type: 'order_stage',
      link: `/siparis-takip?orderNumber=${order.orderNumber}`,
    });
    siteNotified = true;
  }

  // 2. Müşteriye E-Posta Gönderimi
  const isEmailChannelEnabled = settings.notifyChannelEmail ?? true;
  if (isEmailChannelEnabled && order.customerEmail) {
    try {
      await dispatchStageNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        stageName: meta.title,
        photoUrl,
        caption,
        trackingUrl: `https://safirya.tr/siparis-takip?orderNumber=${order.orderNumber}`,
        settings,
      });
      emailSent = true;
    } catch (err) {
      console.error('[Safirya Bildirim] E-posta gönderim hatası:', err);
    }
  }

  return { siteNotified, emailSent };
}
