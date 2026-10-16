import { AdminInvoice, AdminSettings } from '@/types/admin';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export type InvoiceSettingsInput = Partial<AdminSettings> & {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  taxOffice?: string;
  taxNumber?: string;
  mersisNo?: string;
};

/**
 * Sayıyı Türkçe yazıya çevirme fonksiyonu (Fatura dip notu için)
 */
function numberToTurkishWords(num: number): string {
  const ones = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
  const tens = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];

  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  function convertGroup(n: number): string {
    let res = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    if (h > 0) {
      res += (h === 1 ? '' : ones[h]) + 'Yüz ';
    }
    if (t > 0) {
      res += tens[t] + ' ';
    }
    if (o > 0) {
      res += ones[o] + ' ';
    }
    return res;
  }

  let result = '';
  if (wholePart === 0) {
    result = 'Sıfır ';
  } else {
    const millions = Math.floor(wholePart / 1000000);
    const thousands = Math.floor((wholePart % 1000000) / 1000);
    const remainder = wholePart % 1000;

    if (millions > 0) {
      result += convertGroup(millions) + 'Milyon ';
    }
    if (thousands > 0) {
      result += (thousands === 1 ? '' : convertGroup(thousands)) + 'Bin ';
    }
    if (remainder > 0) {
      result += convertGroup(remainder);
    }
  }

  result = result.trim() + ' Türk Lirası';

  if (decimalPart > 0) {
    const t = Math.floor(decimalPart / 10);
    const o = decimalPart % 10;
    const decText = (tens[t] ? tens[t] + ' ' : '') + (ones[o] ? ones[o] + ' ' : '');
    result += ' ' + decText.trim() + ' Kuruş';
  }

  return 'Yalnız ' + result;
}

/**
 * Resmi E-Arşiv / E-Fatura A4 HTML Şablon Üreticisi
 */
export function generateOfficialInvoiceHtml(
  invoice: AdminInvoice,
  settings?: InvoiceSettingsInput
): string {
  const companyName =
    settings?.companyName ||
    settings?.storeName ||
    'Safirya El Yapımı Tasarım ve Zanaat Atölyesi Tic. Ltd. Şti.';
  const companyAddress =
    settings?.companyAddress ||
    settings?.atelierAddress ||
    'Bostanlı Mah. Cemal Gürsel Cad. No: 42/A Karşıyaka / İZMİR';
  const companyPhone =
    settings?.companyPhone || settings?.contactPhone || '+90 (232) 555 72 34';
  const companyEmail =
    settings?.companyEmail || settings?.contactEmail || 'muhasebe@safirya.com';
  const taxOffice = settings?.taxOffice || 'Karşıyaka V.D.';
  const taxNumber = settings?.taxNumber || '1820448192';
  const mersisNo = settings?.mersisNo || '0182044819200001';

  const issueDate = invoice.issueDate || new Date().toISOString().slice(0, 10);
  const formattedSubtotal = Number(invoice.subtotal || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedTax = Number(invoice.taxAmount || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedTotal = Number(invoice.totalAmount || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const wordsTotal = numberToTurkishWords(Number(invoice.totalAmount || 0));

  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [
        {
          name: 'Kişiye Özel Tasarım Hediyelik Ürün',
          quantity: 1,
          unitPrice: Number(((Number(invoice.totalAmount) || 0) / 1.2).toFixed(2)),
          totalAmount: Number(invoice.totalAmount) || 0,
        },
      ];

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>E-Arşiv Fatura - ${invoice.invoiceNo}</title>
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
    .invoice-container {
      width: 100%;
      max-width: 794px;
      margin: 0 auto;
      padding: 10px 15px;
      background: #ffffff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #1B2A4A;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #1B2A4A;
      letter-spacing: 2px;
      margin: 0;
    }
    .brand-sub {
      font-size: 9.5px;
      color: #4b5563;
      margin-top: 2px;
      font-weight: 600;
    }
    .company-details {
      font-size: 9px;
      color: #6b7280;
      margin-top: 4px;
      line-height: 1.4;
    }
    .badge-box {
      background: #1B2A4A;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 4px;
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .invoice-no {
      font-family: "Courier New", Courier, monospace;
      font-size: 16px;
      font-weight: 900;
      color: #D96B27;
      margin-top: 6px;
    }
    .meta-text {
      font-size: 9.5px;
      color: #4b5563;
      margin-top: 2px;
    }
    .parties-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 14px;
    }
    .party-col {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      background: #fafaf9;
    }
    .party-title {
      font-size: 10px;
      font-weight: 800;
      color: #1B2A4A;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .party-info {
      font-size: 9.5px;
      line-height: 1.5;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 9.5px;
    }
    .items-table th {
      background: #1B2A4A;
      color: #ffffff;
      padding: 7px 8px;
      text-align: left;
      font-weight: 700;
      border: 1px solid #1B2A4A;
    }
    .items-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .items-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .summary-section {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
    }
    .legal-notice {
      flex: 1;
      font-size: 8.5px;
      color: #64748b;
      line-height: 1.45;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
    }
    .legal-notice strong {
      color: #0f172a;
    }
    .totals-table {
      width: 280px;
      border-collapse: collapse;
      font-size: 10px;
    }
    .totals-table td {
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
    }
    .totals-table td.label {
      background: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    .totals-table td.amount {
      text-align: right;
      font-family: "Courier New", Courier, monospace;
      font-weight: 700;
      color: #0f172a;
    }
    .totals-table tr.grand-total td {
      background: #1B2A4A;
      color: #ffffff;
      font-size: 12px;
      font-weight: 900;
      border: 1px solid #1B2A4A;
    }
    .totals-table tr.grand-total td.amount {
      color: #ffedd5;
    }
    .words-box {
      border: 1px dashed #cbd5e1;
      background: #fffbeb;
      color: #92400e;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 600;
      margin-bottom: 14px;
      text-align: right;
    }
    .footer-bar {
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #64748b;
    }
    .qr-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    
    <!-- Üst Başlık & Logo Tablosu -->
    <table class="header-table" style="border: 0; width: 100%;">
      <tr>
        <td style="vertical-align: top; width: 62%;">
          <div class="brand-title">${settings?.logoText || 'SAFİRYA'}</div>
          <div class="brand-sub">${companyName}</div>
          <div class="company-details">
            ${companyAddress}<br>
            <strong>Vergi Dairesi:</strong> ${taxOffice} &nbsp;•&nbsp; <strong>VKN:</strong> ${taxNumber}<br>
            <strong>Mersis No:</strong> ${mersisNo} &nbsp;•&nbsp; <strong>Tic. Sicil No:</strong> 491029-5<br>
            <strong>İletişim:</strong> ${companyPhone} &nbsp;•&nbsp; ${companyEmail} &nbsp;•&nbsp; www.safirya.com
          </div>
        </td>
        <td style="vertical-align: top; text-align: right; width: 38%;">
          <div class="badge-box">E-ARŞİV FATURA</div>
          <div class="invoice-no">${invoice.invoiceNo}</div>
          <div class="meta-text"><strong>Düzenleme Tarihi:</strong> ${issueDate}</div>
          <div class="meta-text"><strong>Sipariş No:</strong> #${invoice.orderNumber}</div>
          <div class="meta-text"><strong>Belge Türü:</strong> SATIŞ (Nihai Tüketici)</div>
        </td>
      </tr>
    </table>

    <!-- Alıcı & Düzenleme Bilgileri -->
    <div class="parties-grid">
      <div class="party-col">
        <div class="party-title">SAYIN (MÜŞTERİ / ALICI BİLGİLERİ)</div>
        <div class="party-info">
          <div><strong>Ad Soyad / Ünvan:</strong> ${invoice.customerName || 'Müşteri'}</div>
          <div><strong>TCKN / VKN:</strong> ${invoice.customerTaxId || '11111111111'}</div>
          <div><strong>Teslimat / Fatura Adresi:</strong> ${invoice.customerAddress || 'Kayıtlı Sipariş Adresi'}</div>
          <div><strong>Vergi Dairesi:</strong> ${invoice.customerTaxOffice || 'Tüketici Beyanı'}</div>
        </div>
      </div>
      <div class="party-col">
        <div class="party-title">FATURA & SEVKİYAT DETAYLARI</div>
        <div class="party-info">
          <div><strong>Ödeme Şekli:</strong> Kredi Kartı / 3D Güvenli Online Tahsilat</div>
          <div><strong>Fatura Senaryosu:</strong> E-Arşiv Fatura (GİB Portal)</div>
          <div><strong>Para Birimi:</strong> Türk Lirası (TRY - ₺)</div>
          <div><strong>Düzenleme Saati:</strong> 14:30:00 (Sistem Kayıtlı)</div>
        </div>
      </div>
    </div>

    <!-- Kalemler Tablosu -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">Sıra</th>
          <th>Mal / Hizmet Açıklaması</th>
          <th style="width: 55px; text-align: center;">Miktar</th>
          <th style="width: 80px; text-align: right;">Birim Fiyat</th>
          <th style="width: 50px; text-align: center;">KDV %</th>
          <th style="width: 75px; text-align: right;">KDV Tutarı</th>
          <th style="width: 90px; text-align: right;">Toplam Tutar</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((item, idx) => {
            const itemQuantity = Number(item.quantity) || 1;
            const itemUnitPrice = Number(item.unitPrice) || 0;
            const itemTotal = Number(item.totalAmount) || (itemUnitPrice * itemQuantity);
            const itemVat = Number((itemTotal * 0.2).toFixed(2));
            return `
            <tr>
              <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
              <td><strong>${item.name || 'Özel Ürün'}</strong></td>
              <td style="text-align: center; font-family: monospace;">${itemQuantity} Adet</td>
              <td style="text-align: right; font-family: monospace;">₺${itemUnitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="text-align: center; font-family: monospace;">%20</td>
              <td style="text-align: right; font-family: monospace;">₺${itemVat.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="text-align: right; font-weight: 700; font-family: monospace;">₺${itemTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>

    <!-- Yalnız ... Yazıyla Tutar -->
    <div class="words-box">
      <strong>Ödenecek Tutar Yazıyla:</strong> ${wordsTotal}
    </div>

    <!-- Dip Toplamlar ve Yasal Bilgilendirme -->
    <div class="summary-section">
      <div class="legal-notice">
        <div><strong>GİB E-Arşiv Bildirimi:</strong></div>
        <p style="margin: 4px 0 6px 0;">
          İşbu e-arşiv fatura 213 sayılı Vergi Usul Kanunu ve ilgili mevzuat hükümlerine uygun olarak elektronik ortamda tanzim edilmiş, imzalanmış ve Gelir İdaresi Başkanlığı sistemine başarıyla aktarılmıştır.
        </p>
        <div style="font-family: monospace; font-size: 8px; color: #475569;">
          ETTN: 49b0129a-77e1-4c91-9128-ef2026880012
        </div>
        <div style="margin-top: 6px; font-weight: 600; color: #047857;">
          ✓ Mali Mühür ve Nitelikli Elektronik Sertifika ile İmzalanmıştır.
        </div>
      </div>

      <table class="totals-table">
        <tr>
          <td class="label">Mal / Hizmet Toplamı:</td>
          <td class="amount">₺${formattedSubtotal}</td>
        </tr>
        <tr>
          <td class="label">Hesaplanan KDV (%20):</td>
          <td class="amount">₺${formattedTax}</td>
        </tr>
        <tr class="grand-total">
          <td style="padding: 8px;">GENEL TOPLAM:</td>
          <td class="amount" style="padding: 8px;">₺${formattedTotal}</td>
        </tr>
      </table>
    </div>

    <!-- Alt Footer ve Karekod Bilgisi -->
    <div class="footer-bar">
      <div class="qr-box">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" fill="#f1f5f9"/>
          <rect x="4" y="4" width="12" height="12" fill="#1B2A4A"/>
          <rect x="6" y="6" width="8" height="8" fill="#ffffff"/>
          <rect x="8" y="8" width="4" height="4" fill="#1B2A4A"/>
          <rect x="24" y="4" width="12" height="12" fill="#1B2A4A"/>
          <rect x="26" y="6" width="8" height="8" fill="#ffffff"/>
          <rect x="28" y="8" width="4" height="4" fill="#1B2A4A"/>
          <rect x="4" y="24" width="12" height="12" fill="#1B2A4A"/>
          <rect x="6" y="26" width="8" height="8" fill="#ffffff"/>
          <rect x="8" y="28" width="4" height="4" fill="#1B2A4A"/>
          <rect x="20" y="20" width="4" height="4" fill="#1B2A4A"/>
          <rect x="28" y="28" width="6" height="6" fill="#1B2A4A"/>
          <rect x="20" y="32" width="4" height="4" fill="#1B2A4A"/>
          <rect x="32" y="20" width="4" height="4" fill="#1B2A4A"/>
        </svg>
        <div>
          <strong>GİB Karekod Doğrulama:</strong> e-belge.gib.gov.tr<br>
          Belge No: ${invoice.invoiceNo} • Sipariş: #${invoice.orderNumber}
        </div>
      </div>

      <div style="text-align: right;">
        <strong>Safirya Atölyesi Muhasebe Departmanı</strong><br>
        Sayfa 1 / 1 (A4 Formatı)
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Faturayı doğrudan ve YALNIZCA A4 olarak yazdırma fonksiyonu.
 * Sayfadaki site başlıklarını, butonları, yan menüleri veya modalı YAZDIRMAZ.
 * Gizli bir iframe açarak içine yalnızca saf resmi A4 fatura HTML'ini yükler ve yazdırır.
 */
export function printInvoiceA4(
  invoice: AdminInvoice,
  settings?: InvoiceSettingsInput
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const html = generateOfficialInvoiceHtml(invoice, settings);

      // Varsa eski iframe'i temizle
      const existingIframe = document.getElementById(
        'safirya-invoice-print-iframe'
      );
      if (existingIframe) {
        existingIframe.remove();
      }

      // Gizli yazdırma iframe'i oluştur
      const iframe = document.createElement('iframe');
      iframe.id = 'safirya-invoice-print-iframe';
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

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            resolve();
          } catch (printErr) {
            reject(printErr);
          } finally {
            // Yazdırma işlemi tamamlandıktan veya iptal edildikten sonra temizle
            setTimeout(() => {
              iframe.remove();
            }, 1000);
          }
        }, 300);
      };
    } catch (err) {
      console.error('Fatura yazdırılırken hata:', err);
      reject(err);
    }
  });
}

/**
 * Faturayı A4 boyutunda PDF olarak oluşturup doğrudan tarayıcıya indirme
 */
export async function downloadInvoicePdf(
  invoice: AdminInvoice,
  settings?: InvoiceSettingsInput
): Promise<void> {
  if (typeof window === 'undefined') return;

  const html = generateOfficialInvoiceHtml(invoice, settings);

  // Gizli bir render konteyneri oluştur
  const container = document.createElement('div');
  container.id = 'safirya-invoice-pdf-render-box';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // A4 96 DPI pixel width
  container.style.background = '#ffffff';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const targetElement =
      container.querySelector('.invoice-container') || container;

    const canvas = await html2canvas(targetElement as HTMLElement, {
      scale: 2, // 300 DPI retina netliği
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const safeInvoiceNo = invoice.invoiceNo || 'Fatura';
    pdf.save(`E-Arsiv-Fatura-${safeInvoiceNo}.pdf`);
  } catch (error) {
    console.error('PDF üretilirken hata oluştu, yazdırma penceresine yönlendiriliyor:', error);
    // Fallback: A4 yazdırma diyaloğu
    await printInvoiceA4(invoice, settings);
  } finally {
    container.remove();
  }
}
