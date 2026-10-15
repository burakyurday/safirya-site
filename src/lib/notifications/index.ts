import { sendStageNotificationEmail, StageEmailPayload } from './email';
import { sendWhatsAppStageNotification, WhatsAppNotificationPayload } from './whatsapp';
import { AdminSettings, WebhookDeliveryLog } from '@/types/admin';
import { dispatchWebhookEvent } from '@/lib/webhooks';

export interface DispatchStageNotificationParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  stageName: string;
  photoUrl?: string;
  caption?: string;
  trackingUrl?: string;
  settings?: AdminSettings;
}

export interface DispatchResult {
  email: {
    success: boolean;
    message: string;
    simulated: boolean;
  };
  whatsapp: {
    success: boolean;
    message: string;
    simulated: boolean;
  };
  webhook?: WebhookDeliveryLog;
}

export async function dispatchStageNotification({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  stageName,
  photoUrl,
  caption,
  trackingUrl,
  settings,
}: DispatchStageNotificationParams): Promise<DispatchResult> {
  const safeTrackingUrl =
    trackingUrl ||
    `https://safirya.tr/siparis-takip?orderNumber=${encodeURIComponent(orderNumber)}${customerEmail ? `&email=${encodeURIComponent(customerEmail)}` : ''}`;

  // 1. E-Posta Gönderimi
  const emailPayload: StageEmailPayload = {
    to: customerEmail,
    customerName,
    orderNumber,
    stageName,
    photoUrl,
    caption,
    trackingUrl: safeTrackingUrl,
    settings,
  };

  const emailResult = await sendStageNotificationEmail(emailPayload);

  // 2. WhatsApp Gönderimi (Eğer telefon varsa)
  let whatsappResult = {
    success: true,
    message: 'Telefon numarası bulunmadığı için WhatsApp bildirimi atlandı.',
    simulated: true,
  };

  if (customerPhone) {
    const whatsappPayload: WhatsAppNotificationPayload = {
      toPhone: customerPhone,
      customerName,
      orderNumber,
      stageName,
      photoUrl,
      trackingUrl: safeTrackingUrl,
      config: {
        enabled: settings?.whatsappNotificationsEnabled ?? false,
        phoneId: settings?.whatsappPhoneNumberId || settings?.whatsappPhoneId,
        accessToken: settings?.whatsappAccessToken,
        templateName: settings?.whatsappTemplateName,
      },
    };

    whatsappResult = await sendWhatsAppStageNotification(whatsappPayload);
  }

  // 3. Webhook Gönderimi (Fotoğraflı Aşama Güncellemesi)
  let webhookResult: WebhookDeliveryLog | undefined = undefined;
  if (settings?.webhookEnabled && settings?.webhookUrl) {
    try {
      webhookResult = await dispatchWebhookEvent(settings, {
        event: 'order.photo_uploaded',
        timestamp: new Date().toISOString(),
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        data: {
          stageName,
          photoUrl,
          caption,
          trackingUrl: safeTrackingUrl,
        },
      });
    } catch (whErr) {
      console.warn('Webhook dispatch error:', whErr);
    }
  }

  return {
    email: emailResult,
    whatsapp: whatsappResult,
    webhook: webhookResult,
  };
}
