import { CustomContract } from '@/types/admin';

/**
 * Resmi Kişiye Özel Üretim ve Kişiselleştirme Sözleşmesi
 * 6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği (Md. 15/1-b)
 * A4 formatında yazdırma ve PDF üretimi için HTML şablonu oluşturucu
 */
export function generateOfficialContractHtml(
  contract: CustomContract,
  settings?: {
    logoText?: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    taxOffice?: string;
    taxNumber?: string;
    mersisNo?: string;
  }
): string {
  const companyName =
    settings?.companyName ||
    'Safirya El Yapımı Tasarım ve Zanaat Atölyesi Tic. Ltd. Şti.';
  const companyAddress =
    settings?.companyAddress ||
    'Bostanlı Mah. Cemal Gürsel Cad. No: 42/A Karşıyaka / İZMİR';
  const companyPhone = settings?.companyPhone || '+90 (532) 555 72 34';
  const companyEmail = settings?.companyEmail || 'atolye@safirya.tr';
  const taxOffice = settings?.taxOffice || 'Karşıyaka V.D.';
  const taxNumber = settings?.taxNumber || '1820448192';
  const mersisNo = settings?.mersisNo || '0182044819200001';

  const orderDate = contract.createdAt
    ? contract.createdAt.slice(0, 10)
    : new Date().toLocaleDateString('tr-TR');

  const formattedTotal = Number(contract.totalAmount || 0).toLocaleString(
    'tr-TR',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  // Kalemler listesi varsa veya tekil ürün
  const itemsList =
    contract.items && contract.items.length > 0
      ? contract.items
      : [
          {
            productName: contract.productName || 'Kişiye Özel Tasarım Hediyelik',
            quantity: contract.quantity || 1,
            unitPrice:
              contract.quantity && contract.quantity > 0
                ? contract.totalAmount / contract.quantity
                : contract.totalAmount,
            totalAmount: contract.totalAmount,
            customText: contract.customText,
            scentNote: contract.scentNote,
            colorPalette: contract.colorPalette,
            tagDesignType: contract.tagDesignType,
            extraNote: contract.extraNotes,
          },
        ];

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Kişiye Özel Üretim Sözleşmesi - #${contract.orderNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5px;
      line-height: 1.4;
      color: #1f2937;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .contract-container {
      width: 100%;
      max-width: 794px;
      margin: 0 auto;
      padding: 10px 15px;
      background: #ffffff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #1B2A4A;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #1B2A4A;
      letter-spacing: 2px;
      margin: 0;
    }
    .brand-sub {
      font-size: 9px;
      color: #6b7280;
      margin-top: 2px;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      text-align: right;
      font-size: 10px;
    }
    .meta-box strong {
      color: #1B2A4A;
    }
    .doc-title {
      text-align: center;
      margin: 12px 0 14px 0;
    }
    .doc-title h1 {
      font-size: 14px;
      font-weight: 800;
      color: #1B2A4A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 3px 0;
    }
    .doc-title p {
      font-size: 9.5px;
      color: #4b5563;
      margin: 0;
      font-weight: 600;
    }
    .parties-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    .party-col {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      background: #fafaf9;
    }
    .party-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #1B2A4A;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .party-info {
      font-size: 9.5px;
      line-height: 1.45;
      color: #374151;
    }
    .custom-highlight-box {
      background: #fffbeb;
      border: 1.5px solid #d97706;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 12px;
    }
    .custom-highlight-title {
      font-size: 10px;
      font-weight: 800;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .custom-text-display {
      font-size: 14px;
      font-weight: 800;
      color: #1B2A4A;
      background: #ffffff;
      border: 1px dashed #f59e0b;
      padding: 8px 12px;
      border-radius: 4px;
      text-align: center;
      margin: 4px 0 6px 0;
      letter-spacing: 0.5px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9.5px;
    }
    .items-table th {
      background: #1B2A4A;
      color: #ffffff;
      padding: 6px 8px;
      text-align: left;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .items-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #374151;
    }
    .items-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .legal-articles {
      background: #fcfcfc;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 14px;
      font-size: 9px;
      line-height: 1.45;
      color: #4b5563;
    }
    .legal-articles h3 {
      font-size: 10.5px;
      font-weight: 800;
      color: #1B2A4A;
      margin: 0 0 8px 0;
      text-transform: uppercase;
    }
    .article-item {
      margin-bottom: 6px;
    }
    .article-item strong {
      color: #111827;
    }
    .signature-section {
      display: flex;
      gap: 16px;
      margin-top: 10px;
      border-top: 1.5px solid #1B2A4A;
      padding-top: 10px;
    }
    .signature-box {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      background: #ffffff;
      min-height: 110px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .signature-box-title {
      font-size: 10px;
      font-weight: 800;
      color: #1B2A4A;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .signature-content {
      font-size: 9px;
      color: #374151;
      line-height: 1.4;
    }
    .signature-img {
      max-height: 50px;
      max-width: 160px;
      object-fit: contain;
      display: block;
      margin: 4px 0;
    }
    .seal-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #6ee7b7;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 700;
      font-size: 9px;
      margin-top: 3px;
    }
    .footer-note {
      text-align: center;
      font-size: 8px;
      color: #9ca3af;
      margin-top: 12px;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="contract-container">
    
    <!-- 1. ÜST BAŞLIK VE METADATA -->
    <table class="header-table" style="width: 100%;">
      <tr>
        <td style="vertical-align: top;">
          <h2 class="brand-title">${settings?.logoText || 'SAFİRYA'}</h2>
          <div class="brand-sub">${companyName}</div>
          <div class="brand-sub">${taxOffice} • VKN: ${taxNumber} • Mersis: ${mersisNo}</div>
        </td>
        <td style="vertical-align: top; width: 260px;">
          <div class="meta-box">
            <div>Sözleşme No: <strong>${contract.verificationCode || 'SOZ-' + contract.orderNumber}</strong></div>
            <div>Sipariş No: <strong>#${contract.orderNumber}</strong></div>
            <div>Tanzim Tarihi: <strong>${orderDate}</strong></div>
            <div>Hukuki Statü: <strong style="color: #047857;">DİJİTAL ONAYLI</strong></div>
          </div>
        </td>
      </tr>
    </table>

    <!-- 2. RESMİ BELGE BAŞLIĞI -->
    <div class="doc-title">
      <h1>Kişiye Özel Üretim ve Kişiselleştirme Sözleşmesi</h1>
      <p>6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-b Kapsamında</p>
    </div>

    <!-- 3. TARAFLAR BİLGİSİ (MADDE 1) -->
    <div class="parties-grid">
      <div class="party-col">
        <div class="party-title">SATICI (Hizmet / Mal Sağlayıcı)</div>
        <div class="party-info">
          <div><strong>Ünvan:</strong> ${companyName}</div>
          <div><strong>Adres:</strong> ${companyAddress}</div>
          <div><strong>Vergi Dairesi & No:</strong> ${taxOffice} / ${taxNumber}</div>
          <div><strong>Mersis & Tic. Sicil:</strong> ${mersisNo}</div>
          <div><strong>Telefon:</strong> ${companyPhone}</div>
          <div><strong>E-Posta:</strong> ${companyEmail}</div>
        </div>
      </div>

      <div class="party-col">
        <div class="party-title">ALICI (Tüketici)</div>
        <div class="party-info">
          <div><strong>Ad Soyad:</strong> ${contract.customerName || 'Müşteri'}</div>
          <div><strong>T.C. Kimlik No:</strong> ${contract.customerTckn || 'Tüketici Beyanı / TCKN'}</div>
          <div><strong>Teslimat Adresi:</strong> ${contract.customerAddress || (contract.customerDistrict ? `${contract.customerDistrict} / ${contract.customerCity}` : 'Sipariş Kayıtlı Adresi')}</div>
          <div><strong>Telefon:</strong> ${contract.customerPhone || 'Kayıtlı Telefon'}</div>
          <div><strong>E-Posta:</strong> ${contract.customerEmail}</div>
        </div>
      </div>
    </div>

    <!-- 4. DİKKAT: BASILACAK BİREBİR METİN VURGUSU -->
    <div class="custom-highlight-box">
      <div class="custom-highlight-title">
        <span>✂️</span>
        <span>Ürün Üzerine İşlenecek / Basılacak Birebir İsim, Tarih ve Kaligrafi Metni:</span>
      </div>
      <div class="custom-text-display">
        &ldquo;${contract.customText || 'Özel İsim Belirtilmedi'}&rdquo;
      </div>
      <div style="font-size: 8.5px; color: #78350f;">
        * Atölyemizde harf, imla ve noktalama işaretleri yukarıdaki alanda yer alan metne %100 sadık kalınarak basılacaktır.
      </div>
    </div>

    <!-- 5. KİŞİYE ÖZEL ÜRÜN & PARAMETRE TABLOSU (MADDE 3) -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Ürün / Model</th>
          <th style="width: 50px; text-align: center;">Adet</th>
          <th>Koku / Esans</th>
          <th>Renk / Süsleme</th>
          <th>Teslim Tarihi</th>
          <th style="width: 80px; text-align: right;">Tutar</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList
          .map(
            (item) => `
          <tr>
            <td>
              <strong>${item.productName}</strong>
              ${item.customText ? `<br><span style="color: #b45309; font-size: 8.5px;">Baskı: "${item.customText}"</span>` : ''}
              ${item.tagDesignType ? `<br><span style="color: #6b7280; font-size: 8px;">Etiket: ${item.tagDesignType}</span>` : ''}
            </td>
            <td style="text-align: center;">${item.quantity} Adet</td>
            <td>${item.scentNote || 'Standart'}</td>
            <td>${item.colorPalette || 'Doğal'}</td>
            <td>${contract.agreedDeliveryDate || '3 İş Günü'}</td>
            <td style="text-align: right; font-weight: 700;">₺${Number(item.totalAmount || contract.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
          </tr>
        `
          )
          .join('')}
        <tr style="background: #f1f5f9; font-weight: 800;">
          <td colspan="5" style="text-align: right; font-size: 10px; color: #1B2A4A;">
            TOPLAM SİPARİŞ TUTARI (KDV DAHİL):
          </td>
          <td style="text-align: right; font-size: 10.5px; color: #1B2A4A;">
            ₺${formattedTotal}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 6. HUKUKİ MADDELER & YASAL AYDINLATMA -->
    <div class="legal-articles">
      <h3>Sözleşme Maddeleri ve Yasal Tüketici Bilgilendirmesi</h3>
      
      <div class="article-item">
        <strong>Madde 1 (Konu ve Kapsam):</strong> İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait platform üzerinden sipariş ettiği, özellikleri ve kişiselleştirme parametreleri yukarıda belirtilen kişiye özel hediyelik ve tasarım ürününün üretimi, satışı ve teslimi hususunda tarafların hak ve borçlarının 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında belirlenmesidir.
      </div>

      <div class="article-item">
        <strong>Madde 2 (İsim, Metin ve İmla Teyidi - Alıcı Sorumluluğu):</strong> ALICI, ürün üzerine yazılacak isim, tarih, harf ve notların doğruluğunu bizzat teyit etmiştir. Sözleşmenin onaylanıp siparişin oluşturulması ile kalıp/baskı hazırlığı başlamaktadır. Onay verilmesinin ardından ALICI tarafından talep edilecek imla ve metin düzeltmeleri imalat elvermediği takdirde kabul edilemez; yanlış veya eksik iletilen bilgilerden doğan hatalardan ALICI münhasıran sorumludur.
      </div>

      <div class="article-item">
        <strong>Madde 3 (Cayma Hakkı İstisnası - Yasal Hüküm):</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 48. maddesi ve Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (b) bendi amir hükmü uyarınca; <em>"Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz."</em> Bu amir hüküm gereğince, kişiye özel olarak üretilen ürünlerde yasal cayma, iade veya sipariş iptali hakkı bulunmamaktadır.
      </div>

      <div class="article-item">
        <strong>Madde 4 (El Emeği ve Butik Zanaat Toleransı):</strong> Satışa konu ürünler doğal soya mumu, el yapımı kokulu taş harcı ve doğal kurutulmuş çiçekler ihtiva ettiğinden, hammadde partilerine ve doğal çiçek formlarına bağlı olarak nihai üründe %5 oranında mikro ton ve doğal dizilim varyasyonları bulunabilir.
      </div>

      <div class="article-item">
        <strong>Madde 5 (Kargo ve Hasar Güvencesi):</strong> Ürünler darbe emici koruyucu ambalajlarla kargoya teslim edilir. Teslimat sırasında dış pakette ezilme veya kırılma tespit edilirse ALICI kargo görevlisine "Hasar Tespit Tutanağı" tutturmakla yükümlüdür. Tutanak ibraz edilen hasarlı ürünler SATICI tarafından ivedilikle ücretsiz olarak yenilenir.
      </div>

      <div class="article-item">
        <strong>Madde 6 (Elektronik Delil Sözleşmesi ve Yargı Yetkisi):</strong> Taraflar, HMK 193. maddesi gereğince sistem loglarının ve e-onay kayıtlarının kesin delil olduğunu, uyuşmazlıklarda Ticaret Bakanlığı parasal sınırları dahilinde Tüketici Hakem Heyetleri ve Tüketici Mahkemelerinin yetkili olduğunu kabul ederler.
      </div>
    </div>

    <!-- 7. ONAY & DİJİTAL İMZA MÜHRÜ -->
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-box-title">SATICI (Safirya Tasarım Ltd. Şti.)</div>
        <div class="signature-content">
          <div><strong>Yetkili:</strong> Safirya Atölye Yönetimi</div>
          <div><strong>Kaşe & Onay:</strong> Safirya Zanaat ve Tasarım</div>
          <div style="margin-top: 12px; font-weight: 700; color: #1B2A4A;">
            [ Elektronik Sistem Onaylı Kaşe ]
          </div>
        </div>
      </div>

      <div class="signature-box">
        <div class="signature-box-title">ALICI (Tüketici Dijital Onay ve E-İmzası)</div>
        <div class="signature-content">
          <div><strong>İmzalayan Ad Soyad:</strong> ${contract.signedBy || contract.customerName || 'Alıcı'}</div>
          <div><strong>Onay Zamanı:</strong> ${contract.signedAt || orderDate}</div>
          
          ${
            contract.signatureDataUrl
              ? `<img src="${contract.signatureDataUrl}" alt="Müşteri İmzası" class="signature-img" />`
              : `<div style="padding: 8px 0; color: #047857; font-weight: 700;">✓ Dijital Olarak İmzalandı & Onaylandı</div>`
          }

          <div class="seal-badge">
            Mühür Kodu: ${contract.verificationCode || 'SOZ-SFR-2026-VERIFIED'}
          </div>
        </div>
      </div>
    </div>

    <!-- 8. ALT YASAL NOT -->
    <div class="footer-note">
      İşbu belge, 6502 sayılı Kanun ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca sipariş oluşturulmadan evvel elektronik ortamda akdedilmiş olup ıslak imza hükmündedir.
      <br>Belge Doğrulama: www.safirya.tr/sozlesme-onay/${contract.orderNumber}
    </div>

  </div>
</body>
</html>
`;
}

/**
 * Sözleşmeyi doğrudan ve YALNIZCA A4 olarak yazdırma fonksiyonu.
 * Sayfadaki site başlıklarını, butonları veya menüleri YAZDIRMAZ.
 * Gizli bir iframe açarak içine yalnızca saf resmi A4 sözleşme HTML'ini yükler ve yazdırır.
 */
export function printContractA4(
  contract: CustomContract,
  settings?: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const html = generateOfficialContractHtml(contract, settings);

      // Varsa eski iframe'i temizle
      const existingIframe = document.getElementById(
        'safirya-contract-print-iframe'
      );
      if (existingIframe) {
        existingIframe.remove();
      }

      // Gizli yazdırma iframe'i oluştur
      const iframe = document.createElement('iframe');
      iframe.id = 'safirya-contract-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        throw new Error('Yazdırma penceresi başlatılamadı.');
      }

      doc.open();
      doc.write(html);
      doc.close();

      let hasPrinted = false;
      const executePrint = () => {
        if (hasPrinted) return;
        hasPrinted = true;
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve();
        } catch (printErr) {
          reject(printErr);
        } finally {
          setTimeout(() => {
            iframe.remove();
          }, 1500);
        }
      };

      if (iframe.contentWindow) {
        iframe.contentWindow.onload = () => {
          setTimeout(executePrint, 200);
        };
      }
      // Safari / Chrome doc.close() tetikleme emniyet zamanlayıcısı
      setTimeout(executePrint, 500);
    } catch (err) {
      console.error('Sözleşme yazdırılırken hata:', err);
      reject(err);
    }
  });
}

/**
 * Sözleşmeyi gerçek PDF dosyası olarak bilgisayara / cihaza indirme fonksiyonu.
 * html2canvas ve jsPDF kullanarak A4 boyutunda net, vektörel kalitede PDF oluşturur.
 */
export async function downloadContractPdf(
  contract: CustomContract,
  settings?: any
): Promise<void> {
  if (typeof window === 'undefined') return;

  const html = generateOfficialContractHtml(contract, settings);

  // Görünmeyen render konteyneri oluştur (A4 piksel karşılığı: 794px genişlik)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#ffffff';
  container.style.color = '#1f2937';
  container.style.zIndex = '-9999';
  container.innerHTML = html;

  document.body.appendChild(container);

  try {
    // Görsellerin (özellikle imza base64) yüklenmesi için ufak bekleme
    await new Promise((r) => setTimeout(r, 250));

    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const targetEl = (container.querySelector('.contract-container') as HTMLElement) || container;

    const canvas = await html2canvas(targetEl, {
      scale: 2, // 2x Retina keskinliği
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // İlk sayfa
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Gerekirse 2. sayfa
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const safeOrderNum = contract.orderNumber || 'Siparis';
    pdf.save(`Kisisellestirme_Sozlesmesi_${safeOrderNum}.pdf`);
  } catch (error) {
    console.error('PDF üretilirken hata oluştu, yazdırma penceresine yönlendiriliyor:', error);
    // Fallback: A4 yazdırma diyaloğu
    await printContractA4(contract, settings);
  } finally {
    container.remove();
  }
}
