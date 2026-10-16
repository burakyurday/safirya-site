import { EMAIL_BRAND, emailPreheader, escapeHtml } from '@/lib/email/brand';

export interface StageEmailPayload { to: string; customerName: string; orderNumber: string; stageName: string; photoUrl?: string; caption?: string; trackingUrl?: string; settings?: unknown; }
export interface EmailDispatchResult { success: boolean; message: string; simulated: boolean; previewUrl?: string; }

export function generateSafiryaEmailHtml({ customerName, orderNumber, stageName, photoUrl, caption, trackingUrl, to }: StageEmailPayload): string {
  const currentYear = new Date().getFullYear();
  const safeTrackingUrl = trackingUrl || `https://safirya.tr/siparis-takip?orderNumber=${encodeURIComponent(orderNumber)}${to ? `&email=${encodeURIComponent(to)}` : ''}`;
  const safeName = escapeHtml(customerName);
  const safeOrder = escapeHtml(orderNumber);
  const safeStage = escapeHtml(stageName);
  const photo = photoUrl ? `<tr><td style="padding-top:26px;"><div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${EMAIL_BRAND.muted};font-weight:bold;margin-bottom:10px;">ATÖLYEDEN CANLI KARE</div><img src="${escapeHtml(photoUrl)}" alt="${safeStage}" style="width:100%;height:auto;max-height:330px;object-fit:cover;display:block;border-radius:14px;border:1px solid ${EMAIL_BRAND.line};" /></td></tr>` : '';
  const note = caption ? `<div style="font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};font-style:italic;margin-top:10px;">“${escapeHtml(caption)}”</div>` : '';

  return `<!doctype html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Siparişinizin yeni aşaması · ${safeOrder}</title></head><body style="margin:0;padding:0;background:${EMAIL_BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${EMAIL_BRAND.ink};">${emailPreheader(`${stageName} · #${orderNumber}`)}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_BRAND.cream};padding:28px 12px 40px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:${EMAIL_BRAND.paper};border:1px solid ${EMAIL_BRAND.line};border-radius:22px;overflow:hidden;"><tr><td style="background:${EMAIL_BRAND.navy};padding:29px 36px;text-align:center;"><div style="font-family:Georgia,serif;color:#fff;font-size:27px;letter-spacing:5px;font-weight:bold;">SAFİRYA</div><div style="margin-top:8px;color:#E9B69C;font-size:10px;letter-spacing:2px;font-weight:bold;text-transform:uppercase;">El yapımı tasarım atölyesi</div></td></tr>
<tr><td style="padding:40px 44px 38px;"><div style="font-size:10px;color:${EMAIL_BRAND.terracotta};font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:14px;">ATÖLYE GÜNCELLEMESİ</div><h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.2;font-weight:normal;color:${EMAIL_BRAND.navy};margin:0 0 16px;">Siparişiniz ilerliyor.</h1><p style="font-size:15px;line-height:1.7;color:${EMAIL_BRAND.muted};margin:0;">Merhaba ${safeName}, <strong style="color:${EMAIL_BRAND.navy};">#${safeOrder}</strong> numaralı siparişiniz ustalarımızın ellerinde özenle hazırlanıyor.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;background:${EMAIL_BRAND.terracottaSoft};border:1px solid #EFCFBE;border-radius:16px;"><tr><td style="padding:22px 24px;border-left:4px solid ${EMAIL_BRAND.terracotta};"><div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${EMAIL_BRAND.terracotta};font-weight:bold;">MEVCUT AŞAMA</div><div style="font-family:Georgia,serif;font-size:23px;color:${EMAIL_BRAND.navy};margin-top:8px;">${safeStage}</div>${note}</td></tr></table>${photo}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:30px;"><tr><td align="center"><a href="${escapeHtml(safeTrackingUrl)}" target="_blank" style="display:inline-block;background:${EMAIL_BRAND.terracotta};color:#fff;text-decoration:none;border-radius:10px;padding:16px 28px;font-size:13px;font-weight:bold;letter-spacing:.4px;">SİPARİŞİMİ TAKİP ET&nbsp; →</a></td></tr></table><div style="font-size:11px;color:#8A93A3;text-align:center;margin-top:11px;">Üretim geçmişinizi ve kargo durumunuzu tek ekranda görün.</div>
</td></tr><tr><td style="border-top:1px solid ${EMAIL_BRAND.line};background:${EMAIL_BRAND.cream};padding:24px 36px;text-align:center;"><div style="font-size:12px;color:${EMAIL_BRAND.navy};font-weight:bold;">Safirya Zanaat &amp; Tasarım Atölyesi</div><div style="font-size:11px;color:${EMAIL_BRAND.muted};margin-top:7px;">İzmir / Karşıyaka (Online Zanaat Atölyesi)</div><div style="font-size:10px;color:#9AA2AE;margin-top:13px;">WhatsApp +90 (532) 555 7234 · destek@safirya.tr · © ${currentYear}</div></td></tr></table></td></tr></table></body></html>`;
}

export async function sendStageNotificationEmail(payload: StageEmailPayload): Promise<EmailDispatchResult> {
  try {
    // 1. Sunucu tarafındaysak (SSR, API route, Server Action): Kendi kendimize HTTP fetch atmayıp doğrudan gönderelim!
    if (typeof window === 'undefined') {
      const { sendEmail } = await import('@/lib/email/sender');
      const htmlContent = generateSafiryaEmailHtml({
        to: payload.to,
        customerName: payload.customerName || 'Değerli Müşterimiz',
        orderNumber: payload.orderNumber,
        stageName: payload.stageName || 'Üretim Aşaması',
        photoUrl: payload.photoUrl,
        caption: payload.caption,
        trackingUrl: payload.trackingUrl,
      });

      const s = (payload.settings as any) || {};
      const result = await sendEmail({
        to: payload.to,
        subject: `🎨 Siparişiniz ${payload.stageName} Aşamasında! (#${payload.orderNumber}) - Safirya Atölyesi`,
        html: htmlContent,
        from: s?.smtpFrom || process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>',
        apiKey: s?.smtpPass || process.env.RESEND_API_KEY || process.env.SMTP_PASS,
        smtpSettings: {
          host: s?.smtpHost || process.env.SMTP_HOST || 'smtp.resend.com',
          port: Number(s?.smtpPort || process.env.SMTP_PORT || 465),
          user: s?.smtpUser || process.env.SMTP_USER || 'resend',
          pass: s?.smtpPass || process.env.SMTP_PASS || process.env.RESEND_API_KEY,
        },
      });

      return {
        success: result.success,
        message: result.success
          ? `E-posta ${result.provider === 'resend' ? 'Resend' : 'SMTP'} üzerinden iletildi (${result.messageId || ''})`
          : result.error || 'Aşama e-postası iletilemedi.',
        simulated: false,
      };
    }

    // 2. Tarayıcı tarafındaysak (Client Component): /api/notifications/stage endpoint'ine yetkili çerezlerle gönder
    const res = await fetch('/api/notifications/stage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        orderNumber: payload.orderNumber,
        customerName: payload.customerName,
        customerEmail: payload.to,
        stageName: payload.stageName,
        photoUrl: payload.photoUrl,
        caption: payload.caption,
        settings: payload.settings,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success !== false) {
      return {
        success: true,
        message: data.message || 'E-posta bildirimi iletildi.',
        simulated: data.simulated ?? false,
      };
    }
    return {
      success: false,
      message: data.error || `E-posta gönderilemedi (${res.status})`,
      simulated: false,
    };
  } catch (err: unknown) {
    console.warn('[Safirya Bildirim Servisi] Aşama bildirimi gönderim hatası:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Bağlantı hatası',
      simulated: false,
    };
  }
}
