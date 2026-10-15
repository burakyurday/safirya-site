export function generateAuthVerificationEmailHtml({
  code,
  email,
  userName,
  type,
}: {
  code: string;
  email: string;
  userName?: string;
  type: 'register' | 'reset_password' | 'login';
}): string {
  const currentYear = new Date().getFullYear();

  let title = 'Safirya E-Posta Doğrulama Kodu';
  let heading = 'Hesabınızı Doğrulayın';
  let description =
    'Safirya Atölyesi’ne hoş geldiniz! Üyeliğinizi tamamlamak ve atölye ayrıcalıklarından yararlanmak için aşağıdaki 6 haneli doğrulama kodunu kullanın:';

  if (type === 'reset_password') {
    title = 'Safirya Şifre Sıfırlama Kodu';
    heading = 'Şifre Sıfırlama Talebi';
    description =
      'Safirya hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki 6 haneli doğrulama kodunu giriniz:';
  } else if (type === 'login') {
    title = 'Safirya Giriş Doğrulama Kodu';
    heading = 'Giriş Doğrulama';
    description =
      'Safirya hesabınıza güvenli giriş yapmak için aşağıdaki 6 haneli kodu kullanınız:';
  }

  // Kodun her bir rakamını şık kutucuklar halinde diz
  const formattedCode = code.split('').join(' ');

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #231B18;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F3EC; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E2DCD3; overflow: hidden; box-shadow: 0 4px 16px rgba(35, 27, 24, 0.05);">
          
          <!-- Üst Başlık & Logo -->
          <tr>
            <td style="background-color: #231B18; padding: 28px 36px; text-align: center;">
              <div style="font-family: Georgia, serif; font-size: 24px; font-weight: 500; letter-spacing: 4px; color: #F6F3EC; text-transform: uppercase;">
                SAFİRYA
              </div>
              <div style="font-size: 10px; font-weight: 600; letter-spacing: 2px; color: #C85A32; margin-top: 4px; text-transform: uppercase;">
                El Yapımı Tasarım Atölyesi
              </div>
            </td>
          </tr>

          <!-- Ana Gövde -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #C85A32; margin-bottom: 8px;">
                🔐 GÜVENLİK VE KİMLİK DOĞRULAMA
              </div>

              <h1 style="margin: 0 0 16px; font-family: Georgia, serif; font-size: 22px; font-weight: normal; color: #231B18;">
                ${userName ? `Merhaba ${userName},` : 'Merhaba,'}
              </h1>

              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #54473F;">
                ${description}
              </p>

              <!-- Kod Kutusu -->
              <div style="background-color: #FAF8F5; border: 1.5px dashed #C85A32; border-radius: 6px; padding: 22px 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #7A7067; margin-bottom: 8px; font-weight: 600;">
                  6 Haneli Doğrulama Kodunuz
                </div>
                <div style="font-family: 'Courier New', Courier, monospace, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #231B18;">
                  ${formattedCode}
                </div>
                <div style="font-size: 11px; color: #C85A32; margin-top: 8px; font-weight: 500;">
                  ⏱ Bu kod 10 dakika boyunca geçerlidir.
                </div>
              </div>

              <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: #8C827A;">
                Eğer bu işlemi siz başlatmadıysanız lütfen bu e-postayı dikkate almayınız. Hesabınız güvendedir.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF8F5; border-top: 1px solid #E2DCD3; padding: 20px 36px; text-align: center;">
              <div style="font-size: 11px; font-weight: 600; color: #231B18;">
                Safirya Zanaat & Tasarım Atölyesi
              </div>
              <div style="font-size: 10px; color: #7A7067; margin-top: 4px;">
                Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul &bull; info@safirya.tr
              </div>
              <div style="font-size: 10px; color: #A89F91; margin-top: 10px;">
                &copy; ${currentYear} Safirya. Tüm hakları saklıdır.
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
