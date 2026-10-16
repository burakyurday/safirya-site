import { NextResponse } from 'next/server';
import { getAdminSessionServer } from '@/lib/adminAuth';
import { testResendConnection, sendEmail } from '@/lib/email/sender';

export async function GET() {
  try {
    const session = await getAdminSessionServer();
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
        { status: 401 }
      );
    }

    const testResult = await testResendConnection();
    return NextResponse.json({
      success: testResult.connected,
      ...testResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Bağlantı hatası' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSessionServer();
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      targetEmail = 'destek@safirya.tr',
      apiKey,
      smtpSettings,
      from,
    } = body;

    const effectiveApiKey =
      (typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : null) ||
      process.env.RESEND_API_KEY ||
      process.env.SMTP_PASS;

    const effectiveHost =
      (smtpSettings?.host && typeof smtpSettings.host === 'string' && smtpSettings.host.trim()
        ? smtpSettings.host.trim()
        : null) ||
      process.env.SMTP_HOST ||
      'smtp.resend.com';

    const effectiveUser =
      (smtpSettings?.user && typeof smtpSettings.user === 'string' && smtpSettings.user.trim()
        ? smtpSettings.user.trim()
        : null) ||
      process.env.SMTP_USER ||
      'resend';

    const effectivePass =
      (smtpSettings?.pass && typeof smtpSettings.pass === 'string' && smtpSettings.pass.trim()
        ? smtpSettings.pass.trim()
        : null) ||
      effectiveApiKey;

    const effectivePort = Number(smtpSettings?.port || process.env.SMTP_PORT || 465);

    const emailResult = await sendEmail({
      to: targetEmail,
      subject: `Safirya Atölye - Resend Altyapı Bağlantı Testi (${new Date().toLocaleTimeString('tr-TR')})`,
      from: from || process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>',
      apiKey: effectiveApiKey || undefined,
      smtpSettings: {
        host: effectiveHost,
        port: effectivePort,
        user: effectiveUser,
        pass: effectivePass || undefined,
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #E2DCD3; border-radius: 12px; background: #FFFCF9;">
          <h2 style="color: #18243D; margin-top: 0;">Safirya E-Posta Altyapı Testi Başarılı!</h2>
          <p style="color: #697386; font-size: 14px; line-height: 1.6;">
            Bu e-posta, Safirya Atölyesi Yönetim Paneli üzerinden tetiklenen canlı altyapı testi sonucu gönderilmiştir.
          </p>
          <div style="background: #F7F3EE; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
            <div><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</div>
            <div><strong>Sağlayıcı:</strong> Resend REST API (safirya.tr)</div>
            <div><strong>Durum:</strong> Teslimat Başarılı</div>
          </div>
          <p style="color: #9AA2AE; font-size: 12px; margin-bottom: 0;">
            Safirya Zanaat & Tasarım Atölyesi - Karşıyaka / İzmir
          </p>
        </div>
      `,
      text: 'Safirya E-Posta Altyapı Testi Başarılı! Resend üzerinden gönderildi.',
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'E-posta gönderilemedi.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${targetEmail} adresine test e-postası Resend üzerinden iletildi! (${emailResult.messageId})`,
      messageId: emailResult.messageId,
      provider: emailResult.provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Test işlemi başarısız' },
      { status: 500 }
    );
  }
}
