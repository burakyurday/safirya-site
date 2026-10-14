import { sendStageNotificationEmail, StageEmailPayload } from './email';
import { sendWhatsAppStageNotification, WhatsAppNotificationPayload } from './whatsapp';
import { AdminSettings } from '@/types/admin';

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
    trackingUrl || `https://safirya.tr/siparis-takip?orderNumber=${orderNumber}`;

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

  return {
    email: emailResult,
    whatsapp: whatsappResult,
  };
}
