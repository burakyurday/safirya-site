import { AdminSettings, WebhookDeliveryLog } from '@/types/admin';

export interface WebhookEventPayload {
  event: 'order.stage_changed' | 'order.photo_uploaded' | 'order.contract_signed' | 'order.created' | 'mold.critical_wear';
  timestamp: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  data: Record<string, any>;
}

/**
 * Gönderilecek JSON'u Discord veya Slack formatına adapte eder (eğer webhook URL'si discord/slack ise)
 */
function formatForDiscordOrSlack(url: string, payload: WebhookEventPayload) {
  const isDiscord = url.includes('discord.com/api/webhooks');
  const isSlack = url.includes('hooks.slack.com');

  if (isDiscord) {
    let title = `🔔 Safirya Atölye Bildirimi: ${payload.event}`;
    let description = '';
    let color = 14248743; // #D96B27 (Safirya Kehribar)

    if (payload.event === 'order.stage_changed') {
      title = `📦 Sipariş Aşaması Güncellendi: #${payload.orderNumber}`;
      description = `**Müşteri:** ${payload.customerName}\n**Yeni Aşama:** ${payload.data.newStageName || payload.data.stage}\n**Ürünler:** ${payload.data.itemSummary || '-'}`;
      color = 3066993; // Yeşil
    } else if (payload.event === 'order.photo_uploaded') {
      title = `📸 Atölyeden Canlı Aşama Fotoğrafı Eklendi: #${payload.orderNumber}`;
      description = `**Aşama:** ${payload.data.stageName}\n**Not:** ${payload.data.caption || 'Fotoğraf yüklendi.'}\n[Siparişi Takip Et](${payload.data.trackingUrl || '#'})`;
      color = 16744231; // Turuncu
    } else if (payload.event === 'order.contract_signed') {
      title = `✍️ Özel Üretim Sözleşmesi İmzalandı: #${payload.orderNumber}`;
      description = `**Müşteri:** ${payload.customerName}\n**Onay Kodu:** ${payload.data.verificationCode}\n**Baskı Metni:** "${payload.data.customText}"`;
      color = 2067276; // Safir Mavi
    }

    const embed: Record<string, any> = {
      title,
      description,
      color,
      timestamp: payload.timestamp,
      footer: { text: 'Safirya Atölye ERP & Webhook Sistemi' },
    };

    if (payload.data.photoUrl) {
      embed.image = { url: payload.data.photoUrl };
    }

    return {
      content: `Atölye üretim bandında yeni hareket: **${payload.orderNumber || ''}**`,
      embeds: [embed],
    };
  }

  if (isSlack) {
    return {
      text: `*Safirya Atölye Olayı:* \`${payload.event}\` - Sipariş: *#${payload.orderNumber}* (${payload.customerName})\n>${payload.data.caption || payload.data.newStageName || ''}`,
    };
  }

  // Standart Generic Webhook JSON
  return payload;
}

/**
 * Webhook tetikleme fonksiyonu
 */
export async function dispatchWebhookEvent(
  settings: AdminSettings | undefined,
  payload: WebhookEventPayload
): Promise<WebhookDeliveryLog> {
  const logId = `wh-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const endpoint = settings?.webhookUrl?.trim() || '';

  const initialLog: WebhookDeliveryLog = {
    id: logId,
    event: payload.event,
    orderNumber: payload.orderNumber || 'GENEL',
    endpointUrl: endpoint || 'TANIMLANMAMIŞ',
    status: 'FAILED',
    payloadPreview: JSON.stringify(payload).substring(0, 300),
    attemptCount: 1,
    sentAt: new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };

  if (!settings?.webhookEnabled || !endpoint) {
    initialLog.responseMessage = 'Webhook devre dışı veya endpoint URL tanımlanmamış.';
    return initialLog;
  }

  // Event abone kontrolü
  const subscribed = settings.webhookEvents || ['order.stage_changed', 'order.photo_uploaded', 'order.contract_signed'];
  if (!subscribed.includes(payload.event)) {
    initialLog.responseMessage = `Bu olay ('${payload.event}') webhook abonelik listesinde bulunmuyor.`;
    return initialLog;
  }

  try {
    const formattedBody = formatForDiscordOrSlack(endpoint, payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Safirya-Webhook-Agent/1.0',
    };

    if (settings.webhookSecret) {
      headers['X-Safirya-Signature'] = `sha256=${Buffer.from(settings.webhookSecret + payload.timestamp).toString('base64').substring(0, 32)}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    initialLog.statusCode = res.status;
    if (res.ok) {
      initialLog.status = 'SUCCESS';
      initialLog.responseMessage = `Başarıyla iletildi (${res.status} ${res.statusText})`;
    } else {
      initialLog.status = 'FAILED';
      initialLog.responseMessage = `Hedef sunucu hata döndü: ${res.status} ${res.statusText}`;
    }
  } catch (err: any) {
    initialLog.status = 'FAILED';
    initialLog.responseMessage = err?.name === 'AbortError' ? 'Zaman aşımı (Timeout 6s)' : (err?.message || 'Ağ hatası oluştu');
  }

  return initialLog;
}
