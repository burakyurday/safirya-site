import { NextResponse } from 'next/server';
import { generateCampaignEmailHtml, CampaignEmailProps } from '@/lib/marketing/campaignEmail';
import { getAdminSessionServer } from '@/lib/adminAuth';
import { sendEmail } from '@/lib/email/sender';

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

    const emailResult = await sendEmail({
      to: isTest ? targetEmails[0] : targetEmails,
      subject: isTest ? `[TEST] ${campaignProps.subject}` : campaignProps.subject,
      html: htmlContent,
      from: settings?.smtpFrom,
      senderName: campaignProps.senderName || 'Safirya Atölyesi',
      apiKey: settings?.smtpPass,
      smtpSettings: {
        host: settings?.smtpHost,
        port: Number(settings?.smtpPort),
        user: settings?.smtpUser,
        pass: settings?.smtpPass,
      },
    });

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        simulated: false,
        provider: emailResult.provider,
        messageId: emailResult.messageId,
        message: isTest
          ? `${targetEmails[0]} adresine e-posta başarıyla iletildi (${emailResult.provider.toUpperCase()} - ${emailResult.messageId}).`
          : `${targetEmails.length} alıcıya kampanya e-postası başarıyla gönderildi (${emailResult.provider.toUpperCase()} - ${emailResult.messageId}).`,
        recipientCount: isTest ? 1 : targetEmails.length,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: emailResult.error || 'Kampanya e-postası gönderilemedi.',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Mail gönderim hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'E-posta gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
