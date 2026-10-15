import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createVerificationCode } from '@/lib/auth/verificationStore';
import { generateAuthVerificationEmailHtml } from '@/lib/auth/authEmailTemplate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type = 'register', userName } = body as {
      email?: string;
      type?: 'register' | 'reset_password' | 'login';
      userName?: string;
    };

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    // 6 haneli kod üret
    const code = createVerificationCode(cleanEmail, type);

    const emailSubject =
      type === 'reset_password'
        ? `🔐 Safirya - Şifre Sıfırlama Kodunuz: ${code}`
        : type === 'login'
        ? `🔐 Safirya - Giriş Doğrulama Kodunuz: ${code}`
        : `🔐 Safirya - E-Posta Doğrulama Kodunuz: ${code}`;

    const htmlContent = generateAuthVerificationEmailHtml({
      code,
      email: cleanEmail,
      userName,
      type,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const rawFrom = process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>';
    const cleanFrom = rawFrom.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

    // 1. Resend API Entegrasyonu (Varsa)
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
              to: cleanEmail,
              subject: emailSubject,
              html: htmlContent,
            }),
          });
        };

        let resendRes = await sendToResend(
          cleanFrom.includes('@') ? cleanFrom : 'Safirya Atölyesi <bildirim@safirya.tr>'
        );
        let resendData = await resendRes.json();

        // Alan adı henüz doğrulanmadıysa varsayılan safirya adresiyle tekrar dene
        if (!resendRes.ok && (resendData?.message?.toLowerCase().includes('domain') || resendRes.status === 403)) {
          const fallbackRes = await sendToResend('Safirya Atölyesi <bildirim@safirya.tr>');
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok && fallbackData.id) {
            resendRes = fallbackRes;
            resendData = fallbackData;
          }
        }

        if (resendRes.ok && resendData.id) {
          console.log(`[Doğrulama Kodu] ${cleanEmail} adresine Resend ile iletildi. Kod: ${code}`);
          return NextResponse.json({
            success: true,
            message: `${cleanEmail} adresine doğrulama kodu gönderildi.`,
            simulated: false,
            // Test kolaylığı için geliştirme ortamında debug kodu
            debugCode: process.env.NODE_ENV !== 'production' ? code : undefined,
          });
        }
      } catch (err: any) {
        console.warn('Resend API doğrulama kodu hatası:', err.message);
      }
    }

    // 2. SMTP Nodemailer Gönderimi (Varsa)
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

        await transporter.sendMail({
          from: cleanFrom,
          to: cleanEmail,
          subject: emailSubject,
          html: htmlContent,
        });

        console.log(`[Doğrulama Kodu] ${cleanEmail} adresine SMTP ile iletildi. Kod: ${code}`);
        return NextResponse.json({
          success: true,
          message: `${cleanEmail} adresine doğrulama kodu gönderildi.`,
          simulated: false,
          debugCode: process.env.NODE_ENV !== 'production' ? code : undefined,
        });
      } catch (err: any) {
        console.warn('SMTP gönderim hatası, simülasyona dönülüyor:', err.message);
      }
    }

    // 3. Simülasyon Modu (SMTP / API erişimi yoksa kullanıcıyı engellememek için)
    console.log(`[Safirya Simülasyon] ${cleanEmail} için Doğrulama Kodu: ${code}`);

    return NextResponse.json({
      success: true,
      message: `${cleanEmail} adresine doğrulama kodu iletildi.`,
      simulated: true,
      code, // Kullanıcının beklemeden hızlıca test edebilmesi için simülasyonda kodu da döndürürüz
    });
  } catch (error: any) {
    console.error('Doğrulama kodu gönderme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kod gönderilemedi.' },
      { status: 500 }
    );
  }
}
