import { NextResponse } from 'next/server';
import { generateSafiryaEmailHtml } from '@/lib/notifications/email';
import { getAdminSessionServer } from '@/lib/adminAuth';
import { sendEmail } from '@/lib/email/sender';

export async function POST(req: Request) {
  try {
    const session = await getAdminSessionServer();
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Aşama bildirimi göndermek için yönetici girişi gereklidir.' },
        { status: 401 }
      );
    }
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      stageName,
      photoUrl,
      caption,
      settings,
    } = body;

    if (!customerEmail || !orderNumber) {
      return NextResponse.json(
        { success: false, error: 'E-posta ve sipariş numarası gereklidir.' },
        { status: 400 }
      );
    }

    const htmlContent = generateSafiryaEmailHtml({
      to: customerEmail,
      customerName: customerName || 'Değerli Müşterimiz',
      orderNumber,
      stageName: stageName || 'Üretim Aşaması',
      photoUrl,
      caption,
    });

    const cleanCustomerEmail = String(customerEmail)
      .trim()
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF\s]/g, '');

    const emailResult = await sendEmail({
      to: cleanCustomerEmail,
      subject: `🎨 Siparişiniz ${stageName} Aşamasında! (#${orderNumber}) - Safirya Atölyesi`,
      html: htmlContent,
      from: settings?.smtpFrom || process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>',
      apiKey: settings?.smtpPass || process.env.RESEND_API_KEY || process.env.SMTP_PASS,
      smtpSettings: {
        host: settings?.smtpHost || process.env.SMTP_HOST || 'smtp.resend.com',
        port: Number(settings?.smtpPort || process.env.SMTP_PORT || 465),
        user: settings?.smtpUser || process.env.SMTP_USER || 'resend',
        pass: settings?.smtpPass || process.env.SMTP_PASS || process.env.RESEND_API_KEY,
      },
    });

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: `E-posta ${emailResult.provider === 'resend' ? 'Resend' : 'SMTP'} üzerinden iletildi (${emailResult.messageId || ''})`,
        simulated: false,
        messageId: emailResult.messageId,
      });
    }

    console.error(`[Aşama Bildirim Hatası] ${customerEmail} adresine e-posta gönderilemedi: ${emailResult.error}`);
    return NextResponse.json(
      {
        success: false,
        error: emailResult.error || 'Aşama e-postası iletilemedi.',
        simulated: false,
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error('API Bildirim Hatası:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
