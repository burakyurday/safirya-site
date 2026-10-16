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
    const baseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/notifications/stage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber: payload.orderNumber, customerName: payload.customerName, customerEmail: payload.to, stageName: payload.stageName, photoUrl: payload.photoUrl, caption: payload.caption, settings: payload.settings }) });
    if (res.ok) { const data = await res.json(); return { success: data.success ?? true, message: data.message || 'E-posta bildirimi iletildi.', simulated: data.simulated ?? false }; }
  } catch (err: unknown) { console.warn('[Safirya Bildirim Servisi] API çağrısı simülasyona yönlendirildi:', err); }
  return { success: true, message: `${payload.to} adresine e-posta bildirimi iletildi (Simülasyon).`, simulated: true };
}
