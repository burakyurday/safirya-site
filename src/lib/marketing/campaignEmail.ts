/**
 * Safirya Marka Kimliğine Uygun Duyarlı E-Posta Şablonları & HTML Üreticisi
 * Renkler: Safirya Lacivert (#1B2A4A), Terracotta (#D96B27), Sıcak Krem (#FAF8F5)
 */

export interface CampaignEmailProps {
  campaignName: string;
  subject: string;
  preheader?: string;
  templateType: 'lansman' | 'indirim' | 'ozel-davet' | 'sepet-kurtarma' | 'bulten';
  headline: string;
  bodyText: string;
  heroImageUrl?: string;
  couponCode?: string;
  discountRate?: number;
  ctaLabel: string;
  ctaUrl: string;
  senderName?: string;
  logoUrl?: string;
  logoText?: string;
  brandTagline?: string;
  storeName?: string;
  contactEmail?: string;
  instagramHandle?: string;
  address?: string;
  products?: {
    name: string;
    price: number;
    oldPrice?: number;
    image: string;
    category?: string;
    badge?: string;
  }[];
}

const DEFAULT_PRODUCTS = [
  {
    name: 'Kehribar Cam Kavanoz Doğal Soya Mumu (210g)',
    price: 349,
    oldPrice: 420,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
    category: 'Doğal Mumlar',
    badge: 'Çok Satan',
  },
  {
    name: 'Doğal Lavanta Yağlı Dekoratif Kokulu Taş Buketi',
    price: 289,
    oldPrice: 340,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    category: 'Kokulu Taş & Alçı',
    badge: 'El Yapımı',
  },
  {
    name: 'Geleneksel Geometrik Desenli Miyuki Boncuk Bileklik',
    price: 490,
    oldPrice: 560,
    image: 'https://images.unsplash.com/photo-1611591475155-239dd2a3449c?auto=format&fit=crop&w=600&q=80',
    category: 'Miyuki Takı',
    badge: 'Zanaat',
  },
];

export function generateCampaignEmailHtml(props: CampaignEmailProps): string {
  const {
    subject,
    preheader = 'Safirya Atölyesi el yapımı tasarım bülteni',
    templateType,
    headline,
    bodyText,
    heroImageUrl,
    couponCode,
    discountRate,
    ctaLabel,
    ctaUrl,
    logoUrl,
    logoText = 'SAFİRYA',
    brandTagline = 'El Yapımı Tasarım & Zanaat Atölyesi',
    storeName = 'Safirya Atölyesi',
    contactEmail = 'destek@safirya.tr',
    instagramHandle = '@safirya35353535',
    address = 'Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul',
    products = DEFAULT_PRODUCTS,
  } = props;

  const currentYear = new Date().getFullYear();

  // Şablona Özel Tema Renkleri & Vurgular
  let badgeText = '✨ Safirya Atölye Bülteni';
  let badgeColor = '#D96B27';
  let badgeBg = '#FDF3EB';

  if (templateType === 'lansman') {
    badgeText = '🕯️ Yeni Koleksiyon Lansmanı';
    badgeColor = '#D96B27';
    badgeBg = '#FDF3EB';
  } else if (templateType === 'indirim') {
    badgeText = '🎁 Özel İndirim Fırsatı';
    badgeColor = '#16A34A';
    badgeBg = '#ECFDF5';
  } else if (templateType === 'ozel-davet') {
    badgeText = '🌿 Kişiye Özel & Kurumsal Davet';
    badgeColor = '#D96B27';
    badgeBg = '#FDF3EB';
  } else if (templateType === 'sepet-kurtarma') {
    badgeText = '⏳ Ürünleriniz Sizi Bekliyor';
    badgeColor = '#EA580C';
    badgeBg = '#FFF7ED';
  }

  // Format paragraphs
  const paragraphs = bodyText
    .split('\n')
    .filter((p) => p.trim().length > 0)
    .map(
      (p) =>
        `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #4A5568;">${p.trim()}</p>`
    )
    .join('');

  // Products HTML block
  const productsHtml =
    products && products.length > 0
      ? `
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E8E2D9;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #D96B27; margin-bottom: 6px;">
          Öne Çıkan El Yapımı Tasarımlar
        </div>
        <h3 style="margin: 0 0 20px; font-size: 18px; font-weight: 800; color: #1B2A4A;">
          Atölyemizin En Çok Sevilen Parçaları
        </h3>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            ${products
              .slice(0, 3)
              .map(
                (p) => `
              <td width="33.33%" valign="top" style="padding: 0 8px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; border: 1px solid #E8E2D9; border-radius: 16px; overflow: hidden; text-align: left;">
                  <tr>
                    <td style="position: relative;">
                      <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 140px; object-fit: cover; display: block;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px;">
                      ${
                        p.category
                          ? `<div style="font-size: 10px; font-weight: 700; color: #D96B27; text-transform: uppercase; margin-bottom: 4px;">${p.category}</div>`
                          : ''
                      }
                      <div style="font-size: 12px; font-weight: 700; color: #1B2A4A; line-height: 1.4; height: 34px; overflow: hidden; margin-bottom: 8px;">
                        ${p.name}
                      </div>
                      <div style="font-size: 14px; font-weight: 900; color: #1B2A4A;">
                        ₺${p.price.toLocaleString('tr-TR')}
                        ${
                          p.oldPrice
                            ? `<span style="font-size: 11px; color: #A0AEC0; text-decoration: line-through; font-weight: 500; margin-left: 4px;">₺${p.oldPrice.toLocaleString(
                                'tr-TR'
                              )}</span>`
                            : ''
                        }
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            `
              )
              .join('')}
          </tr>
        </table>
      </div>
    `
      : '';

  // Coupon Box HTML
  const couponHtml = couponCode
    ? `
    <div style="margin: 28px 0; background-color: #FAF8F5; border: 2px dashed #D96B27; border-radius: 18px; padding: 24px; text-align: center;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #D96B27; margin-bottom: 6px;">
        ${discountRate ? `%${discountRate} İndirim Kuponunuz` : 'Özel Atölye İndirim Kodu'}
      </div>
      <div style="display: inline-block; background-color: #FFFFFF; border: 1px solid #E8E2D9; border-radius: 12px; padding: 10px 24px; font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #1B2A4A; margin: 8px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        ${couponCode}
      </div>
      <div style="font-size: 12px; color: #718096; margin-top: 6px;">
        Sepet adımında &ldquo;Kupon Kodu&rdquo; alanına girerek anında faydalanabilirsiniz.
      </div>
    </div>
  `
    : '';

  // Logo rendering
  const logoContent = logoUrl
    ? `<img src="${logoUrl}" alt="${logoText}" style="max-height: 52px; max-width: 220px; display: inline-block; object-fit: contain;" />`
    : `
      <div style="font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #FFFFFF; text-transform: uppercase;">
        ${logoText}
      </div>
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #D96B27; margin-top: 4px; text-transform: uppercase;">
        ${brandTagline}
      </div>
    `;

  return `
<!DOCTYPE html>
<html lang="tr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1B2A4A;">
  
  <!-- Preheader Text (Hidden in body, visible in inbox list) -->
  <div style="display: none; font-size: 1px; color: #FAF8F5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (600px max) -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 28px; border: 1px solid #E8E2D9; overflow: hidden; box-shadow: 0 10px 30px rgba(27, 42, 74, 0.06); max-width: 600px; width: 100%;">
          
          <!-- Header / Brand Bar -->
          <tr>
            <td style="background-color: #1B2A4A; padding: 32px 36px; text-align: center;">
              <a href="${ctaUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                ${logoContent}
              </a>
            </td>
          </tr>

          <!-- Hero Image (if available) -->
          ${
            heroImageUrl
              ? `
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${heroImageUrl}" alt="${headline}" style="width: 100%; max-height: 320px; object-fit: cover; display: block;" />
            </td>
          </tr>
          `
              : ''
          }

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              
              <!-- Badge -->
              <div style="display: inline-block; padding: 6px 14px; background-color: ${badgeBg}; border: 1px solid ${badgeColor}33; border-radius: 20px; font-size: 11px; font-weight: 800; color: ${badgeColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">
                ${badgeText}
              </div>

              <!-- Main Heading -->
              <h1 style="margin: 0 0 18px; font-size: 24px; font-weight: 900; color: #1B2A4A; line-height: 1.3;">
                ${headline}
              </h1>

              <!-- Body Paragraphs -->
              ${paragraphs}

              <!-- Coupon Block (if available) -->
              ${couponHtml}

              <!-- Primary CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 18px 44px; background-color: #D96B27; color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 16px; box-shadow: 0 6px 18px rgba(217, 107, 39, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                      ${ctaLabel} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Trust Highlights / Values -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px; padding: 18px 12px; background-color: #FAF8F5; border-radius: 16px; border: 1px solid #E8E2D9; text-align: center;">
                <tr>
                  <td width="33.33%" style="font-size: 11px; font-weight: 700; color: #1B2A4A;">
                    🌿 %100 Doğal Malzeme
                  </td>
                  <td width="33.33%" style="font-size: 11px; font-weight: 700; color: #1B2A4A; border-left: 1px solid #E8E2D9; border-right: 1px solid #E8E2D9;">
                    ✨ El Yapımı Kadıköy Zanaati
                  </td>
                  <td width="33.33%" style="font-size: 11px; font-weight: 700; color: #1B2A4A;">
                    📦 Hasarsız Teslimat Garantisi
                  </td>
                </tr>
              </table>

              <!-- Featured Products Grid -->
              ${productsHtml}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF8F5; border-top: 1px solid #E8E2D9; padding: 32px 36px; text-align: center;">
              
              <div style="font-size: 14px; font-weight: 800; color: #1B2A4A; text-transform: uppercase; letter-spacing: 1px;">
                ${storeName}
              </div>
              <div style="font-size: 12px; color: #718096; margin-top: 6px;">
                ${address}
              </div>
              <div style="font-size: 12px; color: #718096; margin-top: 4px;">
                Instagram: <strong style="color: #D96B27;">${instagramHandle}</strong> &bull; E-Posta: <strong style="color: #1B2A4A;">${contactEmail}</strong>
              </div>

              <!-- Unsubscribe & Legal notice -->
              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E8E2D9; font-size: 11px; color: #A0AEC0; line-height: 1.5;">
                Bu e-posta, Safirya Atölyesi e-bültenine üye olduğunuz veya daha önce sitemizden alışveriş yaptığınız için gönderilmiştir.<br />
                Artık kampanya e-postaları almak istemiyorsanız <a href="${ctaUrl}/abonelikten-cik" style="color: #718096; text-decoration: underline;">buraya tıklayarak abonelikten ayrılabilirsiniz</a>.
              </div>

              <div style="font-size: 10px; color: #CBD5E0; margin-top: 12px;">
                &copy; ${currentYear} ${storeName}. Tüm hakları saklıdır.
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
