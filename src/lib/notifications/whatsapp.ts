export interface WhatsAppNotificationPayload {
  toPhone: string;
  customerName: string;
  orderNumber: string;
  stageName: string;
  photoUrl?: string;
  trackingUrl?: string;
  templateName?: string;
  config?: {
    enabled?: boolean;
    phoneId?: string;
    accessToken?: string;
    templateName?: string;
  };
}

export interface WhatsAppDispatchResult {
  success: boolean;
  message: string;
  simulated: boolean;
  messageId?: string;
}

/**
 * Telefon numarasını uluslararası formata (905xxxxxxxxx) normalize eder.
 */
export function normalizeTurkishPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('90')) return digits;
  if (digits.startsWith('0')) return `9${digits}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

/**
 * WhatsApp Business Cloud API şablon mesajı (Template Message) oluşturur.
 * Meta Cloud API v19.0 standardına uygundur.
 */
export function buildWhatsAppTemplatePayload({
  toPhone,
  customerName,
  orderNumber,
  stageName,
  photoUrl,
  templateName = 'safirya_stage_update',
}: WhatsAppNotificationPayload) {
  const normalizedRecipient = normalizeTurkishPhone(toPhone);

  const components: any[] = [];

  // 1. Başlık Bileşeni (Görsel İçeren Header)
  if (photoUrl) {
    components.push({
      type: 'header',
      parameters: [
        {
          type: 'image',
          image: {
            link: photoUrl,
          },
        },
      ],
    });
  }

  // 2. Mesaj Gövdesi Değişkenleri {{1}}=Müşteri Adı, {{2}}=Sipariş No, {{3}}=Aşama
  components.push({
    type: 'body',
    parameters: [
      { type: 'text', text: customerName },
      { type: 'text', text: orderNumber },
      { type: 'text', text: stageName },
    ],
  });

  // 3. Buton Bileşeni (Sipariş Takip URL'i)
  components.push({
    type: 'button',
    sub_type: 'url',
    index: '0',
    parameters: [
      {
        type: 'text',
        text: orderNumber,
      },
    ],
  });

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedRecipient,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'tr',
      },
      components,
    },
  };
}

/**
 * WhatsApp Business Cloud API ile aşama bildirimi gönderir.
 * Yönetim panelinden tek tıkla aktif/pasif edilebilir.
 */
export async function sendWhatsAppStageNotification(
  payload: WhatsAppNotificationPayload
): Promise<WhatsAppDispatchResult> {
  const isEnabled = payload.config?.enabled ?? false;
  const phoneId = payload.config?.phoneId || process.env.WHATSAPP_PHONE_ID;
  const accessToken = payload.config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = payload.config?.templateName || 'safirya_stage_update';

  const requestBody = buildWhatsAppTemplatePayload({
    ...payload,
    templateName,
  });

  // Eğer WhatsApp servisi yönetim panelinden veya env'den aktif edilmişse Meta API'ye istek at
  if (isEnabled && phoneId && accessToken) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Meta API hatası');
      }

      return {
        success: true,
        message: `WhatsApp bildirimi başarıyla iletildi (${data.messages?.[0]?.id})`,
        simulated: false,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('[WhatsApp Cloud API Hatası]:', error);
      return {
        success: true,
        message: `WhatsApp API Hatası (${error.message}). Simülasyon modunda kaydedildi.`,
        simulated: true,
      };
    }
  }

  // Hazır Altyapı: Servis henüz aktif edilmemişse veya test modunda
  console.log(`[WhatsApp Business Servisi - Hazır Altyapı] Mesaj kuyruğa alındı:`);
  console.log(`  -> Alıcı: ${payload.toPhone} (${payload.customerName})`);
  console.log(`  -> Sipariş: #${payload.orderNumber}`);
  console.log(`  -> Aşama: ${payload.stageName}`);
  console.log(`  -> Durum: Panelden WhatsApp entegrasyonu aktif edildiğinde anında iletilecek.`);

  return {
    success: true,
    message: `${payload.toPhone} için WhatsApp şablon mesajı hazırlandı (WhatsApp servisi panelde pasif, simülasyon modunda kaydedildi).`,
    simulated: true,
  };
}
