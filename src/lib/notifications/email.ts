export interface StageEmailPayload {
  to: string;
  customerName: string;
  orderNumber: string;
  stageName: string;
  photoUrl?: string;
  caption?: string;
  trackingUrl?: string;
  settings?: any;
}

export interface EmailDispatchResult {
  success: boolean;
  message: string;
  simulated: boolean;
  previewUrl?: string;
}

export function generateSafiryaEmailHtml({
  customerName,
  orderNumber,
  stageName,
  photoUrl,
  caption,
  trackingUrl,
  to,
}: StageEmailPayload): string {
  const currentYear = new Date().getFullYear();
  const safeTrackingUrl =
    trackingUrl ||
    `https://safirya.tr/siparis-takip?orderNumber=${encodeURIComponent(orderNumber)}${to ? `&email=${encodeURIComponent(to)}` : ''}`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safirya Atölye Üretim Bildirimi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1B2A4A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 24px; border: 1px solid #E8E2D9; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          
          <!-- Üst Logo & Başlık Bandı -->
          <tr>
            <td style="background-color: #1B2A4A; padding: 32px 40px; text-align: center;">
              <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                SAFİRYA
              </div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #D96B27; margin-top: 4px; text-transform: uppercase;">
                El Yapımı Tasarım & Zanaat Atölyesi
              </div>
            </td>
          </tr>

          <!-- Ana İçerik -->
          <tr>
            <td style="padding: 40px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #FDF3EB; border: 1px solid #F5D3BC; border-radius: 20px; font-size: 11px; font-weight: 700; color: #D96B27; text-transform: uppercase; margin-bottom: 16px;">
                🎨 Atölye Canlı Üretim Güncellemesi
              </div>

              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #1B2A4A; line-height: 1.3;">
                Merhaba ${customerName}, siparişiniz yeni aşamasına geçti!
              </h1>

              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #4A5568;">
                <strong>#${orderNumber}</strong> numaralı el yapımı tasarım siparişiniz atölye ustalarımızın ellerinde özenle şekillenmeye devam ediyor. Siparişinizin güncel üretim aşaması:
              </p>

              <!-- Aşama Rozeti -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #F8F7F4; border-left: 4px solid #D96B27; border-radius: 8px; padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1px;">
                      Mevcut Aşama
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #1B2A4A; margin-top: 4px;">
                      ${stageName}
                    </div>
                    ${
                      caption
                        ? `<div style="font-size: 13px; color: #4A5568; margin-top: 6px; font-style: italic;">"${caption}"</div>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <!-- Aşama Fotoğrafı (Varsa) -->
              ${
                photoUrl
                  ? `
              <div style="margin-bottom: 28px; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #718096; margin-bottom: 8px; text-transform: uppercase; text-align: left;">
                  📸 Atölyeden Canlı Kare:
                </div>
                <img 
                  src="${photoUrl}" 
                  alt="${stageName}" 
                  style="width: 100%; max-width: 520px; height: auto; max-height: 340px; object-fit: cover; border-radius: 16px; border: 1px solid #E8E2D9; display: block; margin: 0 auto;"
                />
              </div>
              `
                  : ''
              }

              <!-- Takip Butonu -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 10px;">
                <tr>
                  <td align="center">
                    <a href="${safeTrackingUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #D96B27; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 14px; box-shadow: 0 4px 14px rgba(217, 107, 39, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                      Sipariş Zaman Çizelgesini İncele &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="text-align: center; font-size: 11px; color: #A0AEC0; margin-top: 8px;">
                Fotoğraflı üretim geçmişini ve kargo takip durumunu dilediğiniz an inceleyebilirsiniz.
              </div>

            </td>
          </tr>

          <!-- Alt Bilgi / Footer -->
          <tr>
            <td style="background-color: #F8F7F4; border-top: 1px solid #E8E2D9; padding: 24px 40px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: #1B2A4A;">
                Safirya Tasarım & Zanaat Atölyesi
              </div>
              <div style="font-size: 11px; color: #718096; margin-top: 4px;">
                Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul
              </div>
              <div style="font-size: 11px; color: #718096; margin-top: 4px;">
                WhatsApp Destek: +90 (532) 555 7234 &bull; atolye@safirya.tr
              </div>
              <div style="font-size: 10px; color: #A0AEC0; margin-top: 16px;">
                &copy; ${currentYear} Safirya. Tüm hakları saklıdır. Bu e-posta sipariş aşama bildiriminiz için otomatik olarak gönderilmiştir.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Aşama bildirim e-postasını gönderir.
 * Tarayıcıda veya sunucuda /api/notifications/stage API rotasını tetikler.
 */
export async function sendStageNotificationEmail(
  payload: StageEmailPayload
): Promise<EmailDispatchResult> {
  try {
    const baseUrl =
      typeof window !== 'undefined'
        ? ''
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/notifications/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: payload.orderNumber,
        customerName: payload.customerName,
        customerEmail: payload.to,
        stageName: payload.stageName,
        photoUrl: payload.photoUrl,
        caption: payload.caption,
        settings: payload.settings,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success ?? true,
        message: data.message || 'E-posta bildirimi iletildi.',
        simulated: data.simulated ?? false,
      };
    }
  } catch (err: any) {
    console.warn('[Safirya Bildirim Servisi] API çağrısı simülasyona yönlendirildi:', err);
  }

  return {
    success: true,
    message: `${payload.to} adresine e-posta bildirimi iletildi (Simülasyon).`,
    simulated: true,
  };
}
