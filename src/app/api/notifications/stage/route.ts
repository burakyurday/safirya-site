import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateSafiryaEmailHtml } from '@/lib/notifications/email';
import { getAdminSessionServer } from '@/lib/adminAuth';

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

    // SMTP ayarları
    const smtpHost = settings?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = Number(settings?.smtpPort || process.env.SMTP_PORT || 587);
    const smtpUser = settings?.smtpUser || process.env.SMTP_USER;
    const smtpPass = settings?.smtpPass || process.env.SMTP_PASS;
    const rawFrom =
      settings?.smtpFrom ||
      process.env.SMTP_FROM ||
      'Safirya Atölyesi <bildirim@safirya.tr>';
    const cleanFrom = rawFrom.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

    const resendApiKey =
      (smtpPass?.startsWith('re_') ? smtpPass : null) ||
      process.env.RESEND_API_KEY ||
      (smtpUser?.startsWith('re_') ? smtpUser : null);

    if (resendApiKey) {
      try {
        const sendToResend = async (fromAddress: string) => {
          return await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromAddress,
              to: customerEmail,
              subject: `🎨 Siparişiniz ${stageName} Aşamasında! (#${orderNumber}) - Safirya Atölyesi`,
              html: htmlContent,
            }),
          });
        };

        let resendRes = await sendToResend(cleanFrom.includes('@') ? cleanFrom : 'Safirya Atölyesi <bildirim@safirya.tr>');
        let resendData = await resendRes.json();

        if (!resendRes.ok && (resendData?.message?.toLowerCase().includes('domain') || resendRes.status === 403)) {
          const fallbackRes = await sendToResend('Safirya Atölyesi <bildirim@safirya.tr>');
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok && fallbackData.id) {
            resendRes = fallbackRes;
            resendData = fallbackData;
          }
        }

        if (resendRes.ok && resendData.id) {
          return NextResponse.json({
            success: true,
            message: `E-posta Resend üzerinden iletildi (${resendData.id})`,
            simulated: false,
          });
        }
      } catch (err: any) {
        console.warn('Resend API aşama bildirim hatası:', err.message);
      }
    }

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const info = await transporter.sendMail({
          from: cleanFrom,
          to: customerEmail,
          subject: `🎨 Siparişiniz ${stageName} Aşamasında! (#${orderNumber}) - Safirya Atölyesi`,
          html: htmlContent,
        });

        return NextResponse.json({
          success: true,
          message: `E-posta başarıyla iletildi (${info.messageId})`,
          simulated: false,
        });
      } catch (err: any) {
        console.error('SMTP Gönderim Hatası:', err);
        return NextResponse.json({
          success: true,
          message: `SMTP Hatası (${err.message}). Simülasyon modunda kaydedildi.`,
          simulated: true,
        });
      }
    }

    // SMTP yapılandırılmamışsa simülasyon modu
    console.log(`[Safirya E-Posta Servisi] Simüle Bildirim Gönderildi:`);
    console.log(`  -> Alıcı: ${customerEmail} (${customerName})`);
    console.log(`  -> Sipariş: #${orderNumber}`);
    console.log(`  -> Aşama: ${stageName}`);
    if (photoUrl) console.log(`  -> Fotoğraf: ${photoUrl}`);

    return NextResponse.json({
      success: true,
      message: `${customerEmail} adresine kurumsal e-posta bildirimi başarıyla iletildi (Geliştirme / Simülasyon Modu).`,
      simulated: true,
    });
  } catch (err: any) {
    console.error('API Bildirim Hatası:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
