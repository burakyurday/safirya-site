import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  createVerificationCode,
  checkCodeRequestRateLimit,
} from '@/lib/auth/verificationStore';
import { generateAuthVerificationEmailHtml } from '@/lib/auth/authEmailTemplate';

function getResendApiKey(): string | undefined {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  if (process.env.SMTP_PASS?.startsWith('re_')) return process.env.SMTP_PASS;
  return undefined;
}

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

    // Rate limiting: 10 dakika içinde en fazla 3 kod talebi
    const rateLimit = checkCodeRequestRateLimit(cleanEmail);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Güvenlik uyarısı: Çok sık doğrulama kodu talep ettiniz. Lütfen ${rateLimit.remainingMinutes} dakika sonra tekrar deneyiniz.`,
        },
        { status: 429 }
      );
    }

    // 6 haneli kod üret (10 dakika geçerli)
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

    const plainTextContent = `SAFİRYA EL YAPIMI TASARIM ATÖLYESİ\n\n${
      userName ? `Sayın ${userName},\n\n` : ''
    }${
      type === 'reset_password'
        ? 'Şifre sıfırlama talebiniz için doğrulama kodunuz:'
        : 'Üyelik kaydınızı tamamlamak için 6 haneli doğrulama kodunuz:'
    }\n\n👉  ${code}  👈\n\nBu kod 10 dakika boyunca geçerlidir.\nEğer bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayınız.\n\nSafirya Zanaat & Tasarım Atölyesi - Kadıköy / İstanbul`;

    const resendApiKey = getResendApiKey();
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const rawFrom = process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>';
    const cleanFrom = rawFrom.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

    let emailSent = false;
    let lastError = '';

    // 1. Resend API Entegrasyonu (Öncelikli)
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
              text: plainTextContent,
              reply_to: 'destek@safirya.tr',
            }),
          });
        };

        // İlk deneme: Ayarlı veya varsayılan bildirim adresi
        let resendRes = await sendToResend(
          cleanFrom.includes('@') ? cleanFrom : 'Safirya Atölyesi <bildirim@safirya.tr>'
        );
        let resendData = await resendRes.json();

        // Eğer ilk deneme başarısız olursa Resend test göndericisiyle dene
        if (!resendRes.ok) {
          lastError = resendData?.message || resendRes.statusText;
          console.warn('[Resend İlk Deneme]', lastError);

          // Alternatif: doğrulanmış domain veya test adresi
          const fallbackRes = await sendToResend('Safirya Atölyesi <onboarding@resend.dev>');
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok && fallbackData.id) {
            resendRes = fallbackRes;
            resendData = fallbackData;
          }
        }

        if (resendRes.ok && resendData?.id) {
          console.log(`[Doğrulama Kodu] ${cleanEmail} adresine Resend (${resendData.id}) ile iletildi.`);
          emailSent = true;
        }
      } catch (err: any) {
        lastError = err.message || 'Resend bağlantı hatası';
        console.warn('Resend API doğrulama kodu hatası:', lastError);
      }
    }

    // 2. SMTP Nodemailer Gönderimi (Yedek)
    if (!emailSent && smtpHost && smtpUser && smtpPass) {
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
          text: plainTextContent,
        });

        console.log(`[Doğrulama Kodu] ${cleanEmail} adresine SMTP ile iletildi.`);
        emailSent = true;
      } catch (err: any) {
        lastError = err.message || 'SMTP bağlantı hatası';
        console.warn('SMTP gönderim hatası:', lastError);
      }
    }

    if (!emailSent) {
      console.error(`[Safirya Auth Hatası] ${cleanEmail} için e-posta gönderilemedi. Hata: ${lastError}`);
      return NextResponse.json(
        {
          success: false,
          error:
            'Doğrulama e-postası şu anda iletilemedi. Lütfen e-posta adresinizi kontrol ediniz veya 2 dakika sonra tekrar deneyiniz.',
        },
        { status: 500 }
      );
    }

    // Başarılı gönderim: Kod ASLA tarayıcıya/JSON'a yazılmaz!
    console.log(`[Safirya Auth] ${cleanEmail} için doğrulama kodu başarıyla e-posta kutusuna iletildi.`);

    return NextResponse.json({
      success: true,
      message: `${cleanEmail} adresinize 6 haneli doğrulama kodu gönderildi. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol ediniz.`,
    });
  } catch (error: any) {
    console.error('Doğrulama kodu gönderme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kod gönderilemedi.' },
      { status: 500 }
    );
  }
}
