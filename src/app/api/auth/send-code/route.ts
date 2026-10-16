import { NextResponse } from 'next/server';
import {
  createVerificationCode,
  checkCodeRequestRateLimit,
} from '@/lib/auth/verificationStore';
import { generateAuthVerificationEmailHtml } from '@/lib/auth/authEmailTemplate';
import { sendEmail } from '@/lib/email/sender';

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

    const cleanEmail = email
      .trim()
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF\s]/g, '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta formatı giriniz (örn: isim@domain.com).' },
        { status: 400 }
      );
    }

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
    }\n\n👉  ${code}  👈\n\nBu kod 10 dakika boyunca geçerlidir.\nEğer bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayınız.\n\nSafirya Zanaat & Tasarım Atölyesi - İzmir / Karşıyaka`;

    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: emailSubject,
      html: htmlContent,
      text: plainTextContent,
      replyTo: 'destek@safirya.tr',
      senderName: 'Safirya Atölyesi',
      from: process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>',
      apiKey: process.env.RESEND_API_KEY || process.env.SMTP_PASS,
      smtpSettings: {
        host: process.env.SMTP_HOST || 'smtp.resend.com',
        port: Number(process.env.SMTP_PORT || 465),
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
      },
    });

    if (!emailResult.success) {
      console.error(`[Safirya Auth Hatası] ${cleanEmail} için e-posta gönderilemedi. Hata: ${emailResult.error}`);
      
      let userFriendlyError = 'Doğrulama e-postası şu anda iletilemedi. Lütfen e-posta adresinizi kontrol ediniz veya 2 dakika sonra tekrar deneyiniz.';
      if (emailResult.error?.includes('Invalid `to` field') || emailResult.error?.includes('invalid')) {
        userFriendlyError = 'Girdiğiniz e-posta adresine teslimat yapılamadı. Lütfen geçerli bir e-posta adresi girdiğinizden emin olunuz.';
      } else if (emailResult.error?.includes('rate limit') || emailResult.error?.includes('Too many requests')) {
        userFriendlyError = 'Çok fazla istek gönderildi. Lütfen birkaç dakika sonra tekrar deneyiniz.';
      }

      return NextResponse.json(
        {
          success: false,
          error: userFriendlyError,
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
