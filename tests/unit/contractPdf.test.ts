import { describe, it, expect } from 'vitest';
import { generateOfficialContractHtml } from '@/lib/contractPdf';
import { CustomContract } from '@/types/admin';

describe('contractPdf - Resmi Kişiye Özel Üretim Sözleşmesi', () => {
  it('6502 sayılı kanun ve 15/1-b cayma hakkı istisnasını içermelidir', () => {
    const mockContract: CustomContract = {
      id: 'ctr-1042',
      orderId: 'ord-1042',
      orderNumber: 'SFR-2026-1042',
      customerName: 'Ayşe Yılmaz',
      customerEmail: 'ayse@example.com',
      customerPhone: '0532 555 72 34',
      customerAddress: 'Karşıyaka / İzmir',
      productName: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
      quantity: 50,
      totalAmount: 1250,
      customText: 'Ayşe & Ali - 15.10.2026',
      agreedDeliveryDate: '2026-10-25',
      status: 'ONAYLANDI',
      legalConsentChecked: true,
      createdAt: '2026-10-15T10:00:00.000Z',
      signedAt: '2026-10-15T10:00:00.000Z',
      verificationCode: 'SOZ-SFR-2026-1042-OK',
      items: [
        {
          productName: 'Kişiye Özel İsimli Söz/Nişan Soya Mumu',
          quantity: 50,
          customText: 'Ayşe & Ali - 15.10.2026',
          scentNote: 'Fransız Lavantası',
        },
      ],
    };

    const html = generateOfficialContractHtml(mockContract);

    expect(html).toContain('6502');
    expect(html).toContain('15/1-b');
    expect(html).toContain('SFR-2026-1042');
    expect(html).toContain('Ayşe Yılmaz');
    expect(html).toContain('Ayşe & Ali - 15.10.2026');
    expect(html).toContain('SOZ-SFR-2026-1042-OK');
    expect(html).toContain('1.250,00');
  });
});
