import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateCampaignEmailHtml, CampaignEmailProps } from '@/lib/marketing/campaignEmail';
import { getAdminSessionServer } from '@/lib/adminAuth';

// E-posta adresini satır sonu ve boşluklardan arındırır
function sanitizeFromAddress(from?: string, defaultSenderName = 'Safirya Atölyesi'): string {
  if (!from) return `"${defaultSenderName}" <bildirim@safirya.tr>`;
  const cleaned = from.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned.includes('@')) {
    return `"${defaultSenderName}" <bildirim@safirya.tr>`;
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSessionServer();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Kampanya e-postası göndermek için yönetici girişi gereklidir.' },
        { status: 401 }
      );
    }
    const body = await req.json();
    const {
      recipients,
      testEmail,
      isTest = false,
      campaignProps,
      settings,
    } = body as {
      recipients?: string[];
      testEmail?: string;
      isTest?: boolean;
      campaignProps: CampaignEmailProps;
      settings?: any;
    };

    if (!campaignProps || !campaignProps.subject) {
      return NextResponse.json(
        { success: false, error: 'Kampanya verileri ve konu başlığı zorunludur.' },
        { status: 400 }
      );
    }

    const htmlContent = generateCampaignEmailHtml(campaignProps);
    const targetEmails: string[] = isTest
      ? [testEmail || settings?.contactEmail || 'test@safirya.tr']
      : recipients && recipients.length > 0
      ? recipients
      : ['musteri1@safirya.tr', 'musteri2@safirya.tr'];

    // SMTP & Resend Değişkenleri
    const smtpHost = settings?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = Number(settings?.smtpPort || process.env.SMTP_PORT || 587);
    const smtpUser = settings?.smtpUser || process.env.SMTP_USER;
    const smtpPass = settings?.smtpPass || process.env.SMTP_PASS;
    const rawFrom =
      settings?.smtpFrom ||
      process.env.SMTP_FROM ||
      `"${campaignProps.senderName || 'Safirya Atölyesi'}" <bildirim@safirya.tr>`;

    let cleanFrom = sanitizeFromAddress(rawFrom, campaignProps.senderName);

    const resendApiKey =
      (smtpPass?.startsWith('re_') ? smtpPass : null) ||
      process.env.RESEND_API_KEY ||
      (smtpUser?.startsWith('re_') ? smtpUser : null);

    // 1. RESEND DOĞRUDAN REST API ENTEGRASYONU (re_... anahtarı varsa)
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
              to: isTest ? targetEmails[0] : targetEmails,
              subject: isTest ? `[TEST] ${campaignProps.subject}` : campaignProps.subject,
              html: htmlContent,
            }),
          });
        };

        let resendRes = await sendToResend(cleanFrom);
        let resendData = await resendRes.json();

        // Eğer kullanıcı henüz doğrulanmamış özel bir domain (safirya.com / safirya.tr) kullandıysa ve Resend 403 verdi ise:
        // Test amaçlı otomatik olarak Resend'in resmi test adresi 'bildirim@safirya.tr' ile ikinci bir deneme yap!
        const isDomainError =
          !resendRes.ok &&
          (resendData?.message?.toLowerCase().includes('domain') ||
            resendData?.message?.toLowerCase().includes('verified') ||
            resendData?.message?.toLowerCase().includes('from address') ||
            resendRes.status === 403 ||
            resendRes.status === 422);

        if (isDomainError && !cleanFrom.includes('bildirim@safirya.tr')) {
          const fallbackFrom = `"${campaignProps.senderName || 'Safirya'}" <bildirim@safirya.tr>`;
          const retryRes = await sendToResend(fallbackFrom);
          const retryData = await retryRes.json();

          if (retryRes.ok && retryData.id) {
            return NextResponse.json({
              success: true,
              simulated: false,
              provider: 'resend',
              messageId: retryData.id,
              message: `${targetEmails[0]} adresine e-posta Resend test adresi (bildirim@safirya.tr) ile başarıyla gönderildi! (Kullandığınız alan adı henüz Resend'de doğrulanmadığı için test gönderiminde bildirim@safirya.tr kullanıldı)`,
              recipientCount: 1,
            });
          } else {
            resendData = retryData;
            resendRes = retryRes;
          }
        }

        if (resendRes.ok && resendData.id) {
          return NextResponse.json({
            success: true,
            simulated: false,
            provider: 'resend',
            messageId: resendData.id,
            message: isTest
              ? `${targetEmails[0]} adresine Resend üzerinden e-posta başarıyla iletildi.`
              : `${targetEmails.length} alıcıya Resend üzerinden kampanya başarıyla gönderildi.`,
            recipientCount: isTest ? 1 : targetEmails.length,
          });
        }

        // Resend açık bir hata döndürdüyse (örn. alan adı doğrulanmamış veya test alıcısı kısıtlaması)
        if (resendData?.message) {
          let extraHelp = '';
          if (resendData.message.includes('own email address')) {
            extraHelp =
              ' [İpucu: Resend ücretsiz test modunda sadece Resend hesabınızı açtığınız e-posta adresinize mail gönderebilirsiniz. Başka adreslere göndermek için https://resend.com/domains adresinden alan adınızı doğrulayın.]';
          } else if (resendData.message.includes('domain')) {
            extraHelp =
              ' [İpucu: Alan adınız henüz doğrulanmamışsa "Gönderici (From)" alanına "Safirya <bildirim@safirya.tr>" yazarak test edebilirsiniz.]';
          }

          return NextResponse.json(
            {
              success: false,
              error: `Resend Hatası: ${resendData.message}${extraHelp}`,
            },
            { status: 400 }
          );
        }
      } catch (resendError: any) {
        console.warn('[Resend API Hatası, SMTP deneniyor]:', resendError.message);
      }
    }

    // 2. STANDART NODEMAILER SMTP GÖNDERİMİ (smtp.resend.com veya özel SMTP)
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

        // Test gönderimi tek alıcıya gider
        if (isTest) {
          const info = await transporter.sendMail({
            from: cleanFrom,
            to: targetEmails[0],
            subject: `[TEST] ${campaignProps.subject}`,
            html: htmlContent,
          });

          return NextResponse.json({
            success: true,
            simulated: false,
            messageId: info.messageId,
            message: `${targetEmails[0]} adresine SMTP üzerinden test e-postası başarıyla iletildi.`,
            recipientCount: 1,
          });
        }

        // Toplu gönderim: Bcc veya batch
        const info = await transporter.sendMail({
          from: cleanFrom,
          to: cleanFrom,
          bcc: targetEmails,
          subject: campaignProps.subject,
          html: htmlContent,
        });

        return NextResponse.json({
          success: true,
          simulated: false,
          messageId: info.messageId,
          message: `${targetEmails.length} alıcıya kampanya e-postası başarıyla gönderildi.`,
          recipientCount: targetEmails.length,
        });
      } catch (smtpError: any) {
        console.error('[SMTP Gönderim Hatası]:', smtpError.message);
        return NextResponse.json(
          {
            success: false,
            error: `SMTP Gönderim Hatası: ${smtpError.message}. (Resend kullanıyorsanız gönderici adresini "Safirya <bildirim@safirya.tr>" olarak ayarlayın veya https://resend.com/domains üzerinden alan adınızı doğrulayın.)`,
          },
          { status: 400 }
        );
      }
    }

    // 3. SMTP YAPILANDIRILMAMIŞSA SİMÜLASYON MODU
    return NextResponse.json({
      success: true,
      simulated: true,
      recipientCount: targetEmails.length,
      targetRecipient: isTest ? targetEmails[0] : `${targetEmails.length} alıcı`,
      message: isTest
        ? `[Geliştirme Simülasyonu] ${targetEmails[0]} adresine test e-postası sanal olarak iletildi. (Gerçek gönderim için Yönetim Paneli -> Vitrin & CMS Ayarları -> Resend bilgilerini girin)`
        : `[Geliştirme Simülasyonu] ${targetEmails.length} kişilik hedef kitleye kampanya e-postası kuyruğa alındı.`,
    });
  } catch (error: any) {
    console.error('Mail gönderim hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'E-posta gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
