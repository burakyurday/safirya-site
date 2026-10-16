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
    }\n\n👉  ${code}  👈\n\nBu kod 10 dakika boyunca geçerlidir.\nEğer bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayınız.\n\nSafirya Zanaat & Tasarım Atölyesi - İzmir / Karşıyaka`;

    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: emailSubject,
      html: htmlContent,
      text: plainTextContent,
      replyTo: 'destek@safirya.tr',
      senderName: 'Safirya Atölyesi',
      from: process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>',
      smtpSettings: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (!emailResult.success) {
      console.error(`[Safirya Auth Hatası] ${cleanEmail} için e-posta gönderilemedi. Hata: ${emailResult.error}`);
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
