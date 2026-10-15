import { EMAIL_BRAND, emailPreheader, escapeHtml } from '@/lib/email/brand';

export function generateAuthVerificationEmailHtml({
  code,
  email,
  userName,
  type,
}: {
  code: string;
  email: string;
  userName?: string;
  type: 'register' | 'reset_password' | 'login';
}): string {
  const currentYear = new Date().getFullYear();
  const safeCode = escapeHtml(code);
  const recipient = userName ? `Merhaba ${escapeHtml(userName)},` : 'Merhaba,';
  const content = {
    register: {
      title: 'Safirya hesabınızı doğrulayın',
      eyebrow: 'HESAP KURULUMU',
      heading: 'Atölyeye hoş geldiniz',
      description: 'Üyeliğinizi tamamlamak için aşağıdaki tek kullanımlık doğrulama kodunu girin.',
    },
    reset_password: {
      title: 'Safirya şifre sıfırlama kodu',
      eyebrow: 'HESAP GÜVENLİĞİ',
      heading: 'Şifrenizi yenileyin',
      description: 'Yeni şifrenizi belirlemek için aşağıdaki tek kullanımlık doğrulama kodunu girin.',
    },
    login: {
      title: 'Safirya giriş doğrulama kodu',
      eyebrow: 'GÜVENLİ GİRİŞ',
      heading: 'Girişinizi doğrulayın',
      description: 'Safirya hesabınıza güvenli şekilde devam etmek için aşağıdaki kodu kullanın.',
    },
  }[type];

  return `<!doctype html>
<html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${content.title}</title></head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${EMAIL_BRAND.ink};">
${emailPreheader(content.description)}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_BRAND.cream};padding:28px 12px 40px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${EMAIL_BRAND.paper};border:1px solid ${EMAIL_BRAND.line};border-radius:22px;overflow:hidden;">
<tr><td style="background:${EMAIL_BRAND.navy};padding:30px 36px 28px;text-align:center;">
  <div style="font-family:Georgia,serif;font-size:27px;letter-spacing:5px;color:#fff;font-weight:bold;">SAFİRYA</div>
  <div style="margin-top:8px;color:#E9B69C;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">El yapımı tasarım atölyesi</div>
</td></tr>
<tr><td style="padding:40px 44px 34px;">
  <div style="font-size:10px;letter-spacing:1.8px;color:${EMAIL_BRAND.terracotta};font-weight:bold;text-transform:uppercase;margin-bottom:14px;">${content.eyebrow}</div>
  <h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.2;font-weight:normal;color:${EMAIL_BRAND.navy};margin:0 0 14px;">${content.heading}</h1>
  <p style="font-size:15px;line-height:1.7;color:${EMAIL_BRAND.muted};margin:0 0 8px;">${recipient}</p>
  <p style="font-size:15px;line-height:1.7;color:${EMAIL_BRAND.muted};margin:0 0 28px;">${content.description}</p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_BRAND.terracottaSoft};border:1px solid #EFCFBE;border-radius:16px;"><tr><td style="padding:26px 18px;text-align:center;">
    <div style="font-size:10px;letter-spacing:1.7px;text-transform:uppercase;color:${EMAIL_BRAND.terracotta};font-weight:bold;">DOĞRULAMA KODUNUZ</div>
    <div style="font-family:'Courier New',monospace;font-size:36px;line-height:1.2;letter-spacing:8px;color:${EMAIL_BRAND.navy};font-weight:bold;margin:13px 0 10px;padding-left:8px;">${safeCode}</div>
    <div style="font-size:12px;color:${EMAIL_BRAND.muted};">Bu kod 10 dakika boyunca geçerlidir.</div>
  </td></tr></table>
  <p style="font-size:12px;line-height:1.6;color:#8A93A3;margin:24px 0 0;">Bu işlemi siz başlatmadıysanız e-postayı yok sayın. Hesabınızda değişiklik yapılmaz.</p>
</td></tr>
<tr><td style="border-top:1px solid ${EMAIL_BRAND.line};background:${EMAIL_BRAND.cream};padding:24px 36px;text-align:center;">
  <div style="font-size:12px;color:${EMAIL_BRAND.navy};font-weight:bold;">Safirya Zanaat &amp; Tasarım Atölyesi</div>
  <div style="font-size:11px;color:${EMAIL_BRAND.muted};margin-top:7px;">Caferağa Mah. Şair Nefi Sk. No:18 · Kadıköy / İstanbul</div>
  <div style="font-size:10px;color:#9AA2AE;margin-top:13px;">${escapeHtml(email)} · © ${currentYear} Safirya</div>
</td></tr>
</table></td></tr></table></body></html>`;
}
