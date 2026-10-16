import nodemailer from 'nodemailer';

export const DEFAULT_FROM_ADDRESS = 'Safirya Atölyesi <bildirim@safirya.tr>';
export const DEFAULT_REPLY_TO = 'destek@safirya.tr';

/**
 * Resend API anahtarını güvenli şekilde çözer:
 * 1. Fonksiyona parametre / istek gövdesinde verilen anahtar
 * 2. process.env.RESEND_API_KEY
 * 3. process.env.SMTP_PASS (re_ ile başlıyorsa)
 */
export function getResendApiKey(overrideKey?: string): string {
  if (overrideKey && overrideKey.trim().startsWith('re_')) {
    return overrideKey.trim();
  }
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    return process.env.RESEND_API_KEY.trim();
  }
  if (process.env.SMTP_PASS && process.env.SMTP_PASS.trim().startsWith('re_')) {
    return process.env.SMTP_PASS.trim();
  }
  return '';
}

/**
 * Gönderici (From) adresini temizler ve Resend için doğrulanmış domain (@safirya.tr) kuralına uygun hale getirir.
 * Eğer panelde veya ayarlarda yanlışlıkla .com girilmişse otomatik olarak .tr alan adına dönüştürür.
 */
export function sanitizeSenderAddress(rawFrom?: string, defaultName = 'Safirya Atölyesi'): string {
  if (!rawFrom || !rawFrom.trim()) {
    return `"${defaultName}" <bildirim@safirya.tr>`;
  }

  let cleaned = rawFrom.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

  // safirya.com girilmişse doğrulanmış olan safirya.tr'ye düzelt
  if (cleaned.toLowerCase().includes('@safirya.com')) {
    cleaned = cleaned.replace(/@safirya\.com/gi, '@safirya.tr');
  }

  // Eğer adres sadece isimse veya e-posta içermiyorsa
  if (!cleaned.includes('@')) {
    return `"${cleaned}" <bildirim@safirya.tr>`;
  }

  // Eğer isim kısmı tırnaksızsa ve boşluk içeriyorsa Resend RFC standartları için düzenle
  const emailMatch = cleaned.match(/<([^>]+)>/);
  if (emailMatch) {
    const emailOnly = emailMatch[1].trim();
    let namePart = cleaned.replace(emailMatch[0], '').trim();
    namePart = namePart.replace(/^["']|["']$/g, '');
    const finalName = namePart || defaultName;
    return `"${finalName}" <${emailOnly}>`;
  }

  // Sadece email girildiyse (örn: bildirim@safirya.tr)
  return `"${defaultName}" <${cleaned}>`;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  senderName?: string;
  apiKey?: string;
  smtpSettings?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
  };
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: 'resend' | 'smtp' | 'none';
  error?: string;
  simulated?: boolean;
}

/**
 * Merkezi e-posta gönderim servisi.
 * Resend REST API önceliklidir; başarısızlık durumunda yapılandırılmışsa özel SMTP'ye geçer.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const {
    to,
    subject,
    html,
    text,
    from,
    replyTo = DEFAULT_REPLY_TO,
    senderName = 'Safirya Atölyesi',
    apiKey,
    smtpSettings,
  } = options;

  const cleanFrom = sanitizeSenderAddress(from, senderName);
  const activeApiKey = getResendApiKey(apiKey || smtpSettings?.pass);

  // 1. Resend REST API ile Doğrudan Gönderim
  if (activeApiKey) {
    try {
      const payload: Record<string, any> = {
        from: cleanFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      };

      if (text) {
        payload.text = text;
      }
      if (replyTo) {
        payload.reply_to = replyTo;
      }

      console.log(`[Safirya Mail] Resend üzerinden gönderiliyor: ${cleanFrom} -> ${Array.isArray(to) ? to.join(', ') : to} ("${subject}")`);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data?.id) {
        console.log(`[Safirya Mail] Başarıyla gönderildi. MessageId: ${data.id}`);
        return {
          success: true,
          messageId: data.id,
          provider: 'resend',
          simulated: false,
        };
      }

      const resendError = data?.message || res.statusText || 'Resend bilinmeyen hata';
      console.warn(`[Safirya Mail] Resend API Hatası (${res.status}):`, resendError);

      // Eğer hata domain kaynaklıysa veya kullanıcı adı formatındaysa varsayılan safirya.tr ile son bir deneme yap
      if (
        !cleanFrom.includes('bildirim@safirya.tr') &&
        (resendError.toLowerCase().includes('domain') ||
          resendError.toLowerCase().includes('verified') ||
          res.status === 403)
      ) {
        console.log('[Safirya Mail] Doğrulanmış varsayılan adres (bildirim@safirya.tr) ile yeniden deneniyor...');
        payload.from = `"${senderName}" <bildirim@safirya.tr>`;
        const retryRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const retryData = await retryRes.json();
        if (retryRes.ok && retryData?.id) {
          console.log(`[Safirya Mail] İkinci denemede başarıyla gönderildi. MessageId: ${retryData.id}`);
          return {
            success: true,
            messageId: retryData.id,
            provider: 'resend',
            simulated: false,
          };
        }
      }

      // Resend REST API başarısız olduysa veya alan adı hatası alındıysa
      // Eğer özel SMTP veya Resend SMTP (smtp.resend.com) tanımlıysa yedek olarak dene!
      const fallbackHost = smtpSettings?.host || process.env.SMTP_HOST;
      const fallbackUser = smtpSettings?.user || process.env.SMTP_USER;
      const fallbackPass = smtpSettings?.pass || process.env.SMTP_PASS || activeApiKey;

      if (!fallbackHost || !fallbackUser || !fallbackPass) {
        return {
          success: false,
          error: `Resend API Hatası: ${resendError}`,
          provider: 'resend',
        };
      }
      console.warn(`[Safirya Mail] Resend REST API başarısız (${resendError}). SMTP üzerinden deneniyor...`);
    } catch (err: any) {
      console.error('[Safirya Mail] Resend REST istek hatası:', err.message);
      const fallbackHost = smtpSettings?.host || process.env.SMTP_HOST;
      if (!fallbackHost) {
        return {
          success: false,
          error: `Bağlantı hatası: ${err.message}`,
          provider: 'resend',
        };
      }
      console.warn(`[Safirya Mail] Resend REST istisnası (${err.message}). SMTP üzerinden deneniyor...`);
    }
  }

  // 2. Özel SMTP / Resend SMTP (Nodemailer) Gönderimi (Yedek veya Doğrudan)
  const host = smtpSettings?.host || process.env.SMTP_HOST || 'smtp.resend.com';
  const user = smtpSettings?.user || process.env.SMTP_USER || 'resend';
  const pass = smtpSettings?.pass || process.env.SMTP_PASS || activeApiKey;
  const port = Number(smtpSettings?.port || process.env.SMTP_PORT || 465);

  if (host && user && pass) {
    try {
      console.log(`[Safirya Mail] SMTP üzerinden deneniyor: ${host}:${port} (${user})`);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from: cleanFrom,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text,
        replyTo,
      });

      console.log(`[Safirya Mail] SMTP ile başarıyla iletildi: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        provider: 'smtp',
        simulated: false,
      };
    } catch (smtpErr: any) {
      console.error('[Safirya Mail] SMTP Hatası:', smtpErr.message);
      return {
        success: false,
        error: `SMTP Gönderim Hatası: ${smtpErr.message}`,
        provider: 'smtp',
      };
    }
  }

  return {
    success: false,
    error: 'E-posta servisi yapılandırılamadı. Lütfen SMTP veya Resend API anahtarlarını kontrol ediniz.',
    provider: 'none',
  };
}

/**
 * Resend API bağlantı durumunu ve doğrulanmış alan adlarını kontrol eder.
 */
export async function testResendConnection(apiKey?: string): Promise<{
  connected: boolean;
  domains: Array<{ name: string; status: string }>;
  error?: string;
}> {
  const key = getResendApiKey(apiKey);
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        connected: false,
        domains: [],
        error: data.message || `Resend HTTP ${res.status}`,
      };
    }
    const data = await res.json();
    return {
      connected: true,
      domains: (data.data || []).map((d: any) => ({ name: d.name, status: d.status })),
    };
  } catch (err: any) {
    return {
      connected: false,
      domains: [],
      error: err.message || 'Bağlantı kurulamadı',
    };
  }
}
